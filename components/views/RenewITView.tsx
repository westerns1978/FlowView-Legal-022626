import React, { useState, useEffect, useRef } from 'react';
import { CommandCenterView } from './CommandCenterView';
import { Profitability } from '../Profitability';
import { Opportunities } from '../Opportunities';
import { MAIntegrationView } from './MAIntegrationView';
import { PricingSection } from '../PricingSection';
import { RenewIT360Logo } from '../FlowViewLogo';
import { AuditTrailData, AppData } from '../../types';
import { Card } from '../ui/Card';
import { SkeletonLoader } from '../ui/SkeletonLoader';
import { ServerStackIcon, CheckCircleIcon, ArrowDownIcon } from '../ui/Icons';
import { AppConfig } from '../../config';

type SubViewId = 'command' | 'profit' | 'ops' | 'ma-integration';

interface RenewITViewProps {
    onOpenAiCommandCenter: (prompt: string) => void;
    onSubViewChange: (subViewId: SubViewId) => void;
    onOpenAuditTrail: (data: AuditTrailData) => void;
    onShowOpportunityAlert: (message: string, view: 'sales-pipeline' | 'renewit-ops') => void;
    appData: AppData;
    onNavigateToClient: (clientId: string) => void;
}

const SubNavButton: React.FC<{ label: string; isActive: boolean; onClick: () => void; }> = ({ label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors ${
            isActive 
                ? 'border-primary text-primary' 
                : 'border-transparent text-text-secondary hover:text-text-primary'
        }`}
    >
        {label}
    </button>
);

const TelemetryConsole: React.FC = () => {
    const [logs, setLogs] = useState<string[]>([]);
    const [status, setStatus] = useState<'connecting' | 'connected'>('connecting');
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setTimeout(() => {
            setStatus('connected');
            setLogs(prev => [...prev, `[SYS] Connected to ACS-LEGAL Engine (${AppConfig.urls.mcpServer})`, `[SYS] Stream ID: ${Math.random().toString(36).substring(7)}`]);
        }, 1500);

        const interval = setInterval(() => {
            if (status === 'connecting') return;
            const devices = ['CLIENT-101', 'CLIENT-202', 'CLIENT-303', 'CLIENT-404'];
            const events = [
                { type: 'SESSION_LOG', data: '{"cpt": "90837", "duration": "53min"}' },
                { type: 'STATUS', data: '{"state": "ACTIVE", "compliance": "98%"}' },
                { type: 'HEARTBEAT', data: '{"latency": "24ms"}' },
            ];
            const device = devices[Math.floor(Math.random() * devices.length)];
            const event = events[Math.floor(Math.random() * events.length)];
            const logEntry = `[${new Date().toLocaleTimeString()}] <${device}> ${event.type}: ${event.data}`;
            setLogs(prev => {
                const newLogs = [...prev, logEntry];
                if (newLogs.length > 5) return newLogs.slice(newLogs.length - 5);
                return newLogs;
            });
        }, 3000);
        return () => clearInterval(interval);
    }, [status]);

    return (
        <div className="bg-black/90 rounded-lg p-3 font-mono text-[10px] text-green-400 border border-green-500/30 shadow-[0_0_10px_rgba(34,197,94,0.1)] mb-4">
            <div className="flex justify-between items-center mb-2 border-b border-green-500/30 pb-1">
                <div className="flex items-center gap-2">
                    <ServerStackIcon className="w-3 h-3" />
                    <span className="font-bold">LIVE COMPLIANCE STREAM</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                    <span className="uppercase">{status}</span>
                </div>
            </div>
            <div ref={scrollRef} className="space-y-1 h-24 overflow-hidden relative">
                {logs.map((log, i) => (
                    <div key={i} className="truncate opacity-90 animate-fade-in-up">{log}</div>
                ))}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-500/5 to-transparent pointer-events-none animate-scanline"></div>
            </div>
        </div>
    );
};

const RenewITViewInternal: React.FC<RenewITViewProps> = ({ 
    onOpenAiCommandCenter, 
    onSubViewChange, 
    onOpenAuditTrail, 
    onShowOpportunityAlert, 
    appData,
    onNavigateToClient
}) => {
    const [activeSubView, setActiveSubView] = useState<SubViewId>('command');

    if (!appData || !appData.contractData) {
        return <Card><SkeletonLoader className="h-96" /></Card>;
    }

    useEffect(() => {
        onSubViewChange(activeSubView);
    }, [activeSubView]);

    const renderContent = () => {
        switch (activeSubView) {
            case 'command':
                return (
                    <div className="space-y-8">
                        <CommandCenterView onOpenAiCommandCenter={onOpenAiCommandCenter} appData={appData} />
                        <PricingSection />
                    </div>
                );
            case 'profit':
                return <Profitability onOpenAiCommandCenter={onOpenAiCommandCenter} onOpenAuditTrail={onOpenAuditTrail} appData={appData} onNavigateToClient={onNavigateToClient} />;
            case 'ops':
                return <Opportunities onOpenAiCommandCenter={onOpenAiCommandCenter} onShowOpportunityAlert={onShowOpportunityAlert} appData={appData} />;
            case 'ma-integration':
                return <MAIntegrationView onOpenAiCommandCenter={onOpenAiCommandCenter} />;
            default:
                return <CommandCenterView onOpenAiCommandCenter={onOpenAiCommandCenter} appData={appData} />;
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            <header className="bg-component p-4 rounded-xl border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-xl font-black text-primary uppercase tracking-tighter">Client Center</h2>
                    <p className="text-text-secondary mt-1 text-sm max-w-xl">
                        Orchestrating <strong>{appData.contractData.length}</strong> active clients. Connected to real-time compliance engine.
                    </p>
                </div>
                <div className="hidden lg:block w-96">
                    <TelemetryConsole />
                </div>
            </header>
            
            <nav className="border-b border-border flex items-center overflow-x-auto">
                <SubNavButton label="Client Overview" isActive={activeSubView === 'command'} onClick={() => setActiveSubView('command')} />
                <SubNavButton label="Billing Analysis" isActive={activeSubView === 'profit'} onClick={() => setActiveSubView('profit')} />
                <SubNavButton label="Intake Pipeline" isActive={activeSubView === 'ops'} onClick={() => setActiveSubView('ops')} />
            </nav>
            
            <main className="min-h-[400px]">
                {renderContent()}
            </main>
        </div>
    );
};

export const RenewITView = React.memo(RenewITViewInternal);