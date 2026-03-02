import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { MetricCard } from '../ui/MetricCard';
import { HealthGauge } from '../ui/HealthGauge';
import { foundationalData, contractData, scenarios } from '../../data/digital-thread-data';
import { salesPipelineData } from '../../data/sales-pipeline-data';
import { calculateClientHealth } from '../../services/analyticsService';
import { SparklesIcon, MoneyBagIcon, TimerIcon, ShieldIcon, LineChartIcon } from '../ui/Icons';
import { ClientHealth } from '../../types';

interface ClientHealthViewProps {
    onOpenAiCommandCenter: (prompt: string) => void;
}

const formatCurrency = (value: number) => {
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

export const ClientHealthView: React.FC<ClientHealthViewProps> = ({ onOpenAiCommandCenter }) => {
    const [selectedClientId, setSelectedClientId] = useState<string>(foundationalData.customers[0].id);

    const clientHealthData = useMemo(() => {
        const client = foundationalData.customers.find(c => c.id === selectedClientId);
        if (!client) return null;

        const clientTickets = scenarios
            .filter(s => s.customerName === client.name)
            .map(s => s.freshDeskData.ticket);

        return calculateClientHealth(
            client.name,
            contractData,
            clientTickets,
            salesPipelineData
        );
    }, [selectedClientId]);

    const selectedClientName = foundationalData.customers.find(c => c.id === selectedClientId)?.name || 'Client';

    const getHealthStatus = (score: number) => {
        if (score > 80) return { text: 'Excellent', color: 'text-success' };
        if (score > 60) return { text: 'Good', color: 'text-blue-500' };
        if (score > 40) return { text: 'Fair', color: 'text-yellow-500' };
        return { text: 'At Risk', color: 'text-danger' };
    };

    const healthStatus = clientHealthData ? getHealthStatus(clientHealthData.score) : { text: 'N/A', color: 'text-text-secondary' };

    return (
        <div className="space-y-6 animate-fade-in">
            <Card>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <h2 className="text-2xl font-bold text-text-primary">Client Health Score</h2>
                    <div className="w-full md:w-1/3">
                        <select
                            value={selectedClientId}
                            onChange={(e) => setSelectedClientId(e.target.value)}
                            className="w-full p-3 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-component text-text-primary"
                        >
                            {foundationalData.customers.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </Card>

            {clientHealthData ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-1 flex flex-col items-center justify-center text-center">
                        <h3 className="text-xl font-bold text-text-primary mb-4">{selectedClientName}</h3>
                        <HealthGauge score={clientHealthData.score} />
                        <p className={`text-2xl font-bold mt-4 ${healthStatus.color}`}>{healthStatus.text}</p>
                        <button
                            onClick={() => onOpenAiCommandCenter(`Analyze the health of ${selectedClientName}. Summarize their revenue flow, compliance actions, and program status, then suggest one action item to strengthen the relationship.`)}
                            className="mt-4 w-full flex items-center justify-center gap-2 bg-primary/10 text-primary text-sm font-bold py-2 px-3 rounded-lg transition hover:bg-primary/20"
                        >
                            <SparklesIcon className="w-4 h-4" />
                            Ask AI to Analyze
                        </button>
                    </Card>
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <MetricCard
                            title="Avg. Revenue Flow"
                            value={`${clientHealthData.profitability.toFixed(1)}%`}
                            icon={<MoneyBagIcon className="w-6 h-6"/>}
                            prompt={`Analyze the revenue flow of cases for ${selectedClientName}.`}
                            onOpenAiCommandCenter={onOpenAiCommandCenter}
                        />
                         <MetricCard
                            title="Compliance Actions"
                            value={`${clientHealthData.serviceStrain} actions`}
                            icon={<TimerIcon className="w-6 h-6"/>}
                            prompt={`Summarize the recent compliance actions for ${selectedClientName}.`}
                            onOpenAiCommandCenter={onOpenAiCommandCenter}
                        />
                         <MetricCard
                            title="Program Status"
                            value={clientHealthData.renewalStatus.status}
                            icon={<ShieldIcon className="w-6 h-6"/>}
                            prompt={`Which cases for ${selectedClientName} are completing soon?`}
                            onOpenAiCommandCenter={onOpenAiCommandCenter}
                        />
                         <MetricCard
                            title="Intake Opportunity"
                            value={formatCurrency(clientHealthData.growthOpportunity)}
                            icon={<LineChartIcon className="w-6 h-6"/>}
                            prompt={`What are the open intake opportunities for ${selectedClientName}?`}
                            onOpenAiCommandCenter={onOpenAiCommandCenter}
                        />
                    </div>
                </div>
            ) : (
                 <Card>
                    <p className="text-center text-text-secondary">Select a client to view their health score.</p>
                </Card>
            )}
        </div>
    );
};