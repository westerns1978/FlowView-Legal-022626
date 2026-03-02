
import React, { useState, useRef, useEffect } from 'react';
import { ProgressBar } from './ProgressBar';

interface UserProfileProps {
    userProfileData: {
        name: string;
        points: number;
    };
    onLogout: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userProfileData, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pointsGoal = 1000;
    const progress = Math.min((userProfileData.points / pointsGoal) * 100, 100);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-3 bg-component-lighter p-1.5 rounded-full border border-border-color hover:border-primary/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold flex-shrink-0">
                    {userProfileData.name.charAt(0)}
                </div>
                <div className="hidden md:block pr-2 text-left">
                    <p className="text-sm font-semibold text-text-primary">{userProfileData.name}</p>
                    <div className="flex items-center gap-2">
                        <div className="w-20">
                            <ProgressBar progress={progress} />
                        </div>
                        <p className="text-xs font-medium text-text-secondary">{userProfileData.points} / {pointsGoal} Pts</p>
                    </div>
                </div>
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-component rounded-lg shadow-xl border border-border-color z-50 animate-fade-in-scale">
                    <div className="p-2">
                        <button onClick={onLogout} className="w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-component-light rounded-md">
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
