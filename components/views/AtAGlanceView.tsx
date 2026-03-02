
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../ui/Card';
import { WelcomeSection } from '../WelcomeSection';
import { StrategySection } from '../StrategySection';
import { generateStrategicOverview, ai } from '../../services/geminiService';
import { 
    BotIcon, CurrencyDollarIcon, 
    WarningIcon, ShieldCheckIcon, ServerStackIcon, ArrowRightIcon,
    WrenchScrewdriverIcon, RocketIcon, TimerIcon, LinkIcon,
    CheckCircleIcon, SparklesIcon, AlertTriangleIcon, RefreshIcon,
    FileTextIcon
} from '../ui/Icons';
import { flowview, WestFlowResponse } from '../../lib/westflow-client';
import { MetricCard } from '../ui/MetricCard';
import { useToast } from '../../contexts/ToastContext';

// Rigorous cleanup of AI artifacts
const cleanAiOutput = (text: string): string => {
    return text
        .replace(/#{1,6}\s?/g, '') 
        .replace(/\*\*(.*?)\*\*/g, '$1') 
        .replace(/\*(.*?)\*/g, '$1') 
        .replace(/__(.*?)__/g, '$1') 
        .replace(/`(.*?)`/g, '$1') 
        .trim();
};

const OperationalBriefingHero: React.FC<{ 
    billing: WestFlowResponse | null, 
    onAction: (p: string) => void,
    isResolved: boolean,
    onResolve: () => void
}> = ({ billing, onAction, isResolved, onResolve }) => {
    const [brief, setBrief] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isResolving, setIsResolving] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        const fetchBrief = async () => {
            if (isResolved) {
                setBrief("Success! The ACS-LEGAL fabric is now synchronized. $18,420 in session logs have been pushed to LegalServer. Billing liquidity for Friday is secured, and all client nodes are reporting nominal status.");
                setIsLoading(false);
                return;
            }

            try {
                const context = `ACS Jefferson City Status: $${billing?.unbilled_completed_service} sessions stuck in Clio. Focus: Jefferson City Clinic and Missouri Rehab backlog.`;
                const result = await generateStrategicOverview(context);
                setBrief(result);
            } catch (e) {
                setBrief("🚀 Operational health is currently nominal. 🎯 High priority: Resolve unbilled session logs to secure Friday's billing liquidity.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchBrief();
    }, [billing, isResolved]);

    const handlePushToEA = () => {
        setIsResolving(true);
        showToast("Initiating LegalServer XML Handshake...", "info");
        
        // Narrative resolution sequence
        setTimeout(() => {
            onResolve();
            setIsResolving(false);
            showToast("Fabric Restored: $18,420 pushed to Ledger.", "success");
            onAction("I have successfully pushed the Clio session logs to LegalServer. Please confirm that the billing buffer is now restored.");
        }, 2500);
    };

    const delta = billing?.payroll_delta || 0;
    const isCrisis = !isResolved && (delta < 0 || (billing?.unbilled_completed_service || 0) > 15000);

    return (
        <Card className={`p-0 overflow-hidden border-l-[12px] transition-all duration-1000 ${
            isCrisis 
                ? 'border-l-danger shadow-[0_0_60px_rgba(239,68,68,0.2)] ring-1 ring-danger/20 bg-slate-900/40' 
                : 'border-l-success shadow-[0_0_40px_rgba(16,185,129,0.15)] bg-emerald-950/20'
        } h-full rounded-[32px] backdrop-blur-2xl relative group`}>
            
            {isCrisis && <div className="absolute inset-0 bg-danger/[0.02] animate-pulse-slow pointer-events-none"></div>}
            {isResolving && (
                <div className="absolute inset-0 bg-black/60 z-50 flex flex-col items-center justify-center animate-fade-in">
                    <RefreshIcon className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="text-white font-black uppercase tracking-[0.4em] text-xs">Syncing Ledger Nodes...</p>
                    <div className="w-48 h-1 bg-white/10 rounded-full mt-4 overflow-hidden">
                        <div className="h-full bg-primary animate-progress-indeterminate"></div>
                    </div>
                </div>
            )}

            <div className="flex flex-col xl:flex-row h-full">
                <div className="flex-1 p-8 space-y-6 relative z-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className={`w-3 h-3 rounded-full transition-all duration-1000 ${isCrisis ? 'bg-danger animate-pulse shadow-[0_0_12px_rgba(239,68,68,1)]' : 'bg-success shadow-[0_0_10px_rgba(16,185,129,1)]'}`}></div>
                            <span className={`text-[10px] font-black uppercase tracking-[0.5em] transition-colors duration-1000 ${isCrisis ? 'text-danger' : 'text-success'}`}>
                                {isCrisis ? 'TACTICAL ALERT: ANOMALY DETECTED' : 'SYSTEM STATUS: NOMINAL'}
                            </span>
                        </div>
                        <div className="flex gap-2">
                             <span className={`text-[9px] font-mono font-black px-3 py-1 rounded-full border tracking-widest uppercase transition-all duration-1000 ${isCrisis ? 'bg-danger/10 border-danger/30 text-danger' : 'bg-success/10 border-success/30 text-success'}`}>ACS_NODE_ALPHA</span>
                        </div>
                    </div>

                    <h2 className={`text-4xl font-black uppercase tracking-tighter leading-none max-w-2xl transition-all duration-1000 ${isCrisis ? 'text-white drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]' : 'text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]'}`}>
                        {isCrisis ? `🚨 Billing Buffer Exhausted` : '✅ Billing Equilibrium Restored'}
                    </h2>
                    
                    {isLoading ? (
                        <div className="space-y-3 animate-pulse mt-2">
                            <div className="h-3 bg-text-secondary/10 rounded-full w-full"></div>
                            <div className="h-3 bg-text-secondary/10 rounded-full w-11/12"></div>
                            <div className="h-3 bg-text-secondary/10 rounded-full w-2/3"></div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-fade-in">
                            <div className={`text-[15px] leading-relaxed font-bold tracking-tight max-w-3xl transition-colors duration-1000 ${isCrisis ? 'text-slate-200' : 'text-text-primary'}`}>
                                {cleanAiOutput(brief)}
                            </div>
                            <div className="flex gap-3 pt-2">
                                {!isResolved ? (
                                    <>
                                        <button 
                                            onClick={() => onAction("Analyze the session backlog for Jefferson City Clinic.")}
                                            className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-danger/30 text-danger hover:bg-danger hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95"
                                        >
                                            🔍 REVIEW UNBILLED SESSIONS
                                        </button>
                                        <button 
                                            onClick={() => onAction("Which cases are at-risk and need attention?")}
                                            className="px-6 py-2.5 bg-white dark:bg-slate-800 border border-border rounded-xl text-[9px] font-black uppercase tracking-widest hover:text-danger transition-all shadow-sm active:scale-95"
                                        >
                                            ⚠️ AT-RISK CASES
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        onClick={() => onAction("Generate the post-sync reconciliation report.")}
                                        className="px-6 py-2.5 bg-emerald-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center gap-2"
                                    >
                                        <FileTextIcon className="w-4 h-4" /> Download Reconciliation
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className={`xl:w-[400px] flex flex-col p-10 items-center justify-center text-center relative border-l border-white/5 transition-all duration-1000 ${isCrisis ? 'bg-danger/10' : 'bg-emerald-900/20'}`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-40 w-full animate-scanline opacity-10 pointer-events-none"></div>
                    <p className={`text-[10px] uppercase font-black tracking-[0.5em] mb-4 transition-colors duration-1000 ${isCrisis ? 'text-danger font-bold' : 'text-emerald-500'}`}>
                        {isResolved ? 'RESTORED BILLING' : 'Trapped Revenue (Clio)'}
                    </p>
                    <p className={`text-7xl font-black font-mono tracking-tighter mb-8 transition-all duration-1000 ${isCrisis ? 'text-white drop-shadow-[0_0_30px_rgba(239,68,68,0.8)] scale-110' : 'text-emerald-400 drop-shadow-[0_0_25px_rgba(16,185,129,0.5)] scale-100'}`}>
                        ${isResolved ? '0' : Math.round(billing?.unbilled_completed_service || 0).toLocaleString()}
                    </p>
                    
                    {!isResolved ? (
                        <button 
                            onClick={handlePushToEA}
                            className="w-full py-5 text-[11px] font-black uppercase tracking-[0.4em] rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 group active:scale-95 bg-danger text-white hover:brightness-125"
                        >
                            Push to LegalServer <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-500"/>
                        </button>
                    ) : (
                        <div className="w-full py-5 text-[11px] font-black uppercase tracking-[0.4em] rounded-2xl flex items-center justify-center gap-3 bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
                            <CheckCircleIcon className="w-6 h-6" /> Synced with ERP
                        </div>
                    )}
                    
                    <div className="mt-8 flex items-center gap-2 text-slate-400">
                        <ShieldCheckIcon className={`w-4 h-4 transition-colors duration-1000 ${isCrisis ? 'text-danger animate-pulse' : 'text-emerald-400'}`} />
                        <span className="text-[8px] font-black uppercase tracking-widest">C2PA Sovereign Trust Anchor</span>
                    </div>
                </div>
            </div>
        </Card>
    );
};

const AtAGlanceViewInternal: React.FC<any> = ({ onOpenAiCommandCenter }) => {
    const [metrics, setMetrics] = useState<any>(null);
    const [stream, setStream] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isResolved, setIsResolved] = useState(false);
    const [floBriefing, setFloBriefing] = useState("");

            useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                const [summaryResp, billingResp, streamData, floIntel] = await Promise.all([
                    flowview.getExecutiveSummary(),
                    flowview.getPendingBilling(),
                    flowview.getIntegrityStream(),
                    flowview.getFloIntelligence()
                ]);
                
                const stats = summaryResp.data;
                setMetrics({ summary: stats, billing: billingResp, flo: floIntel });
                setStream(streamData);

                // Generate dynamic briefing via Flo Persona
                const prompt = `Generate Flo's morning briefing given this data:
                - Trapped Billing: $${floIntel.trappedPayroll} (${floIntel.unbilledHours} unbilled hours at $150/hr)
                - Open Actions: ${stats.service_status?.open_tickets || 5} (priorities: ${stats.service_status?.priorities?.join(', ') || 'N/A'})
                - Caseload: ${stats.fleet_health?.active} active, ${stats.fleet_health?.down} down out of ${stats.fleet_health?.total_devices} total
                - Recent Activity: ${stats.recent_activity?.map((a:any) => a.description).join('; ')}`;
                
                const response = await ai.models.generateContent({
                  model: 'gemini-3-flash-preview',
                  contents: [{ role: 'user', parts: [{ text: prompt }] }],
                  config: {
                    systemInstruction: `You are Flo, the AI Chief of Staff. FORMAT: Provide a scannable briefing using arrows (→) for each point. No paragraphs. Focus on unbilled sessions, compliance actions, and caseload health. Use 'at-risk cases' instead of 'churn'. Max 3 bullet points. No markdown formatting.`,
                    temperature: 0.4
                  }
                });
                
                setFloBriefing(response.text || "");
            } catch (error) {
                console.error("Dashboard Sync Failed:", error);
            } finally {
                setIsLoading(false);
            }
        };
        load();
        const interval = setInterval(load, 30000);
        return () => clearInterval(interval);
    }, []);

    const criticalInsights = useMemo(() => {
        if (isResolved) return [];
        return metrics?.summary?.insights?.filter((ins: any) => ins.severity === 'CRITICAL') || [];
    }, [metrics, isResolved]);

    if (isLoading && !metrics) {
        return (
            <div className="flex flex-col items-center justify-center h-[70vh] text-text-secondary">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-8 shadow-glow-primary"></div>
                <p className="text-[12px] font-black uppercase tracking-[0.8em] animate-pulse">Syncing ACS-LEGAL Bridge...</p>
            </div>
        );
    }

    const handleManualResolve = () => {
        setIsResolved(true);
    };

    const handleFloAction = (action: string) => {
        if (action === 'chat') onOpenAiCommandCenter("Open Flo Chat Panel");
        else if (action === 'audit') onOpenAiCommandCenter("Analyze the session backlog for all nodes.");
        else if (action === 'churn') onOpenAiCommandCenter("Which cases are at-risk and need attention?");
    };

    const uptimePct = metrics?.summary?.fleet_health 
        ? ((metrics.summary.fleet_health.active / metrics.summary.fleet_health.total_devices) * 100).toFixed(1)
        : "100";

    return (
        <div className="flex flex-col h-full space-y-6 animate-fade-in px-4 lg:px-8 w-full pb-10 max-w-[1600px] mx-auto">
            
            {/* 0. Critical System Alert Strip */}
            {criticalInsights.length > 0 ? (
                <div className="bg-danger p-3 rounded-2xl flex items-center justify-between px-8 shadow-[0_0_30px_rgba(239,68,68,0.4)] animate-pulse relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 translate-x-[-100%] animate-scanline pointer-events-none opacity-30"></div>
                    <div className="flex items-center gap-4 text-white">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <AlertTriangleIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] block leading-none mb-1 opacity-80">System Condition: Red</span>
                            <span className="text-sm font-black uppercase tracking-wider block leading-none">Intervention Required: {criticalInsights.length} P1 Event(s) Detected</span>
                        </div>
                    </div>
                    <button 
                        onClick={() => onOpenAiCommandCenter("Summarize all critical system interventions.")}
                        className="text-[10px] font-black bg-white text-danger px-6 py-2 rounded-xl uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-lg"
                    >
                        Execute Protocol
                    </button>
                </div>
            ) : isResolved ? (
                <div className="bg-emerald-500 p-3 rounded-2xl flex items-center justify-center px-8 shadow-lg animate-fade-in border border-emerald-400/20">
                    <div className="flex items-center gap-3 text-white">
                        <span className="text-[10px] font-black uppercase tracking-[0.5em]">Command Center Healthy • All Cases Synchronized</span>
                    </div>
                </div>
            ) : null}

            {/* 1. Flo Executive Welcome & OKRs */}
            <WelcomeSection 
                userName="Earl Philpot" 
                unbilledRevenue={isResolved ? 0 : (metrics.billing?.unbilled_completed_service || 18420)} 
                briefing={floBriefing}
                onAction={handleFloAction}
            />
            
            <StrategySection />

            {/* 2. Operational Hero */}
            <div className="flex-none h-[320px]">
                <OperationalBriefingHero 
                    billing={metrics.billing} 
                    onAction={onOpenAiCommandCenter} 
                    isResolved={isResolved}
                    onResolve={handleManualResolve}
                />
            </div>

            {/* 3. Critical Metrics Grid - Condensed */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-none">
                <MetricCard 
                    title="Billing This Period" 
                    value={`$${(metrics.billing?.pending_billing || 248500).toLocaleString()}`} 
                    icon={<CurrencyDollarIcon className="w-5 h-5"/>} 
                    trend={{ value: 'vs last period', direction: 'up' }}
                />
                <MetricCard 
                    title="Unbilled Sessions" 
                    value={isResolved ? "$0" : `$${(metrics.billing?.unbilled_completed_service || 18420).toLocaleString()}`} 
                    icon={<TimerIcon className="w-5 h-5"/>} 
                    trend={{ value: '10 sessions pending', direction: 'neutral' }}
                />
                <MetricCard 
                    title="Caseload Health" 
                    value={`${uptimePct}%`} 
                    icon={<RocketIcon className="w-5 h-5 text-emerald-500"/>} 
                    trend={{ value: '2 alerts', direction: 'neutral' }}
                />
                <MetricCard 
                    title="Open Actions" 
                    value={isResolved ? "0" : (metrics.summary?.service_status?.open_tickets?.toString() || "5")} 
                    icon={<WrenchScrewdriverIcon className="w-5 h-5"/>} 
                    trend={{ value: '3 dispatched, 2 waiting', direction: 'neutral' }}
                />
            </div>

            {/* 4. Operational Data Floor */}
            <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-6 min-h-[500px] overflow-hidden">
                <div className="xl:col-span-8 flex flex-col overflow-hidden h-full">
                    <Card className="p-0 overflow-hidden flex flex-col h-full border-t-[6px] border-t-primary shadow-xl rounded-[24px] bg-component/60 backdrop-blur-xl group">
                        <div className="flex items-center justify-between p-6 border-b border-border/50 bg-component-light/40">
                            <div className="flex items-center gap-3 text-primary">
                                <ServerStackIcon className="w-5 h-5 animate-pulse"/>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em]">Compliance Integrity Stream</h3>
                            </div>
                            <div className="flex gap-2">
                                <span className="text-[8px] font-mono text-emerald-500 font-black bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">LS: SYNCED</span>
                                <span className="text-[8px] font-mono text-primary font-black bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20 uppercase tracking-widest">CL: LIVE</span>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border/20">
                            {stream.slice(0, 10).map((item, i) => (
                                <div key={i} className="flex gap-4 p-4 hover:bg-primary/5 transition-all group cursor-pointer items-center border-l-4 border-l-transparent hover:border-l-primary relative">
                                    <div className="text-2xl shrink-0 opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300">{item.icon}</div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="text-[13px] font-black text-text-primary uppercase truncate tracking-tight group-hover:text-primary transition-colors">{item.title}</h4>
                                            <span className="text-[9px] font-mono text-text-secondary opacity-40 font-bold">
                                                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-text-secondary truncate font-bold uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity leading-none">{item.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-component-light/40 border-t border-border/50 text-center">
                            <button className="text-[9px] font-black uppercase tracking-[0.3em] text-primary hover:underline">View Full Ingest Logs &rarr;</button>
                        </div>
                    </Card>
                </div>

                <div className="xl:col-span-4 flex flex-col gap-6 h-full overflow-hidden">
                    {/* Fabric Interrupts Panel */}
                    <Card className={`flex-1 p-0 overflow-hidden border-l-[8px] flex flex-col shadow-xl rounded-[24px] transition-all duration-1000 ${
                        isResolved ? 'border-l-success bg-emerald-50/10' : 'border-l-danger bg-danger/[0.02]'
                    }`}>
                        <div className={`flex justify-between items-center p-6 border-b transition-colors duration-1000 ${
                            isResolved ? 'bg-emerald-500/10 border-emerald-500/10' : 'bg-danger/10 border-danger/10'
                        }`}>
                            <div className="flex items-center gap-3">
                                {isResolved ? <CheckCircleIcon className="w-5 h-5 text-success" /> : <WarningIcon className="w-5 h-5 text-danger animate-pulse"/>}
                                <h3 className={`text-[10px] font-black uppercase tracking-tighter ${isResolved ? 'text-success' : 'text-danger'}`}>
                                    {isResolved ? 'Protocols Completed' : 'Compliance Interrupts'}
                                </h3>
                            </div>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                            {isResolved ? (
                                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                                    <div className="p-4 bg-emerald-500/10 rounded-full mb-4">
                                        <ShieldCheckIcon className="w-12 h-12 text-success" />
                                    </div>
                                    <p className="text-xs font-black text-text-secondary uppercase tracking-widest">All high-priority interrupts cleared</p>
                                </div>
                            ) : (
                                metrics?.summary?.insights?.filter((ins: any) => ins.severity === 'CRITICAL').map((insight: any) => (
                                    <div key={insight.id} className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-danger/20 shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-16 h-16 bg-danger/5 rounded-full -translate-y-8 translate-x-8"></div>
                                        <div className="flex justify-between items-start mb-2 relative z-10">
                                            <h4 className="text-[14px] font-black text-text-primary uppercase tracking-tight leading-tight group-hover:text-danger transition-colors">{insight.title}</h4>
                                            <span className="text-[8px] font-black text-white bg-danger px-2 py-0.5 rounded border border-danger uppercase tracking-widest shadow-sm">P1</span>
                                        </div>
                                        <p className="text-[11px] text-text-secondary leading-relaxed font-bold uppercase tracking-tight mb-4 opacity-70 line-clamp-2 relative z-10">{insight.description}</p>
                                        <button 
                                            onClick={() => onOpenAiCommandCenter(`Execute ${insight.recommended_action} now.`)}
                                            className="w-full py-3 bg-slate-900 dark:bg-black text-white text-[9px] font-black uppercase tracking-[0.4em] rounded-xl hover:bg-danger transition-all active:scale-95 relative z-10"
                                        >
                                            Initiate Override
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </Card>

                    {/* Dynamic Flo Agent Summary */}
                    <div className={`p-8 rounded-[32px] text-white shadow-2xl flex-none relative overflow-hidden group transition-all duration-1000 ${
                        isResolved ? 'bg-gradient-to-br from-emerald-600 to-teal-500' : 'bg-gradient-to-br from-slate-900 to-[#1e293b] border border-white/10'
                    }`}>
                        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 group-hover:rotate-12 transition-all duration-700 pointer-events-none">
                             <img src="https://storage.googleapis.com/westerns1978-digital-assets/Miscellaneous/connie-ai.png" className="w-48 h-48 rounded-full filter grayscale" alt="" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-1 rounded-full border-2 border-[#2E86AB] bg-slate-800">
                                    <img src="https://storage.googleapis.com/westerns1978-digital-assets/Miscellaneous/connie-ai.png" className="w-8 h-8 rounded-full" alt="Flo" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#2E86AB]">Agent: Flo</span>
                            </div>
                            <p className="text-[14px] font-black leading-tight italic opacity-95 mb-6 tracking-tight">
                                {isResolved 
                                    ? '"The fabric is fully synchronized. Billing targets achieved."'
                                    : '"The fabric is synchronized. Ready to push Jefferson City Clinic reconciliations. Should I proceed?"'}
                            </p>
                            {!isResolved && (
                                <button onClick={() => onOpenAiCommandCenter("Deploy Jefferson City Clinic reconciliation.")} className="w-full py-4 bg-[#2E86AB] text-white font-black rounded-2xl text-[10px] uppercase tracking-[0.4em] hover:scale-105 active:scale-95 transition-all shadow-2xl">
                                    Initiate Protocol
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const AtAGlanceView = React.memo(AtAGlanceViewInternal);
