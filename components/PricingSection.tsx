
import React from 'react';
import { Card } from './ui/Card';
import { CheckCircleIcon, CurrencyDollarIcon } from './ui/Icons';

export const PricingSection: React.FC = () => {
    const tiers = [
        { name: 'Bronze CPC', margin: '12%', volume: 'High', color: 'border-amber-700/30' },
        { name: 'Silver Managed', margin: '24%', volume: 'Med', color: 'border-slate-400/30' },
        { name: 'Platinum Agentic', margin: '48%', volume: 'Low', color: 'border-primary/30' }
    ];

    return (
        <div className="space-y-4">
            <h3 className="text-sm font-black text-text-primary uppercase tracking-[0.3em] px-1">Service Value Benchmarks</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tiers.map(tier => (
                    <Card key={tier.name} className={`border-t-4 ${tier.color} p-5`}>
                        <h4 className="font-black text-text-primary uppercase tracking-tight text-xs mb-4">{tier.name}</h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                                <span className="text-text-secondary">Expected Margin</span>
                                <span className="text-primary font-black">{tier.margin}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-bold uppercase">
                                <span className="text-text-secondary">Market Volume</span>
                                <span className="text-text-primary">{tier.volume}</span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};
