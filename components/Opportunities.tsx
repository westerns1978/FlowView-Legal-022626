
import React, { useMemo, useState, useEffect } from 'react';
import { AppData } from '../types';
import { LightbulbIcon, FileTextIcon, AlertTriangleIcon } from './ui/Icons';
import { Card } from './ui/Card';


interface OpportunitiesProps {
    onOpenAiCommandCenter: (prompt: string) => void;
    onShowOpportunityAlert: (message: string, view: 'sales-pipeline' | 'renewit-ops') => void;
    appData: AppData;
}

export const Opportunities: React.FC<OpportunitiesProps> = ({ onOpenAiCommandCenter, onShowOpportunityAlert, appData }) => {
    // Therapeutic win: Adding a guard clause prevents crashes from race conditions, making the app more stable and reducing user frustration.
    if (!appData || !appData.contractData) {
        return <div className="text-center p-4 text-text-secondary">Loading data...</div>;
    }

    const { contractData, scenarios, foundationalData } = appData;
    const [selectedClient, setSelectedClient] = useState<string>(foundationalData.customers[0]?.id || '');

    const coTerminationCandidates = useMemo(() => {
        if (!contractData) return [];
        const clientContracts: { [key: string]: any[] } = {};
        contractData.forEach(c => {
            if (!clientContracts[c.clientId]) {
                clientContracts[c.clientId] = [];
            }
            clientContracts[c.clientId].push(c);
        });

        return Object.values(clientContracts)
            .filter(contracts => contracts.length > 1)
            .map(contracts => ({
                clientName: contracts[0].clientName,
                contracts: contracts.map(c => ({ serviceName: c.serviceName, endDate: c.endDate }))
            }));
    }, [contractData]);

    const selectedClientData = useMemo(() => {
        if (!selectedClient) return null;

        const clientInfo = foundationalData.customers.find(c => c.id === selectedClient);
        if (!clientInfo) return null;

        const contracts = contractData.filter(c => c.clientId === selectedClient);
        const tickets = scenarios
            .filter(s => s.customerName === clientInfo.name)
            .map(s => s.freshDeskData.ticket);
            
        // AI Insight Logic: Flag tickets for services not under contract
        const contractedServices = contracts.map(c => c.serviceName.toLowerCase());
        const insightTickets = tickets.filter(t => {
            if(t.subject.toLowerCase().includes('wifi') && !contractedServices.some(cs => cs.includes('wifi'))) return true;
            if(t.subject.toLowerCase().includes('av') && !contractedServices.some(cs => cs.includes('av'))) return true;
            if(t.subject.toLowerCase().includes('server') && !contractedServices.some(cs => cs.includes('server'))) return true;
            return false;
        });

        return {
            clientName: clientInfo.name,
            contracts,
            tickets,
            insightTickets,
        }
    }, [selectedClient, contractData, scenarios, foundationalData]);

    useEffect(() => {
        if (selectedClientData?.insightTickets && selectedClientData.insightTickets.length > 0) {
            const message = `Unbilled sessions detected for ${selectedClientData.clientName}. Flagged for potential revenue recovery. Review now?`;
            onShowOpportunityAlert(message, 'renewit-ops');
        }
    }, [selectedClientData, onShowOpportunityAlert]);


    return (
        <div data-sub-view="ops" className="h-full flex flex-col space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <h3 className="font-bold text-text-primary mb-3 flex items-center gap-2">
                        <LightbulbIcon className="w-5 h-5 text-yellow-500" /> Program Completion Candidates
                    </h3>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {coTerminationCandidates.map(candidate => (
                            <div key={candidate.clientName} className="bg-component-light p-3 rounded-lg border border-border">
                                <h4 className="font-semibold text-primary">{candidate.clientName}</h4>
                                <ul className="text-xs text-text-secondary mt-1 list-disc list-inside">
                                    {candidate.contracts.map(c => <li key={c.serviceName}>{c.serviceName} (Ends: {c.endDate})</li>)}
                                </ul>
                            </div>
                        ))}
                    </div>
                </Card>
                <Card className="lg:col-span-2">
                    <h3 className="font-bold text-text-primary mb-3">Compliance & Session Integration View</h3>
                    <select
                        value={selectedClient}
                        onChange={(e) => setSelectedClient(e.target.value)}
                        className="w-full p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-component-light text-text-primary mb-4"
                    >
                        {foundationalData.customers.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>

                    {selectedClientData && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h4 className="font-semibold text-text-primary mb-2">Active Cases</h4>
                                <div className="space-y-2">
                                    {selectedClientData.contracts.length > 0 ? selectedClientData.contracts.map(c => (
                                        <div key={c.contractId} className="bg-component-light p-2 rounded-md border border-border">
                                            <p className="font-semibold text-sm text-text-primary">{c.serviceName}</p>
                                            <p className="text-xs text-text-secondary">Ends: {c.endDate}</p>
                                        </div>
                                    )) : <p className="text-xs text-text-secondary">No active cases found.</p>}
                                </div>
                            </div>
                             <div>
                                <h4 className="font-semibold text-text-primary mb-2">Recent Compliance Actions</h4>
                                 <div className="space-y-2">
                                    {selectedClientData.tickets.length > 0 ? selectedClientData.tickets.map(t => (
                                        <div key={t.ticketId} className="bg-component-light p-2 rounded-md border border-border">
                                            <p className="font-semibold text-sm text-text-primary flex items-center gap-1">
                                                <FileTextIcon className="w-4 h-4 text-text-secondary" /> {t.subject}
                                            </p>
                                            <p className="text-xs text-text-secondary">Status: {t.status}</p>
                                        </div>
                                    )) : <p className="text-xs text-text-secondary">No recent actions found.</p>}
                                </div>
                            </div>
                             {selectedClientData.insightTickets.length > 0 && (
                                <div className="md:col-span-2 mt-2 bg-warning/10 border border-warning/20 text-warning p-3 rounded-lg">
                                    <h4 className="font-bold flex items-center gap-2"><AlertTriangleIcon className="w-5 h-5" /> AI Insight: Potential Unbilled Sessions</h4>
                                    <p className="text-sm mt-1">The following actions may not be linked to a billed session:</p>
                                    <ul className="list-disc list-inside text-sm mt-1">
                                        {selectedClientData.insightTickets.map(t => <li key={t.ticketId}><strong>{t.ticketId}:</strong> {t.subject}</li>)}
                                    </ul>
                                     <button onClick={() => onOpenAiCommandCenter(`Draft an email to ${selectedClientData.clientName} about their recent unbilled sessions. Request clarification on program status.`)} className="mt-2 text-xs font-bold text-warning hover:underline">
                                        Ask AI to Draft Billing Email &rarr;
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};
