
import React, { useMemo, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useTheme } from '../App';
import { Contract, AuditTrailData, AppData } from '../types';
import { Card } from './ui/Card';
import { SparklesIcon, CheckBadgeIcon, StarIcon } from './ui/Icons';

interface ProfitabilityProps {
    onOpenAiCommandCenter: (prompt: string) => void;
    onOpenAuditTrail: (data: AuditTrailData) => void;
    appData: AppData;
    onNavigateToClient: (clientId: string) => void;
}

const formatCurrency = (value: number) => {
    if (isNaN(value)) return '$0';
    return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const COLORS = ['#3b82f6', '#16a34a', '#f97316', '#ec4899', '#8b5cf6'];

const CustomTooltip: React.FC<any> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        const data = payload[0]?.payload;
        return (
            <div className="bg-component p-2 shadow-lg rounded-lg border border-border text-sm">
                <p className="font-bold text-text-primary">{label}</p>
                {payload.map((pld: any, index: number) => (
                     <p key={index} style={{ color: pld.fill }}>{`${pld.name}: ${formatCurrency(pld.value)}`}</p>
                ))}
                {data && data.sla_adherence && <p className="text-text-secondary">{`SLA Adherence: ${data.sla_adherence}%`}</p>}
            </div>
        );
    }
    return null;
};

const StarRating: React.FC<{ rating: number }> = ({ rating }) => (
    <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
            <StarIcon key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-border'}`} />
        ))}
    </div>
);


