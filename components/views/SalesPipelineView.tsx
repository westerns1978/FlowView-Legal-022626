
import React, { useMemo, useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, FunnelChart, Funnel, LabelList, Cell } from 'recharts';
import { useTheme } from '../../App';
import { useToast } from '../../contexts/ToastContext';
import { SalesOpportunity, AppData } from '../../types';
import { Card } from '../ui/Card';
import { SparklesIcon, TargetIcon, CurrencyDollarIcon, CheckIcon, LineChartIcon, WarningIcon, ShieldCheckIcon, DocumentTextIcon } from '../ui/Icons';
import { MetricCard } from '../ui/MetricCard';
import { getSalesPipelineInsight } from '../../services/geminiService';
import { AiInsightCard } from '../ui/AiInsightCard';
import { SkeletonLoader } from '../ui/SkeletonLoader';

const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const FunnelRiskTooltip: React.FC<any> = ({ active, payload }) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        const riskLevels: { [key: string]: { level: 'Low' | 'Medium' | 'High'; color: string } } = {
            'INTAKE': { level: 'Low', color: 'text-emerald-500' },
            'ANALYSIS': { level: 'Medium', color: 'text-risk-medium' },
            'DRAFTING': { level: 'High', color: 'text-risk-high' },
            'FINAL_REVIEW': { level: 'Low', color: 'text-emerald-500' },
        };
        const risk = riskLevels[data.name] || { level: 'Low', color: 'text-emerald-500' };

        return (
            <div className="bg-bg-secondary p-3 shadow-lg rounded-lg border border-divider text-sm w-56 font-sans-ui">
                <p className="font-bold text-text-primary uppercase tracking-wider text-xs">{data.name}</p>
                <p className="text-text-secondary mt-1 font-mono">{`Volume: ${data.value} Matters`}</p>
                <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-divider">
                    <WarningIcon className={`w-4 h-4 ${risk.color}`} />
                    <p className={`font-bold text-[10px] uppercase tracking-widest ${risk.color}`}>{`AI Risk Assessment: ${risk.level}`}</p>
                </div>
                 <div className="flex items-center gap-1.5 mt-1 text-[9px] font-bold uppercase tracking-widest text-emerald-500">
                    <ShieldCheckIcon className="w-3.5 h-3.5"/>
                    <p>C2PA Verified</p>
                </div>
            </div>
        );
    }
    return null;
};

const SortableHeader: React.FC<{
    label: string;
    sortKey: keyof SalesOpportunity;
    sortConfig: { key: keyof SalesOpportunity; direction: 'ascending' | 'descending' } | null;
    requestSort: (key: keyof SalesOpportunity) => void;
    className?: string;
}> = ({ label, sortKey, sortConfig, requestSort, className }) => {
    const isSorted = sortConfig && sortConfig.key === sortKey;
    const directionIcon = isSorted ? (sortConfig.direction === 'ascending' ? ' ▲' : ' ▼') : '';
    return (
        <th className={`p-3 text-left font-bold text-[10px] uppercase tracking-widest text-text-dim select-none cursor-pointer hover:bg-bg-secondary transition-colors font-sans-ui ${className}`}>
            <button onClick={() => requestSort(sortKey)} className="flex items-center gap-1 w-full">
                <span className="flex-1">{label}</span>
                <span className={`text-[10px] ${isSorted ? 'text-accent-primary' : 'text-text-dim opacity-30'}`}>{isSorted ? directionIcon : ' ↕'}</span>
            </button>
        </th>
    );
};

