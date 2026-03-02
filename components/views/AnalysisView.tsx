import React, { useState, useEffect } from 'react';
import { RoiInsights } from '../RoiInsights';
import { ExpensesView } from './ExpensesView';
import { AppData } from '../../types';

type SubViewId = 'roi' | 'expenses';

interface AnalysisViewProps {
    onOpenAiCommandCenter: (prompt: string) => void;
    onSubViewChange: (subViewId: SubViewId) => void;
    appData: AppData;
}

const SubNavButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${
            isActive 
                ? 'bg-primary text-white shadow' 
                : 'bg-component-light text-text-secondary hover:text-text-primary'
        }`}
    >
        {label}
    </button>
);

const AnalysisViewInternal: React.FC<AnalysisViewProps> = ({ onOpenAiCommandCenter, onSubViewChange, appData }) => {
    const [activeSubView, setActiveSubView] = useState<SubViewId>('roi');

    useEffect(() => {
        onSubViewChange(activeSubView);
    }, [activeSubView, onSubViewChange]);

    const subViews = [
        { id: 'roi', label: '📈 Revenue Insights', component: <RoiInsights onOpenAiCommandCenter={onOpenAiCommandCenter} appData={appData} /> },
        { id: 'expenses', label: '🧾 Billing Analysis', component: <ExpensesView onOpenAiCommandCenter={onOpenAiCommandCenter} appData={appData} /> },
    ];
    
    const ActiveComponent = subViews.find(v => v.id === activeSubView)?.component;

    return (
        <div className="animate-fade-in space-y-6">
            <nav className="p-1.5 bg-component-light rounded-lg flex items-center gap-2 border border-border w-fit">
                {subViews.map(view => (
                    <SubNavButton
                        key={view.id}
                        label={view.label}
                        isActive={activeSubView === view.id}
                        onClick={() => setActiveSubView(view.id as SubViewId)}
                    />
                ))}
            </nav>
            <main>
                {ActiveComponent}
            </main>
        </div>
    );
};

export const AnalysisView = React.memo(AnalysisViewInternal);