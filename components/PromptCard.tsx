
import React from 'react';
import { SparklesIcon } from './ui/Icons';

interface PromptCardProps {
    title: string;
    description: string;
    onClick: () => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({ title, description, onClick }) => {
    return (
        <button 
            onClick={onClick}
            className="w-full text-left p-3 bg-component rounded-lg border border-border-color hover:bg-primary/10 hover:border-accent/50 transition-all duration-200 shadow-sm hover:shadow-md group"
        >
            <div className="flex items-start gap-3">
                <div className="mt-1">
                   <SparklesIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                    <h4 className="font-bold text-text-primary">{title}</h4>
                    <p className="text-sm text-text-secondary">{description}</p>
                </div>
            </div>
        </button>
    );
};