export const Profitability: React.FC<ProfitabilityProps> = ({ onOpenAiCommandCenter, onOpenAuditTrail, appData, onNavigateToClient }) => {
    const { contractData, msaData } = appData;
    const { theme } = useTheme();
    const tickColor = theme === 'dark' ? '#94a3b8' : '#64748b';
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedContractId, setExpandedContractId] = useState<string | null>(null);
    
    // Therapeutic win: Live data updates reduce user stress by ensuring financial analysis is always current.
    const profitabilityByVendor = useMemo(() => {
        if (!contractData) return [];
        const vendorData: { [key: string]: { revenue: number, profit: number } } = {};
        contractData.forEach(c => {
            if (!vendorData[c.vendor]) {
                vendorData[c.vendor] = { revenue: 0, profit: 0 };
            }
            vendorData[c.vendor].revenue += c.recurringPrice;
            vendorData[c.vendor].profit += c.recurringPrice - c.recurringCost;
        });
        return Object.entries(vendorData).map(([name, data]) => ({ name, ...data }));
    }, [contractData]);
    
    const revenueLeakageSources = [
        { name: 'Missed Sessions', value: 15 },
        { name: 'Billing Errors', value: 12 },
        { name: 'Rate Adjustments', value: 10 },
        { name: 'Other', value: 5 }
    ];

    const filteredContracts = useMemo(() => {
        if (!contractData) return [];
        if (!searchTerm) return contractData;
        return contractData.filter(c => 
            c.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.serviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.vendor.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, contractData]);

    if (!contractData) return <div>Loading...</div>;

    return (
        <div data-sub-view="profit" className="h-full flex flex-col space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <h3 className="font-bold text-text-primary mb-2">Billing by Program</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={profitabilityByVendor} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                <XAxis dataKey="name" tick={{ fontSize: 12, fill: tickColor }} />
                                <YAxis tick={{ fontSize: 12, fill: tickColor }} tickFormatter={(val) => `$${Number(val)/1000}k`}/>
                                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(128,128,128,0.1)'}} />
                                <Legend wrapperStyle={{fontSize: '12px', paddingTop: '10px'}}/>
                                <Bar dataKey="revenue" fill="var(--color-primary-light)" name="Billing" />
                                <Bar dataKey="profit" fill="var(--color-primary)" name="Margin" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
                <Card>
                    <h3 className="font-bold text-text-primary mb-2">Compliance Performance (Value vs. Filing)</h3>
                    <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={msaData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                <XAxis dataKey="client_name" tick={{ fontSize: 10, fill: tickColor }} interval={0} angle={-20} textAnchor="end" height={50}/>
                                <YAxis tick={{ fontSize: 10, fill: tickColor }} tickFormatter={(val) => `$${Number(val)/1000}k`}/>
                                <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(128,128,128,0.1)'}} />
                                <Bar dataKey="total_value" name="Total Value">
                                    {msaData && msaData.map((entry, index) => {
                                        const sla = entry.sla_adherence;
                                        let color;
                                        if (sla >= 98) color = '#22c55e'; // green
                                        else if (sla >= 95) color = '#f59e0b'; // yellow
                                        else color = '#ef4444'; // red
                                        return <Cell key={`cell-${index}`} fill={color} />;
                                    })}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <Card>
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xl font-bold text-text-primary">Case Drill-Down</h3>
                    <div className="flex items-center gap-4">
                         <input 
                            type="text"
                            placeholder="Search cases..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full md:w-64 p-2 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-text-primary text-sm"
                         />
                         <button onClick={() => onOpenAiCommandCenter("Summarize the billing of all active cases.")} className="flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover">
                            <SparklesIcon className="w-4 h-4" />
                            Ask AI
                        </button>
                    </div>
                </div>
                <div className="overflow-auto max-h-96">
                    <table className="min-w-full text-sm">
                        <thead className="bg-component-light sticky top-0">
                            <tr>
                                <th className="p-3 text-left font-semibold text-text-secondary">Client</th>
                                <th className="p-3 text-left font-semibold text-text-secondary">Case</th>
                                <th className="p-3 text-right font-semibold text-text-secondary">Margin</th>
                                <th className="p-3 text-center font-semibold text-text-secondary">Provenance</th>
                                <th className="p-3 text-center font-semibold text-text-secondary">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredContracts.map((contract: Contract) => {
                                const margin = contract.recurringPrice > 0 ? ((contract.recurringPrice - contract.recurringCost) / contract.recurringPrice) * 100 : 0;
                                const isVerified = contract.clientName === 'ACME Corp'; // Mock verification
                                const isExpanded = expandedContractId === contract.contractId;

                                return (
                                <React.Fragment key={`${contract.contractId}-${contract.lastUpdated || ''}`}>
                                    <tr className={`hover:bg-component-light transition-colors duration-200 ${contract.lastUpdated ? 'animate-value-change' : ''}`}>
                                        <td className="p-3">
                                            <button 
                                                onClick={() => onNavigateToClient(contract.clientId)}
                                                className="font-black text-primary uppercase tracking-tight text-[12px] hover:underline text-left"
                                            >
                                                {contract.clientName}
                                            </button>
                                        </td>
                                        <td className="p-3 text-text-secondary">{contract.serviceName}</td>
                                        <td className={`p-3 text-right font-medium ${margin > 20 ? 'text-success' : 'text-warning'}`}>{margin.toFixed(1)}%</td>
                                        <td className="p-3 text-center">
                                            {isVerified ? (
                                                <button 
                                                    onClick={() => onOpenAuditTrail({ documentName: contract.serviceName, documentType: "SOW", c2pa: { timestamp: new Date().toISOString(), hash: '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join(''), issuer: 'DoKrunch AI' }})} 
                                                    className="text-success hover:scale-110 transition-transform"
                                                    title="View C2PA Audit Trail"
                                                >
                                                    <CheckBadgeIcon className="w-5 h-5" />
                                                </button>
                                            ) : (
                                                <span className="text-text-secondary text-xs">-</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            <button 
                                                onClick={() => setExpandedContractId(isExpanded ? null : contract.contractId)}
                                                className={`text-xs font-semibold py-1 px-2 rounded ${isExpanded ? 'bg-primary text-white' : 'bg-component-lighter text-text-secondary hover:bg-border'}`}
                                            >
                                                {isExpanded ? 'Hide' : 'Show'}
                                            </button>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="bg-component-light">
                                            <td colSpan={5} className="p-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in text-xs">
                                                    <div>
                                                        <h5 className="font-bold text-text-primary mb-1">Session History</h5>
                                                        {contract.schedule && contract.schedule.length > 0 ? (
                                                            <ul className="list-disc list-inside text-text-secondary">
                                                                {contract.schedule.map(s => <li key={s.date}>{s.purpose} ({s.date})</li>)}
                                                            </ul>
                                                        ) : <p className="text-text-secondary">No sessions scheduled.</p>}
                                                    </div>
                                                    <div>
                                                        <h5 className="font-bold text-text-primary mb-1">Performance</h5>
                                                        <div className="flex items-center gap-2">
                                                            <StarRating rating={contract.performanceRating || 0} />
                                                            <span className="text-text-secondary">({contract.performanceRating || 'N/A'}/5)</span>
                                                        </div>
                                                    </div>
                                                    <div className="md:col-span-1">
                                                        <h5 className="font-bold text-text-primary mb-1">Customer Feedback</h5>
                                                        <p className="italic text-text-secondary">"{contract.customerFeedback || 'No feedback provided.'}"</p>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};
