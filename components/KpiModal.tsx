import React from 'react';
import { Kpi } from '../types';
import { CloseIcon, MoneyBagIcon, ShieldIcon, TimerIcon, LineChartIcon, TargetIcon } from './ui/Icons';
import { useTheme } from '../App';

interface KpiModalProps {
    isOpen: boolean;
    onClose: () => void;
    kpis: Kpi[];
    isLoading: boolean;
}

const iconMap: { [key: string]: React.FC<{className?: string}> } = {
    acquisition: MoneyBagIcon,
    satisfaction: ShieldIcon,
    sprint: TimerIcon,
    innovation: LineChartIcon,
    resolution: TargetIcon,
};

const KpiCard: React.FC<{ kpi: Kpi }> = ({ kpi }) => {
    const IconComponent = iconMap[kpi.icon] || TargetIcon;
    const { theme } = useTheme();
    
    const colorClasses: {[key: string]: {light: string, dark: string}} = {
        acquisition: { light: 'bg-yellow-100 text-yellow-600', dark: 'bg-yellow-900/50 text-yellow-300' },
        satisfaction: { light: 'bg-purple-100 text-purple-600', dark: 'bg-purple-900/50 text-purple-300' },
        sprint: { light: 'bg-orange-100 text-orange-600', dark: 'bg-orange-900/50 text-orange-300' },
        innovation: { light: 'bg-green-100 text-green-600', dark: 'bg-green-900/50 text-green-300' },
        resolution: { light: 'bg-red-100 text-red-600', dark: 'bg-red-900/50 text-red-300' }
    };
    const cardColor = colorClasses[kpi.icon]?.[theme] || 'bg-component-lighter text-text-secondary';

    return (
        <div className="bg-component p-6 rounded-2xl shadow-md border border-border-color flex flex-col items-start text-left animate-fade-in h-full transition-all duration-300 hover:shadow-lg dark:hover:shadow-glow-accent/50 hover:-translate-y-1">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 ${cardColor}`}>
                <IconComponent className="w-7 h-7" />
            </div>
            <h4 className="text-lg font-bold text-text-primary mb-2">{kpi.title}</h4>
            <p className="text-sm text-text-secondary flex-grow">{kpi.description}</p>
        </div>
    );
};

const Loader: React.FC = () => (
     <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center justify-center p-8 text-center text-text-secondary">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent mb-4"></div>
            <p className="text-lg font-semibold">Brainstorming KPIs...</p>
            <p className="text-sm">The AI is crunching the numbers and ideas.</p>
        </div>
    </div>
);

export const KpiModal: React.FC<KpiModalProps> = ({ isOpen, onClose, kpis, isLoading }) => {
    const modalRef = React.useRef<HTMLDivElement>(null);
    const [isAnimatingOut, setIsAnimatingOut] = React.useState(false);

    const closeModal = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            onClose();
            setIsAnimatingOut(false);
        }, 300);
    };

    React.useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeModal();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    if (!isOpen) return null;

    return (
        <div ref={modalRef} className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={e => e.target === modalRef.current && closeModal()}>
            <div className={`bg-background border border-border-color rounded-2xl shadow-2xl w-full max-w-4xl transform flex flex-col ${isAnimatingOut ? 'animate-fade-out-scale' : 'animate-fade-in-scale'}`}>
                <div className="flex justify-between items-center p-5 border-b border-border-color">
                    <h3 className="text-xl font-bold text-text-primary flex items-center gap-3">
                        <span role="img" aria-label="sparkles">✨</span>
                        Brainstorm KPIs
                    </h3>
                    <button onClick={closeModal} className="text-text-secondary hover:text-text-primary transition-colors">
                        <CloseIcon className="w-7 h-7"/>
                    </button>
                </div>
                <div className="p-8 max-h-[75vh] overflow-y-auto">
                    {isLoading ? (
                        <Loader />
                    ) : (
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                           {kpis.map((kpi, index) => <KpiCard key={index} kpi={kpi} />)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};