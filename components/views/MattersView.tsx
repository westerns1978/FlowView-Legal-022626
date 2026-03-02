
import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { 
    ShieldCheckIcon, 
    MagnifyingGlassIcon, 
    PlusIcon,
    FilterIcon,
    ChevronRightIcon,
    UserIcon,
    CalendarIcon,
    DocumentTextIcon,
    SparklesIcon
} from '../ui/Icons';
import { AppData } from '../../types';

interface Matter {
    id: string;
    name: string;
    client: string;
    type: string;
    status: 'Active' | 'Pending' | 'Closed';
    attorney: string;
    deadline: string;
    risk: 'Low' | 'Medium' | 'High';
}

const MOCK_MATTERS: Matter[] = [
    { id: 'MTR-001', name: 'Smith v. State', client: 'John Smith', type: 'Litigation', status: 'Active', attorney: 'Sarah Jenkins', deadline: 'Today', risk: 'High' },
    { id: 'MTR-002', name: 'Jones Corp Acquisition', client: 'Jones Corp', type: 'Corporate', status: 'Pending', attorney: 'Michael Ross', deadline: 'Mar 12', risk: 'Medium' },
    { id: 'MTR-003', name: 'Miller Estate Planning', client: 'Estate of Miller', type: 'Estate', status: 'Active', attorney: 'Harvey Specter', deadline: 'Mar 15', risk: 'Low' },
    { id: 'MTR-004', name: 'TechSoft Patent Filing', client: 'TechSoft Inc', type: 'IP', status: 'Active', attorney: 'Louis Litt', deadline: 'Mar 18', risk: 'Medium' },
    { id: 'MTR-005', name: 'Green Valley Zoning', client: 'Green Valley Developers', type: 'Real Estate', status: 'Closed', attorney: 'Donna Paulsen', deadline: 'Completed', risk: 'Low' },
    { id: 'MTR-006', name: 'Doe Employment Dispute', client: 'Jane Doe', type: 'Employment', status: 'Active', attorney: 'Sarah Jenkins', deadline: 'Mar 22', risk: 'High' },
];

