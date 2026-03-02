
import React, { useState } from 'react';
import { PointsLeaderboard } from '../PointsLeaderboard';
import { Achievements } from '../Achievements';
import { MemeModal } from '../MemeModal';
import { KpiModal } from '../KpiModal';
import { useToast } from '../../contexts/ToastContext';
import { generateKpiIdeas } from '../../services/geminiService';
import { Kpi, AppData } from '../../types';
import { Card } from '../ui/Card';
import { SkeletonLoader } from '../ui/SkeletonLoader';

interface GamificationViewProps {
     onOpenAiCommandCenter: (prompt: string) => void;
     appData: AppData;
}

export const GamificationView: React.FC<GamificationViewProps> = ({ onOpenAiCommandCenter, appData }) => {
    const [isMemeOpen, setIsMemeOpen] = useState(false);
    const [isKpiOpen, setIsKpiOpen] = useState(false);
    const [initialMemeTopic, setInitialMemeTopic] = useState('');
    const [kpis, setKpis] = useState<Kpi[]>([]);
    const [isKpiLoading, setIsKpiLoading] = useState(false);
    const { showToast } = useToast();

    // Therapeutic win: Adding a guard clause prevents crashes from race conditions, making the app more stable and reducing user frustration.
    if (!appData || !appData.achievementsData || !appData.foundationalData) {
        return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
                <div className="lg:col-span-2">
                    <Card><SkeletonLoader className="h-64" /></Card>
                </div>
                <div>
                    <Card><SkeletonLoader className="h-64" /></Card>
                </div>
            </div>
        );
    }

    const handleOpenMemeModal = (topic: string) => {
        setInitialMemeTopic(topic);
        setIsMemeOpen(true);
    };

    const handleBrainstormKpis = async () => {
        setIsKpiOpen(true);
        if (kpis.length > 0) return;
        
        setIsKpiLoading(true);
        try {
            const kpiIdeas = await generateKpiIdeas();
            setKpis(kpiIdeas);
        } catch (error) {
            console.error("Failed to generate KPIs:", error);
            setIsKpiOpen(false);
            showToast("AI couldn't brainstorm KPIs right now.");
        } finally {
            setIsKpiLoading(false);
        }
    };


    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="lg:col-span-2">
                <Card>
                    <Achievements achievementsData={appData.achievementsData} />
                </Card>
            </div>
            <div>
                <Card>
                    <PointsLeaderboard 
                        onOpenMemeModal={handleOpenMemeModal}
                        onBrainstormKpis={handleBrainstormKpis}
                        onShowToast={showToast}
                        appData={appData}
                    />
                </Card>
            </div>
             <MemeModal
                isOpen={isMemeOpen}
                onClose={() => setIsMemeOpen(false)}
                initialTopic={initialMemeTopic}
            />
            <KpiModal
                isOpen={isKpiOpen}
                onClose={() => setIsKpiOpen(false)}
                kpis={kpis}
                isLoading={isKpiLoading}
            />
        </div>
    );
};
