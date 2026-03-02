
import React from 'react';
import { SparklesIcon, AlertTriangleIcon, RocketIcon, BadgeIcon } from './ui/Icons';
import { AiHoverTooltip } from './ui/AiHoverTooltip';
import { Employee } from '../types';

type SortConfigItem = { key: keyof Employee; direction: 'ascending' | 'descending' };

const getProgressBarColor = (percentage: number) => {
    if (percentage > 80) return 'bg-success';
    if (percentage > 50) return 'bg-yellow-500';
    return 'bg-danger';
}

const getTierInfo = (pts: number) => {
    if (pts > 20000) return { label: 'DIAMOND', color: 'text-sky-400 bg-sky-400/10 border-sky-400/20' };
    if (pts > 10000) return { label: 'PLATINUM', color: 'text-slate-300 bg-slate-300/10 border-slate-300/20' };
    return { label: 'GOLD', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
}

const SortableHeader: React.FC<{
    label: string;
    sortKey: keyof Employee;
    sortConfig: SortConfigItem[];
    requestSort: (key: keyof Employee, event: React.MouseEvent) => void;
    className?: string;
}> = ({ label, sortKey, sortConfig, requestSort, className }) => {
    const sortInfo = sortConfig.find(s => s.key === sortKey);
    const directionIcon = sortInfo ? (sortInfo.direction === 'ascending' ? '▲' : '▼') : '';
    const sortIndex = sortConfig.findIndex(s => s.key === sortKey);

    return (
        <th className={`p-3 text-left font-semibold text-text-secondary ${className}`}>
            <button onClick={(e) => requestSort(sortKey, e)} className="flex items-center gap-1 hover:text-text-primary transition-colors group">
                {label} 
                <div className="flex flex-col items-center h-6">
                    <span className="text-xs w-3 h-3 text-primary font-bold">{directionIcon}</span>
                    {sortConfig.length > 1 && sortIndex > -1 && (
                        <span className="text-[10px] bg-border group-hover:bg-primary/20 text-text-secondary group-hover:text-primary font-bold rounded-full w-3.5 h-3.5 flex items-center justify-center leading-none">
                            {sortIndex + 1}
                        </span>
                    )}
                </div>
            </button>
        </th>
    );
};

interface UtilizationTableProps {
    onOpenAiCommandCenter: (prompt: string) => void;
    setSelectedEmployeeName: (name: string) => void;
    onOpenFraudAlert: (employee: Employee) => void;
    data: Employee[];
    sortConfig: SortConfigItem[];
    requestSort: (key: keyof Employee, event: React.MouseEvent) => void;
}

export const UtilizationTable: React.FC<UtilizationTableProps> = ({ 
    onOpenAiCommandCenter, 
    setSelectedEmployeeName,
    onOpenFraudAlert,
    data,
    sortConfig,
    requestSort
}) => {
    const [hoveredUser, setHoveredUser] = React.useState<string | null>(null);
    const [tooltipPosition, setTooltipPosition] = React.useState<{ top: number, left: number } | null>(null);

    const totals = React.useMemo(() => {
        if (data.length === 0) return { totalHours: 0, totalExpenses: 0, avgBillablePct: 0 };
        const totalHours = data.reduce((sum, emp) => sum + emp.hours, 0);
        const totalExpenses = data.reduce((sum, emp) => sum + emp.expenses, 0);
        const totalBillableHours = data.reduce((sum, emp) => sum + (emp.hours * (emp.billablePct/100)), 0);
        const avgBillablePct = totalHours > 0 ? (totalBillableHours / totalHours) * 100 : 0;
        return { totalHours, totalExpenses, avgBillablePct };
    }, [data]);

    const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>, name: string) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipPosition({ top: rect.top - rect.height, left: rect.left + rect.width / 2 });
        setHoveredUser(name);
    };
    
    const handleMouseLeave = () => {
        setHoveredUser(null);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="overflow-x-auto -mx-4 px-4 flex-grow">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="bg-component-lighter/50 dark:bg-component-lighter/10">
                            <SortableHeader label="Provider Name" sortKey="name" sortConfig={sortConfig} requestSort={requestSort} />
                            <SortableHeader label="Sessions" sortKey="hours" sortConfig={sortConfig} requestSort={requestSort} className="text-right" />
                            <SortableHeader label="Billing" sortKey="expenses" sortConfig={sortConfig} requestSort={requestSort} className="text-right" />
                            <SortableHeader label="Compliance %" sortKey="billablePct" sortConfig={sortConfig} requestSort={requestSort} className="w-1/4" />
                            <SortableHeader label="Performance Pts" sortKey="points" sortConfig={sortConfig} requestSort={requestSort} className="text-center" />
                            <th className="p-3 text-center font-semibold text-text-secondary">AI Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border-color">
                        {data.map((emp) => {
                            const tier = getTierInfo(emp.points || 0);
                            return (
                                <tr key={`${emp.id}`} className="hover:bg-primary/5 transition-colors group">
                                    <td className="p-3">
                                        <button 
                                            onClick={() => setSelectedEmployeeName(emp.name)} 
                                            onMouseEnter={(e) => handleMouseEnter(e, emp.name)}
                                            onMouseLeave={handleMouseLeave}
                                            className="font-black text-primary uppercase tracking-tight text-[12px] hover:underline"
                                        >
                                            {emp.name}
                                        </button>
                                    </td>
                                    <td className="p-3 text-right font-mono font-bold text-text-primary">{emp.hours.toFixed(2)}</td>
                                    <td className="p-3 text-right font-mono font-bold text-text-secondary">${emp.expenses.toFixed(2)}</td>
                                    <td className="p-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-full bg-component-light rounded-full h-1.5 border border-border/40 overflow-hidden">
                                                <div className={`${getProgressBarColor(emp.billablePct)} h-full transition-all duration-1000 shadow-glow-primary`} style={{ width: `${emp.billablePct}%` }}></div>
                                            </div>
                                            <span className="font-black text-text-secondary w-10 text-right text-[10px]">{emp.billablePct.toFixed(0)}%</span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-center">
                                        <div className="flex flex-col items-center gap-1">
                                            <div className="flex items-center gap-1.5 font-black text-primary text-[11px]">
                                                <RocketIcon className="w-3.5 h-3.5" />
                                                {(emp.points || 0).toLocaleString()}
                                            </div>
                                            <span className={`text-[8px] font-black px-2 py-0.5 rounded border ${tier.color} uppercase tracking-widest`}>
                                                {tier.label}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-center">
                                         <div className="flex items-center justify-center gap-2">
                                            {emp.aiFlag && (
                                                 <AiHoverTooltip
                                                    mode="static"
                                                    staticContent={emp.aiFlag}
                                                    icon={<AlertTriangleIcon className="w-5 h-5 text-danger" />}
                                                    onClick={() => onOpenFraudAlert(emp)}
                                                />
                                            )}
                                            <button onClick={() => onOpenAiCommandCenter(`Write a provider performance review for ${emp.name}. Status: ${tier.label} tier.`)} className="p-2 rounded-xl text-primary bg-primary/10 hover:bg-primary hover:text-white transition-all shadow-sm">
                                                <SparklesIcon className="w-4.5 h-4.5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
             {hoveredUser && tooltipPosition && (
                <AiHoverTooltip
                    targetPosition={tooltipPosition}
                    prompt={`Give me a quick productivity tip for ${hoveredUser}.`}
                    onClose={handleMouseLeave}
                />
            )}
        </div>
    );
};