const SalesPipelineViewInternal: React.FC<{ onOpenAiCommandCenter: (p: string) => void, onShowOpportunityAlert: any, appData: AppData }> = ({ onOpenAiCommandCenter, onShowOpportunityAlert, appData }) => {
    const { theme } = useTheme();
    const { showToast } = useToast();
    const tickColor = theme === 'dark' ? '#94a3b8' : '#64748b';
    const [searchTerm, setSearchTerm] = useState('');
    const [pipelineStats, setPipelineStats] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sortConfig, setSortConfig] = useState<{ key: keyof SalesOpportunity; direction: 'ascending' | 'descending' } | null>({ key: 'totalAmt', direction: 'descending' });

    useEffect(() => {
        setIsLoading(true);
        setTimeout(() => {
            if (!appData) return;
            const pipelineOpps = appData.salesPipelineData.filter(opp => opp.oppStage !== 'ADMITTED' && opp.oppStage !== 'LOST');
            
            const totalPipelineValue = pipelineOpps.length;
            const winRate = 84.2; // Mocked for legal context
            const avgDealSize = 12.5; // Mocked turnaround time in days
            const forecast30Days = 18; // Mocked forecasted completions

            setPipelineStats({ totalPipelineValue, winRate, avgDealSize, forecast30Days });
            setIsLoading(false);
        }, 500);
    }, [appData]);

    const FUNNEL_COLORS = theme === 'dark' ? ['#34D399', '#FBBF24', '#F87171', '#60A5FA'] : ['#10B981', '#F59E0B', '#EF4444', '#3B82F6'];

    const pipelineByStage = useMemo(() => {
        return [
            { name: 'INTAKE', value: 24 },
            { name: 'ANALYSIS', value: 18 },
            { name: 'DRAFTING', value: 12 },
            { name: 'FINAL_REVIEW', value: 6 },
        ];
    }, []);
    
    const pipelineByLOB = useMemo(() => {
        return [
            { name: 'Corporate', value: 15 },
            { name: 'Litigation', value: 22 },
            { name: 'Real Estate', value: 8 },
            { name: 'IP', value: 12 },
        ];
    }, []);

    const requestSort = (key: keyof SalesOpportunity) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedAndFilteredOpps = useMemo(() => {
        if (!appData) return [];
        let filteredOpps = [...appData.salesPipelineData];
        if (searchTerm) {
             const lowercasedFilter = searchTerm.toLowerCase();
             filteredOpps = filteredOpps.filter(opp =>
                (opp.opportunityName.toLowerCase().includes(lowercasedFilter) ||
                 opp.soldToCompany.toLowerCase().includes(lowercasedFilter) ||
                 opp.salesRep.toLowerCase().includes(lowercasedFilter))
            );
        }
        if (sortConfig !== null) {
            filteredOpps.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
                }
                
                const strA = String(aValue).toLowerCase();
                const strB = String(bValue).toLowerCase();
                if (strA < strB) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (strA > strB) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return filteredOpps;
    }, [searchTerm, sortConfig, appData]);

    const getStagePill = (stage: string) => {
        switch(stage) {
            case 'FINAL_REVIEW': return <span className="py-1 px-3 rounded-full text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-sans-ui">Final Review</span>;
            case 'DRAFTING': return <span className="py-1 px-3 rounded-full text-[10px] font-bold uppercase tracking-widest bg-accent-primary/10 text-accent-primary border border-accent-primary/20 font-sans-ui">Drafting</span>;
            case 'ANALYSIS': return <span className="py-1 px-3 rounded-full text-[10px] font-bold uppercase tracking-widest bg-risk-medium/10 text-risk-medium border border-risk-medium/20 font-sans-ui">Analysis</span>;
            case 'INTAKE': return <span className="py-1 px-3 rounded-full text-[10px] font-bold uppercase tracking-widest bg-bg-secondary text-text-dim border border-divider font-sans-ui">Intake</span>;
            default: return <span className="py-1 px-3 rounded-full text-[10px] font-bold uppercase tracking-widest bg-bg-secondary text-text-dim border border-divider font-sans-ui">{stage}</span>;
        }
    };

    if (!appData) return <SkeletonLoader className="h-96" />;

    return (
        <div className="h-full flex flex-col space-y-6 animate-fade-in pb-10 px-4 lg:px-8 max-w-[1600px] mx-auto pt-2">
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard isLoading={isLoading} title="Active Reviews" value={pipelineStats?.totalPipelineValue || 0} icon={<DocumentTextIcon className="w-6 h-6"/>} prompt="Analyze the current review pipeline composition." onOpenAiCommandCenter={onOpenAiCommandCenter}/>
                <MetricCard isLoading={isLoading} title="Risk Flags" value="12" icon={<WarningIcon className="w-6 h-6"/>} prompt="What are the primary risk factors in current reviews?" onOpenAiCommandCenter={onOpenAiCommandCenter}/>
                <MetricCard isLoading={isLoading} title="Avg Turnaround" value={`${pipelineStats?.avgDealSize || 0} Days`} icon={<CheckIcon className="w-6 h-6"/>} prompt="How can we improve turnaround time for drafting?" onOpenAiCommandCenter={onOpenAiCommandCenter}/>
                <MetricCard isLoading={isLoading} title="Forecast (30d)" value={pipelineStats?.forecast30Days || 0} icon={<LineChartIcon className="w-6 h-6"/>} prompt="List all reviews forecasted to complete in the next 30 days." onOpenAiCommandCenter={onOpenAiCommandCenter}/>
             </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <div className="h-full flex flex-col">
                        <div className="mb-4"><h3 className="font-bold text-text-primary font-serif-display">Review Pipeline</h3></div>
                        <div className="flex-grow h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <FunnelChart>
                                    <Tooltip content={<FunnelRiskTooltip />} />
                                    <Funnel 
                                        dataKey="value" 
                                        data={pipelineByStage} 
                                        isAnimationActive
                                        className="cursor-pointer"
                                    >
                                        {pipelineByStage.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
                                        ))}
                                        <LabelList position="right" fill={tickColor} stroke="none" dataKey="name" fontWeight="bold" fontSize={10} className="font-sans-ui uppercase tracking-widest" />
                                    </Funnel>
                                </FunnelChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Card>
                
                <Card className="lg:col-span-1">
                    <div className="h-full flex flex-col">
                        <div className="mb-4"><h3 className="font-bold text-text-primary font-serif-display">Matter Category</h3></div>
                        <div className="flex-grow h-64">
                             <ResponsiveContainer width="100%" height="100%">
                                 <BarChart data={pipelineByLOB} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis type="number" tick={{ fontSize: 10, fill: tickColor, fontFamily: 'var(--font-mono)' }} />
                                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 9, fill: tickColor, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }} className="font-sans-ui" />
                                    <Tooltip content={<FunnelRiskTooltip />} cursor={{fill: 'rgba(128,128,128,0.1)'}} />
                                    <Bar dataKey="value" fill="var(--color-accent-primary)" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </Card>

                <div className="lg:col-span-1 h-full">
                     <AiInsightCard 
                        insightFetcher={getSalesPipelineInsight} 
                        onOpenAiCommandCenter={onOpenAiCommandCenter} 
                        compact={false} 
                    />
                </div>
            </div>

            <Card>
                 <div className="flex flex-col md:flex-row justify-between md:items-center mb-4 gap-4">
                    <h3 className="text-xl font-bold text-text-primary font-serif-display">Review Queue</h3>
                     <div className="flex items-center gap-4 w-full md:w-auto">
                         <input 
                            type="text"
                            placeholder="Search reviews..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 p-2.5 border border-divider rounded-lg bg-bg-card text-text-primary text-sm focus:ring-2 focus:ring-accent-primary outline-none shadow-sm font-serif-body italic"
                         />
                     </div>
                </div>
                <div className="overflow-auto max-h-96 custom-scrollbar">
                     <table className="min-w-full text-sm">
                        <thead className="bg-bg-secondary sticky top-0 z-10 border-b border-divider">
                            <tr>
                                <SortableHeader label="Matter" sortKey="opportunityName" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader label="Client" sortKey="soldToCompany" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader label="Lead Attorney" sortKey="salesRep" sortConfig={sortConfig} requestSort={requestSort} />
                                <SortableHeader label="Priority" sortKey="totalAmt" sortConfig={sortConfig} requestSort={requestSort} className="text-right" />
                                <SortableHeader label="Stage" sortKey="oppStage" sortConfig={sortConfig} requestSort={requestSort} className="text-center" />
                                <SortableHeader label="Deadline" sortKey="lastModified" sortConfig={sortConfig} requestSort={requestSort} className="text-right" />
                                <th className="p-3 text-center font-bold text-[10px] uppercase tracking-widest text-text-dim font-sans-ui">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-divider">
                            {sortedAndFilteredOpps.map((opp, idx) => (
                                <tr key={idx} className="hover:bg-bg-secondary/50 transition-colors">
                                    <td className="p-3 font-semibold text-text-primary max-w-[200px] truncate font-sans-ui">{opp.opportunityName}</td>
                                    <td className="p-3 text-text-secondary truncate max-w-[150px] font-sans-ui">{opp.soldToCompany}</td>
                                    <td className="p-3 text-text-dim font-mono text-[10px] font-bold uppercase tracking-widest">{opp.salesRep}</td>
                                    <td className="p-3 text-right font-mono font-bold text-text-primary">{opp.totalAmt > 50000 ? 'HIGH' : 'NORMAL'}</td>
                                    <td className="p-3 text-center">{getStagePill(idx % 4 === 0 ? 'FINAL_REVIEW' : idx % 3 === 0 ? 'DRAFTING' : idx % 2 === 0 ? 'ANALYSIS' : 'INTAKE')}</td>
                                    <td className="p-3 text-right text-text-dim text-[10px] font-mono uppercase tracking-widest">{new Date(opp.lastModified).toLocaleDateString()}</td>
                                    <td className="p-3 text-center">
                                        <button 
                                            onClick={() => onOpenAiCommandCenter(`Draft review summary for ${opp.opportunityName}`)}
                                            className="p-1.5 rounded-lg text-text-dim hover:text-accent-primary hover:bg-accent-primary/10 transition-colors"
                                        >
                                            <SparklesIcon className="w-4 h-4" />
                                        </button>
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

export const SalesPipelineView = React.memo(SalesPipelineViewInternal);
