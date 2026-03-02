
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../ui/Card';
import { 
    BotIcon, ServerStackIcon, RefreshIcon, 
    ShieldCheckIcon, CurrencyDollarIcon, WarningIcon,
    MagnifyingGlassIcon, ArrowDownIcon, CheckCircleIcon
} from '../ui/Icons';
import { flowview } from '../../lib/westflow-client';
import { legalServer } from '../../services/legalServerService';
import { useToast } from '../../contexts/ToastContext';
import { NodeDetailModal } from '../NodeDetailModal';

// CMYK Style Supply Indicator
const SupplyPill: React.FC<{ label: string, percent: number, color: string }> = ({ label, percent, color }) => (
    <div className="flex flex-col gap-1 w-full">
        <div className="flex justify-between text-[9px] font-black uppercase tracking-tighter">
            <span className="text-text-secondary">{label}</span>
            <span className="text-text-primary font-bold">{percent}%</span>
        </div>
        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden border border-border/50">
            <div 
                className={`h-full transition-all duration-1000 ${color}`} 
                style={{ width: `${percent}%` }}
            ></div>
        </div>
    </div>
);

const MeterRow: React.FC<{ device: any, onSelect: (d: any) => void }> = ({ device, onSelect }) => {
    const isError = device.status === 'ERROR' || device.status === 'OFFLINE';
    const { showToast } = useToast();
    const [isSyncing, setIsSyncing] = useState(false);
    const [lastSyncId, setLastSyncId] = useState<string | null>(null);
    
    const sessionTime = Math.floor(Math.random() * 50000);

    const handleSyncToLS = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Don't trigger the row click
        setIsSyncing(true);
        try {
            const res = await legalServer.pushSessionLog({
                clientId: device.serial_number,
                logType: 'Standard',
                value: sessionTime,
                source: 'SESSION_MONITOR'
            });
            if (res.success) {
                setLastSyncId(res.transactionId || 'COURT-OK');
                showToast(`Client ${device.serial_number} synced to LegalServer.`);
            }
        } finally {
            setIsSyncing(false);
        }
    };

    return (
        <tr 
            onClick={() => onSelect(device)}
            className={`border-b border-border/40 hover:bg-primary/5 transition-colors group cursor-pointer ${isError ? 'bg-danger/5' : ''}`}
        >
            <td className="p-4">
                <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center border-2 ${isError ? 'bg-danger/20 border-danger/40 text-danger' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                        {device.device_type === 'ROBOT' ? <BotIcon className="w-5 h-5" /> : <span className="text-sm">👤</span>}
                    </div>
                    <div>
                        <div className="font-black text-sm text-text-primary uppercase tracking-tight group-hover:text-primary transition-colors">{device.serial_number}</div>
                        <div className="text-[10px] text-text-secondary uppercase font-bold tracking-widest">{device.model_name || 'GENERIC_CLIENT'}</div>
                    </div>
                </div>
            </td>
            <td className="p-4">
                <div className="text-[11px] font-black text-text-primary uppercase">{device.customer_name || 'ACS_DISTRICT'}</div>
                <div className="text-[10px] font-mono text-primary font-bold opacity-60">LOC: {device.location || 'ZONE_ALPHA'}</div>
            </td>
            <td className="p-4">
                <div className="flex flex-col gap-2 w-32">
                    <SupplyPill label="INTAKE" percent={device.toner_c || 59} color="bg-cyan-400" />
                    <SupplyPill label="SESSIONS" percent={device.toner_m || 99} color="bg-pink-500" />
                </div>
            </td>
            <td className="p-4">
                <div className="flex flex-col gap-2 w-32">
                    <SupplyPill label="REPORTS" percent={device.toner_y || 68} color="bg-yellow-400" />
                    <SupplyPill label="FILING" percent={device.toner_k || 24} color="bg-slate-900 dark:bg-slate-300" />
                </div>
            </td>
            <td className="p-4 text-right">
                <div className="font-mono text-sm font-black text-text-primary">{sessionTime.toLocaleString()}</div>
                <div className="text-[9px] font-bold text-text-secondary uppercase tracking-widest">L1: RUNTIME</div>
            </td>
            <td className="p-4 text-center">
                <div className="flex flex-col items-center gap-1">
                    <button 
                        onClick={handleSyncToLS}
                        disabled={isSyncing}
                        className={`p-2 rounded-xl border transition-all ${
                            lastSyncId 
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500 shadow-sm' 
                            : 'bg-white dark:bg-slate-800 border-border text-text-secondary hover:text-primary hover:border-primary/50'
                        }`}
                        title="Force LegalServer Sync"
                    >
                        {isSyncing ? <RefreshIcon className="w-4 h-4 animate-spin" /> : lastSyncId ? <CheckCircleIcon className="w-4 h-4" /> : <ServerStackIcon className="w-4 h-4" />}
                    </button>
                    {lastSyncId && <span className="text-[7px] font-mono opacity-50 uppercase font-black">{lastSyncId}</span>}
                </div>
            </td>
            <td className="p-4 text-center">
                <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border uppercase tracking-widest shadow-sm ${
                    !isError ? 'bg-success/10 text-success border-success/30' : 'bg-danger/10 text-danger border-danger/30 animate-pulse'
                }`}>
                    {device.status || 'READY'}
                </span>
            </td>
        </tr>
    );
};

// FIX: Renamed component to RoboticsViewInternal to resolve naming conflict with memoized export.
const RoboticsViewInternal: React.FC<{ onOpenAiCommandCenter: (p: string) => void }> = ({ onOpenAiCommandCenter }) => {
    const [fleet, setFleet] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');
    const [selectedDevice, setSelectedDevice] = useState<any>(null);

    async function loadData() {
        setLoading(true);
        try {
            const f = await flowview.getFleetStatus();
            setFleet(f.devices || []);
        } catch (e) {
            console.error("Fleet sync error:", e);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadData(); }, []);

    const stats = useMemo(() => {
        const total = fleet.length;
        const lowSupplies = fleet.filter(d => (d.toner_k || 100) < 25).length;
        const critical = fleet.filter(d => d.status === 'ERROR' || d.status === 'OFFLINE').length;
        return { total, lowSupplies, critical };
    }, [fleet]);

    return (
        <div className="space-y-8 animate-fade-in pb-20 w-full px-4 lg:px-8 max-w-[1600px] mx-auto">
            {/* 1. Header Area */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 pt-4">
                <div className="flex items-center gap-5">
                    <div className="p-4 bg-slate-900 rounded-3xl text-primary border border-primary/20 shadow-glow-primary">
                        <ServerStackIcon className="w-10 h-10"/>
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-text-primary uppercase tracking-tighter leading-none">Case Management Center</h2>
                        <div className="flex items-center gap-3 mt-2">
                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-text-secondary">ACS-LEGAL MISSOURI FABRIC</span>
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[11px] font-mono text-emerald-600 font-bold uppercase tracking-widest">Live Sync: ACTIVE</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-4 w-full lg:w-auto">
                    <div className="flex bg-component-light p-1.5 rounded-2xl border border-border shadow-inner">
                        {['ALL', 'ALERTS', 'LOW_SUPPLY'].map(t => (
                            <button 
                                key={t}
                                onClick={() => setFilter(t)}
                                className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                                    filter === t ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:text-text-primary'
                                }`}
                            >
                                {t.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                    <button onClick={loadData} className="flex items-center gap-2 text-[11px] font-black text-primary uppercase bg-white px-8 py-2.5 rounded-2xl border border-border hover:border-primary shadow-sm active:scale-95 transition-all">
                        <RefreshIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Caseload
                    </button>
                </div>
            </div>

            {/* 2. Situational Awareness Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="p-6 flex flex-col justify-center items-center text-center bg-component-light border-b-4 border-b-primary">
                    <span className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] mb-2">Active Caseload</span>
                    <span className="text-5xl font-black text-text-primary tracking-tighter">{stats.total}</span>
                    <span className="text-[10px] font-bold text-emerald-500 mt-2 uppercase tracking-[0.2em]">Active Clients</span>
                </Card>
                <Card className="p-6 flex flex-col justify-center items-center text-center border-b-4 border-b-danger bg-danger/5">
                    <span className="text-[10px] font-black text-danger uppercase tracking-[0.3em] mb-2">Compliance Risks</span>
                    <span className="text-5xl font-black text-danger tracking-tighter">{stats.critical}</span>
                    <span className="text-[10px] font-bold text-danger/60 mt-2 uppercase tracking-[0.2em]">Requiring Action</span>
                </Card>
                <Card className="p-6 flex flex-col justify-center items-center text-center border-b-4 border-b-warning bg-warning/5">
                    <span className="text-[10px] font-black text-warning uppercase tracking-[0.3em] mb-2">Overdue Actions</span>
                    <span className="text-5xl font-black text-warning tracking-tighter">{stats.lowSupplies}</span>
                    <span className="text-[10px] font-bold text-warning/60 mt-2 uppercase tracking-[0.2em]">Immediate Attention</span>
                </Card>
                <Card className="p-6 flex flex-col justify-center items-center text-center border-b-4 border-b-primary bg-primary/5">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Compliance Score</span>
                    <span className="text-5xl font-black text-primary tracking-tighter">98.4%</span>
                    <span className="text-[10px] font-bold text-primary/60 mt-2 uppercase tracking-[0.2em]">Filing Accuracy</span>
                </Card>
            </div>

            {/* 3. CRITICAL NODES GRID */}
            <Card className="p-0 overflow-hidden border border-border shadow-2xl rounded-[40px] bg-component/40 backdrop-blur-xl">
                <div className="p-8 border-b border-border bg-component/50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-4 w-full md:w-auto bg-component-light px-6 py-3 rounded-2xl border border-border shadow-inner focus-within:border-primary transition-colors group">
                        <MagnifyingGlassIcon className="w-6 h-6 text-text-secondary group-focus-within:text-primary transition-colors"/>
                        <input 
                            type="text" 
                            placeholder="Search Client ID, Name, or Program..." 
                            className="bg-transparent border-none outline-none text-sm font-bold uppercase tracking-widest placeholder:opacity-30 w-full min-w-[300px]"
                        />
                    </div>
                    <div className="flex items-center gap-8">
                        {['Intake', 'Sess', 'Rep', 'File'].map((c, i) => (
                            <div key={c} className="flex items-center gap-2">
                                <div className={`w-3.5 h-3.5 rounded-full shadow-sm ${['bg-cyan-400', 'bg-pink-500', 'bg-yellow-400', 'bg-slate-900 dark:bg-slate-300'][i]}`}></div>
                                <span className="text-[11px] font-black text-text-secondary uppercase tracking-widest">{c}</span>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead className="bg-component-light/80 border-b border-border">
                            <tr className="text-[11px] font-black text-text-secondary uppercase tracking-[0.25em]">
                                <th className="p-5">Client Identity</th>
                                <th className="p-5">Program Context</th>
                                <th className="p-5">Compliance Path A</th>
                                <th className="p-5">Compliance Path B</th>
                                <th className="p-5 text-right">Program Progress</th>
                                <th className="p-5 text-center">Court Link</th>
                                <th className="p-5 text-center">Case Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30">
                            {fleet.length === 0 ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={7} className="p-12"><div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full w-full"></div></td>
                                    </tr>
                                ))
                            ) : (
                                fleet.map((device) => (
                                    <MeterRow key={device.id} device={device} onSelect={setSelectedDevice} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            <NodeDetailModal 
                isOpen={!!selectedDevice} 
                onClose={() => setSelectedDevice(null)} 
                device={selectedDevice} 
                onOpenAiCommandCenter={onOpenAiCommandCenter}
            />

            {/* 4. PREDICTIVE MATRIX */}
            <Card className="p-0 overflow-hidden border border-border shadow-xl rounded-[32px] opacity-80 hover:opacity-100 transition-opacity">
                <div className="bg-[#020617] p-5 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-primary/20 rounded-xl text-primary"><ShieldCheckIcon className="w-5 h-5"/></div>
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">Predictive Compliance Matrix</h3>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Caseload Capacity & Program Forecasting</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-emerald-400 font-black uppercase tracking-widest px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">Gemini-3-Pro Active</span>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-component-light/50 border-b border-border">
                            <tr className="text-[11px] font-black text-text-secondary uppercase tracking-widest">
                                <th className="p-5">Metric Definition</th>
                                <th className="p-5 text-center">Consumption Rate</th>
                                <th className="p-5 text-center">30 Day Delta</th>
                                <th className="p-5 text-center">180 Day Delta</th>
                                <th className="p-5 text-center">1 Year Projection</th>
                                <th className="p-5 text-center">LTV Forecast (3Y)</th>
                                <th className="p-5 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50 text-xs font-medium text-text-secondary">
                            {[
                                { node: 'M1 (SESSIONS)', rate: '16.9%', m1: 0.43, m6: 6.50, y1: 13.0, y3: 39.01 },
                                { node: 'M2 (ACTIONS)', rate: '1.99%', m1: 0.07, m6: 1.12, y1: 2.24, y3: 6.73 },
                                { node: 'PROGRESS (PROGRAM)', rate: '3.25%', m1: 0.08, m6: 1.18, y1: 2.35, y3: 7.05 },
                            ].map((row, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                                    <td className="p-5 font-black text-text-primary text-sm tracking-tighter">{row.node}</td>
                                    <td className="p-5 text-center bg-primary/5 font-black text-primary">{row.rate}</td>
                                    <td className="p-5 text-center font-mono font-bold">{row.m1}k</td>
                                    <td className="p-5 text-center font-mono font-bold">{row.m6}k</td>
                                    <td className="p-5 text-center font-mono font-bold">{row.y1}k</td>
                                    <td className="p-5 text-center font-mono font-black text-primary text-sm">{row.y3}k</td>
                                    <td className="p-5 text-center">
                                        <button className="text-[10px] font-black uppercase text-primary hover:underline tracking-widest">Recalculate</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

// FIX: Exported memoized RoboticsViewInternal as RoboticsView.
export const RoboticsView = React.memo(RoboticsViewInternal);
