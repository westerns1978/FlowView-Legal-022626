
import React, { useState, useEffect } from 'react';
import { Card } from './Card';
import { SparklesIcon, AlertTriangleIcon } from './Icons';

interface AiInsightCardProps {
    insightFetcher: () => Promise<string>;
    onOpenAiCommandCenter: (prompt: string) => void;
    compact?: boolean;
}

export const AiInsightCard: React.FC<AiInsightCardProps> = ({ insightFetcher, onOpenAiCommandCenter, compact = false }) => {
    const [insight, setInsight] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchInsight = async () => {
            setIsLoading(true);
            setError(false);
            try {
                const result = await insightFetcher();
                setInsight(result);
            } catch (error) {
                console.error("Failed to fetch AI insight:", error);
                setError(true);
            } finally {
                setIsLoading(false);
            }
        };
        fetchInsight();
    }, [insightFetcher]);

    if (error) {
        // Render a subtle warning instead of a big red box
        return (
            <div className="flex items-center justify-center p-4 bg-component-light rounded-xl border border-border/50 text-xs text-text-secondary">
               <AlertTriangleIcon className="w-4 h-4 mr-2 text-warning opacity-70" />
               <span>AI Insight unavailable</span>
            </div>
        )
    }

    if (isLoading) {
        return (
            <Card className={`bg-component-light ${compact ? 'p-3' : 'p-4'} h-full flex flex-col justify-center items-center`}>
                 <div className="flex items-center gap-2 text-text-secondary animate-pulse">
                    <SparklesIcon className="w-5 h-5 text-primary" />
                    <span className="text-xs font-medium">Analyzing data...</span>
                </div>
            </Card>
        );
    }

    return (
        <Card className={`bg-gradient-to-br from-primary/5 to-component h-full border border-primary/10 ${compact ? 'p-3' : 'p-5'}`}>
            <div className="flex flex-col h-full justify-between">
                <div className="flex items-start gap-3">
                    <div className="p-1.5 bg-primary/10 rounded-lg shrink-0">
                        <SparklesIcon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="space-y-1 overflow-hidden w-full">
                        <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-2">AI Analysis</h3>
                        <div 
                            className={`prose prose-sm dark:prose-invert max-w-none text-text-secondary leading-relaxed 
                            prose-strong:text-text-primary prose-strong:font-bold prose-headings:text-text-primary
                            prose-ul:list-disc prose-ul:pl-4 prose-li:my-0.5
                            ${compact ? 'line-clamp-2' : 'max-h-[300px] overflow-y-auto pr-2'}`}
                            dangerouslySetInnerHTML={{ __html: (window as any).marked ? (window as any).marked.parse(insight) : `<p>${insight}</p>` }}
                        ></div>
                    </div>
                </div>
                <button 
                    onClick={() => onOpenAiCommandCenter(`Tell me more about this insight: "${insight}"`)}
                    className="self-end text-xs font-bold text-primary hover:text-accent transition-colors flex items-center gap-1 mt-3"
                >
                    Explore Insight &rarr;
                </button>
            </div>
        </Card>
    );
};
