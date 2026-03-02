
import React, { useState, useCallback, useEffect, createContext, useContext, useRef, Suspense, useMemo } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { Header } from './components/Header';
import { TabbedPanel } from './components/TabbedPanel';
import { FlowViewHUD } from './components/FlowViewHUD';
import { KnowledgeBaseModal } from './components/KnowledgeBaseModal';
import { AuditTrailModal } from './components/AuditTrailModal';
import { WeeklySummaryModal } from './components/WeeklySummaryModal';
import TrustSendModal from './components/TrustSendModal';
import { DataPlaygroundModal } from './components/DataPlaygroundModal';
import { FlowCaptureModal } from './components/FlowCaptureModal';
import { Alert, ChatMessage, AuditTrailData, WeeklySummary, AppData, ProcessingResult } from './types';
import { getProactiveAlerts, generateWeeklyBriefing, ai, generateGroundedResponse, getSentinelPersona, speakResponse } from './services/geminiService';
import { useToast, ToastProvider } from './contexts/ToastContext';
import { foundationalData, scenarios, contractData, msaData, salesPipelineData, travelData, inventoryData, fdTickets, fdActivities, enterpriseExpenses, loadClients, loadIntakeOpportunities, loadSessionContracts } from './digital-thread-data';
import { processData } from './data/dataProcessor';
import { Chat } from "@google/genai";
import { AiThinkingOverlay } from './components/ui/AiThinkingOverlay';
import { CommandPalette } from './components/CommandPalette';
import { ErrorBoundary } from './components/ErrorBoundary';
import { usePersistentSession } from './hooks/usePersistentSession';
import { DateRangeProvider, useDateRange } from './contexts/DateRangeContext';
import { VideoCaptureModal } from './components/VideoCaptureModal';
import { ScannerModal } from './components/ScannerModal';
import { flowview } from './lib/westflow-client';
import { PersonaProvider, usePersona } from './contexts/PersonaContext';

