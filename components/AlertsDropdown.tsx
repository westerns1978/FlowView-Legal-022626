
import React from 'react';
import { Alert } from '../types';
import { InfoIcon, WarningIcon, CheckCircleIcon } from './ui/Icons';

interface AlertsDropdownProps {
    alerts: Alert[];
    setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>;
}

const AlertIcon: React.FC<{ type: Alert['type'] }> = ({ type }) => {
    switch (type) {
        case 'success':
            return <CheckCircleIcon className="w-6 h-6 text-success" />;
        case 'warning':
            return <WarningIcon className="w-6 h-6 text-warning" />;
        case 'info':
            return <InfoIcon className="w-6 h-6 text-primary" />;
        default:
            return null;
    }
};

export const AlertsDropdown: React.FC<AlertsDropdownProps> = ({ alerts, setAlerts }) => {
    
    const handleClearAlerts = () => {
        setAlerts([]);
    };
    
    return (
        <div className="absolute top-full right-0 mt-2 w-80 bg-component rounded-lg shadow-xl border border-border-color z-50 animate-fade-in-scale">
            <div className="p-3 font-bold text-text-primary border-b border-border-color">
                Notifications
            </div>
            <div className="max-h-80 overflow-y-auto">
                {alerts.length === 0 ? (
                    <p className="text-center text-text-secondary p-6 text-sm">No new notifications.</p>
                ) : (
                    alerts.map(alert => (
                        <div key={alert.id} className="flex items-start gap-3 p-3 border-b border-border-color hover:bg-component-lighter">
                            <div className="flex-shrink-0 mt-0.5">
                                <AlertIcon type={alert.type} />
                            </div>
                            <p className="text-sm text-text-secondary">{alert.message}</p>
                        </div>
                    ))
                )}
            </div>
            {alerts.length > 0 && (
                <div className="p-2 bg-component/50 rounded-b-lg">
                    <button 
                        onClick={handleClearAlerts}
                        className="w-full text-center text-sm font-medium text-primary hover:text-accent py-1"
                    >
                        Clear All
                    </button>
                </div>
            )}
        </div>
    );
};
