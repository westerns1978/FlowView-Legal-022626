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
    const size = className?.includes('w-') ? '' : 'w-[52px] h-[52px]';
    return (
        <div className={`${size} text-accent-primary ${className || ''}`}>
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <circle cx="24" cy="6" r="3" fill="currentColor" opacity="0.9"/>
              <line x1="24" y1="9" x2="24" y2="42" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="16" x2="40" y2="16" stroke="currentColor" strokeWidth="2"/>
              <line x1="24" y1="9" x2="24" y2="16" stroke="currentColor" strokeWidth="2"/>
              {/* Left pan */}
              <line x1="8" y1="16" x2="4" y2="28" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="8" y1="16" x2="12" y2="28" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 28 Q8 34 14 28" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              {/* Right pan */}
              <line x1="40" y1="16" x2="36" y2="28" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="40" y1="16" x2="44" y2="28" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M34 28 Q40 34 46 28" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              {/* Base */}
              <line x1="16" y1="42" x2="32" y2="42" stroke="currentColor" strokeWidth="2.5"/>
            </svg>
        </div>
    );
};

export const CompactLogo: React.FC<LogoProps> = ({ className }) => {
    const size = className?.includes('w-') ? '' : 'w-[28px] h-[28px]';
    return (
        <div className={`${size} text-accent-primary ${className || ''}`}>
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <circle cx="24" cy="6" r="3" fill="currentColor" opacity="0.9"/>
              <line x1="24" y1="9" x2="24" y2="42" stroke="currentColor" strokeWidth="2"/>
              <line x1="8" y1="16" x2="40" y2="16" stroke="currentColor" strokeWidth="2"/>
              <line x1="24" y1="9" x2="24" y2="16" stroke="currentColor" strokeWidth="2"/>
              {/* Left pan */}
              <line x1="8" y1="16" x2="4" y2="28" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="8" y1="16" x2="12" y2="28" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M2 28 Q8 34 14 28" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              {/* Right pan */}
              <line x1="40" y1="16" x2="36" y2="28" stroke="currentColor" strokeWidth="1.5"/>
              <line x1="40" y1="16" x2="44" y2="28" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M34 28 Q40 34 46 28" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              {/* Base */}
              <line x1="16" y1="42" x2="32" y2="42" stroke="currentColor" strokeWidth="2.5"/>
            </svg>
        </div>
    );
};

export const FlowViewLogo = AppLogo;

export const RenewIT360Logo: React.FC<{className?: string}> = ({className}) => (
    <div className={`flex items-center gap-3 ${className}`}>
         <div className="w-8 h-8 flex-shrink-0">
            <AppLogo />
         </div>
        <span className="text-xl font-bold text-text-primary whitespace-nowrap font-serif-display">FlowView Legal</span>
    </div>
);