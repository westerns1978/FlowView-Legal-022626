import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Card } from '../ui/Card';
import { generateLifecycleInsight } from '../../services/geminiService';
import { calculateClientHealth } from '../../services/analyticsService';
import { useToast } from '../../contexts/ToastContext';
import { SparklesIcon, FileTextIcon, AlertTriangleIcon, UserGroupIcon, ShieldIcon, MoneyBagIcon, TimerIcon, LineChartIcon, ServerStackIcon } from '../ui/Icons';
import { AppData, Contract } from '../../types';
import { SkeletonLoader } from '../ui/SkeletonLoader';
import { HealthGauge } from '../ui/HealthGauge';
import { MetricCard } from '../ui/MetricCard';

interface Customer360ViewProps {
    onOpenAiCommandCenter: (prompt: string) => void;
    initialClientId?: string | null;
    appData: AppData;
}

const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const AiStrategyBanner: React.FC<{ insight: string | null; isLoading: boolean; onRetry: () => void; }> = ({ insight, isLoading, onRetry }) => {
    if (isLoading) return <SkeletonLoader className="h-20 w-full rounded-xl" />;
    
    if (!insight) {
        return (
            <div className="bg-bg-secondary p-4 rounded-xl border border-divider flex items-center justify-between animate-fade-in">
                <div className="flex items-center gap-3 text-text-dim font-sans-ui">
                    <AlertTriangleIcon className="w-5 h-5" />
                    <span className="text-sm">AI analysis timed out.</span>
                </div>
                <button onClick={onRetry} className="text-xs bg-bg-card hover:bg-divider px-3 py-1.5 rounded-lg border border-divider transition-colors font-bold font-sans-ui text-text-primary">
                    Retry Analysis
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-accent-primary/10 via-bg-secondary to-bg-secondary p-4 rounded-xl border-l-4 border-accent-primary shadow-sm flex items-start gap-4 animate-fade-in">
            <div className="p-2 bg-white/10 rounded-full shrink-0">
                <SparklesIcon className="w-5 h-5 text-accent-primary" />
            </div>
            <div className="flex-grow">
                <h4 className="text-xs font-bold text-accent-primary uppercase tracking-wider mb-1 font-sans-ui">Strategic Lifecycle Insight</h4>
                <div className="prose prose-sm dark:prose-invert max-w-none text-text-secondary leading-snug font-serif-body" dangerouslySetInnerHTML={{ 
                    __html: typeof (window as any).marked?.parse === 'function' 
                        ? (window as any).marked.parse(insight, { breaks: true, gfm: true }) 
                        : insight.replace(/\n/g, '<br/>') 
                }}></div>
            </div>
        </div>
    );
};

const Customer360ViewInternal: React.FC<Customer360ViewProps> = ({ onOpenAiCommandCenter, initialClientId = null, appData }) => {
    if (!appData) {
        return <div className="space-y-6"><Card><SkeletonLoader className="h-16" /></Card><SkeletonLoader className="h-96" /></div>;
    }
    
    const [selectedClientId, setSelectedClientId] = useState<string>(initialClientId || appData.foundationalData.customers[0].id);
    const [insight, setInsight] = useState<string | null>(null);
    const [isInsightLoading, setIsInsightLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        if (initialClientId) {
            setSelectedClientId(initialClientId);
        }
    }, [initialClientId]);

    const customer360Data = useMemo(() => {
        const client = appData.foundationalData.customers.find(c => c.id === selectedClientId);
        if (!client) return null;

        const clientScenarios = appData.scenarios.filter(s => s.customerName === client.name);
        const clientContracts = appData.contractData.filter(c => c.clientId === selectedClientId);
        const clientOpportunities = appData.salesPipelineData.filter(opp => opp.soldToCompany === client.name);
        const clientTickets = clientScenarios.map(s => s.freshDeskData.ticket);

        const totalInvoiced = clientScenarios.reduce((sum, s) => sum + s.quickBooksData.invoice.amount, 0);
        const outstandingBalance = clientScenarios
            .filter(s => s.quickBooksData.invoice.status !== 'Paid')
            .reduce((sum, s) => sum + s.quickBooksData.invoice.amount, 0);

        const health = calculateClientHealth(client.name, appData.contractData, clientTickets, appData.salesPipelineData);

        return {
            ...client,
            contracts: clientContracts,
            opportunities: clientOpportunities,
            tickets: clientTickets,
            financials: { totalInvoiced, outstandingBalance },
            health
        };
    }, [selectedClientId, appData]);

    const fetchInsight = useCallback(async () => {
        if (!customer360Data) return;
        setIsInsightLoading(true);
        setInsight(null);
        
        const timeoutId = setTimeout(() => {
            setIsInsightLoading(false);
            setInsight(null);
        }, 10000); 

        try {
            const result = await generateLifecycleInsight(customer360Data);
            setInsight(result);
        } catch (err) {
            console.error("Failed to get lifecycle insight:", err);
            setInsight(null);
        } finally {
            clearTimeout(timeoutId);
            setIsInsightLoading(false);
        }
    }, [customer360Data]);

    useEffect(() => {
        fetchInsight();
    }, [fetchInsight]);

    const handleGenerateQuote = (ticketId: string) => {
        showToast(`Court filing request sent to ACS-LEGAL for action #${ticketId}`);
        onOpenAiCommandCenter(`Generate a court filing in ACS-LEGAL for action #${ticketId} at ${customer360Data?.name}.`);
    };

    const handleEscalateToProject = (ticketId: string) => {
        showToast(`Action #${ticketId} escalated for program review.`);
    }

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'Active':
                return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
            case 'Renewing':
                return 'bg-accent-primary/10 text-accent-primary border-accent-primary/30';
            case 'At Risk':
                return 'bg-risk-high text-white border-risk-high shadow-sm';
            case 'Expired':
                return 'bg-text-dim/10 text-text-dim border-text-dim/30';
            case 'Paid':
                return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
            default:
                return 'bg-risk-medium/10 text-risk-medium border-risk-medium/30';
        }
    };

    if (!customer360Data) return null;

    return (
        <div className="space-y-4 animate-fade-in pb-10 h-full flex flex-col">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 px-2">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center text-white font-bold text-xl shadow-lg border-2 border-white/20 font-serif-display">
                        {customer360Data.name.charAt(0)}
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-text-primary font-serif-display">{customer360Data.name}</h2>
                        <div className="flex items-center gap-3 text-sm text-text-secondary font-sans-ui">
                            <span className="flex items-center gap-1"><UserGroupIcon className="w-4 h-4"/> {customer360Data.industry}</span>
                            <span className="w-1 h-1 rounded-full bg-text-secondary"></span>
                            <span className={customer360Data.health.score > 70 ? "text-emerald-500 font-medium" : "text-risk-high font-medium"}>
                                Health Score: {customer360Data.health.score}/100
                            </span>
                        </div>
                    </div>
                </div>
                <select
                    value={selectedClientId}
                    onChange={(e) => setSelectedClientId(e.target.value)}
                    className="w-full md:w-64 p-2.5 border border-divider rounded-lg bg-bg-card text-text-primary text-sm focus:ring-2 focus:ring-accent-primary outline-none shadow-sm font-sans-ui"
                >
                    {appData.foundationalData.customers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard 
                    title="Revenue Flow" 
                    value={`${customer360Data.health.profitability.toFixed(1)}%`} 
                    icon={<MoneyBagIcon className="w-5 h-5"/>}
                    trend={{ value: '2.5%', direction: 'up' }}
                />
                <MetricCard 
                    title="Compliance Actions" 
                    value={`${customer360Data.health.serviceStrain} Actions`} 
                    icon={<TimerIcon className="w-5 h-5"/>}
                    isAlert={customer360Data.health.serviceStrain > 5}
                />
                <MetricCard 
                    title="Program Status" 
                    value={customer360Data.health.renewalStatus.status} 
                    icon={<ShieldIcon className="w-5 h-5"/>}
                    isAlert={customer360Data.health.renewalStatus.status === 'At Risk'}
                />
                <MetricCard 
                    title="Intake Opps" 
                    value={formatCurrency(customer360Data.health.growthOpportunity)} 
                    icon={<LineChartIcon className="w-5 h-5"/>}
                    prompt={`What are the open intake opportunities for ${customer360Data.name}?`}
                    onOpenAiCommandCenter={onOpenAiCommandCenter}
                />
            </div>

            <AiStrategyBanner 
                insight={insight} 
                isLoading={isInsightLoading} 
                onRetry={fetchInsight} 
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-grow">
                <div className="lg:col-span-4 flex flex-col gap-4 h-full">
                    <Card className="flex flex-col items-center justify-center py-6 h-full">
                        <HealthGauge score={customer360Data.health.score} />
                        <p className="mt-4 font-bold text-lg text-text-primary">Overall Health</p>
                    </Card>
                    <Card className="h-full">
                        <h3 className="text-lg font-bold text-text-primary mb-4 font-serif-display">Financial Overview</h3>
                        <div className="space-y-4 font-sans-ui">
                            <div className="flex justify-between items-center p-3 bg-bg-secondary rounded-lg">
                                <span className="text-text-dim text-sm">Total Invoiced</span>
                                <span className="font-bold text-text-primary">{formatCurrency(customer360Data.financials.totalInvoiced)}</span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-bg-secondary rounded-lg border-l-4 border-risk-high">
                                <span className="text-text-dim text-sm">Outstanding</span>
                                <span className="font-bold text-risk-high">{formatCurrency(customer360Data.financials.outstandingBalance)}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
                    <Card className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-text-primary flex items-center gap-2 font-serif-display">
                                <ServerStackIcon className="w-4 h-4 text-accent-primary" />
                                Active Cases
                            </h3>
                            <span className="text-[10px] font-bold uppercase tracking-widest bg-bg-secondary px-2 py-1 rounded text-text-dim border border-divider font-sans-ui">
                                {customer360Data.contracts.length} Cases
                            </span>
                        </div>
                        <div className="space-y-3 overflow-y-auto pr-2 flex-grow custom-scrollbar">
                            {customer360Data.contracts.length === 0 ? (
                                <div className="text-center py-10 text-text-secondary italic text-sm">No active contracts found for this client.</div>
                            ) : customer360Data.contracts.map(c => {
                                const today = new Date();
                                const endDate = new Date(c.endDate);
                                const diffDays = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                                const isExpiringSoon = diffDays <= 30 && diffDays >= 0;
                                const isAtRisk = c.status === 'At Risk' || isExpiringSoon;

                                return (
                                    <div 
                                        key={c.contractId} 
                                        className={`p-4 border rounded-2xl transition-all duration-300 relative group overflow-hidden ${
                                            isAtRisk 
                                            ? 'border-risk-high/40 bg-risk-high/5 shadow-sm shadow-risk-high/5' 
                                            : 'border-divider hover:border-accent-primary/30 bg-bg-secondary/30 hover:bg-bg-secondary'
                                        }`}
                                    >
                                        {isAtRisk && <div className="absolute top-0 left-0 w-1.5 h-full bg-risk-high animate-pulse"></div>}
                                        
                                        <div className="flex justify-between items-start mb-3 relative z-10">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-sm text-text-primary uppercase tracking-tight truncate flex items-center gap-2 font-sans-ui">
                                                    {c.serviceName}
                                                    {isAtRisk && <span title="Compliance Risk Detected" className="shrink-0 flex items-center"><AlertTriangleIcon className="w-3.5 h-3.5 text-risk-high" /></span>}
                                                </h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest font-sans-ui">{c.vendor}</span>
                                                    <span className="w-1 h-1 rounded-full bg-divider"></span>
                                                    <span className="text-[10px] font-mono text-accent-primary font-bold">ID: {c.contractId}</span>
                                                </div>
                                            </div>
                                            <span className={`text-[9px] font-bold px-2 py-1 rounded-full border uppercase tracking-widest shrink-0 font-sans-ui ${getStatusStyles(c.status)}`}>
                                                {c.status}
                                            </span>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-divider relative z-10">
                                            <div className="space-y-0.5">
                                                <p className="text-[8px] font-bold text-text-dim uppercase tracking-[0.2em] font-sans-ui">Admission Date</p>
                                                <p className="text-[10px] font-mono font-bold text-text-primary">{c.startDate}</p>
                                            </div>
                                            <div className="space-y-0.5 text-right">
                                                <p className="text-[8px] font-bold text-text-dim uppercase tracking-[0.2em] font-sans-ui">Completion Target</p>
                                                <p className={`text-[10px] font-mono font-bold ${isExpiringSoon || c.status === 'Expired' ? "text-risk-high" : "text-text-primary"}`}>
                                                    {c.endDate}
                                                    {isExpiringSoon && " !"}
                                                </p>
                                            </div>
                                        </div>

                                        {isExpiringSoon && c.status !== 'Expired' && (
                                            <div className="mt-3 py-1 px-2 bg-risk-high/10 rounded-lg text-[9px] font-bold text-risk-high uppercase tracking-widest text-center border border-risk-high/20 font-sans-ui">
                                                Expiring in {diffDays} days
                                            </div>
                                        )}
                                        {c.status === 'Expired' && (
                                            <div className="mt-3 py-1 px-2 bg-text-dim/10 rounded-lg text-[9px] font-bold text-text-dim uppercase tracking-widest text-center border border-text-dim/20 font-sans-ui">
                                                Term Ended
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    <Card className="h-full flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-text-primary font-serif-display">Recent Compliance Actions</h3>
                            <button onClick={() => onOpenAiCommandCenter(`Summarize all open compliance actions for ${customer360Data.name}`)} className="text-xs text-accent-primary font-bold hover:underline font-sans-ui">Analyze</button>
                        </div>
                        <div className="space-y-3 overflow-y-auto pr-2 flex-grow custom-scrollbar">
                            {customer360Data.tickets.length === 0 ? (
                                <div className="text-center py-10 text-text-dim italic text-sm font-serif-body">No recent actions found.</div>
                            ) : customer360Data.tickets.map(t => (
                                <div key={t.ticketId} className="p-3 border border-divider rounded-lg bg-bg-secondary/50 group hover:border-accent-primary/30 transition-colors">
                                    <p className="text-sm font-medium text-text-primary mb-1 truncate font-sans-ui">{t.subject}</p>
                                    <div className="flex justify-between items-center">
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest font-sans-ui ${
                                            t.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-risk-medium/10 text-risk-medium'
                                        }`}>{t.status}</span>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleGenerateQuote(t.ticketId)} className="text-[10px] bg-accent-primary/10 text-accent-primary px-2 py-1 rounded-lg font-bold uppercase tracking-widest hover:bg-accent-primary hover:text-white transition-all font-sans-ui">Filing</button>
                                            <button onClick={() => handleEscalateToProject(t.ticketId)} className="text-[10px] border border-divider text-text-dim px-2 py-1 rounded-lg font-bold uppercase tracking-widest hover:text-text-primary transition-all font-sans-ui">Review</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export const Customer360View = React.memo(Customer360ViewInternal);