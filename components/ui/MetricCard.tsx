
import React from 'react';
import { Card } from './Card';
import { SkeletonLoader } from './SkeletonLoader';
import { useCountUp } from '../../hooks/useCountUp';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon, AlertTriangleIcon } from './Icons';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    prompt?: string;
    trend?: {
        value: string;
        direction: 'up' | 'down' | 'neutral';
    };
    onOpenAiCommandCenter?: (prompt: string) => void;
    onClick?: () => void;
    isLoading?: boolean;
    isAlert?: boolean;
    isSyncing?: boolean;
    isLiveDataSimulating?: boolean;
    progress?: number;
}

const parseValue = (valueStr: string | number): number => {
    if (valueStr === undefined || valueStr === null) return 0;
    if (typeof valueStr === 'number') return valueStr;
    const cleaned = valueStr.replace(/[^0-9.]/g, '');
    let num = parseFloat(cleaned);
    if (valueStr.toLowerCase().includes('k')) {
        num *= 1000;
    }
    if (valueStr.toLowerCase().includes('m')) {
        num *= 1000000;
    }
    return isNaN(num) ? 0 : num;
};

const formatValue = (value: number, originalFormat: string | number): string => {
     const formatStr = String(originalFormat);
     if (formatStr.includes('$')) {
        if (formatStr.toLowerCase().includes('k')) {
            return `$${(value / 1000).toFixed(1)}k`;
        }
        return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    if (formatStr.includes('%')) {
        return `${Math.round(value)}%`;
    }
    return Math.round(value).toLocaleString();
}

export const MetricCard: React.FC<MetricCardProps> = ({ 
    title, value, icon, prompt, trend, 
    onOpenAiCommandCenter, onClick, 
    isLoading = false, isAlert = false, 
    isSyncing = false, isLiveDataSimulating = false,
    progress
}) => {
    const endValue = parseValue(value);
    const animatedValue = useCountUp(endValue, 800);
    const displayValue = formatValue(animatedValue, value);

    const base = endValue;
    const sparklineData = Array.from({ length: 10 }).map((_, i) => ({
        v: base * (0.8 + Math.random() * 0.4)
    }));
    
    const handleClick = () => {
        if (onClick) {
            onClick();
        } else if (onOpenAiCommandCenter && prompt) {
            onOpenAiCommandCenter(prompt);
        }
    };
    
    const alertClasses = isAlert 
        ? 'ring-2 ring-risk-high shadow-[0_0_20px_rgba(var(--risk-high-rgb),0.15)] bg-risk-high/5 animate-pulse-slow' 
        : 'bg-bg-card';

    const interactiveClasses = onClick || (onOpenAiCommandCenter && prompt) 
        ? 'cursor-pointer hover:border-accent-primary/50 hover:shadow-shadow-card hover:bg-bg-secondary/20 transition-all'
        : '';

    return (
        <Card
            className={`flex flex-col h-full min-h-[110px] relative overflow-hidden group backdrop-blur-sm transition-all duration-500 rounded-xl shadow-shadow-card border border-border-default ${alertClasses} ${interactiveClasses}`}
            onClick={handleClick}
            noPadding
        >
            <div className="p-4 md:p-5 flex flex-col h-full z-10 relative justify-between">
                <div className="flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                            <p className="text-[11px] font-bold text-text-dim uppercase tracking-[0.15em] font-sans-ui">{title}</p>
                            {isAlert && <AlertTriangleIcon className="w-3 h-3 text-risk-high animate-bounce" />}
                        </div>
                        {isLoading ? (
                            <SkeletonLoader className="h-8 w-24 mt-1" />
                        ) : (
                            <p className={`text-3xl font-bold tracking-tight leading-none transition-colors duration-300 font-serif-display ${isAlert ? 'text-risk-high' : 'text-text-primary'}`}>{displayValue}</p>
                        )}
                    </div>
                    <div className={`p-2 rounded-lg transition-all shadow-sm ${isAlert ? 'bg-risk-high text-white' : 'bg-bg-secondary border border-divider text-text-dim group-hover:text-accent-primary'}`}>
                        {icon}
                    </div>
                </div>

                <div className="flex items-center justify-between mt-2">
                    {trend && trend.direction !== 'neutral' && !isLoading && !isAlert && (
                         <div className={`flex items-center gap-1 font-bold text-[9px] px-2 py-0.5 rounded-full border w-fit uppercase tracking-wider font-sans-ui ${
                             trend.direction === 'up' 
                             ? 'text-emerald-500 bg-emerald-500/5 border-emerald-500/20' 
                             : 'text-risk-high bg-risk-high/5 border-risk-high/20'
                         }`}>
                            {trend.direction === 'up' ? <ArrowUpIcon className="w-2.5 h-2.5"/> : <ArrowDownIcon className="w-2.5 h-2.5"/>}
                            <span>{trend.value}</span>
                         </div>
                    )}
                    
                    {isAlert && (
                        <div className="text-[9px] font-bold text-risk-high uppercase tracking-widest bg-risk-high/10 px-2 py-0.5 rounded border border-risk-high/20 w-fit font-sans-ui">
                            URGENT
                        </div>
                    )}
                </div>
            </div>

            {/* Sparkline Overlay */}
            {!isLoading && (
                <div className={`absolute bottom-0 left-0 right-0 h-8 transition-all duration-700 pointer-events-none ${isAlert ? 'opacity-20' : 'opacity-5 group-hover:opacity-15'}`}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={sparklineData}>
                            <Area 
                                type="monotone" 
                                dataKey="v" 
                                stroke={isAlert ? '#ef4444' : 'var(--color-primary)'} 
                                fill={isAlert ? '#ef4444' : 'var(--color-primary)'} 
                                strokeWidth={1} 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Threshold Progress Bar (Option A) */}
            {progress !== undefined && (
                <div className="absolute bottom-0 left-0 w-full h-[3px] bg-border/20 z-20">
                    <div 
                        className={`h-full transition-all duration-1000 ${progress > 90 ? 'bg-success' : progress > 50 ? 'bg-primary' : 'bg-orange-500'}`}
                        style={{ width: `${progress}%` }}
                    />
                </div>
            )}
        </Card>
    );
};
