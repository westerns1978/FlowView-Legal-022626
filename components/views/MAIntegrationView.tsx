import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { MetricCard } from '../ui/MetricCard';
import { ArrowUpTrayIcon, AlertTriangleIcon, CheckCircleIcon, SparklesIcon } from '../ui/Icons';

interface MAIntegrationViewProps {
    onOpenAiCommandCenter: (prompt: string) => void;
}

interface ReconciliationResult {
    importedCount: number;
    overlapCount: number;
    renewalRisks: Array<{
        name: string;
        value: number;
        daysUntilRenewal: number;
    }>;
}

const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

export const MAIntegrationView: React.FC<MAIntegrationViewProps> = ({ onOpenAiCommandCenter }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<ReconciliationResult | null>(null);

    const handleImport = () => {
        setIsLoading(true);
        setResult(null);
        setTimeout(() => {
            setResult({
                importedCount: 47,
                overlapCount: 3,
                renewalRisks: [
                    { name: "Acme Corp Datacenter Support", value: 18000, daysUntilRenewal: 12 },
                    { name: "Global Tech Antivirus", value: 21000, daysUntilRenewal: 28 },
                ]
            });
            setIsLoading(false);
        }, 2500);
    };

    return (
        <div className="animate-fade-in space-y-6">
            <Card>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-text-primary">Program Case Integration</h2>
                    <p className="text-text-secondary mt-1 max-w-2xl mx-auto">
                        A total nightmare, solved. Securely import cases from an acquired program and let the AI instantly identify risks and overlaps to prevent billing leakage.
                    </p>
                    <button
                        onClick={handleImport}
                        disabled={isLoading}
                        className="mt-4 inline-flex items-center gap-2 bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-accent transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ArrowUpTrayIcon className="w-5 h-5" />
                        {isLoading ? 'Reconciling Cases...' : 'Import Acquired Cases (.csv)'}
                    </button>
                    {isLoading && (
                        <div className="w-full bg-border rounded-full h-1 mt-2 overflow-hidden">
                            <div className="bg-primary h-1 rounded-full animate-pulse-fast"></div>
                        </div>
                    )}
                </div>
            </Card>

            {result && (
                <Card className="animate-fade-in bg-component-light">
                    <h3 className="text-xl font-bold text-text-primary mb-4">AI Integration Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <MetricCard
                            isLoading={false}
                            title="Cases Imported"
                            value={result.importedCount.toString()}
                            icon={<CheckCircleIcon className="w-6 h-6 text-success" />}
                        />
                        <MetricCard
                            isLoading={false}
                            title="Potential Overlaps"
                            value={result.overlapCount.toString()}
                            icon={<AlertTriangleIcon className="w-6 h-6 text-warning" />}
                            prompt="Show me the overlapping cases from the integration import."
                            onOpenAiCommandCenter={onOpenAiCommandCenter}
                        />
                         <MetricCard
                            isLoading={false}
                            title="Immediate Completion Risk"
                            value={formatCurrency(result.renewalRisks.reduce((sum, r) => sum + r.value, 0))}
                            icon={<AlertTriangleIcon className="w-6 h-6 text-danger" />}
                            prompt="List all high-risk completions from the integration import."
                            onOpenAiCommandCenter={onOpenAiCommandCenter}
                        />
                    </div>
                    
                    <h4 className="font-semibold text-danger mb-2">WARNING: High-Value Cases Require Immediate Attention</h4>
                    <div className="space-y-2">
                        {result.renewalRisks.map(risk => (
                            <div key={risk.name} className="bg-danger/10 p-3 rounded-lg border border-danger/20 flex items-center justify-between">
                                <div>
                                    <p className="font-semibold text-danger">{risk.name}</p>
                                    <p className="text-sm text-danger/80">Completes in {risk.daysUntilRenewal} days</p>
                                </div>
                                <p className="font-bold text-lg text-danger">{formatCurrency(risk.value)}</p>
                            </div>
                        ))}
                    </div>

                    <button 
                        onClick={() => onOpenAiCommandCenter('Draft an introductory email to the clients from the recent acquisition. Mention that we are reviewing their cases to ensure a smooth transition.')}
                        className="mt-4 w-full flex items-center justify-center gap-2 text-sm text-primary font-semibold hover:underline"
                    >
                        <SparklesIcon className="w-4 h-4" /> Ask AI to draft an introductory email
                    </button>
                </Card>
            )}
        </div>
    );
};
