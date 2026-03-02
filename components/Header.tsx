
import React, { useState, useEffect } from 'react';
import { MoonIcon, SunIcon, CameraIcon, ServerStackIcon, LockClosedIcon } from './ui/Icons';
import { AlertsBell } from './AlertsBell';
import { Alert } from '../types';
import { UserProfile } from './UserProfile';
import { useTheme } from '../App';
import { AppLogo, ACSLogo, CompactLogo } from './FlowViewLogo'; 
import { DateRangePicker } from './ui/DateRangePicker';
import { flowview } from '../lib/westflow-client';
import { usePersona, PERSONAS } from '../contexts/PersonaContext';

const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-text-muted hover:text-accent-primary transition-all"
            aria-label="Toggle theme"
        >
            {theme === 'light' ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
        </button>
    );
};

interface HeaderProps {
    alerts: Alert[];
    setAlerts: React.Dispatch<React.SetStateAction<Alert[]>>;
    onSearchFocus: () => void;
    setCommandQuery: (query: string) => void;
    userProfileData: { name: string; points: number; };
    isLiveDataSimulating: boolean;
    setIsLiveDataSimulating: (enabled: boolean) => void;
    isMuted: boolean;
    setIsMuted: (muted: boolean) => void;
    onLogout: () => void;
    onOpenFlowCapture: (tab?: string) => void; 
    onNavigate?: (viewId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ 
    alerts, setAlerts, onSearchFocus, setCommandQuery, 
    userProfileData, onLogout, onOpenFlowCapture, onNavigate
}) => {
    const { persona } = usePersona();

    return (
        <header className="sticky top-0 z-20 bg-bg-primary border-b border-divider">
            <div className="w-full px-4 lg:px-8">
                <div className="flex items-center justify-between h-16 gap-3">
                    <div className="flex items-center gap-4 flex-shrink-0">
                        <AppLogo className="w-8 h-8 text-accent-primary" />
                        <div className="flex items-center gap-3">
                            <h1 className="text-lg font-bold text-accent-primary tracking-[0.2em] uppercase font-serif-display">FlowView Legal</h1>
                            <span className="text-[9px] border border-accent-primary/30 text-accent-primary px-2 py-0.5 rounded font-bold uppercase tracking-[0.1em]">Compliance</span>
                        </div>
                    </div>
                    
                    <div className="flex-1 flex justify-center max-w-md hidden lg:block">
                        <div className="relative">
                            <input
                                id="search"
                                className="block w-full bg-bg-secondary border border-divider rounded-lg py-2 pl-4 pr-4 text-xs text-text-primary placeholder-text-dim focus:outline-none focus:border-accent-primary/50 transition-all font-sans-ui"
                                placeholder="Search matters, documents, or clients..."
                                onFocus={onSearchFocus}
                                onChange={(e) => setCommandQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4 flex-shrink-0">
                       <div className="hidden md:flex items-center gap-2 text-text-dim text-xs font-sans-ui">
                           <span>{persona.name}</span>
                           <span>•</span>
                           <span>ACS Therapy</span>
                       </div>
                       
                       <button 
                            onClick={onLogout} 
                            className="px-4 py-1.5 border border-divider text-accent-primary hover:bg-accent-primary/10 rounded text-[10px] font-bold uppercase tracking-widest transition-colors"
                        >
                           Sign Out
                       </button>
                       <ThemeToggle />
                    </div>
                </div>
            </div>
        </header>
    );
};
