import React from 'react';
import { Card } from './ui/Card';

interface DashboardSettingsProps {
    kpiConfig: Array<{ id: string; title: string }>;
    visibleKpis: Record<string, boolean>;
    onToggle: (id: string) => void;
}

export const DashboardSettings: React.FC<DashboardSettingsProps> = ({ kpiConfig, visibleKpis, onToggle }) => {
    return (
        <Card className="animate-fade-in bg-component-light">
            <h3 className="text-lg font-bold text-text-primary mb-2">Customize Dashboard</h3>
            <p className="text-sm text-text-secondary mb-4">Select the KPIs you want to see on your "At-a-Glance" view.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {kpiConfig.map(kpi => (
                    <label key={kpi.id} className="flex items-center gap-3 p-3 bg-component rounded-lg border border-border cursor-pointer hover:bg-primary/10 transition-colors">
                        <input
                            type="checkbox"
                            checked={visibleKpis[kpi.id]}
                            onChange={() => onToggle(kpi.id)}
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                        />
                        <span className="font-semibold text-text-primary">{kpi.title}</span>
                    </label>
                ))}
            </div>
        </Card>
    );
};