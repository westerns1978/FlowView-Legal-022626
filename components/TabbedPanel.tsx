
import React, { useEffect, useRef, useMemo } from 'react';
import { CommandView } from './views/CommandView';
import { MattersView } from './views/MattersView';
import { ResearchView } from './views/ResearchView';
import { CalendarView } from './views/CalendarView';
import { CommsView } from './views/CommsView';
import { TeamView } from './views/TeamView';
import { SalesPipelineView } from './views/SalesPipelineView';
import { Customer360View } from './views/Customer360View';
import { DataFabricView } from './views/DataFabricView';
import { RoboticsView } from './views/RoboticsView';
import { AgenticWorkspaceView } from './views/AgenticWorkspaceView';
import { VaultView } from './views/VaultView';
import { ServerStackIcon, SparklesIcon, UserGroupIcon, ShieldCheckIcon, RocketIcon, BotIcon, LockClosedIcon, WrenchScrewdriverIcon, DocumentTextIcon, ChartBarIcon, CalendarIcon, Cog6ToothIcon, ChatBubbleLeftRightIcon, MagnifyingGlassIcon } from './ui/Icons';
import { AuditTrailData, AppData, ProcessingResult } from '../types';
import { OpportunityAlertBanner } from './OpportunityAlertBanner';
import { usePersona } from '../contexts/PersonaContext';

type ViewId = 'dashboard' | 'matters' | 'documents' | 'reviews' | 'research' | 'comms' | 'calendar' | 'settings' | 'command' | 'agents' | 'customer-360' | 'sales-pipeline' | 'renewit' | 'vault' | 'robotics' | 'data-fabric' | 'team' | 'analysis';

interface TabbedPanelProps {
    activeView: string;
    onViewChange: (view: ViewId) => void;
    onSubViewChange: (subView: string | null) => void;
    onOpenAiCommandCenter: (prompt: string) => void;
    onOpenEnhancementsExplorer: () => void;
    openScanner: (onScanComplete: (imageData: string) => void) => void;
    opportunityAlert: { visible: boolean, message: string, view: string | null };
    onDismissOpportunityAlert: () => void;
    onOpenAuditTrail: (data: AuditTrailData) => void;
    onShowOpportunityAlert: (message: string, view: 'sales-pipeline' | 'renewit-ops') => void;
    selectedEntityId: string | null;
    onGenerateWeeklySummary: () => void;
    onOpenTrustSend: () => void;
    syncingSource: string | null;
    onSyncingChange: (source: string | null) => void;
    appData: AppData;
    isLiveDataSimulating: boolean;
    onOpenDataPlayground: () => void;
    onDataUpload: (files: FileList) => void;
    processingResults: ProcessingResult[] | null;
    onOpenFlowCapture: (tab?: string) => void; 
    onNavigateToClient: (clientId: string) => void;
}

const NavItem: React.FC<{ 
    label: React.ReactNode; 
    icon?: React.ReactNode;
    isActive: boolean; 
    onClick: () => void; 
}> = ({ label, icon, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`
            w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg font-sans-ui
            ${isActive 
                ? 'bg-bg-tertiary text-accent-primary shadow-sm border border-divider' 
                : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary border border-transparent'
            }
        `}
    >
        {icon && <span className={isActive ? 'text-accent-primary' : 'text-text-dim group-hover:text-accent-primary'}>{icon}</span>}
        {label}
    </button>
);

