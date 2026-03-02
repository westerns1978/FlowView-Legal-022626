import React from 'react';

interface ProgressBarProps {
    progress: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress }) => {
    const getProgressBarColor = (percentage: number) => {
        if (percentage < 40) return 'from-danger/80 to-danger';
        if (percentage < 60) return 'from-warning/80 to-warning';
        if (percentage < 80) return 'from-yellow-500/80 to-yellow-400';
        return 'from-success/80 to-success';
    }

    return (
        <div className="w-full bg-border-color rounded-full h-2 relative overflow-hidden">
            <div 
                className={`bg-gradient-to-r ${getProgressBarColor(progress)} h-2 rounded-full transition-all duration-500 ease-out relative progress-shimmer`} 
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    );
};