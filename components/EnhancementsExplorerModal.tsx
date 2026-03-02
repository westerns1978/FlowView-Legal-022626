
import React, { useState, useMemo, useEffect, DragEvent, useRef } from 'react';
import { CloseIcon, DocumentTextIcon, ReceiptIcon, UserGroupIcon, ComputerDesktopIcon, DocumentMagnifyingGlassIcon, CheckBadgeIcon, ServerStackIcon, SparklesIcon, ArrowUpTrayIcon, WarningIcon, ScannerIcon, InboxArrowDownIcon } from './ui/Icons';
import { scenarios, foundationalData } from '../data/digital-thread-data';
import { Pie, PieChart, ResponsiveContainer, Cell } from 'recharts';
import { generateUserStories } from '../services/geminiService';
import { useTheme } from '../App';
import { ClientPortalFeature } from './ClientPortalFeature';

// --- Feature Components ---

const DoKrunchFeature: React.FC<{ onOpenAiCommandCenter: (p: string) => void; openScanner: () => void; onShowToast: (msg: string) => void; }> = ({ onOpenAiCommandCenter, openScanner, onShowToast }) => {
    // Renamed to FlowCapture internally for user
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 text-text-primary">
                <h3 className="text-lg font-bold">FlowCapture</h3>
                <p className="text-sm text-text-secondary mb-4">Role-based AI document processing and ingestion.</p>
            </div>
            <div className="md:col-span-2">
                <div className="flex items-center justify-center h-full bg-component-lighter rounded-lg border border-border p-8 text-center">
                    <div>
                        <InboxArrowDownIcon className="w-16 h-16 text-text-secondary mx-auto mb-4"/>
                        <h3 className="text-xl font-bold text-text-primary">FlowCapture Demo</h3>
                        <p className="text-text-secondary mb-4">Experience the unified ingestion engine.</p>
                        <button onClick={openScanner} className="bg-primary text-white font-bold py-2 px-4 rounded-lg">Launch FlowCapture</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const EnhancementsExplorerModal: React.FC<any> = ({ isOpen, onClose, onOpenAiCommandCenter, onShowToast, openScanner }) => {
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [activeFeature, setActiveFeature] = useState<string>('dokrunch');

    const closeModal = () => {
        setIsAnimatingOut(true);
        setTimeout(() => { onClose(); setIsAnimatingOut(false); }, 300);
    };

    const NavButton: React.FC<{ feature: string; label: string; icon: React.ReactNode }> = ({ feature, label, icon }) => (
        <button
            onClick={() => setActiveFeature(feature)}
            className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-colors ${activeFeature === feature ? 'bg-primary/10 text-primary font-semibold' : 'text-text-secondary hover:bg-component-lighter'}`}
        >
            {icon} {label}
        </button>
    );

    const renderContent = () => {
        switch (activeFeature) {
            case 'dokrunch': return <DoKrunchFeature onOpenAiCommandCenter={onOpenAiCommandCenter} openScanner={openScanner} onShowToast={onShowToast} />;
            case 'stories': return <div className="p-4">AI Stories Loading...</div>; 
            case 'portal': return <ClientPortalFeature />;
            default: return null;
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={closeModal}>
            <div
                className={`bg-component rounded-2xl shadow-2xl w-full max-w-5xl transform flex flex-col h-[90vh] border border-border-color ${isAnimatingOut ? 'animate-fade-out-scale' : 'animate-fade-in-scale'}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-border-color">
                    <h3 className="text-xl font-bold text-text-primary">Explore Features</h3>
                    <button onClick={closeModal} className="text-text-secondary hover:text-text-primary">
                        <CloseIcon className="w-6 h-6" />
                    </button>
                </div>
                <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                    <nav className="w-full md:w-1/3 lg:w-1/4 bg-component-lighter border-b md:border-b-0 md:border-r border-border-color p-4 space-y-1">
                        <NavButton feature="dokrunch" label="FlowCapture" icon={<InboxArrowDownIcon className="w-5 h-5" />} />
                        <NavButton feature="portal" label="Client Portal Vision" icon={<ComputerDesktopIcon className="w-5 h-5" />} />
                    </nav>
                    <main className="w-full md:w-2/3 lg:w-3/4 p-6 overflow-y-auto bg-component">
                        {renderContent()}
                    </main>
                </div>
            </div>
        </div>
    );
};
