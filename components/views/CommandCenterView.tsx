
import React, { useState, useEffect } from 'react';
import { 
    WarningIcon, SparklesIcon, ServerStackIcon, 
    BotIcon, CurrencyDollarIcon, LineChartIcon, 
    WrenchScrewdriverIcon, CheckCircleIcon,
    ArrowRightIcon
} from '../ui/Icons';
import { Card } from '../ui/Card';
import { MetricCard } from '../ui/MetricCard';
import { AppData } from '../../types';
import { flowview, WestFlowResponse } from '../../lib/westflow-client';

const CommandCenterViewInternal: React.FC<{ onOpenAiCommandCenter: (p: string) => void, appData: AppData }> = ({ onOpenAiCommandCenter, appData }) => {
    const [summary, setSummary] = useState<any>(null);
    const [billing, setBilling] = useState<WestFlowResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadExecutiveData() {
            setLoading(true);
            const [summaryResp, billingResp] = await Promise.all([
                flowview.getExecutiveSummary(),
                flowview.getPendingBilling()
            ]);
            
            if (summaryResp.success) setSummary(summaryResp.data);
            if (billingResp.success) setBilling(billingResp);
            setLoading(false);
        }

        loadExecutiveData();
        const interval = setInterval(loadExecutiveData, 60000);
        return () => clearInterval(interval);
    }, []);

    const formatCurrency = (val: number) => `$${val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse text-text-secondary">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-bold text-sm uppercase tracking-widest">Loading executive intelligence...</p>
            </div>
        );
    }

    return (
        <div data-sub-view="command" className="flex flex-col space-y-8 animate-fade-in pb-20">
            {/* KPI Grid from Executive Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard 
                    title="Fleet Health" 
                    value={summary?.fleet_health?.total_devices?.toString() || "0"} 
                    icon={<ServerStackIcon className="w-5 h-5"/>} 
                    trend={{ value: `${summary?.fleet_health?.devices_active || 0} active`, direction: 'neutral'}}
                    isLoading={loading}
                />
                <MetricCard 
                    title="Service Status" 
                    value={summary?.service_status?.open_tickets?.toString() || "0"} 
                    icon={<WrenchScrewdriverIcon className="w-5 h-5"/>} 
                    trend={{ value: `${summary?.service_status?.in_progress || 0} in progress`, direction: 'neutral'}}
                    isAlert={(summary?.service_status?.open_tickets || 0) > 5}
                    isLoading={loading}
                />
                <MetricCard 
                    title="Revenue (30-day)" 
                    value={formatCurrency(billing?.pending_billing || 0)} 
                    icon={<CurrencyDollarIcon className="w-5 h-5"/>} 
                    trend={{ value: 'Pending Billing', direction: 'up'}}
                    isLoading={loading}
                />
                <MetricCard 
                    title="Labor Savings" 
                    value={formatCurrency(billing?.labor_savings || 0)} 
                    icon={<SparklesIcon className="w-5 h-5 text-primary"/>} 
                    trend={{ value: `${billing?.labor_hours?.toFixed(1) || 0} hrs saved`, direction: 'up'}}
                    isLoading={loading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Strategic Insights Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                            <TargetIcon className="w-5 h-5 text-primary" /> Strategic Insights
                        </h3>
                    </div>
                    
                    {!summary?.insights || summary.insights.length === 0 ? (
                        <Card className="flex items-center justify-center p-12 text-text-secondary italic border-dashed">
                            No critical insights at this time
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {summary.insights.map((insight: any) => (
                                <Card key={insight.id} className={`border-l-4 transition-all hover:scale-[1.01] ${
                                    insight.severity === 'CRITICAL' ? 'border-l-danger bg-danger/5' : 
                                    insight.severity === 'WARNING' ? 'border-l-warning bg-warning/5' : 'border-l-primary bg-primary/5'
                                }`}>
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-text-secondary">{insight.insight_type}</span>
                                        <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                                            insight.severity === 'CRITICAL' ? 'bg-danger text-white border-danger' : 
                                            insight.severity === 'WARNING' ? 'bg-warning text-white border-warning' : 'bg-primary text-white border-primary'
                                        }`}>{insight.severity}</span>
                                    </div>
                                    <h4 className="font-bold text-text-primary text-lg mb-1">{insight.title}</h4>
                                    <p className="text-sm text-text-secondary leading-relaxed mb-4">{insight.description}</p>
                                    
                                    {insight.potential_savings && (
                                        <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm mb-4">
                                            <CurrencyDollarIcon className="w-4 h-4" />
                                            Potential Savings: {formatCurrency(insight.potential_savings)}
                                        </div>
                                    )}

                                    {insight.recommended_action && (
                                        <div className="bg-component-light p-3 rounded-lg border border-border mb-4 text-xs">
                                            <strong className="text-text-primary uppercase tracking-widest text-[9px]">Recommendation:</strong>
                                            <p className="text-text-secondary mt-1">{insight.recommended_action}</p>
                                        </div>
                                    )}

                                    <button 
                                        onClick={() => onOpenAiCommandCenter(`Execute ${insight.recommended_action} for ${insight.title}`)}
                                        className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
                                    >
                                        Take Action
                                    </button>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Revenue Breakdown Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                            <LineChartIcon className="w-5 h-5 text-primary" /> Revenue Breakdown
                        </h3>
                    </div>

                    <Card className="p-8">
                        <div className="grid grid-cols-1 gap-6">
                            <div className="flex justify-between items-center p-4 bg-component-light rounded-2xl border border-border hover:border-primary/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                                        <BotIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-text-primary">Robot Revenue</h4>
                                        <p className="text-xs text-text-secondary">{billing?.robot_tasks || 0} tasks completed</p>
                                    </div>
                                </div>
                                <span className="text-xl font-mono font-bold text-primary">{formatCurrency(billing?.robot_billing || 0)}</span>
                            </div>

                            <div className="flex justify-between items-center p-4 bg-component-light rounded-2xl border border-border hover:border-primary/30 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-purple-500/10 rounded-xl text-purple-500">
                                        <ServerStackIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-text-primary">Copier Revenue</h4>
                                        <p className="text-xs text-text-secondary">Managed print services</p>
                                    </div>
                                </div>
                                <span className="text-xl font-mono font-bold text-text-primary">{formatCurrency(billing?.copier_billing || 0)}</span>
                            </div>

                            <div className="mt-4 pt-6 border-t border-border">
                                <h4 className="font-bold text-text-primary mb-4 text-sm uppercase tracking-widest">Revenue Model Benchmarks</h4>
                                <div className="space-y-3">
                                    {[
                                        { label: 'CPTT (Cost Per Task Time)', value: '$20/hour' },
                                        { label: 'CPT (Cost Per Task)', value: '$15/task' },
                                        { label: 'CPLF (Cost Per Linear Foot)', value: '$0.50/ft' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm">
                                            <span className="text-text-secondary">{item.label}</span>
                                            <span className="font-mono font-bold text-text-primary">{item.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

// UI helper components
const TargetIcon: React.FC<{className?: string}> = ({className}) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

export const CommandCenterView = React.memo(CommandCenterViewInternal);
