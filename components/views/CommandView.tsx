
import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../ui/Card';
import { WelcomeSection } from '../WelcomeSection';
import { StrategySection } from '../StrategySection';
import { ai } from '../../services/geminiService';
import { 
    CurrencyDollarIcon, 
    WarningIcon, ShieldCheckIcon, ServerStackIcon,
    WrenchScrewdriverIcon, RocketIcon, TimerIcon,
    CheckCircleIcon, AlertTriangleIcon
} from '../ui/Icons';
import { flowview } from '../../lib/westflow-client';
import { MetricCard } from '../ui/MetricCard';
import { usePersona } from '../../contexts/PersonaContext';
import { WeeklySummaryModal } from '../WeeklySummaryModal';
import { Type } from "@google/genai";

const buildFloContext = (data: any) => {
  const staffMap = Object.fromEntries(
    (data.techs || []).map((t: any) => [t.id, t.name])
  );

  const openActionsSummary = (data.openCalls || []).map((c: any) =>
    `${c.id}: ${c.client_id} — ${c.priority} — ${c.compliance_issue || 'No description'} — ${staffMap[c.staff_id] || 'Unassigned'}`
  ).join('\n');

  return `
LIVE LEGAL OPERATIONS DATA (as of ${new Date().toLocaleString()}):

ACTIVE MATTERS: ${data.deviceCount} matters under management.

PENDING DEADLINES (${data.openCalls?.length || 0}):
${openActionsSummary || 'None'}

UNBILLED HOURS ($${data.unbilledTotal.toLocaleString()}):
${(data.unbilledCalls || []).map((c: any) => `${c.id}: ${c.client_id} — $${c.billed_amount}`).join('\n') || 'All caught up'}

HIGH-RISK PROVISIONS (${data.overdueInvoices?.length || 0}):
${(data.overdueInvoices || []).map((i: any) => `${i.invoice_number}: ${i.client_id} — $${i.balance}`).join('\n') || 'None'}

Use this data to give the Managing Partner a concise morning briefing.
Lead with the most critical deadline. Be specific with case names.
Suggest one clear action regarding risk mitigation.
  `;
};

const buildReenaContext = (data: any) => {
  const pipelineValue = data.pipeline?.reduce((s: number, p: any) => s + Number(p.balance_due || 0), 0) || 0;
  return `
INTAKE PIPELINE DATA:
Active Intakes: ${data.pipeline?.length || 0} cases worth $${pipelineValue.toLocaleString()}
At-risk Matters (lowest compliance): ${data.customers?.slice(0,3).map((c: any) => `${c.customer_name} (${c.health_score})`).join(', ') || 'None'}
Upcoming Court Dates: ${data.expiringContracts?.length || 0}

Use this data to give the Office Manager a concise morning briefing.
Focus on intake conversion and upcoming court deadlines.
`;
};