export const MattersView: React.FC<{ appData: AppData; onOpenAiCommandCenter: (p: string) => void }> = ({ appData, onOpenAiCommandCenter }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedMatter, setSelectedMatter] = useState<Matter | null>(null);

    const filteredMatters = useMemo(() => {
        return MOCK_MATTERS.filter(m => 
            m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
            m.attorney.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery]);

    return (
        <div className="flex flex-col h-full space-y-6 animate-fade-in px-4 lg:px-8 w-full pb-10 pt-2 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-text-primary tracking-tight font-serif-display">Matters</h1>
                    <p className="text-text-dim text-sm font-serif-body italic">Managing {MOCK_MATTERS.length} active legal matters across the firm.</p>
                </div>
                <button className="flex items-center gap-2 bg-accent-primary text-bg-primary px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-accent-primary/20">
                    <PlusIcon className="w-4 h-4" />
                    New Matter
                </button>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-dim" />
                    <input 
                        type="text" 
                        placeholder="Search matters, clients, or attorneys..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-bg-card border border-divider rounded-2xl outline-none focus:border-accent-primary/50 transition-all font-serif-body italic text-text-primary shadow-sm"
                    />
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-bg-card border border-divider rounded-2xl text-xs font-bold uppercase tracking-widest text-text-dim hover:text-text-primary hover:border-accent-primary/50 transition-all shadow-sm">
                    <FilterIcon className="w-4 h-4" />
                    Filters
                </button>
            </div>

            {/* Matters List */}
            <Card className="overflow-hidden border-t-2 border-t-accent-primary shadow-md rounded-xl bg-bg-card/60 backdrop-blur-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-bg-secondary/40 border-b border-divider">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-dim font-sans-ui">Matter Name</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-dim font-sans-ui">Client</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-dim font-sans-ui">Type</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-dim font-sans-ui">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-dim font-sans-ui">Attorney</th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-text-dim font-sans-ui">Next Deadline</th>
                                <th className="px-6 py-4"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-divider/50">
                            {filteredMatters.map((matter) => (
                                <tr 
                                    key={matter.id} 
                                    onClick={() => setSelectedMatter(matter)}
                                    className="hover:bg-bg-secondary/30 transition-colors cursor-pointer group"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${
                                                matter.risk === 'High' ? 'bg-risk-high' : 
                                                matter.risk === 'Medium' ? 'bg-risk-medium' : 'bg-risk-low'
                                            }`}></div>
                                            <span className="text-sm font-bold text-text-primary group-hover:text-accent-primary transition-colors">{matter.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-dim font-serif-body italic">{matter.client}</td>
                                    <td className="px-6 py-4">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-bg-secondary border border-divider rounded text-text-dim">
                                            {matter.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                                            matter.status === 'Active' ? 'text-emerald-500 bg-emerald-500/10' :
                                            matter.status === 'Pending' ? 'text-amber-500 bg-amber-500/10' :
                                            'text-text-dim bg-bg-secondary'
                                        }`}>
                                            {matter.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-text-primary font-medium">{matter.attorney}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="w-4 h-4 text-text-dim" />
                                            <span className={`text-xs font-bold ${matter.deadline === 'Today' ? 'text-risk-high' : 'text-text-primary'}`}>
                                                {matter.deadline}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <ChevronRightIcon className="w-5 h-5 text-text-dim group-hover:text-accent-primary transition-all group-hover:translate-x-1 inline-block" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Detail Slide-over (Simplified as a Modal for now) */}
            {selectedMatter && (
                <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-sm" onClick={() => setSelectedMatter(null)}>
                    <div 
                        className="w-full max-w-2xl h-full bg-bg-card shadow-2xl border-l border-divider animate-slide-in-right overflow-y-auto"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="p-8 space-y-8">
                            {/* Detail Header */}
                            <div className="flex justify-between items-start">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] font-black text-accent-primary uppercase tracking-[0.2em] font-sans-ui">Matter Details</span>
                                        <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest px-2 py-0.5 bg-bg-secondary rounded border border-divider">{selectedMatter.id}</span>
                                    </div>
                                    <h2 className="text-3xl font-semibold text-text-primary tracking-tight font-serif-display">{selectedMatter.name}</h2>
                                    <p className="text-text-dim font-serif-body italic mt-1">{selectedMatter.client} · {selectedMatter.type}</p>
                                </div>
                                <button 
                                    onClick={() => setSelectedMatter(null)}
                                    className="p-2 hover:bg-bg-secondary rounded-full transition-colors"
                                >
                                    <PlusIcon className="w-6 h-6 rotate-45 text-text-dim" />
                                </button>
                            </div>

                            {/* AI Insight Panel */}
                            <div className="bg-gradient-to-br from-accent-subtle to-bg-card border border-accent-border rounded-2xl p-6 relative group">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center border border-accent-primary/20">
                                        <SparklesIcon className="w-4 h-4 text-accent-primary" />
                                    </div>
                                    <h3 className="text-xs font-black text-accent-primary uppercase tracking-widest font-sans-ui">AI Recommended Next Step</h3>
                                </div>
                                <p className="text-text-primary font-serif-body italic text-lg leading-relaxed">
                                    "Based on the upcoming filing deadline for {selectedMatter.name}, I recommend reviewing the latest discovery responses from Jones Corp to identify any potential conflicts before the status hearing."
                                </p>
                                <div className="flex gap-3 mt-6">
                                    <button 
                                        onClick={() => onOpenAiCommandCenter(`Draft discovery review for ${selectedMatter.name}`)}
                                        className="bg-accent-primary text-bg-primary px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-accent-primary/20"
                                    >
                                        Execute Review
                                    </button>
                                    <button className="bg-bg-secondary border border-divider text-text-dim px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:text-text-primary transition-all">
                                        Dismiss
                                    </button>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-bg-secondary/30 border border-divider">
                                    <div className="flex items-center gap-2 mb-1">
                                        <UserIcon className="w-4 h-4 text-text-dim" />
                                        <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Assigned Attorney</span>
                                    </div>
                                    <p className="text-lg font-semibold text-text-primary">{selectedMatter.attorney}</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-bg-secondary/30 border border-divider">
                                    <div className="flex items-center gap-2 mb-1">
                                        <CalendarIcon className="w-4 h-4 text-text-dim" />
                                        <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest">Next Deadline</span>
                                    </div>
                                    <p className="text-lg font-semibold text-text-primary">{selectedMatter.deadline}</p>
                                </div>
                            </div>

                            {/* Recent Documents */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <DocumentTextIcon className="w-5 h-5 text-accent-primary" />
                                        <h3 className="text-xs font-black uppercase tracking-widest font-sans-ui">Recent Documents</h3>
                                    </div>
                                    <button className="text-[10px] font-bold text-accent-primary hover:underline uppercase tracking-wider">View All</button>
                                </div>
                                <div className="space-y-2">
                                    {[
                                        { name: 'Initial_Complaint.pdf', date: '2 days ago', size: '1.2 MB' },
                                        { name: 'Discovery_Request_01.docx', date: '4 days ago', size: '450 KB' },
                                        { name: 'Client_Interview_Notes.txt', date: '1 week ago', size: '12 KB' },
                                    ].map((doc, i) => (
                                        <div key={i} className="p-3 rounded-xl border border-divider hover:border-accent-primary/30 transition-all flex items-center justify-between group cursor-pointer">
                                            <div className="flex items-center gap-3">
                                                <DocumentTextIcon className="w-4 h-4 text-text-dim group-hover:text-accent-primary" />
                                                <div>
                                                    <p className="text-xs font-bold text-text-primary">{doc.name}</p>
                                                    <p className="text-[10px] text-text-dim">{doc.date} · {doc.size}</p>
                                                </div>
                                            </div>
                                            <ChevronRightIcon className="w-4 h-4 text-text-dim opacity-0 group-hover:opacity-100 transition-all" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
