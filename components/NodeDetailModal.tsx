
import React, { useMemo } from 'react';
import { Card } from './ui/Card';
import { 
    CloseIcon, BotIcon, ServerStackIcon, ShieldCheckIcon, 
    WrenchScrewdriverIcon, TimerIcon, LineChartIcon,
    CodeBracketIcon, SparklesIcon
} from './ui/Icons';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

interface NodeDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    device: any;
    onOpenAiCommandCenter: (p: string) => void;
}

const TelemetryChart: React.FC<{ color: string }> = ({ color }) => {
    const data = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
        val: 40 + Math.random() * 20
    })), []);

    return (
        <div className="h-20 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data}>
                    <Area type="monotone" dataKey="val" stroke={color} fill={color} fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
};

export const NodeDetailModal: React.FC<NodeDetailModalProps> = ({ isOpen, onClose, device, onOpenAiCommandCenter }) => {
    if (!isOpen || !device) return null;

    const isRobot = device.device_type === 'ROBOT';

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[70] animate-fade-in" onClick={onClose}>
            <div 
                onClick={e => e.stopPropagation()} 
                className="bg-[#020617] w-full max-w-2xl h-auto max-h-[90vh] rounded-[32px] shadow-2xl border border-white/10 overflow-hidden flex flex-col transition-all duration-500 mx-4"
            >
                {/* Header */}
                <div className="p-6 bg-white/5 border-b border-white/10 flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/30 text-primary shadow-glow-primary">
                            {isRobot ? <BotIcon className="w-8 h-8" /> : <span className="text-xl">🖨️</span>}
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tighter uppercase leading-none">{device.serial_number}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400">{device.model_name}</span>
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                <span className="text-[9px] font-mono text-emerald-500 font-bold uppercase tracking-widest">Live_Sync</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <CloseIcon className="w-6 h-6 text-slate-500"/>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                    <div className="space-y-6">
                        {/* Summary Metrics */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-white/5 border-white/5 p-4">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Thermal Load</span>
                                    <span className="text-xs font-mono text-primary">42.4°C</span>
                                </div>
                                <TelemetryChart color="#0284c7" />
                            </Card>

                            <Card className="bg-white/5 border-white/5 p-4">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Network Latency</span>
                                    <span className="text-xs font-mono text-emerald-400">12ms</span>
                                </div>
                                <TelemetryChart color="#10b981" />
                            </Card>
                        </div>

                        {/* Sovereign Trust Seal */}
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 border border-white/10">
                            <div className="flex items-center gap-4">
                                <ShieldCheckIcon className="w-8 h-8 text-trust-c2pa" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-1">Sovereign Trust Seal</p>
                                    <p className="text-[9px] font-mono text-slate-400 truncate">VERIFIED_C2PA: 0x4a84920b12...ef8</p>
                                </div>
                            </div>
                        </div>

                        {/* Execution Ledger */}
                        <div>
                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-3 flex items-center gap-2">
                                <ServerStackIcon className="w-3.5 h-3.5 text-primary" /> Fabric Execution Ledger
                            </h4>
                            <Card className="p-0 overflow-hidden bg-white/5 border-white/5">
                                <table className="w-full text-left text-xs">
                                    <thead className="bg-white/5">
                                        <tr className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                            <th className="p-3">Timestamp</th>
                                            <th className="p-3">Action</th>
                                            <th className="p-3">Value</th>
                                            <th className="p-3">LMS Ref</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-slate-300">
                                        {[
                                            { ts: '10:42:01', act: 'SESSION_LOG', val: '42,801', ref: 'LS-992' },
                                            { ts: '09:15:44', act: 'HEARTBEAT', val: 'STATE_OK', ref: 'GW-001' },
                                            { ts: 'Yesterday', act: 'SESSION_LOG', val: '42,760', ref: 'LS-841' },
                                        ].map((row, i) => (
                                            <tr key={i} className="hover:bg-white/5 transition-colors">
                                                <td className="p-3 font-mono opacity-60">{row.ts}</td>
                                                <td className="p-3 font-black uppercase tracking-tight">{row.act}</td>
                                                <td className="p-3 font-mono font-bold text-primary">{row.val}</td>
                                                <td className="p-3"><span className="px-2 py-0.5 rounded bg-white/5 text-[8px] font-mono">{row.ref}</span></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </Card>
                        </div>

                        {/* Service History & AI Action */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="bg-white/5 border-white/5 p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-black text-[10px] text-white uppercase tracking-tight">Action #A-9901</span>
                                    <span className="text-[7px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-black">RESOLVED</span>
                                </div>
                                <p className="text-[10px] text-slate-400 leading-relaxed italic">"Compliance review on session 2. Completed remote integrity check."</p>
                            </Card>

                            <Card className="bg-primary/10 border-primary/20 p-4">
                                <p className="text-[10px] font-bold text-white leading-relaxed mb-3">
                                    Recommend session extension or additional review within 72 hours based on compliance trends.
                                </p>
                                <button 
                                    onClick={() => onOpenAiCommandCenter(`Execute compliance protocol for ${device.serial_number}`)}
                                    className="w-full py-2 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:brightness-110 active:scale-95 transition-all shadow-glow-primary"
                                >
                                    Initiate Compliance Protocol
                                </button>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-white/5 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                    <div className="flex items-center gap-2 text-slate-500">
                        <TimerIcon className="w-3.5 h-3.5" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Last Handshake: 14s ago</span>
                    </div>
                    <button 
                        onClick={() => onOpenAiCommandCenter(`Audit the full history and SLA compliance for node ${device.serial_number}`)}
                        className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-xl font-black text-[9px] uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all shadow-xl"
                    >
                        <SparklesIcon className="w-3.5 h-3.5 text-primary" />
                        Deep AI Audit
                    </button>
                </div>
            </div>
        </div>
    );
};
