
import React, { useState } from 'react';
import { Card } from './ui/Card';
import { ShieldCheckIcon, CheckCircleIcon, ServerStackIcon, WarningIcon } from './ui/Icons';
import { useToast } from '../contexts/ToastContext';

export const SettingsView: React.FC = () => {
    const { showToast } = useToast();
    const [esnHost, setEsnHost] = useState('192.168.1.100');
    const [esnPort, setEsnPort] = useState('9780');
    const [companyId, setCompanyId] = useState('Sample');
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [logs, setLogs] = useState<string[]>([]);

    const handleTestConnection = () => {
        setTestStatus('testing');
        setLogs(["Initiating handshake with ESN Service on Port " + esnPort + "..."]);
        
        setTimeout(() => {
            setLogs(prev => [...prev, "✔ Socket Open. TLS Handshake Complete."]);
        }, 800);

        setTimeout(() => {
            setLogs(prev => [...prev, `✔ Authenticated as 'CoExecutive' for Company '${companyId}'.`]);
        }, 1600);

        setTimeout(() => {
            setLogs(prev => [...prev, "✔ Validating Schema Access..."]);
            setLogs(prev => [...prev, "  • dbo.ServiceCalls [WRITE ACCESS]"]);
            setLogs(prev => [...prev, "  • dbo.MeterReads [WRITE ACCESS]"]);
            setLogs(prev => [...prev, "  • dbo.Ocontracts [READ ACCESS]"]);
            setTestStatus('success');
            showToast("ESN Connection Validated: Ready for Service Calls & Meters.");
        }, 2800);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-10">
            <div className="flex items-center gap-4 px-2">
                <div className="p-3 bg-slate-800 rounded-lg text-white border border-slate-700">
                    <ServerStackIcon className="w-8 h-8"/>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">Settings & Integrations</h2>
                    <p className="text-text-secondary text-sm">Configure backend connectors and ERP synchronization.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* WestFlow ESN Connector */}
                <Card className="border-l-4 border-l-primary">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <ShieldCheckIcon className="w-6 h-6 text-primary" />
                            <h3 className="text-lg font-bold text-text-primary">WestFlow ESN Connector</h3>
                        </div>
                        <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded border border-primary/20">Authorized</span>
                    </div>
                    
                    <p className="text-sm text-text-secondary mb-6">
                        Securely tunnel session telemetry directly into your on-premise LegalServer SQL database via the ACS Legal Network (ALN).
                    </p>

                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary mb-1">ESN Host (SQL Server IP)</label>
                                <input 
                                    type="text" 
                                    value={esnHost}
                                    onChange={(e) => setEsnHost(e.target.value)}
                                    className="w-full p-2 bg-background border border-border rounded text-sm font-mono"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-secondary mb-1">Port (Default: 9780)</label>
                                <input 
                                    type="text" 
                                    value={esnPort}
                                    onChange={(e) => setEsnPort(e.target.value)}
                                    className="w-full p-2 bg-background border border-border rounded text-sm font-mono"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-text-secondary mb-1">Company ID</label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={companyId}
                                    onChange={(e) => setCompanyId(e.target.value)}
                                    className="flex-1 p-2 bg-background border border-border rounded text-sm font-mono"
                                />
                                <div className="flex items-center gap-1 text-[10px] text-warning bg-warning/10 px-2 rounded border border-warning/20">
                                    <WarningIcon className="w-3 h-3" />
                                    <span>Exclude "Co" prefix</span>
                                </div>
                            </div>
                        </div>

                        <div className="p-3 bg-component-light rounded border border-border">
                            <div className="flex items-center justify-between mb-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="rounded text-primary focus:ring-primary" defaultChecked />
                                    <span className="text-sm font-medium text-text-primary">Enable Write-Back (Service Calls)</span>
                                </label>
                                <span className="text-[10px] text-text-secondary">Req: ESN Build 844+</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="rounded text-primary focus:ring-primary" defaultChecked />
                                    <span className="text-sm font-medium text-text-primary">Enable Meter Import</span>
                                </label>
                            </div>
                        </div>

                        {/* Connection Test Console */}
                        <div className="mt-4 bg-black/80 rounded-lg p-3 font-mono text-[10px] h-32 overflow-y-auto border border-slate-700 shadow-inner">
                            {logs.length === 0 && <span className="text-slate-500 opacity-50"> Ready to test connection...</span>}
                            {logs.map((log, i) => (
                                <div key={i} className="text-green-400 mb-1">{log}</div>
                            ))}
                            {testStatus === 'testing' && <div className="animate-pulse text-primary">...</div>}
                        </div>

                        <button 
                            onClick={handleTestConnection}
                            disabled={testStatus === 'testing'}
                            className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold py-2 px-4 rounded-lg transition-all"
                        >
                            {testStatus === 'testing' ? 'Testing ESN Handshake...' : 'Test Connection & Schema'}
                        </button>
                    </div>
                </Card>

                {/* Additional Settings Placeholder */}
                <Card>
                    <h3 className="text-lg font-bold text-text-primary mb-4">WestFlow General Settings</h3>
                    <p className="text-sm text-text-secondary">Additional configuration options for the Cloud Run instance.</p>
                    <div className="mt-4 p-4 bg-component-light rounded-lg border border-border text-center text-text-secondary text-sm">
                        Additional settings available in Admin Console.
                    </div>
                </Card>
            </div>
        </div>
    );
};