export const TabbedPanel: React.FC<TabbedPanelProps> = ({ 
    activeView, 
    onViewChange, 
    onSubViewChange, 
    onOpenAiCommandCenter, 
    onOpenEnhancementsExplorer, 
    openScanner,
    opportunityAlert,
    onDismissOpportunityAlert,
    onOpenAuditTrail,
    onShowOpportunityAlert,
    selectedEntityId,
    onGenerateWeeklySummary,
    onOpenTrustSend,
    syncingSource,
    onSyncingChange,
    appData,
    isLiveDataSimulating,
    onOpenDataPlayground,
    onDataUpload,
    processingResults,
    onOpenFlowCapture,
    onNavigateToClient
}) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const { persona } = usePersona();

    // AUTO-ANCHOR LOGIC: Resets scroll position to top when switching views
    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'auto' });
        }
    }, [activeView]);

    const views = useMemo(() => [
        { id: 'dashboard', label: 'Dashboard', icon: <ChartBarIcon className="w-5 h-5"/>, component: <CommandView onOpenAiCommandCenter={onOpenAiCommandCenter} onViewChange={(viewId) => onViewChange(viewId as ViewId)} onGenerateWeeklySummary={onGenerateWeeklySummary} onOpenOpenTrustSend={onOpenTrustSend} syncingSource={syncingSource} appData={appData} isLiveDataSimulating={isLiveDataSimulating} /> },
        { id: 'matters', label: 'Matters', icon: <ShieldCheckIcon className="w-5 h-5"/>, component: <MattersView onOpenAiCommandCenter={onOpenAiCommandCenter} appData={appData} /> },
        { id: 'documents', label: 'Documents', icon: <LockClosedIcon className="w-5 h-5"/>, component: <VaultView /> },
        { id: 'reviews', label: 'Reviews', icon: <DocumentTextIcon className="w-5 h-5"/>, component: <SalesPipelineView onOpenAiCommandCenter={onOpenAiCommandCenter} onShowOpportunityAlert={onShowOpportunityAlert} appData={appData} /> },
        { id: 'research', label: 'Research', icon: <MagnifyingGlassIcon className="w-5 h-5"/>, component: <ResearchView onOpenAiCommandCenter={onOpenAiCommandCenter} /> },
        { id: 'comms', label: 'Comms', icon: <ChatBubbleLeftRightIcon className="w-5 h-5"/>, component: <CommsView onOpenAiCommandCenter={onOpenAiCommandCenter} /> },
        { id: 'calendar', label: 'Calendar', icon: <CalendarIcon className="w-5 h-5"/>, component: <CalendarView onOpenAiCommandCenter={onOpenAiCommandCenter} /> },
        { id: 'settings', label: 'Settings', icon: <Cog6ToothIcon className="w-5 h-5" />, component: <DataFabricView onSyncingChange={onSyncingChange} onOpenDataPlayground={onOpenDataPlayground} onDataUpload={onDataUpload} processingResults={processingResults} /> },
        
        // Legacy mappings to keep things from breaking
        { id: 'command', label: 'Compliance', icon: <ShieldCheckIcon className="w-5 h-5"/>, component: <CommandView onOpenAiCommandCenter={onOpenAiCommandCenter} onViewChange={(viewId) => onViewChange(viewId as ViewId)} onGenerateWeeklySummary={onGenerateWeeklySummary} onOpenOpenTrustSend={onOpenTrustSend} syncingSource={syncingSource} appData={appData} isLiveDataSimulating={isLiveDataSimulating} /> },
        { id: 'agents', label: 'Workforce', icon: <BotIcon className="w-5 h-5"/>, component: <AgenticWorkspaceView /> },
        { id: 'customer-360', label: 'Client 360', icon: <UserGroupIcon className="w-5 h-5"/>, component: <Customer360View onOpenAiCommandCenter={onOpenAiCommandCenter} initialClientId={selectedEntityId} appData={appData} /> },
        { id: 'sales-pipeline', label: 'Pipeline', icon: <ChartBarIcon className="w-5 h-5"/>, component: <SalesPipelineView onOpenAiCommandCenter={onOpenAiCommandCenter} onShowOpportunityAlert={onShowOpportunityAlert} appData={appData} /> },
        { id: 'renewit', label: 'Clients', icon: <RocketIcon className="w-5 h-5"/>, component: <MattersView onOpenAiCommandCenter={onOpenAiCommandCenter} appData={appData} /> },
        { id: 'vault', label: 'Document Center', icon: <LockClosedIcon className="w-5 h-5"/>, component: <VaultView /> },
        { id: 'data-fabric', label: 'Fabric', icon: <ServerStackIcon className="w-5 h-5" />, component: <DataFabricView onSyncingChange={onSyncingChange} onOpenDataPlayground={onOpenDataPlayground} onDataUpload={onDataUpload} processingResults={processingResults} /> },
        { id: 'team', label: 'Providers', icon: <UserGroupIcon className="w-5 h-5"/>, component: <TeamView onOpenAiCommandCenter={onOpenAiCommandCenter} onSubViewChange={onSubViewChange} appData={appData} /> },
        { id: 'robotics', label: 'Case Management', icon: <WrenchScrewdriverIcon className="w-5 h-5"/>, component: <RoboticsView onOpenAiCommandCenter={onOpenAiCommandCenter} /> },
    ], [onOpenAiCommandCenter, onViewChange, onGenerateWeeklySummary, onOpenTrustSend, syncingSource, appData, isLiveDataSimulating, onOpenFlowCapture, onSubViewChange, onOpenAuditTrail, onShowOpportunityAlert, selectedEntityId, onSyncingChange, onOpenDataPlayground, onDataUpload, processingResults, onNavigateToClient]);

    const primaryViews = ['dashboard', 'matters', 'documents', 'reviews', 'research', 'comms', 'calendar'];
    const secondaryViews = ['settings'];
    
    // Fallback to legacy views if persona doesn't have the new ones
    const filteredViews = useMemo(() => {
        const hasNewViews = persona.visibleViews.some(v => primaryViews.includes(v));
        if (hasNewViews) {
             return views.filter(v => persona.visibleViews.includes(v.id));
        }
        return views.filter(v => persona.visibleViews.includes(v.id));
    }, [views, persona]);

    useEffect(() => {
        if (activeView !== 'renewit' && activeView !== 'team' && activeView !== 'analysis') {
            onSubViewChange(null);
        }
    }, [activeView, onSubViewChange]);
    
    const ActiveComponent = views.find(v => v.id === activeView)?.component;

    const shouldShowAlert = opportunityAlert.visible && (
        opportunityAlert.view === activeView || 
        (activeView === 'renewit' && opportunityAlert.view === 'renewit-ops')
    );

    return (
        <div className="flex flex-col h-full overflow-hidden bg-bg-primary">
            {/* Horizontal Nav Bar */}
            <div className="flex-none z-10 bg-bg-primary border-b border-divider px-4 lg:px-8">
                <nav className="flex items-center gap-6 overflow-x-auto no-scrollbar justify-start">
                    {views.filter(v => primaryViews.includes(v.id)).map(view => (
                        <button
                            key={view.id}
                            onClick={() => onViewChange(view.id as ViewId)}
                            className={`
                                relative flex items-center gap-2 py-4 text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-300 whitespace-nowrap font-sans-ui
                                ${activeView === view.id 
                                    ? 'text-accent-primary border-b-2 border-accent-primary' 
                                    : 'text-text-dim hover:text-text-primary'
                                }
                            `}
                        >
                            {view.label}
                        </button>
                    ))}
                </nav>
            </div>
            
            {/* Main Content Area */}
            <div 
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 custom-scrollbar scroll-smooth bg-bg-primary"
            >
                <div className="max-w-[1600px] mx-auto w-full">
                    {shouldShowAlert && (
                        <div className="mb-3 animate-slide-in-down">
                            <OpportunityAlertBanner 
                                message={opportunityAlert.message} 
                                onDismiss={onDismissOpportunityAlert}
                            />
                        </div>
                    )}

                    <div className="animate-fade-in pb-20">
                        {ActiveComponent || <div className="p-8 text-center text-text-secondary uppercase font-black tracking-widest opacity-30">Feature currently in synthesis...</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};
