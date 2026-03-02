
import React from 'react';
import { CodeBracketIcon, ShieldCheckIcon } from './ui/Icons';

export const HumanInterfaceSection: React.FC = () => {
    const protocols = [
        { id: 'M-1', name: 'Universal Session Logic', trigger: 'SESSION_HEARTBEAT', description: 'Translates raw session data into LegalServer Session Logs.' },
        { id: 'S-4', name: 'SOW Extraction', trigger: 'DOC_INGEST', description: 'Extracts pricing terms from PDF and signs via C2PA.' },
        { id: 'A-2', name: 'Fraud Sentinel', trigger: 'EXPENSE_LOG', description: 'Flags outlier labor logs against historical dealer benchmarks.' }
    ];

    return (
        <div className="bg-[#020617] border border-white/5 rounded-3xl p-6 shadow-2xl">
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.4em] mb-6 flex items-center gap-3">
                <CodeBracketIcon className="w-5 h-5 text-emerald-400" />
                Agent_Execution_Protocols
            </h3>
            <div className="space-y-4">
                {protocols.map(p => (
                    <div key={p.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:border-emerald-500/40 transition-all group">
                        <div className="flex justify-between items-start mb-2">
                             <span className="text-[9px] font-mono text-emerald-500 font-black uppercase bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">{p.id}</span>
                             <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">{p.trigger}</span>
                        </div>
                        <h4 className="text-xs font-black text-white uppercase tracking-tight mb-1 group-hover:text-emerald-400 transition-colors">{p.name}</h4>
                        <p className="text-[10px] text-slate-400 leading-relaxed italic">"{p.description}"</p>
                    </div>
                ))}
            </div>
            <div className="mt-6 flex items-center gap-2 text-slate-500 justify-center">
                 <ShieldCheckIcon className="w-3 h-3 opacity-50" />
                 <span className="text-[8px] font-bold uppercase tracking-widest">Signed Protocol v2.2.0</span>
            </div>
        </div>
    );
};