// --- Theme Context & Logic ---
interface ThemeContextType {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<'light' | 'dark'>(() => {
        if (typeof window !== 'undefined') {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'light';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

const FullPageLoader: React.FC<{ message: string }> = ({ message }) => (
    <div className="fixed inset-0 bg-primary flex flex-col items-center justify-center z-50">
        <div className="w-16 h-16 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mb-4 shadow-glow-primary"></div>
        <p className="text-text-primary font-bold animate-pulse uppercase tracking-[0.5em] text-[10px] font-serif-display">{message}</p>
    </div>
);

const OfflineBanner: React.FC = () => (
    <div className="bg-warning text-black text-center px-4 py-2 text-sm font-bold flex-none">
        You are currently offline. Some features may be limited.
    </div>
);

const AppContent: React.FC = () => {
    const { isAuthenticated, user, login, logout } = usePersistentSession();
    const [isAppLoading, setIsAppLoading] = useState(true);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const { persona } = usePersona();
    
    const [isLiveDataSimulating, setIsLiveDataSimulating] = useState(() => {
        const saved = localStorage.getItem('isLiveDataSimulating');
        return saved !== null ? JSON.parse(saved) : true;
    });
    const [rawAppData, setRawAppData] = useState(() => ({ foundationalData, scenarios, contractData, msaData, salesPipelineData, travelData, inventoryData, fdTickets, fdActivities, enterpriseExpenses }));
    const [userPoints, setUserPoints] = useState(0); 

    const dateRangeContext = useDateRange();
    if (!dateRangeContext) throw new Error("DateRangeContext not found.");
    const { dateRange } = dateRangeContext;

    useEffect(() => {
        const initData = async () => {
            await loadClients();      
            await loadIntakeOpportunities();   
            await loadSessionContracts();         
            setRawAppData(prev => ({
                ...prev,
                foundationalData: { ...foundationalData },
                salesPipelineData: [...salesPipelineData],
                contractData: [...contractData]
            }));
        };
        initData();
    }, []);

    // Clean up any legacy localStorage session data from old versions
    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('flowview_secure_session');
            localStorage.removeItem('flowview-active-view');
        }
    }, []);

    // --- HYDRATION: Fetch live Team data from Supabase ---
    useEffect(() => {
        if (isAuthenticated) {
            const hydrateTeamData = async () => {
                const data = await flowview.getTeamData();
                if (data.success) {
                    setRawAppData(prev => ({
                        ...prev,
                        foundationalData: {
                            ...prev.foundationalData,
                            technicians: data.users.map((u: any) => ({
                                id: u.fd_agent_id,
                                uuid: u.id,
                                name: `${u.first_name} ${u.last_name}`,
                                email: u.email || `${u.fd_agent_id}@acs-legal.io`,
                                is_active: u.is_active,
                                createdAt: new Date(u.created_at || Date.now()).getTime(),
                                role: 'Compliance Officer'
                            }))
                        },
                        fdActivities: data.activities,
                        enterpriseExpenses: data.expenses,
                        travelData: data.checkins.map((c: any) => ({
                            id: c.id,
                            user_id: c.user_id,
                            check_in: c.check_in,
                            check_out: c.check_out || null,
                            checkin_location: c.checkin_location,
                            checkout_location: c.checkout_location || null,
                            fd_ticket_id: c.fd_ticket_id || null
                        }))
                    }));
                }
            };
            hydrateTeamData();
        }
    }, [isAuthenticated]);

    const appData = useMemo(() => {
        const derivedData = processData(rawAppData, dateRange);
        derivedData.userProfileData.points += userPoints;
        // Persona override
        derivedData.userProfileData.name = persona.name;
        return { ...rawAppData, ...derivedData };
    }, [rawAppData, dateRange, userPoints, persona]);

    const [modalState, setModalState] = useState({
        isKnowledgeBaseOpen: false,
        isAuditTrailModalOpen: false,
        isWeeklySummaryOpen: false,
        isTrustSendModalOpen: false,
        isDataPlaygroundOpen: false,
        isScannerOpen: false,
        isVideoCaptureOpen: false,
        isFlowCaptureOpen: false, 
    });
    const [isHudExpanded, setIsHudExpanded] = useState(false);
    const [flowCaptureTab, setFlowCaptureTab] = useState<'upload' | 'camera' | 'home'>('home');

    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [commandQuery, setCommandQuery] = useState('');
    const [selectedEntity, setSelectedEntity] = useState<{ type: string; id: string } | null>(null);

    const [activeView, setActiveView] = useState<string>(() => {
        return sessionStorage.getItem('flowview-active-view') || 'dashboard';
    });
    const [activeSubView, setActiveSubView] = useState<string | null>(null);
    const [auditTrailData, setAuditTrailData] = useState<AuditTrailData | null>(null);
    const [opportunityAlert, setOpportunityAlert] = useState<{ visible: boolean, message: string, view: 'sales-pipeline' | 'renewit-ops' | 'vault' | null }>({ visible: false, message: '', view: null });
    const [onScanCallback, setOnScanCallback] = useState<((imageData: string) => void) | null>(null);
    const [onVideoCallback, setOnVideoCallback] = useState<((videoBlob: Blob) => void) | null>(null);
    
    const { showToast } = useToast();

    // Default view on persona change - Only if not already set by persistence
    useEffect(() => {
        const savedView = sessionStorage.getItem('flowview-active-view');
        if (isAuthenticated && !savedView) {
            setActiveView(persona.defaultView);
        }
    }, [persona.id, isAuthenticated]);

    // Persist active view in sessionStorage so it survives refresh but dies on tab close
    useEffect(() => {
        if (isAuthenticated) {
            sessionStorage.setItem('flowview-active-view', activeView);
        }
    }, [activeView, isAuthenticated]);

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [isAiThinking, setIsAiThinking] = useState(false);
    const [weeklySummary, setWeeklySummary] = useState<WeeklySummary | null>(null);
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    const chatRef = useRef<Chat | null>(null);

    const [syncingSource, setSyncingSource] = useState<string | null>(null);
    const [processingResults, setProcessingResults] = useState<ProcessingResult[] | null>(null);
    
    useEffect(() => {
        if (isAuthenticated) {
            const systemInstruction = getSentinelPersona(dateRange);
            chatRef.current = ai.chats.create({
                model: 'gemini-3-flash-preview',
                config: { systemInstruction }
            });
            setChatMessages([{ 
                id: 'initial', 
                sender: 'ai', 
                text: `Good morning, ${persona.name.split(' ')[0]}. I am Flo, your legal operations assistant. I have audited the FlowView Legal fabric. We have 12 pending deadlines this week and 3 high-risk matters requiring your attention. Should we prioritize the Smith v. Jones filing?`
            }]);
        }
    }, [isAuthenticated, dateRange, persona.id]);

    const handleAiNavigation = useCallback((viewId: string) => {
        const viewMap: Record<string, string> = {
            'dashboard': 'dashboard', 'home': 'dashboard', 'compliance': 'dashboard',
            'client': 'research', 'case': 'matters',
            'intake': 'reviews', 'pipeline': 'reviews',
            'vault': 'documents', 'repository': 'documents', 'documents': 'documents',
            'admin': 'settings', 'settings': 'settings',
            'providers': 'comms', 'staff': 'comms'
        };
        const target = viewMap[viewId] || viewId;
        setActiveView(target);
        showToast(`Navigated to ${target}`, 'info');
    }, [showToast]);

    const handleSendMessage = useCallback(async (prompt: string, aiMode: 'chat' | 'report', isFollowUpAction: boolean, uiContext?: string) => {
         if (!prompt.trim() || isAiThinking) return;
        
        setIsHudExpanded(true);
        
        const userMessageId = Date.now().toString();
        const aiMessageId = (Date.now() + 1).toString();
        const userMessage: ChatMessage = { id: userMessageId, sender: 'user', text: prompt };
        setChatMessages(prev => [...prev, userMessage]);
        setIsAiThinking(true);
        setChatMessages(prev => [...prev, { id: aiMessageId, sender: 'ai', text: '...', blocks: [] }]);

        try {
             const result = await generateGroundedResponse(prompt, uiContext);
             if (result.navigationCommand) {
                 handleAiNavigation(result.navigationCommand);
             }
             setChatMessages(prev => prev.map(msg => 
                msg.id === aiMessageId ? { ...msg, text: result.text, blocks: [], groundingMetadata: result.groundingMetadata } : msg
            ));
            
            if (result.text) {
                await speakResponse(result.text);
            }
        } catch (error) {
            console.error("Error processing AI response:", error);
             setChatMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, text: "LegalServer sync encountered a temporary error. Retrying command..." } : msg));
        } finally {
            setIsAiThinking(false);
        }
    }, [isAiThinking, handleAiNavigation]);

    useEffect(() => {
        if (isAuthenticated) setTimeout(() => setIsAppLoading(false), 1500);
        else setTimeout(() => setIsAppLoading(false), 500);
    }, [isAuthenticated]);

    const handleLogin = useCallback(() => { login({ name: persona.name }); setIsAppLoading(true); }, [login, persona.name]);
    const handleLogout = useCallback(() => { logout(); }, [logout]);
    
    const handleGenerateWeeklySummary = useCallback(async () => {
        openModal('isWeeklySummaryOpen');
        setIsSummaryLoading(true);
        setWeeklySummary(null);
        try {
            const summary = await generateWeeklyBriefing();
            setWeeklySummary(summary);
        } catch (error) {
            console.error("Failed to generate weekly summary:", error);
            closeModal('isWeeklySummaryOpen');
            showToast("Service briefing failed. Check network link.", 'error');
        } finally {
            setIsSummaryLoading(false);
        }
    }, [showToast]);

    const openModal = (modalName: keyof typeof modalState, param?: string) => {
        setModalState(prev => ({...prev, [modalName]: true }));
        if (modalName === 'isFlowCaptureOpen' && param) {
            if (param === 'upload' || param === 'camera' || param === 'home') {
                setFlowCaptureTab(param);
            } else {
                setFlowCaptureTab('home');
            }
        }
    };
    
    const closeModal = (modalName: keyof typeof modalState) => {
        setModalState(prev => ({...prev, [modalName]: false }));
    };
    
    const handleOpenAuditTrail = useCallback((data: AuditTrailData) => {
        setAuditTrailData(data);
        openModal('isAuditTrailModalOpen');
    }, []);
    
    const showOpportunityAlert = useCallback((message: string, view: 'sales-pipeline' | 'renewit-ops' | 'vault') => {
        setOpportunityAlert({ visible: true, message, view });
    }, []);

    const handleViewChange = (view: string) => { setActiveView(view); setActiveSubView(null); };

    const handleSubViewChange = useCallback((subView: string | null) => {
        setActiveSubView(subView);
    }, []);

    const handleNavigateToClient = useCallback((clientId: string) => {
        setSelectedEntity({ type: 'client', id: clientId });
        setActiveView('research');
    }, []);

    const handleDataUpload = useCallback(async (files: FileList) => { showToast(`Processing ${files.length} client record(s)...`); }, [showToast]);
    const handleApplyGeneratedData = useCallback((newData: Partial<AppData>) => { 
        setRawAppData(prev => ({ ...prev, ...newData }));
        showToast("Compliance operations updated!");
    }, [showToast]);

    const userProfileDataForHeader = useMemo(() => ({ name: persona.name, points: appData.userProfileData.points }), [persona.name, appData.userProfileData.points]);
    const currentViewForAI = activeSubView ? `${activeView}-${activeSubView}` : activeView;
    
    const handleOpenScanner = (callback: (imageData: string) => void) => {
        setOnScanCallback(() => callback);
        openModal('isScannerOpen');
    };

    const handleOpenFlowCaptureWithTab = (tab?: string) => {
        if (tab === 'upload' || tab === 'camera' || tab === 'home') {
            setFlowCaptureTab(tab);
        } else {
            setFlowCaptureTab('home');
        }
        openModal('isFlowCaptureOpen');
    }

    if (!isAuthenticated) return <LoginScreen onLogin={handleLogin} />;
    if (isAppLoading) return <FullPageLoader message="Connecting to FlowView Legal Fabric..." />;

    return (
        <ErrorBoundary>
          <Suspense fallback={<FullPageLoader message="Syncing Ledger..." />}>
            <div className="flex flex-col h-screen overflow-hidden bg-background relative">
                {isAiThinking && <AiThinkingOverlay />}
                <div className="flex-none">
                    <Header 
                        alerts={alerts} 
                        setAlerts={setAlerts}
                        onSearchFocus={() => setIsCommandPaletteOpen(true)}
                        setCommandQuery={setCommandQuery}
                        userProfileData={userProfileDataForHeader}
                        isLiveDataSimulating={isLiveDataSimulating}
                        setIsLiveDataSimulating={setIsLiveDataSimulating}
                        isMuted={false}
                        setIsMuted={() => {}}
                        onLogout={handleLogout}
                        onOpenFlowCapture={handleOpenFlowCaptureWithTab}
                        onNavigate={setActiveView}
                    />
                </div>
                
                {isCommandPaletteOpen && (
                    <CommandPalette 
                        onClose={() => setIsCommandPaletteOpen(false)} 
                        query={commandQuery}
                        setQuery={setCommandQuery}
                        onOpenAiCommandCenter={(q) => handleSendMessage(q, 'chat', false)}
                        onSelectEntity={setSelectedEntity}
                        currentView={currentViewForAI}
                    />
                )}

                <main className="flex-1 overflow-hidden relative flex flex-col">
                    {!isOnline && <OfflineBanner />}
                    <TabbedPanel
                        activeView={activeView}
                        onViewChange={handleViewChange}
                        onSubViewChange={handleSubViewChange}
                        onOpenAiCommandCenter={(q) => handleSendMessage(q, 'chat', false)}
                        onOpenEnhancementsExplorer={() => openModal('isFlowCaptureOpen', 'home')}
                        openScanner={handleOpenScanner} 
                        opportunityAlert={opportunityAlert}
                        onDismissOpportunityAlert={() => setOpportunityAlert({ ...opportunityAlert, visible: false})}
                        onOpenAuditTrail={handleOpenAuditTrail}
                        onShowOpportunityAlert={showOpportunityAlert}
                        selectedEntityId={selectedEntity?.type === 'client' ? selectedEntity.id : null}
                        onGenerateWeeklySummary={handleGenerateWeeklySummary}
                        onOpenTrustSend={() => openModal('isTrustSendModalOpen')}
                        syncingSource={syncingSource}
                        onSyncingChange={setSyncingSource}
                        appData={appData}
                        isLiveDataSimulating={isLiveDataSimulating}
                        onOpenDataPlayground={() => openModal('isDataPlaygroundOpen')}
                        onDataUpload={handleDataUpload}
                        processingResults={processingResults}
                        onOpenFlowCapture={handleOpenFlowCaptureWithTab} 
                        onNavigateToClient={handleNavigateToClient}
                    />
                </main>
                
                <FlowViewHUD 
                    chatMessages={chatMessages}
                    onSendMessage={handleSendMessage}
                    isThinking={isAiThinking}
                    isMicLocked={false}
                    isExpanded={isHudExpanded}
                    onToggle={() => setIsHudExpanded(!isHudExpanded)}
                />

                <FlowCaptureModal 
                    isOpen={modalState.isFlowCaptureOpen}
                    onClose={() => closeModal('isFlowCaptureOpen')}
                    onShowToast={showToast}
                    initialTab={flowCaptureTab}
                />
                
                <KnowledgeBaseModal isOpen={modalState.isKnowledgeBaseOpen} onClose={() => closeModal('isKnowledgeBaseOpen')} onShowToast={showToast} />
                <AuditTrailModal isOpen={modalState.isAuditTrailModalOpen} onClose={() => closeModal('isAuditTrailModalOpen')} data={auditTrailData} />
                <WeeklySummaryModal isOpen={modalState.isWeeklySummaryOpen} onClose={() => closeModal('isWeeklySummaryOpen')} summaryData={weeklySummary} isLoading={isSummaryLoading} />
                <TrustSendModal isOpen={modalState.isTrustSendModalOpen} onClose={() => closeModal('isTrustSendModalOpen')} onOpenAuditTrail={handleOpenAuditTrail} />
                <DataPlaygroundModal isOpen={modalState.isDataPlaygroundOpen} onClose={() => closeModal('isDataPlaygroundOpen')} appData={appData} onApplyGeneratedData={handleApplyGeneratedData} />
                <ScannerModal 
                    isOpen={modalState.isScannerOpen} 
                    onClose={() => closeModal('isScannerOpen')} 
                    onScanComplete={(img) => { onScanCallback && onScanCallback(img); closeModal('isScannerOpen'); }} 
                />
                <VideoCaptureModal
                    isOpen={modalState.isVideoCaptureOpen}
                    onClose={() => closeModal('isVideoCaptureOpen')}
                    onCaptureComplete={(blob) => { onVideoCallback && onVideoCallback(blob); closeModal('isVideoCaptureOpen'); }}
                />
            </div>
          </Suspense>
        </ErrorBoundary>
    );
};

const App: React.FC = () => (
    <PersonaProvider>
        <ThemeProvider>
            <DateRangeProvider>
                <ToastProvider>
                    <AppContent />
                </ToastProvider>
            </DateRangeProvider>
        </ThemeProvider>
    </PersonaProvider>
);

export default App;
