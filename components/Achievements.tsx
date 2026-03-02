import React from 'react';
import { Achievement } from '../types';

const AchievementItem: React.FC<{ achievement: Achievement }> = ({ achievement }) => (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-component-lighter transition-colors">
        <div className={`text-2xl ${achievement.unlocked ? '' : 'grayscale opacity-40'}`}>{achievement.icon}</div>
        <div>
            <h5 className={`font-bold ${achievement.unlocked ? 'text-text-primary' : 'text-text-secondary'}`}>{achievement.title}</h5>
            <p className="text-xs text-text-secondary">{achievement.description}</p>
        </div>
    </div>
);

interface AchievementsProps {
    achievementsData: Achievement[];
}

export const Achievements: React.FC<AchievementsProps> = ({ achievementsData }) => {
    const unlockedCount = achievementsData.filter(a => a.unlocked).length;

    return (
        <div>
            <h3 className="text-xl font-bold mb-2 text-text-primary">My Achievements ({unlockedCount}/{achievementsData.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievementsData.map(ach => (
                    <AchievementItem key={ach.id} achievement={ach} />
                ))}
            </div>
        </div>
    );
};