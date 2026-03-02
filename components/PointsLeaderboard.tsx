import React from 'react';
import { SparklesIcon, RocketIcon, BadgeIcon } from './ui/Icons';
import { useTheme } from '../App';
import { AppData } from '../types';

interface PointsLeaderboardProps {
    onOpenMemeModal: (topic: string) => void;
    onBrainstormKpis: () => void;
    onShowToast: (message: string) => void;
    appData: AppData;
}

export const PointsLeaderboard: React.FC<PointsLeaderboardProps> = ({ onOpenMemeModal, onBrainstormKpis, onShowToast, appData }) => {
    // Therapeutic win: Adding a guard clause prevents crashes from race conditions, making the app more stable and reducing user frustration.
    if (!appData || !appData.foundationalData) {
        return <div className="text-center p-4 text-text-secondary">Loading leaderboard...</div>;
    }

    const { foundationalData } = appData;
    const { theme } = useTheme();
    
    // CHECKPOINT: The data for this component now comes directly from the `foundationalData.technicians` list.
    // This list now contains all 36 users, and they are sorted here by points.
    const leaderboardData = foundationalData.technicians
        .map(technician => ({
            name: technician.name,
            points: technician.points || 0,
        }))
        .sort((a, b) => b.points - a.points);

    // Beginner comment: This function picks trophy colors. These colors have been checked for accessibility contrast.
    const getTrophyColor = (index: number) => {
        if (theme === 'light') {
            if (index === 0) return 'text-amber-600'; // Gold
            if (index === 1) return 'text-gray-500';  // Silver
            if (index === 2) return 'text-amber-800'; // Bronze
        } else {
            // Use brighter colors for dark mode while maintaining contrast
            if (index === 0) return 'text-yellow-400';
            if (index === 1) return 'text-slate-300';
            if (index === 2) return 'text-orange-400';
        }
        return 'text-transparent';
    }
    
    const handleLogBehavior = () => {
        onShowToast('Points Awarded! 🎉');
    }

    return (
        <div className="bg-component p-4 rounded-xl h-full flex flex-col">
            <h3 className="text-xl font-bold mb-4 text-text-primary">🏆 Q3 Points Leaderboard</h3>
            <ul className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {leaderboardData.map((player, index) => (
                    <li key={player.name} className="flex items-center justify-between bg-component-light p-2 rounded-lg pr-3 shadow-sm border border-border-color">
                        <div className="flex items-center gap-3">
                            <span className="font-semibold text-text-secondary w-5 text-center">{index + 1}.</span>
                            {/* Beginner comment: We show a different icon for the first place winner! */}
                            {index === 0 && <RocketIcon className={`w-5 h-5 ${getTrophyColor(index)}`} />}
                            {index > 0 && <BadgeIcon className={`w-5 h-5 ${getTrophyColor(index)}`} />}
                            <span className="font-medium text-text-primary">{player.name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="font-bold text-primary">{player.points.toLocaleString()} pts</span>
                             <button 
                                onClick={() => onOpenMemeModal(`Celebrating ${player.name} for being a top performer with ${player.points} points!`)}
                                className="p-1.5 rounded-full text-primary bg-primary/10 hover:bg-primary/20 transition-colors"
                                title={`Recognize ${player.name}`}
                            >
                                <SparklesIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
            
            <div className="border-t border-border-color pt-4 mt-auto">
                 <h4 className="text-lg font-bold text-text-primary mb-2">Log Team Behavior</h4>
                 <div className="flex flex-col sm:flex-row gap-2">
                    <select className="flex-grow p-2 text-sm border-border-color rounded-md bg-component-lighter text-text-primary focus:ring-accent w-full sm:w-auto">
                        <option>New Intake Lead (+50 pts)</option>
                        <option>Positive Compliance Review (+25 pts)</option>
                        <option>Completed HIPAA Training (+100 pts)</option>
                    </select>
                    <button onClick={handleLogBehavior} className="bg-primary text-white font-semibold py-2 px-3 rounded-lg hover:bg-accent transition text-sm">
                        Award Points 🏆
                     </button>
                 </div>
            </div>
        </div>
    );
};