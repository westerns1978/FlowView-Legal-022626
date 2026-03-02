
import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { 
    ServerStackIcon, SparklesIcon, CodeBracketIcon, 
    CheckCircleIcon, WarningIcon, RefreshIcon, 
    ShieldCheckIcon, ArrowRightIcon, BotIcon 
} from '../ui/Icons';
import { useToast } from '../../contexts/ToastContext';
import { flowview, ERPStatus } from '../../lib/westflow-client';

const BridgeVisualizer: React.FC<{ erpStatuses: ERPStatus[] }> = ({ erpStatuses }) => {
    return (
        <Card className="bg-[#020617] border-slate-800 overflow-hidden relative min-h-[300px] flex flex-col items-center justify-center">
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiM0NDQiLz48L3N2Zz4=')]"></div>
            
            <div className="relative flex flex-col items-center gap-8 w-full max-w-2xl px-8">
                {/* Source */}
                <div className="flex flex-col items-center animate-fade-in">
                    <div className="p-4 bg-primary/10 rounded-2xl border border-primary/30 text-primary shadow-glow-primary">
                        <BotIcon className="w-10 h-10" />
                    </div>
                    <span className="mt-2 text-[10px] font-bold text-primary uppercase tracking-widest">IoT Telemetry Layer</span>
                </div>

                {/* The "Neutral Zone" Flow */}
                <div className="w-full relative py-8">
                    <div className="h-0.5 w-full bg-slate-800 absolute top-1/2 -translate-y-1/2"></div>
                    <div className="flex justify-between items-center relative z-10 w-full">
                        {/* Stream Particles Animation */}
                        <div className="absolute top-1/2 left-0 h-1 w-2 bg-primary rounded-full animate-flow-right shadow-[0_0_10px_#22d3ee]"></div>
                        <div className="absolute top-1/2 left-1/4 h-1 w-2 bg-primary rounded-full animate-flow-right delay-700 shadow-[0_0_10px_#22d3ee]"></div>
                        <div className="absolute top-1/2 left-1/2 h-1 w-2 bg-primary rounded-full animate-flow-right delay-1000 shadow-[0_0_10px_#22d3ee]"></div>
                    </div>

                    <div className="flex justify-between w-full relative z-20">
                        {/* LegalServer Target */}
                        <div className="flex flex-col items-center group">
                            <div className={`p-4 rounded-2xl border transition-all duration-500 ${erpStatuses.find(s => s.target === 'LegalServer')?.status === 'online' ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                <ServerStackIcon className="w-8 h-8" />
                            </div>
                            <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">LegalServer (LMS)</span>
                            <div className="text-[8px] font-mono text-emerald-500 mt-1 uppercase">XML Port 9780</div>
                        </div>

                        {/* Clio Target */}
                        <div className="flex flex-col items-center group">
                            <div className={`p-4 rounded-2xl border transition-all duration-500 ${erpStatuses.find(s => s.target === 'Clio')?.status === 'online' ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-slate-800 border-slate-700 text-slate-500'}`}>
                                <CodeBracketIcon className="w-8 h-8" />
                            </div>
                            <span className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">Clio (Agile)</span>
                            <div className="text-[8px] font-mono text-primary mt-1 uppercase">JSON REST API</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-4 left-4 right-4 flex justify-between text-[8px] font-mono text-slate-500 uppercase tracking-widest">
                <span>Orchestration: WestFlow continuum</span>
                <span>Switzerland Stance: Enabled</span>
            </div>
        </Card>
    );
};

export const DataFabricView: React.FC<any> = ({ onOpenDataPlayground }) => {
    const { showToast } = useToast();
    const [erpStatuses, setErpStatuses] = useState<ERPStatus[]>([]);
    const [isReconciling, setIsReconciling] = useState(false);

    useEffect(() => {
        const loadStatus = async () => {
            const status = await flowview.getERPStatuses();
            setErpStatuses(status);
        };
        loadStatus();
        const interval = setInterval(loadStatus, 15000);
        return () => clearInterval(interval);
    }, []);

    const runReconciliation = () => {
        setIsReconciling(true);
        showToast("Starting Cross-ERP Reconciliation...");
        setTimeout(() => {
            setIsReconciling(false);
            showToast("Reconciliation Complete: Found 3 meter discrepancies resolved.");
        }, 3000);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20">
            {/* Switzerland Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-2">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20 shadow-glow-primary">
                        <ServerStackIcon className="w-8 h-8"/>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary uppercase tracking-tighter">ACS Legal Fabric</h2>
                        <p className="text-text-secondary text-sm">Neutral orchestration between LegalServer LMS and Clio Agile ERP.</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={runReconciliation}
                        disabled={isReconciling}
                        className="flex items-center gap-2 bg-component border border-border px-4 py-2 rounded-xl text-xs font-bold text-text-primary hover:bg-white transition-all shadow-sm disabled:opacity-50"
                    >
                        <RefreshIcon className={`w-4 h-4 ${isReconciling ? 'animate-spin' : ''}`} />
                        Cross-ERP Reconcile
                    </button>
                    <button 
                        onClick={onOpenDataPlayground}
                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105"
                    >
                        <SparklesIcon className="w-4 h-4" />
                        AI Data Forge
                    </button>
                </div>
            </div>

            {/* Live Flow Visualization */}
            <BridgeVisualizer erpStatuses={erpStatuses} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LegalServer Connector Panel */}
                <Card className="border-l-4 border-l-emerald-500">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-bold border border-emerald-500/20">LS</div>
                            <div>
                                <h3 className="font-bold text-text-primary">LegalServer Tunnel</h3>
                                <p className="text-[10px] text-text-secondary uppercase font-mono">ALN Channel Protocol</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase bg-emerald-500/5 px-2 py-1 rounded">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            Secure Tunnel Active
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-3 bg-component-light rounded-lg border border-border flex justify-between items-center text-xs">
                            <span className="text-text-secondary uppercase font-black text-[9px] tracking-widest">ALN Build Version</span>
                            <span className="font-mono text-text-primary font-bold">8.44.201</span>
                        </div>
                        <div className="p-3 bg-component-light rounded-lg border border-border flex justify-between items-center text-xs">
                            <span className="text-text-secondary uppercase font-black text-[9px] tracking-widest">Session Ingestion (24h)</span>
                            <span className="font-mono text-text-primary font-bold">428 Reads</span>
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[8px] font-mono text-slate-500 uppercase">Last Sync: {new Date(erpStatuses.find(s=>s.target==='LegalServer')?.lastSync || '').toLocaleTimeString()}</span>
                        </div>
                        <button className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-text-primary text-[10px] font-bold uppercase tracking-widest rounded border border-border hover:bg-white transition-all">
                            Configure ALN XML Handshake
                        </button>
                    </div>
                </Card>

                {/* Clio Connector Panel */}
                <Card className="border-l-4 border-l-primary">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold border border-primary/20">CL</div>
                            <div>
                                <h3 className="font-bold text-text-primary">Clio Fabric</h3>
                                <p className="text-[10px] text-text-secondary uppercase font-mono">Agile REST Endpoint</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase bg-primary/5 px-2 py-1 rounded">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                            API Stream Active
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="p-3 bg-component-light rounded-lg border border-border flex justify-between items-center text-xs">
                            <span className="text-text-secondary uppercase font-black text-[9px] tracking-widest">API Latency</span>
                            <span className="font-mono text-text-primary font-bold">12ms (Cloud Run)</span>
                        </div>
                        <div className="p-3 bg-component-light rounded-lg border border-border flex justify-between items-center text-xs">
                            <span className="text-text-secondary uppercase font-black text-[9px] tracking-widest">Actions Automated (24h)</span>
                            <span className="font-mono text-text-primary font-bold">12 Automated</span>
                        </div>
                        <div className="flex justify-between items-center px-1">
                          <span className="text-[8px] font-mono text-slate-500 uppercase">Last Sync: {new Date(erpStatuses.find(s=>s.target==='Clio')?.lastSync || '').toLocaleTimeString()}</span>
                        </div>
                        <button className="w-full py-2 bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest rounded border border-primary/20 hover:bg-primary/10 transition-all">
                            Manage Clio Webhooks
                        </button>
                    </div>
                </Card>
            </div>

            {/* AI Schema Mapper */}
            <Card className="bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border-primary/10">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <SparklesIcon className="w-6 h-6 text-primary" />
                        <div>
                            <h3 className="font-bold text-text-primary">AI Dynamic Schema Mapping</h3>
                            <p className="text-xs text-text-secondary">Auto-mapping session telemetry to heterogeneous ERP targets.</p>
                        </div>
                    </div>
                    <img src="https://storage.googleapis.com/westerns1978-digital-assets/Miscellaneous/connie-ai.png" className="w-8 h-8 rounded-full border border-primary/40 shadow-sm" alt="Flo" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-black/5 p-4 rounded-xl border border-dashed border-border flex flex-col items-center justify-center text-center">
                        <BotIcon className="w-6 h-6 text-slate-400 mb-2" />
                        <p className="text-[10px] font-bold uppercase text-text-secondary">Session Source</p>
                        <p className="text-xs text-text-primary font-mono mt-1">SESSION_ID: 42.1</p>
                    </div>
                    <div className="flex items-center justify-center">
                        <ArrowRightIcon className="w-6 h-6 text-slate-300 animate-pulse" />
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between p-2 bg-emerald-500/5 rounded border border-emerald-500/20">
                            <span className="text-[9px] font-bold text-emerald-600 uppercase">To LegalServer</span>
                            <span className="text-[9px] font-mono text-emerald-700">&lt;Session1&gt;42&lt;/Session1&gt;</span>
                        </div>
                        <div className="flex items-center justify-between p-2 bg-primary/5 rounded border border-primary/20">
                            <span className="text-[9px] font-bold text-primary uppercase">To Clio</span>
                            <span className="text-[9px] font-mono text-primary">"compliance_score": 0.84</span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
};
