import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, CartesianGrid } from 'recharts';
import { SparklesIcon } from './ui/Icons';
import { useTheme } from '../App';
import { Card } from './ui/Card';
import { MetricCard } from './ui/MetricCard';
import { AppData } from '../types';

interface RoiInsightsProps {
    onOpenAiCommandCenter: (prompt: string) => void;
    appData: AppData;
}

export const RoiInsights: React.FC<RoiInsightsProps> = ({ onOpenAiCommandCenter, appData }) => {
    // Therapeutic win: Adding a guard clause prevents crashes from race conditions, making the app more stable and reducing user frustration.
    if (!appData) {
        return <div className="text-center p-4 text-text-secondary">Loading revenue data...</div>;
    }
    const { theme } = useTheme();
    const tickColor = theme === 'dark' ? '#9ca3af' : '#475569';
    const gridColor = theme === 'dark' ? '#374151' : '#e2e8f0';

    const roiData = useMemo(() => {
        // Therapeutic win: Seeing insights update live reduces the anxiety of working with stale data.
        const { scenarios, foundationalData } = appData;
        const completedTickets = scenarios.filter(s => s.freshDeskData.ticket.status === 'Completed').length;
        const totalTickets = scenarios.length;
        const firstCallFixRate = totalTickets > 0 ? (completedTickets / totalTickets * 0.92) * 100 : 0;

        const totalHours = scenarios.reduce((sum: number, s) => {
            const scenarioHours = s.freshDeskData.activities.map(activity => activity.hours).reduce((activitySum, current) => activitySum + current, 0);
            return sum + scenarioHours;
        }, 0);
        const avgUtilization = (totalHours / (foundationalData.technicians.length * 40)) * 100;
        
        const varianceData = [
            { name: 'Q1', variance: -5 },
            { name: 'Q2', variance: 2 },
            { name: 'Q3', variance: 7 },
            { name: 'Q4', variance: 5 },
        ];

        return {
            firstCallFixRate: `${firstCallFixRate.toFixed(1)}%`,
            avgUtilization: `${avgUtilization.toFixed(1)}%`,
            varianceData,
        };
    }, [appData]);

    const prompt = `Analyze these revenue trends. First session success rate is ${roiData.firstCallFixRate} and provider utilization is ${roiData.avgUtilization}. The quarterly variance is trending upwards. What are the likely drivers and what should we focus on next quarter to improve program margins?`;

    return (
        <div className="h-full flex flex-col space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <MetricCard 
                    title="First Session Success Rate" 
                    value={roiData.firstCallFixRate}
                    prompt="What factors are impacting our first session success rate?"
                    onOpenAiCommandCenter={onOpenAiCommandCenter}
                    icon={<span className="text-xl">🎯</span>} 
                />
                 <MetricCard 
                    title="Provider Utilization" 
                    value={roiData.avgUtilization}
                    prompt="Is our current team utilization sustainable?"
                    onOpenAiCommandCenter={onOpenAiCommandCenter}
                    icon={<span className="text-xl">⚖️</span>} 
                />
            </div>
            
            <Card>
                <h4 className="font-semibold text-text-primary mb-2">Revenue Variance Trend</h4>
                <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={roiData.varianceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                            <XAxis dataKey="name" tick={{ fontSize: 12, fill: tickColor }} />
                            <YAxis tick={{ fontSize: 12, fill: tickColor }} unit="%" />
                            <Line type="monotone" dataKey="variance" stroke="var(--color-primary)" strokeWidth={2} name="Variance %" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                 <button onClick={() => onOpenAiCommandCenter(prompt)} className="flex items-center justify-center gap-2 mt-4 w-full bg-component-light text-text-secondary text-sm font-bold py-2 px-3 rounded-lg transition hover:bg-border border border-border">
                    <SparklesIcon className="w-4 h-4 text-primary" /> Analyze Revenue Trends
                </button>
            </Card>
        </div>
    );
};