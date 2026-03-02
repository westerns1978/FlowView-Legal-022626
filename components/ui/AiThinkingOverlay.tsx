import React from 'react';
// FIX: Replaced non-existent AtAGlanceLogo with AppLogo
import { AppLogo } from '../FlowViewLogo';
import { SparklesIcon } from './Icons';

export const AiThinkingOverlay: React.FC = () => {
    return (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[99] flex flex-col items-center justify-center animate-fade-in">
            <div className="text-center p-8 bg-component rounded-2xl shadow-2xl border border-border">
                <div className="relative w-20 h-20 mx-auto mb-4">
                    {/* FIX: Using AppLogo here */}
                    <AppLogo className="w-full h-full" />
                    <SparklesIcon className="absolute -bottom-1 -right-1 w-8 h-8 text-primary animate-pulse" />
                </div>
                <div className="h-4 w-48 bg-primary/20 rounded-full mx-auto mb-4 overflow-hidden">
                    <div className="h-full bg-primary animate-progress-indeterminate"></div>
                </div>
                <h2 className="text-xl font-bold text-text-primary uppercase tracking-tighter">Flo is Reasoning...</h2>
                <p className="text-text-secondary text-xs font-medium uppercase tracking-widest mt-2">Fabric Intelligence Synchronizing</p>
            </div>
        </div>
    );
};