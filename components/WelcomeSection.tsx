
import React from 'react';
import { SparklesIcon } from './ui/Icons';

interface WelcomeSectionProps {
    userName: string;
    unbilledRevenue: number;
    metricLabel?: string;
    briefing?: string;
    onAction?: (action: string) => void;
    actions?: { label: string; actionId: string; variant?: 'primary' | 'default' }[];
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ userName, unbilledRevenue, metricLabel, briefing, onAction, actions }) => {
    const avatarUrl = "https://storage.googleapis.com/westerns1978-digital-assets/Miscellaneous/connie-ai.png";
    
    // Default scannable briefing if none provided
    const fallbackBriefing = `→ ${formatCurrency(unbilledRevenue)} in unbilled session logs ready for sync.\n→ 3 open compliance actions waiting for review.\n→ 2 cases flagged for attention.`;
    const activeBriefing = briefing || fallbackBriefing;

    // Split briefing into lines for arrow rendering
    const briefingLines = activeBriefing.split('\n').filter(line => line.trim().length > 0);

    const defaultActions = [
        { label: 'REVIEW UNBILLED SESSIONS', actionId: 'audit', variant: 'default' as const },
        { label: 'AT-RISK CASES', actionId: 'churn', variant: 'default' as const },
        { label: 'ASK FLO', actionId: 'chat', variant: 'primary' as const },
    ];

    const buttonActions = actions || defaultActions;

    return (
        <div className="bg-gradient-to-br from-accent-subtle to-bg-card border border-accent-border rounded-2xl p-5 md:p-6 mb-3 animate-fade-in shadow-shadow-card relative group flex items-start">
            <div className="absolute inset-0 bg-accent-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-2xl overflow-hidden"></div>
            
            <div className="flex flex-col md:flex-row items-start gap-4 md:gap-6 relative z-10 w-full">
                {/* Flo Avatar Container */}
                <div className="relative shrink-0 pt-1">
                    <div className="w-12 h-12 rounded-full border-2 border-accent-primary p-0.5 shadow-[0_0_15px_rgba(var(--accent-primary-rgb),0.3)] overflow-hidden bg-bg-secondary group-hover:scale-105 transition-transform duration-500">
                        <img 
                            src={avatarUrl} 
                            alt="Flo" 
                            className="w-full h-full object-cover rounded-full"
                        />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-bg-card animate-pulse shadow-sm"></div>
                </div>

                <div className="flex-grow space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <div className="flex items-center gap-3 mb-0.5">
                                <h2 className="text-[11px] font-bold text-accent-primary uppercase tracking-[0.2em] font-sans-ui">
                                    FLO · MORNING BRIEFING
                                </h2>
                            </div>
                            <h1 className="text-2xl font-semibold text-text-primary tracking-tight font-serif-display">Good morning, {userName}.</h1>
                        </div>
                        
                        <div className="bg-bg-secondary/40 px-4 py-2 rounded-xl border border-divider shadow-inner flex flex-col items-end group/stat hover:border-accent-primary/40 transition-all cursor-help">
                            <p className="text-[10px] font-bold text-text-dim uppercase tracking-wider mb-0.5 font-sans-ui">{metricLabel || 'Unbilled Sessions'}</p>
                            <p className="text-2xl font-bold text-accent-primary font-serif-display tracking-tighter">
                                {formatCurrency(unbilledRevenue)}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3 py-2">
                        {briefingLines.map((line, i) => {
                            const cleanLine = line.trim().startsWith('→') ? line.trim().substring(1).trim() : line.trim();
                            return (
                                <p 
                                    key={i} 
                                    onClick={() => onAction?.(`Tell me more about: ${cleanLine}`)}
                                    className="text-text-secondary text-base font-medium leading-relaxed tracking-tight max-w-4xl hover:text-accent-primary cursor-pointer transition-colors font-serif-body italic"
                                >
                                    {cleanLine}
                                </p>
                            );
                        })}
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                        {buttonActions.map((btn, i) => (
                            <button 
                                key={i}
                                onClick={() => onAction?.(btn.actionId)}
                                className={`px-5 py-2 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] transition-all shadow-sm active:scale-95 font-sans-ui ${
                                    btn.variant === 'primary' 
                                        ? 'bg-accent-primary text-bg-primary hover:brightness-110 shadow-lg shadow-accent-primary/20 flex items-center gap-1.5'
                                        : 'bg-bg-card border border-border-default text-text-dim hover:text-text-primary hover:border-accent-primary/50'
                                }`}
                            >
                                {btn.variant === 'primary' && <SparklesIcon className="w-3 h-3" />}
                                {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
