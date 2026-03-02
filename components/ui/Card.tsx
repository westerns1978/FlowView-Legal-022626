import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = "", onClick, noPadding = false, ...props }) => {
    // Glassmorphism base classes with updated border/shadow logic
    const baseClasses = "glass-panel rounded-2xl transition-all duration-300 relative overflow-hidden";
    
    // Interactive classes
    const clickableClasses = onClick 
        ? "cursor-pointer hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/40 group" 
        : "";
    
    // Padding logic
    const paddingClass = noPadding ? "" : "p-6";

    // Text contrast override if specific bg color is passed (like primary bg)
    const textContrastClass = className?.includes('bg-primary') ? 'text-white border-none shadow-glow-primary' : '';

    return (
        <div 
            className={`${baseClasses} ${clickableClasses} ${paddingClass} ${textContrastClass} ${className}`}
            onClick={onClick}
            {...props}
        >
            {/* Subtle inner glow for depth */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
            
            <div className="relative z-10 h-full">
                {children}
            </div>
        </div>
    );
};