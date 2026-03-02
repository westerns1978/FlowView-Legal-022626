
import React from 'react';
import { TargetIcon, LineChartIcon, ShieldCheckIcon } from './ui/Icons';
import { ProgressBar } from './ProgressBar';

export const StrategySection: React.FC = () => {
    const goals = [
        { id: 1, title: 'Compliance at Risk Reduction', progress: 68, target: '15%', icon: <TargetIcon className="w-3.5 h-3.5" />, color: 'text-orange-500' },
        { id: 2, title: 'Program Margin Expansion', progress: 42, target: '22%', icon: <LineChartIcon className="w-3.5 h-3.5" />, color: 'text-primary' },
        { id: 3, title: 'Caseload Compliance Integrity', progress: 99, target: '99.9%', icon: <ShieldCheckIcon className="w-3.5 h-3.5" />, color: 'text-emerald-500' }
    ];

    return (
        <div className="bg-component p-3 md:p-4 rounded-xl border border-border shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-border/50">
                {goals.map((goal, idx) => (
                    <div key={goal.id} className={`${idx !== 0 ? 'md:pl-6' : ''} ${idx !== 0 ? 'pt-3 md:pt-0' : ''}`}>
                        <div className="flex items-center gap-2 mb-1.5">
                            <div className="text-text-secondary opacity-50">
                                {goal.icon}
                            </div>
                            <h4 className="text-[9px] font-black text-text-secondary uppercase tracking-widest leading-tight">
                                {goal.title}
                            </h4>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`text-sm font-black ${goal.color}`}>{goal.progress}%</span>
                            <div className="flex-1">
                                <ProgressBar progress={goal.progress} />
                            </div>
                            <span className="text-[9px] font-bold text-text-secondary uppercase whitespace-nowrap">Goal: {goal.target}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
