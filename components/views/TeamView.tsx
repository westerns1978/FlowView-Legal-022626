
import React, { useState, useEffect, useMemo } from 'react';
import { UtilizationView } from './UtilizationView';
import { TravelHistoryView } from './TravelHistoryView';
import { InventoryView } from './InventoryView';
import { PointsLeaderboard } from '../PointsLeaderboard';
import { AppData } from '../../types';
import { Card } from '../ui/Card';
import { SparklesIcon, BotIcon, UserGroupIcon, ServerStackIcon, RocketIcon } from '../ui/Icons';
import { generateStrategicOverview } from '../../services/geminiService';

type SubViewId = 'utilization' | 'travel' | 'inventory';

interface TeamViewProps {
     onOpenAiCommandCenter: (prompt: string) => void;
     onSubViewChange: (subViewId: SubViewId | string) => void;
     appData: AppData;
}

const SubNavButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all rounded-lg ${
            isActive 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-text-secondary hover:text-text-primary hover:bg-component-light'
        }`}
    >
        {label}
    </button>
);

const TeamAuditCard: React.FC<{ data: AppData; onAction: (p: string) => void }> = ({ data, onAction }) => {
    const [audit, setAudit] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAudit = async () => {
            const teamStats = `Team of ${data.foundationalData.technicians.length} providers. Total Hours: ${data.utilizationData.reduce((s,e) => s+e.hours, 0).toFixed(1)}. Avg Billable: ${Math.round(data.utilizationData.reduce((s,e) => s+e.billablePct, 0) / data.utilizationData.length)}%. Top performer: ${[...data.utilizationData].sort((a,b) => b.hours - a.hours)[0]?.name}.`;
            try {
                const res = await generateStrategicOverview(`Provider Audit: ${teamStats}`);
                setAudit(res);
            } catch (e) {
                setAudit("🚀 Provider fabric is stable. Recommended focus: Review low-utilization providers for caseload optimization.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAudit();
    }, [data]);

    return (
        <Card className="bg-slate-900 border-l-[8px] border-l-primary p-6 rounded-[24px] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <BotIcon className="w-48 h-48 text-white"/>
            </div>
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-primary/20 rounded-xl">
                        <SparklesIcon className="w-5 h-5 text-primary animate-pulse" />
                    </div>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Flo's Provider Audit</span>
                </div>
                {isLoading ? (
                    <div className="animate-pulse space-y-2">
                        <div className="h-2 bg-slate-800 rounded w-full"></div>
                        <div className="h-2 bg-slate-800 rounded w-2/3"></div>
                    </div>
                ) : (
                    <p className="text-sm font-bold text-slate-200 leading-relaxed max-w-3xl italic">{audit}</p>
                )}
                <div className="mt-4 flex gap-3">
                    <button onClick={() => onAction("Generate a full utilization report for this month.")} className="text-[9px] font-black uppercase tracking-widest text-primary hover:underline">Full Analytics &rarr;</button>
                </div>
            </div>
        </Card>
    );
};

const TeamViewInternal: React.FC<TeamViewProps> = ({ onOpenAiCommandCenter, onSubViewChange, appData }) => {
    const [activeSubView, setActiveSubView] = useState<SubViewId>('utilization');
    const [filteredTravelEmployeeId, setFilteredTravelEmployeeId] = useState<number | null>(null);

    useEffect(() => {
        onSubViewChange(activeSubView);
    }, [activeSubView, onSubViewChange]);

    const handleSwitchToTravel = (employeeId: number) => {
        setFilteredTravelEmployeeId(employeeId);
        setActiveSubView('travel');
    };
    
    const handleClearTravelFilter = () => {
        setFilteredTravelEmployeeId(null);
    };

    const subViews = [
        { id: 'utilization', label: 'Utilization', component: <UtilizationView onOpenAiCommandCenter={onOpenAiCommandCenter} appData={appData} onSwitchToTravelView={handleSwitchToTravel} /> },
        { id: 'travel', label: 'Provider Map', component: <TravelHistoryView appData={appData} filterByEmployeeId={filteredTravelEmployeeId} onClearFilter={handleClearTravelFilter} /> },
        { id: 'inventory', label: 'Supply Stock', component: <InventoryView appData={appData} /> },
    ];
    
    const ActiveComponent = subViews.find(v => v.id === activeSubView)?.component;

    return (
        <div className="animate-fade-in space-y-6 pb-10 px-4 max-w-[1700px] mx-auto">
            {/* 1. High-Impact Strategic Header */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8">
                    <TeamAuditCard data={appData} onAction={onOpenAiCommandCenter} />
                </div>
                <div className="xl:col-span-4">
                    <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20 flex flex-col justify-between h-full p-6">
                        <div>
                             <h3 className="text-xs font-black text-text-primary uppercase tracking-[0.3em] mb-4">Fabric Status</h3>
                             <div className="space-y-3">
                                <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary border-b border-border/30 pb-2">
                                    <span>ACTIVE_PROVIDERS</span>
                                    <span className="text-primary font-black">{appData.foundationalData.technicians.length}</span>
                                </div>
                                <div className="flex justify-between items-center text-[10px] font-bold text-text-secondary border-b border-border/30 pb-2">
                                    <span>LIVE_SESSION_SYNC</span>
                                    <span className="text-emerald-500 font-black">99.8%</span>
                                </div>
                             </div>
                        </div>
                        <button onClick={() => onOpenAiCommandCenter("Audit all provider billing for accuracy.")} className="w-full py-3 bg-white dark:bg-slate-800 rounded-xl border border-border text-[9px] font-black uppercase tracking-[0.2em] shadow-sm hover:scale-[1.02] transition-all">
                             Trigger Billing Audit
                        </button>
                    </Card>
                </div>
            </div>

            {/* 2. Persistent Team Header & Tabs */}
            <div className="flex flex-col xl:flex-row gap-6">
                <div className="flex-1 space-y-6">
                    <div className="bg-component/60 backdrop-blur-xl border border-border/40 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-primary text-white rounded-2xl shadow-lg shadow-primary/20">
                                <UserGroupIcon className="w-6 h-6"/>
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-text-primary tracking-tighter uppercase">Provider Command</h2>
                                <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-0.5">ACS-LEGAL Provider Core</p>
                            </div>
                        </div>
                        
                        <nav className="flex items-center gap-2 p-1.5 bg-component-light rounded-2xl border border-border shadow-inner">
                            {subViews.map(view => (
                                <SubNavButton
                                    key={view.id}
                                    label={view.label}
                                    isActive={activeSubView === view.id}
                                    onClick={() => setActiveSubView(view.id as SubViewId)}
                                />
                            ))}
                        </nav>
                    </div>

                    {/* 3. Main Dynamic Content Area */}
                    <main className="min-h-[500px]">
                        {ActiveComponent}
                    </main>
                </div>

                {/* 4. Persistent Sidebar Rewards/Leaderboard */}
                <aside className="xl:w-[380px] space-y-6">
                    <Card className="p-0 overflow-hidden rounded-[32px] border border-border shadow-2xl bg-component/60 backdrop-blur-xl">
                        <div className="p-6 bg-primary/5 border-b border-border flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <RocketIcon className="w-6 h-6 text-primary animate-bounce-slow" />
                                <h3 className="text-sm font-black text-text-primary uppercase tracking-[0.2em]">Rewards Hub</h3>
                            </div>
                            <span className="text-[8px] font-mono text-primary font-black uppercase bg-primary/10 px-2 py-1 rounded">LIVE_POINTS</span>
                        </div>
                        <div className="p-2">
                             <PointsLeaderboard 
                                onOpenMemeModal={(t) => onOpenAiCommandCenter(`Create a celebrate meme for: ${t}`)}
                                onBrainstormKpis={() => onOpenAiCommandCenter("Suggest 3 new gamified KPIs for the provider team.")}
                                onShowToast={(msg) => console.log(msg)}
                                appData={appData}
                            />
                        </div>
                    </Card>

                    <Card className="bg-[#020617] border-white/5 p-8 rounded-[32px] text-center">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4 border border-primary/30">
                            <RocketIcon className="w-8 h-8 text-primary" />
                        </div>
                        <h4 className="text-white font-black text-sm uppercase tracking-widest">Team Performance Q3</h4>
                        <p className="text-[10px] text-slate-500 uppercase mt-2 font-bold leading-relaxed">Current team velocity is +14.2% higher than previous period.</p>
                    </Card>
                </aside>
            </div>
        </div>
    );
};

export const TeamView = React.memo(TeamViewInternal);
