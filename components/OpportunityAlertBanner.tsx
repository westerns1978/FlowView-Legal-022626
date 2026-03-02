import React from 'react';
import { LightbulbIcon, CloseIcon } from './ui/Icons';

interface OpportunityAlertBannerProps {
    message: string;
    onDismiss: () => void;
}

export const OpportunityAlertBanner: React.FC<OpportunityAlertBannerProps> = ({ message, onDismiss }) => {
    return (
        <div className="info-banner info mb-6 animate-fade-in-scale">
            <LightbulbIcon className="info-banner-icon" />
            <div className="info-banner-content flex-grow">
                 <p className="text-sm font-semibold">{message}</p>
            </div>
            <button
                onClick={onDismiss}
                className="text-text-secondary hover:bg-primary/20 p-1 rounded-full transition-colors self-start"
                aria-label="Dismiss alert"
            >
                <CloseIcon className="w-5 h-5" />
            </button>
        </div>
    );
};