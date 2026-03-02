
import React from 'react';

interface LogoProps {
    className?: string;
}

export const ACSLogo: React.FC<LogoProps> = ({ className }) => (
    <img 
        src="https://storage.googleapis.com/gemynd-public/projects/katun/katie/assets/pds/qt%3Dq_95.webp" 
        alt="ACS Corporate Logo" 
        className={className} 
    />
);

export const AppLogo: React.FC<LogoProps> = ({ className }) => {
    const sizeClasses = className?.includes('w-') ? className : `w-10 h-10 ${className || ''}`;
    return (
        <div className={`relative flex items-center justify-center text-primary ${sizeClasses}`}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                <path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" stroke="currentColor" strokeWidth="8" fill="none" vectorEffect="non-scaling-stroke" />
                <path d="M50 20 L80 35 L80 65 L50 80 L20 65 L20 35 Z" fill="currentColor" fillOpacity="0.2" />
                <circle cx="50" cy="50" r="15" fill="currentColor" />
            </svg>
        </div>
    );
};

export const FlowViewLogo = AppLogo;

export const RenewIT360Logo: React.FC<{className?: string}> = ({className}) => (
    <div className={`flex items-center gap-3 ${className}`}>
         <div className="w-8 h-8 text-primary flex-shrink-0">
            <AppLogo />
         </div>
        <span className="text-xl font-bold text-text-primary whitespace-nowrap">RenewIT 360</span>
    </div>
);
