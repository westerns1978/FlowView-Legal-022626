

import React from 'react';
import { ComputerDesktopIcon, SparklesIcon, PlusCircleIcon, BellIcon } from './ui/Icons';
import { Alert } from '../types';

interface BottomNavBarProps {
    onOpenFieldReport: () => void;
    alerts: Alert[];
    onOpenAiCommandCenter: (query?: string) => void;
}

const NavItem: React.FC<{ icon: React.ReactNode; label: string; onClick?: () => void; hasBadge?: boolean }> = ({ icon, label, onClick, hasBadge }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center gap-1 text-text-secondary hover:text-primary transition-colors w-full relative">
        {hasBadge && <span className="absolute top-0 right-[25%] block h-2 w-2 rounded-full bg-danger"></span>}
        {icon}
        <span className="text-xs">{label}</span>
    </button>
);

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ onOpenFieldReport, alerts, onOpenAiCommandCenter }) => {
    
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-component border-t border-border-color shadow-lg z-40">
            <div className="flex justify-around items-center h-16 px-2">
                <NavItem icon={<ComputerDesktopIcon className="w-6 h-6" />} label="Dashboard" onClick={scrollToTop} />
                <NavItem icon={<SparklesIcon className="w-6 h-6" />} label="AI Analyst" onClick={() => onOpenAiCommandCenter()} />
                <NavItem icon={<PlusCircleIcon className="w-7 h-7 text-primary" />} label="Report" onClick={onOpenFieldReport} />
                <NavItem icon={<BellIcon className="w-6 h-6" />} label="Alerts" hasBadge={alerts.length > 0} />
            </div>
        </footer>
    );
};