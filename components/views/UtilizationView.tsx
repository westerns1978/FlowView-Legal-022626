
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, CartesianGrid, Tooltip, Legend, Cell } from 'recharts';
import { FdTicket, AppData, Employee } from '../../types';
import { useTheme } from '../../App';
import { Card } from '../ui/Card';
import { UtilizationTable } from '../UtilizationTable';
import { DownloadIcon, SparklesIcon, ServerStackIcon, CodeBracketIcon, RocketIcon } from '../ui/Icons';
import { useToast } from '../../contexts/ToastContext';
import { FraudAlertModal } from '../ui/AiHoverTooltip';
import { AgentDrillDownModal } from '../AgentDrillDownModal';
import { useDateRange } from '../../contexts/DateRangeContext';

interface UtilizationViewProps {
    onOpenAiCommandCenter: (prompt: string) => void;
    appData: AppData;
    onSwitchToTravelView: (employeeId: number) => void;
}

type SortConfigItem = { key: keyof Employee; direction: 'ascending' | 'descending' };

const ProviderEnergyChart: React.FC<{ data: Employee[] }> = ({ data }) => {
    const { theme } = useTheme();
    const tickColor = theme === 'dark' ? '#94a3b8' : '#64748b';
    const gridColor = theme === 'dark' ? '#1e293b' : '#f1f5f9';

    const chartData = useMemo(() => {
        return [...data].sort((a,b) => b.hours - a.hours).slice(0, 10);
    }, [data]);

    return (
        <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }} barGap={6}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} opacity={0.1} />
                    <XAxis 
                        dataKey="name" 
                        tick={{ fontSize: 9, fill: tickColor, fontWeight: 'bold' }} 
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                    />
                    <YAxis 
                        tick={{ fontSize: 9, fill: tickColor }} 
                        axisLine={false}
                        tickLine={false}
                    />
                    <Tooltip
                        cursor={{fill: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)'}}
                        contentStyle={{ 
                            background: 'var(--color-component)', 
                            border: '1px solid var(--color-border)', 
                            borderRadius: '16px', 
                            fontSize: '11px', 
                            fontWeight: 'bold',
                            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                        }}
                    />
                    <Legend 
                        iconType="circle" 
                        verticalAlign="top" 
                        align="right"
                        wrapperStyle={{ fontSize: '9px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em', paddingBottom: '24px' }} 
                    />
                    <Bar dataKey="hours" name="Billable Hours" fill="#0284c7" radius={[4, 4, 0, 0]} barSize={20} />
                    <Bar dataKey="expenses" name="Expense Flow ($)" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export const UtilizationView: React.FC<UtilizationViewProps> = ({ onOpenAiCommandCenter, appData, onSwitchToTravelView }) => {
    const [selectedEmployeeName, setSelectedEmployeeName] = useState<string | null>(null);
    const { utilizationData } = appData;
    // FIX: Using the correct useToast hook to get showToast function, resolving the variable shadowing and usage-before-declaration error.
    const { showToast } = useToast();
    const dateRangeContext = useDateRange();
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState<SortConfigItem[]>([{ key: 'hours', direction: 'descending' }]);
    const [fraudAlertUser, setFraudAlertUser] = useState<Employee | null>(null);

    const requestSort = (key: keyof Employee, event: React.MouseEvent) => {
        const isShiftPressed = event.shiftKey;
        setSortConfig(prev => {
            const existingSortIndex = prev.findIndex(s => s.key === key);
            if (isShiftPressed) {
                if (existingSortIndex > -1) {
                    const newSorts = [...prev];
                    newSorts[existingSortIndex].direction = newSorts[existingSortIndex].direction === 'ascending' ? 'descending' : 'ascending';
                    return newSorts;
                } else {
                    return [...prev, { key, direction: 'descending' }];
                }
            } else {
                if (existingSortIndex > -1) {
                    const direction = prev[existingSortIndex].direction === 'ascending' ? 'descending' : 'ascending';
                    return [{ key, direction }];
                } else {
                    return [{ key, direction: 'descending' }];
                }
            }
        });
    };

    const displayedData = useMemo(() => {
        let filteredData = [...utilizationData];
        if (searchTerm) {
            filteredData = filteredData.filter(emp => emp.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }
        if (sortConfig.length > 0) {
            filteredData.sort((a, b) => {
                for (const sort of sortConfig) {
                    const aValue = a[sort.key];
                    const bValue = b[sort.key];
                    if (aValue === null || aValue === undefined) return 1;
                    if (bValue === null || bValue === undefined) return -1;
                    if (aValue < bValue) return sort.direction === 'ascending' ? -1 : 1;
                    if (aValue > bValue) return sort.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }
        return filteredData;
    }, [utilizationData, searchTerm, sortConfig]);

    const totalPoints = useMemo(() => displayedData.reduce((s,e) => s + (e.points || 0), 0), [displayedData]);

    return (
        <div className="space-y-4 animate-fade-in">
            {selectedEmployeeName && (
                <AgentDrillDownModal
                    employeeName={selectedEmployeeName}
                    appData={appData}
                    onClose={() => setSelectedEmployeeName(null)}
                    dateRange={dateRangeContext.dateRange}
                    onOpenAiCommandCenter={onOpenAiCommandCenter}
                />
            )}
            {fraudAlertUser && <FraudAlertModal employee={fraudAlertUser} onClose={() => setFraudAlertUser(null)} />}

            {/* Tight Metrics Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                <Card className="lg:col-span-8 p-6 bg-component/40 backdrop-blur-md">
                    <div className="flex justify-between items-center mb-6 px-2">
                        <div className="flex flex-col">
                            <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em] flex items-center gap-2">
                                <ServerStackIcon className="w-4 h-4 text-primary"/> Provider Energy Matrix
                            </h3>
                            <p className="text-[8px] text-text-secondary/50 font-bold uppercase mt-1">Cross-referencing Sessions vs Revenue Flow</p>
                        </div>
                        <div className="flex items-center gap-3">
                             <div className="w-2.5 h-2.5 rounded-full bg-primary/20 animate-pulse"></div>
                             <span className="text-[9px] font-mono font-black text-primary uppercase tracking-widest">Comp: Sess_vs_Rev</span>
                        </div>
                    </div>
                    <ProviderEnergyChart data={displayedData} />
                </Card>

                <Card className="lg:col-span-4 bg-[#020617] border-slate-800 flex flex-col p-6 shadow-2xl">
                    <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] mb-8 flex items-center gap-2">
                        <CodeBracketIcon className="w-4 h-4 text-emerald-400" />
                        Provider_Analytics
                    </h3>
                    <div className="space-y-6 flex-1">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-emerald-500/40 transition-all cursor-default">
                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">PROVIDER_THROUGHPUT</p>
                             <p className="text-2xl font-black text-emerald-400 font-mono tracking-tighter">
                                {displayedData.reduce((s,e) => s+e.hours, 0).toFixed(1)} HRS
                             </p>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-primary/40 transition-all cursor-default">
                             <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1.5">TOTAL_PERFORMANCE_BANK</p>
                             <div className="flex items-center gap-3">
                                <RocketIcon className="w-5 h-5 text-primary animate-bounce-slow" />
                                <p className="text-2xl font-black text-primary font-mono tracking-tighter">
                                    {totalPoints.toLocaleString()} PTS
                                </p>
                             </div>
                        </div>
                    </div>
                    <button 
                        onClick={() => onOpenAiCommandCenter("Deep audit the provider logs for productivity gaps. Focus on billable efficiency vs actual session hours.")}
                        className="w-full mt-8 py-4 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl border border-primary/20 hover:bg-primary transition-all hover:text-white shadow-lg active:scale-95"
                    >
                        Provider Sync Deep Dive
                    </button>
                </Card>
            </div>

            {/* Table Area with Quick Filters */}
            <Card className="p-0 overflow-hidden border border-border shadow-2xl rounded-[40px] bg-component/60 backdrop-blur-xl">
                <div className="p-8 border-b border-border/50 bg-component/50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto bg-component-light px-6 py-3 rounded-2xl border border-border shadow-inner group focus-within:border-primary transition-all">
                        <MagnifyingGlassIcon className="w-5 h-5 text-text-secondary opacity-30 group-focus-within:opacity-100 transition-opacity" />
                        <input
                            type="text"
                            placeholder="Filter Provider Node..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-transparent text-[11px] font-black uppercase tracking-widest outline-none w-64 placeholder:opacity-20"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button onClick={() => showToast("Exporting Provider Fabric...")} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary hover:text-primary transition-all group">
                            <DownloadIcon className="w-6 h-6 group-hover:translate-y-1 transition-transform" /> Export Audit
                        </button>
                    </div>
                </div>
                <div className="overflow-auto custom-scrollbar max-h-[600px]">
                    <UtilizationTable 
                        onOpenAiCommandCenter={onOpenAiCommandCenter} 
                        setSelectedEmployeeName={setSelectedEmployeeName} 
                        onOpenFraudAlert={setFraudAlertUser}
                        data={displayedData}
                        sortConfig={sortConfig}
                        requestSort={requestSort}
                    />
                </div>
            </Card>
        </div>
    )
}

const MagnifyingGlassIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
);
