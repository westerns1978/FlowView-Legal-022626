
import React, { useState, useRef, useEffect } from 'react';
import { Alert } from '../types';
import { BellIcon } from './ui/Icons';
import { AlertsDropdown } from './AlertsDropdown';

interface AlertsBellProps {
    alerts: Alert[];
    setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>;
}

export const AlertsBell: React.FC<AlertsBellProps> = ({ alerts, setAlerts }) => {
    const [isOpen, setIsOpen] = useState(false);
    const hasUnread = alerts.length > 0;
    const ref = useRef<HTMLDivElement>(null);

    // Close dropdown if clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (ref.current && !ref.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [ref]);

    const handleBellClick = () => {
        setIsOpen(prev => !prev);
    };

    return (
        <div className="relative" ref={ref}>
            <button 
                onClick={handleBellClick}
                className="relative p-2 rounded-full text-text-secondary hover:bg-component-lighter hover:text-text-primary transition-colors"
                aria-label="Notifications"
            >
                <BellIcon className="w-6 h-6" />
                {hasUnread && (
                    <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-component"></span>
                )}
            </button>
            {isOpen && <AlertsDropdown alerts={alerts} setAlerts={setAlerts} />}
        </div>
    );
};