const CommandViewInternal: React.FC<any> = ({ onOpenAiCommandCenter, onViewChange }) => {
    const [metrics, setMetrics] = useState<any>(null);
    const [stream, setStream] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isResolved, setIsResolved] = useState(false);
    const [floBriefing, setFloBriefing] = useState("");
    const { persona } = usePersona();

    // Weekly Summary State
    const [isWeeklySummaryOpen, setIsWeeklySummaryOpen] = useState(false);
    const [weeklySummaryData, setWeeklySummaryData] = useState<any>(null);
    const [isWeeklySummaryLoading, setIsWeeklySummaryLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            setIsLoading(true);
            try {
                // Determine which data to fetch based on persona
                let briefingPrompt = "";
                let liveMetrics: any = {};
                
                if (persona.id === 'sales') {
                    const salesData = await flowview.getSalesCommandData();
                    liveMetrics = {
                        pipelineValue: salesData.pipeline.reduce((s, p) => s + Number(p.value || 0), 0),
                        dealCount: salesData.pipeline.length,
                        expiringCount: salesData.expiringContracts.length,
                        avgHealth: Math.round(salesData.customers.reduce((s, c) => s + (c.health_score || 0), 0) / (salesData.customers.length || 1)),
                        atRisk: salesData.customers.slice(0, 3)
                    };
                    briefingPrompt = buildReenaContext(salesData);
                } else {
                    const opData = await flowview.getCommandCenterData();
                    liveMetrics = {
                        openCallsCount: opData.openCalls.length,
                        unbilledTotal: opData.unbilledTotal,
                        deviceCount: opData.deviceCount,
                        overdueTotal: opData.overdueTotal,
                        overdueCount: opData.overdueInvoices.length
                    };
                    briefingPrompt = buildFloContext(opData);
                }

                // Fetch feed separately
                const feed = await flowview.getUnifiedActivityFeed();
                setStream(feed.map(item => ({
                    id: item.id,
                    title: item.session_type || 'Compliance Update',
                    description: item.description || `Session for ${item.client?.first_name} ${item.client?.last_name} updated`,
                    timestamp: item.session_date || item.created_at,
                    icon: item.status === 'completed' ? '✅' : '📅'
                })));

                setMetrics(liveMetrics);

                // Generate dynamic briefing via AI
                const response = await ai.models.generateContent({
                  model: 'gemini-3-flash-preview',
                  contents: [{ role: 'user', parts: [{ text: briefingPrompt }] }],
                  config: {
                    systemInstruction: persona.floSystemPrompt,
                    temperature: 0.4
                  }
                });
                
                setFloBriefing(response.text || "");
            } catch (error) {
                console.error("Dashboard Sync Failed:", error);
            } finally {
                setIsLoading(false);
            }
        };
        load();
        const interval = setInterval(load, 60000);
        return () => clearInterval(interval);
    }, [persona.id]);

    const uptimePct = useMemo(() => {
        // Mocking uptime as a function of open calls relative to device count
        if (!metrics?.deviceCount) return "98.4";
        const health = Math.max(90, 100 - (metrics.openCallsCount / metrics.deviceCount * 100));
        return health.toFixed(1);
    }, [metrics]);

    const generateWeeklySummary = async () => {
        setIsWeeklySummaryOpen(true);
        setIsWeeklySummaryLoading(true);
        
        try {
            const dataContext = JSON.stringify({
                persona: persona.name,
                metrics,
                recentActivity: stream.slice(0, 5)
            });

            const summaryPrompt = `Generate a comprehensive weekly executive summary for a healthcare practice (ACS Therapy, Jefferson City MO). 
            
            Current Data Fabric Snapshot:
            ${dataContext}

            Your output must be a narrative and data-driven overview.`;

            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: [{ role: 'user', parts: [{ text: summaryPrompt }] }],
                config: {
                    systemInstruction: "You are Flo, an AI compliance assistant for a healthcare practice. Generate executive weekly summaries. Respond ONLY with valid JSON. No markdown formatting, no backticks. The tone should be professional but warm — this is a practice in Missouri.",
                    temperature: 0.5,
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING },
                            insights: { type: Type.STRING },
                            talkingPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                            imagePrompt: { type: Type.STRING },
                            kpis: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        label: { type: Type.STRING },
                                        value: { type: Type.STRING }
                                    },
                                    required: ["label", "value"]
                                }
                            }
                        },
                        required: ["title", "insights", "talkingPoints", "imagePrompt", "kpis"]
                    }
                }
            });

            const summaryResult = JSON.parse(response.text || "{}");
            setWeeklySummaryData(summaryResult);
        } catch (error) {
            console.error("Weekly summary generation failed:", error);
            setWeeklySummaryData({
                title: "Weekly Compliance Briefing",
                insights: "ACS-LEGAL operations remain robust. Key focus areas for this week include clearing the unbilled session backlog and addressing compliance score anomalies.",
                talkingPoints: ["Address unbilled sessions immediately", "Monitor high-caseload providers", "Follow up on completing programs"],
                imagePrompt: "A professional Missouri healthcare office with warm lighting, watercolor style",
                kpis: [
                    { label: "Compliance Score", value: `${uptimePct}%` },
                    { label: "Unbilled Revenue", value: `$${Math.round(metrics?.unbilledTotal || 0).toLocaleString()}` },
                    { label: "Active Intakes", value: metrics?.dealCount?.toString() || "0" }
                ]
            });
        } finally {
            setIsWeeklySummaryLoading(false);
        }
    };

    const handleFloAction = (actionId: string) => {
        if (actionId === 'chat' || actionId.startsWith('Tell me more')) onOpenAiCommandCenter(actionId);
        else if (actionId === 'audit') onOpenAiCommandCenter("Analyze the labor backlog for all nodes.");
        else if (actionId === 'churn') onOpenAiCommandCenter("Which accounts are at-risk and need attention?");
        else if (actionId === 'deals') onOpenAiCommandCenter("Show me my top opportunities sorted by value.");
        else if (actionId === 'weekly') generateWeeklySummary();
        else if (actionId === 'push') {
            onOpenAiCommandCenter("Push all completed service hours to e-automate for billing.");
            setIsResolved(true);
        }
    };

    const welcomeActions = useMemo(() => {
        const common = [
            { label: '📊 WEEKLY BRIEFING', actionId: 'weekly', variant: 'default' as const },
            { label: 'ASK FLO', actionId: 'chat', variant: 'primary' as const },
        ];
        
        if (persona.id === 'sales') {
            return [
                { label: 'TOP INTAKES', actionId: 'deals', variant: 'default' as const },
                { label: 'AT-RISK MATTERS', actionId: 'churn', variant: 'default' as const },
                ...common
            ];
        }
        
        return [
            { label: 'SYNC TO LEGALSERVER', actionId: 'push', variant: 'default' as const },
            { label: 'AT-RISK MATTERS', actionId: 'churn', variant: 'default' as const },
            ...common
        ];
    }, [persona.id]);

    const deadlines = useMemo(() => [
        { id: 1, title: 'Filing Deadline: Smith v. State', date: 'Today', priority: 'High', type: 'Court' },
        { id: 2, title: 'Discovery Response: Jones Corp', date: 'Tomorrow', priority: 'Medium', type: 'Filing' },
        { id: 3, title: 'Status Hearing: Miller Estate', date: 'Mar 15', priority: 'Low', type: 'Hearing' },
        { id: 4, title: 'Contract Renewal: TechSoft', date: 'Mar 18', priority: 'Medium', type: 'Contract' },
    ], []);

    if (isLoading && !metrics) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-text-secondary animate-pulse">
                <div className="w-12 h-12 border-4 border-accent-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="font-bold text-xs uppercase tracking-[0.5em]">Synchronizing FlowView Legal Fabric...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full space-y-4 animate-fade-in px-4 lg:px-8 w-full pb-10 pt-2 max-w-[1600px] mx-auto">
            
            {/* 1. Flo Executive Welcome */}
            <WelcomeSection 
                userName={persona.name} 
                unbilledRevenue={persona.id === 'sales' 
                    ? (metrics?.pipelineValue || 0) 
                    : (isResolved ? 0 : (metrics?.unbilledTotal || 465))
                } 
                metricLabel={persona.id === 'sales' ? 'Active Intake' : 'Unbilled Revenue'}
                briefing={floBriefing}
                onAction={handleFloAction}
                actions={welcomeActions}
            />

            {/* 2. KPI Cards Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-none">
                <MetricCard 
                    title="Active Matters" 
                    value={metrics?.deviceCount?.toString() || "0"}
                    icon={<ShieldCheckIcon className="w-5 h-5"/>} 
                    trend={{ value: "+2 this week", direction: 'up' }}
                    onClick={() => onViewChange('matters')}
                />
                <MetricCard 
                    title="Pending Deadlines" 
                    value={isResolved ? "0" : (metrics?.openCallsCount?.toString() || "0")} 
                    icon={<TimerIcon className="w-5 h-5"/>} 
                    trend={{ value: "3 due today", direction: 'down' }}
                    isAlert={metrics?.openCallsCount > 5}
                    onClick={() => onViewChange('calendar')}
                />
                <MetricCard 
                    title="Documents This Week" 
                    value="24"
                    icon={<ServerStackIcon className="w-5 h-5"/>} 
                    trend={{ value: "12 pending review", direction: 'neutral' }}
                    onClick={() => onViewChange('documents')}
                />
                <MetricCard 
                    title="High-Risk Provisions" 
                    value={metrics?.atRisk?.length?.toString() || "0"}
                    icon={<AlertTriangleIcon className="w-5 h-5 text-risk-high"/>} 
                    isAlert={metrics?.atRisk?.length > 0}
                    onClick={() => onViewChange('reviews')}
                />
            </div>

            {/* 3. Middle Row: Deadline Timeline & Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Deadline Timeline */}
                <Card className="p-0 overflow-hidden flex flex-col h-full border-t-2 border-t-accent-primary shadow-md rounded-xl bg-bg-card/60 backdrop-blur-xl">
                    <div className="flex items-center justify-between p-4 border-b border-divider bg-bg-secondary/40">
                        <div className="flex items-center gap-2 text-accent-primary">
                            <TimerIcon className="w-5 h-5"/>
                            <h3 className="text-xs font-black uppercase tracking-widest font-sans-ui">Deadline Timeline</h3>
                        </div>
                        <button className="text-[10px] font-bold text-accent-primary hover:underline uppercase tracking-wider">View Calendar</button>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-divider/50">
                        {deadlines.map((deadline) => (
                            <div key={deadline.id} className="p-4 flex items-center gap-4 hover:bg-bg-secondary/30 transition-colors cursor-pointer group">
                                <div className={`w-2 h-2 rounded-full shrink-0 ${
                                    deadline.priority === 'High' ? 'bg-risk-high animate-pulse' : 
                                    deadline.priority === 'Medium' ? 'bg-risk-medium' : 'bg-risk-low'
                                }`}></div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-text-primary truncate group-hover:text-accent-primary transition-colors">{deadline.title}</h4>
                                    <p className="text-[11px] text-text-dim uppercase tracking-wider font-bold">{deadline.type} · {deadline.date}</p>
                                </div>
                                <div className="text-[10px] font-black text-text-dim uppercase tracking-widest bg-bg-secondary px-2 py-1 rounded border border-divider">
                                    {deadline.priority}
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Recent Activity Feed */}
                <Card className="p-0 overflow-hidden flex flex-col h-full border-t-2 border-t-accent-primary shadow-md rounded-xl bg-bg-card/60 backdrop-blur-xl">
                    <div className="flex items-center justify-between p-4 border-b border-divider bg-bg-secondary/40">
                        <div className="flex items-center gap-2 text-accent-primary">
                            <ServerStackIcon className="w-5 h-5"/>
                            <h3 className="text-xs font-black uppercase tracking-widest font-sans-ui">Recent Activity Feed</h3>
                        </div>
                        <span className="text-[8px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 uppercase tracking-widest">LIVE SYNC</span>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-divider/50 max-h-80">
                        {stream.length === 0 ? (
                            <div className="p-10 text-center text-text-dim italic text-sm">No recent activity detected</div>
                        ) : stream.map((item, i) => (
                            <div 
                                key={i} 
                                onClick={() => onOpenAiCommandCenter(`What's the status of ${item.title}?`)}
                                className="flex gap-4 p-4 hover:bg-bg-secondary/30 transition-all group cursor-pointer items-center border-l-2 border-l-transparent hover:border-l-accent-primary"
                            >
                                <div className="text-lg shrink-0 opacity-40 group-hover:opacity-100 transition-all">{item.icon}</div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-0.5">
                                        <h4 className="text-xs font-bold text-text-primary truncate uppercase tracking-tight group-hover:text-accent-primary transition-colors">{item.title}</h4>
                                        <span className="text-[10px] text-text-dim font-medium">
                                            {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-text-dim truncate font-medium">{item.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* 4. Bottom Row: Risk Heatmap */}
            <Card className="p-6 border-t-2 border-t-accent-primary shadow-md rounded-xl bg-bg-card/60 backdrop-blur-xl">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-accent-primary">
                        <ShieldCheckIcon className="w-5 h-5"/>
                        <h3 className="text-xs font-black uppercase tracking-widest font-sans-ui">Risk Heatmap</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-sm bg-risk-low"></div>
                            <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Low</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-sm bg-risk-medium"></div>
                            <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">Medium</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded-sm bg-risk-high"></div>
                            <span className="text-[10px] font-bold text-text-dim uppercase tracking-wider">High</span>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {['Corporate', 'Litigation', 'Real Estate', 'IP', 'Employment', 'Tax'].map((category, i) => {
                        const risk = i % 3 === 0 ? 'high' : i % 2 === 0 ? 'medium' : 'low';
                        return (
                            <div key={category} className="p-4 rounded-xl border border-divider bg-bg-secondary/20 hover:border-accent-primary/30 transition-all group cursor-help">
                                <p className="text-[10px] font-bold text-text-dim uppercase tracking-widest mb-2 group-hover:text-text-primary">{category}</p>
                                <div className="flex items-end gap-1 h-12">
                                    {[0.3, 0.6, 0.8, 0.4, 0.9].map((h, j) => (
                                        <div 
                                            key={j} 
                                            className={`flex-1 rounded-t-sm transition-all duration-500 ${
                                                risk === 'high' ? 'bg-risk-high/40 group-hover:bg-risk-high' : 
                                                risk === 'medium' ? 'bg-risk-medium/40 group-hover:bg-risk-medium' : 
                                                'bg-risk-low/40 group-hover:bg-risk-low'
                                            }`}
                                            style={{ height: `${h * 100}%` }}
                                        ></div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Sub-footer System Tray */}
            <div className="pt-2 flex justify-between items-center px-1">
                <div className="flex items-center gap-4">
                    <span className="text-[8px] font-black text-text-dim uppercase tracking-widest opacity-40">Legal Fabric Nodes: Connected</span>
                    <div className="h-1 w-24 bg-divider rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: '96%' }}></div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                     <ShieldCheckIcon className="w-3 h-3 text-accent-primary opacity-50" />
                     <span className="text-[8px] font-black uppercase text-text-dim opacity-50 tracking-widest leading-none">FlowView Legal Sovereign Trust v3.1.0</span>
                </div>
            </div>

            {/* Weekly Summary Modal */}
            <WeeklySummaryModal
                isOpen={isWeeklySummaryOpen}
                onClose={() => {
                    setIsWeeklySummaryOpen(false);
                    setWeeklySummaryData(null);
                }}
                summaryData={weeklySummaryData}
                isLoading={isWeeklySummaryLoading}
            />
        </div>
    );
};

export const CommandView = React.memo(CommandViewInternal);
