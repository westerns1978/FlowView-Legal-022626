
import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { InboxArrowDownIcon, SparklesIcon, CheckCircleIcon, DocumentMagnifyingGlassIcon, ServerStackIcon, FingerPrintIcon, ArrowUpTrayIcon, ScannerIcon, CameraIcon, MicrophoneIcon } from '../ui/Icons';

interface FlowCaptureViewProps {
    onOpenFlowCapture: (tab?: string) => void;
}

const PipelineStep: React.FC<{ icon: React.ReactNode, label: string, status: 'active' | 'pending' | 'complete' }> = ({ icon, label, status }) => {
    const colors = {
        active: 'text-primary border-primary animate-pulse bg-primary/5',
        pending: 'text-text-secondary border-border',
        complete: 'text-success border-success bg-success/5'
    };
    return (
        <div className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 ${colors[status]} w-28 transition-all`}>
            {icon}
            <span className="text-[10px] font-bold uppercase">{label}</span>
        </div>
    );
};

const CaptureActionCard: React.FC<{ icon: React.ReactNode, title: string, subtitle: string, onClick: () => void }> = ({ icon, title, subtitle, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center p-4 bg-component rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-all group h-full w-full text-center">
        <div className="p-3 bg-component-light rounded-full mb-3 group-hover:scale-110 transition-transform group-hover:bg-white group-hover:shadow-md">
            {icon}
        </div>
        <h4 className="font-bold text-text-primary text-md">{title}</h4>
        <p className="text-[10px] text-text-secondary">{subtitle}</p>
    </button>
);

export const FlowCaptureView: React.FC<FlowCaptureViewProps> = ({ onOpenFlowCapture }) => {
    const [logs, setLogs] = useState<string[]>([
        "System initialized. Waiting for input...",
    ]);

    // Simulate a live ingestion stream
    React.useEffect(() => {
        const interval = setInterval(() => {
            const events = [
                "Ingesting: INV-2025-001.pdf via Email",
                "C2PA Verification: Signature Valid (Hash: 0x4a...)",
                "Vision Engine (Gemini 2.5): Analyzing Image...",
                "Extraction: Vendor='Acme Corp', Total='$4,500'",
                "Knowledge Graph: Linked to Node[Vendor:102]"
            ];
            const randomEvent = events[Math.floor(Math.random() * events.length)];
            setLogs(prev => [randomEvent, ...prev.slice(0, 7)]);
        }, 3500);
        return () => clearInterval(interval);
    }, []);

    const recentCaptures = [
        { id: 1, name: 'Service_Report_A45.pdf', type: 'Upload', time: '10 mins ago', status: 'Processed' },
        { id: 2, name: 'Scan_Kyocera_Config.jpg', type: 'Scan', time: '2 hours ago', status: 'Processed' },
        { id: 3, name: 'Site_Visit_Notes.wav', type: 'Voice', time: 'Yesterday', status: 'Pending' },
    ];

    return (
        <div className="space-y-4 animate-fade-in pb-10">
            {/* Header */}
            <div className="flex items-center gap-4 px-2">
                <div className="p-3 bg-primary/10 rounded-lg text-primary border border-primary/20 shadow-glow-primary">
                    <InboxArrowDownIcon className="w-8 h-8"/>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">FlowCapture Engine</h2>
                    <p className="text-text-secondary text-sm">Unified ingestion pipeline powered by Gemini 2.5 Flash Vision.</p>
                </div>
            </div>

            {/* Main Actions Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <CaptureActionCard 
                    icon={<ArrowUpTrayIcon className="w-6 h-6 text-primary"/>} 
                    title="Upload File" 
                    subtitle="PDF, Images, Docs"
                    onClick={() => onOpenFlowCapture('upload')} 
                />
                <CaptureActionCard 
                    icon={<ScannerIcon className="w-6 h-6 text-blue-500"/>} 
                    title="Scan Document" 
                    subtitle="TWAIN / Remote"
                    onClick={() => onOpenFlowCapture('scan')} 
                />
                <CaptureActionCard 
                    icon={<CameraIcon className="w-6 h-6 text-purple-500"/>} 
                    title="Capture Photo" 
                    subtitle="Site Evidence"
                    onClick={() => onOpenFlowCapture('camera')} 
                />
                <CaptureActionCard 
                    icon={<MicrophoneIcon className="w-6 h-6 text-red-500"/>} 
                    title="Voice Note" 
                    subtitle="Dictate Report"
                    onClick={() => onOpenFlowCapture('voice')} 
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Pipeline Visualizer */}
                <Card className="lg:col-span-2">
                    <h3 className="font-bold text-text-primary mb-6">Real-time Processing Pipeline</h3>
                    <div className="flex flex-wrap justify-around items-center gap-2">
                        <PipelineStep icon={<InboxArrowDownIcon className="w-6 h-6"/>} label="Ingest" status="complete" />
                        <div className="h-0.5 w-4 bg-border"></div>
                        <PipelineStep icon={<FingerPrintIcon className="w-6 h-6"/>} label="Verify (C2PA)" status="complete" />
                         <div className="h-0.5 w-4 bg-border"></div>
                        <PipelineStep icon={<DocumentMagnifyingGlassIcon className="w-6 h-6"/>} label="Gemini Vision" status="active" />
                         <div className="h-0.5 w-4 bg-border"></div>
                        <PipelineStep icon={<ServerStackIcon className="w-6 h-6"/>} label="Graph Sync" status="pending" />
                    </div>
                    
                    <div className="mt-6 p-4 bg-black/90 rounded-lg font-mono text-[10px] text-green-400 h-40 overflow-hidden relative">
                        <div className="absolute top-2 right-2 text-gray-500 text-[9px] font-bold">LIVE LOGS</div>
                        <div className="space-y-1">
                            {logs.map((log, i) => (
                                <div key={i} className="opacity-90">
                                    <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Recent Captures List */}
                <Card className="flex flex-col h-full">
                    <h3 className="font-bold text-text-primary mb-4">Recent Captures</h3>
                    <div className="space-y-2 flex-grow overflow-y-auto max-h-[300px]">
                        {recentCaptures.map(item => (
                            <div key={item.id} className="flex items-center justify-between p-2.5 bg-component-light rounded-lg border border-border">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-component rounded-full border border-border">
                                        {item.type === 'Upload' && <ArrowUpTrayIcon className="w-4 h-4 text-primary"/>}
                                        {item.type === 'Scan' && <ScannerIcon className="w-4 h-4 text-blue-500"/>}
                                        {item.type === 'Voice' && <MicrophoneIcon className="w-4 h-4 text-red-500"/>}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-text-primary">{item.name}</p>
                                        <p className="text-[10px] text-text-secondary">{item.time} • {item.type}</p>
                                    </div>
                                </div>
                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${item.status === 'Processed' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                                    {item.status}
                                </span>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 py-2 text-xs font-bold text-primary hover:bg-primary/5 rounded-lg transition">
                        View All History
                    </button>
                </Card>
            </div>
        </div>
    );
};
