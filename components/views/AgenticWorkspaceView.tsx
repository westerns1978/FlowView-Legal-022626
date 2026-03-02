
import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { 
    SparklesIcon, BotIcon, CheckCircleIcon, TimerIcon, 
    ServerStackIcon, LockClosedIcon, CodeBracketIcon, 
    ShieldCheckIcon, LineChartIcon, CheckIcon
} from '../ui/Icons';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, Legend, Cell 
} from 'recharts';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../App';
import { HumanInterfaceSection } from '../HumanInterfaceSection';

interface Task {
    id: string;
    agent: 'Flo' | 'Katie' | 'Aiva' | 'Cricket';
    tenant: string;
    title: string;
    status: 'In Progress' | 'Complete' | 'Awaiting Approval' | 'Blocked';
    priority: 'Low' | 'Medium' | 'High';
    progress: number;
    description: string;
    reasoningTrace?: string[];
    timestamp: string;
}

const ConfettiBurst: React.FC<{ x: number; y: number }> = ({ x, y }) => {
    const colors = ['#10b981', '#0284c7', '#8b5cf6', '#f59e0b', '#ef4444'];
    return (
        <div className="fixed inset-0 pointer-events-none z-[100]">
            {Array.from({ length: 12 }).map((_, i) => (
                <div
                    key={i}
                    className="confetti animate-confetti-burst"
                    style={{
                        left: x,
                        top: y,
                        backgroundColor: colors[i % colors.length],
                        transform: `rotate(${i * 30}deg) translateX(${30 + Math.random() * 50}px)`,
                        animationDelay: `${Math.random() * 0.2}s`
                    }}
                />
            ))}
        </div>
    );
};

const AgentStatCard: React.FC<{ name: string, role: string, fixRate: string, utilization: string, avatar?: string, active?: boolean }> = ({ name, role, fixRate, utilization, avatar, active }) => (
    <div className="bg-component border border-border/50 rounded-2xl p-4 flex flex-col items-center text-center hover:border-primary/40 transition-all cursor-pointer group flex-1 min-w-[140px] relative overflow-hidden">
        {active && <div className="absolute top-2 right-2 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>}
        <div className={`w-12 h-12 rounded-full border-2 p-0.5 mb-2 group-hover:scale-110 transition-transform ${name === 'Flo' ? 'border-[#2E86AB]' : 'border-primary/20'}`}>
            {avatar ? (
                <img src={avatar} className="w-full h-full rounded-full object-cover" alt={name} />
            ) : (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                    <BotIcon className="w-6 h-6 text-primary" />
                </div>
            )}
        </div>
        <h4 className="font-black text-[11px] text-text-primary uppercase tracking-tight">{name}</h4>
        <p className="text-[8px] text-text-secondary uppercase tracking-[0.2em] font-bold mb-2">{role}</p>
        <div className="grid grid-cols-2 w-full gap-2 pt-2 border-t border-border/30">
            <div>
                <p className="text-[7px] text-text-secondary uppercase font-bold">{name === 'Flo' ? 'Accuracy' : 'Fix Rate'}</p>
                <p className="text-[10px] font-black text-emerald-500">{fixRate}</p>
            </div>
            <div>
                <p className="text-[7px] text-text-secondary uppercase font-bold">Util</p>
                <p className="text-[10px] font-black text-accent">{utilization}</p>
            </div>
        </div>
    </div>
);

export const AgenticWorkspaceView: React.FC = () => {
    const { showToast } = useToast();
    const performanceData = [
        { name: 'Flo', fixRate: 99, utilization: 100 },
        { name: 'Katie', fixRate: 94, utilization: 82 },
        { name: 'Cricket', fixRate: 88, utilization: 45 },
        { name: 'Aiva', fixRate: 99, utilization: 92 },
    ];

    const [tasks, setTasks] = useState<Task[]>([
        { 
            id: 'BRIEF-001', 
            agent: 'Flo', 
            tenant: 'ACS THERAPY',
            title: 'Compliance Morning Pulse', 
            status: 'Complete', 
            priority: 'High',
            progress: 100, 
            timestamp: 'Just now',
            description: 'Synchronized Clio unbilled session nodes with LegalServer LMS tunnel. Identified $18,420 in trapped billing.',
            reasoningTrace: ['Audit activities table', 'Calculate billable deltas', 'Cross-reference compliance actions']
        },
        { 
            id: 'TASK-992', 
            agent: 'Katie', 
            tenant: 'JEFFERSON CITY CLINIC',
            title: 'HIPAA Breach Remediation', 
            status: 'In Progress', 
            priority: 'High',
            progress: 78, 
            timestamp: '2 mins ago',
            description: 'Client ID 882 reporting potential HIPAA breach. Triggering compliance lockdown and checking audit logs.',
            reasoningTrace: ['Detected thermal spike on node', 'Validated case coverage', 'Initiated Port 9780 reset']
        },
        { 
            id: 'TASK-841', 
            agent: 'Cricket', 
            tenant: 'MISSOURI REHAB',
            title: 'Case Revenue Audit', 
            status: 'Awaiting Approval', 
            priority: 'Medium',
            progress: 100, 
            timestamp: '15 mins ago',
            description: 'Identified 12% revenue leakage due to non-billable sessions. Proposed reconciliation for LegalServer sync.',
            reasoningTrace: ['Analyzed action vs session logs', 'Calculated trapped revenue: $1,420', 'Drafting ERP credit memo']
        }
    ]);

    const [animatingTaskId, setAnimatingTaskId] = useState<string | null>(null);
    const [confettiPos, setConfettiPos] = useState<{ x: number; y: number } | null>(null);

    const handleCompleteTask = (taskId: string, event: React.MouseEvent) => {
        setAnimatingTaskId(taskId);
        setConfettiPos({ x: event.clientX, y: event.clientY });
        setTimeout(() => {
            setTasks(prev => prev.map(t => 
                t.id === taskId ? { ...t, status: 'Complete', progress: 100 } : t
            ));
            showToast("Task marked as synchronized and complete.");
        }, 300);
        setTimeout(() => {
            setAnimatingTaskId(null);
            setConfettiPos(null);
        }, 1200);
    };

    return (
        <div className="space-y-6 animate-fade-in pb-20 w-full px-4 lg:px-8 max-w-[1600px] mx-auto">
            {confettiPos && <ConfettiBurst x={confettiPos.x} y={confettiPos.y} />}
            
            <div className="flex flex-col xl:flex-row items-stretch justify-between gap-6 pt-4 border-b border-border/50 pb-8">
                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-accent/10 rounded-2xl text-accent border border-accent/20 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                            <BotIcon className="w-8 h-8"/>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-text-primary uppercase tracking-tighter leading-none">Agentic Operations</h2>
                            <p className="text-[9px] font-mono text-accent font-bold uppercase tracking-widest mt-1">Multi-Agent Orchestration Layer</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <AgentStatCard name="Flo" role="Staff" fixRate="99.9%" utilization="100%" avatar="https://storage.googleapis.com/westerns1978-digital-assets/Miscellaneous/connie-ai.png" active />
                        <AgentStatCard name="Katie" role="Service" fixRate="94.2%" utilization="82%" />
                        <AgentStatCard name="Cricket" role="Sales" fixRate="88.0%" utilization="45%" />
                        <AgentStatCard name="Aiva" role="System" fixRate="99.8%" utilization="92%" />
                    </div>
                </div>

                <Card className="flex-1 bg-component-light/50 border border-primary/10 min-w-[400px]">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-primary">
                            <LineChartIcon className="w-4 h-4" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em]">Agentic Reliability matrix</h3>
                        </div>
                        <span className="text-[8px] font-mono font-bold text-text-secondary opacity-50 uppercase tracking-widest">Q3 Intel</span>
                    </div>
                    <div className="h-44 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={performanceData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                                <Tooltip contentStyle={{ background: 'var(--color-background)', border: '1px solid var(--color-border)', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold' }} />
                                <Bar dataKey="fixRate" name="Success Rate" fill="#0284c7" radius={[4, 4, 0, 0]} barSize={24} />
                                <Bar dataKey="utilization" name="Engagement" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                <div className="xl:col-span-8 space-y-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em]">Execution Ledger</h3>
                        <span className="text-[8px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20 tracking-widest">FABRIC_V2.2.0</span>
                    </div>
                    
                    {tasks.map(task => (
                        <Card 
                            key={task.id} 
                            className={`p-0 overflow-hidden rounded-[24px] border-border/50 hover:border-primary/40 transition-all duration-500 shadow-sm hover:shadow-2xl group relative ${
                                animatingTaskId === task.id ? 'animate-success-flash animate-success-ripple' : ''
                            }`}
                        >
                            <div className="flex flex-col md:flex-row divide-y md:divide-y-0 md:divide-x divide-border/30">
                                <div className="p-4 flex flex-col justify-between items-center text-center bg-component-light/50 w-full md:w-32 group-hover:bg-primary/5 transition-colors">
                                     <div className={`w-12 h-12 rounded-full border-2 p-0.5 transition-all duration-500 ${task.agent === 'Flo' ? 'border-[#2E86AB]' : 'border-primary/5'} ${task.status === 'Complete' ? 'scale-110 shadow-lg !border-emerald-500' : 'group-hover:scale-110'}`}>
                                        {task.agent === 'Flo' ? (
                                            <img src="https://storage.googleapis.com/westerns1978-digital-assets/Miscellaneous/connie-ai.png" className="w-full h-full rounded-full object-cover" alt="Flo" />
                                        ) : (
                                            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-primary font-black text-xl">
                                                {task.agent[0]}
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-3">
                                        <p className="text-[10px] font-black text-text-primary uppercase tracking-tight leading-none">{task.agent}</p>
                                        <p className="text-[8px] text-text-secondary uppercase font-bold mt-1.5 opacity-60 tracking-widest">{task.timestamp}</p>
                                    </div>
                                </div>
                                <div className="flex-1 p-6 space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="flex items-center gap-3">
                                                <h4 className="font-black text-base text-text-primary uppercase tracking-tight">{task.title}</h4>
                                                <span className={`text-[8px] font-black px-2 py-0.5 rounded border uppercase tracking-[0.2em] ${task.priority === 'High' ? 'bg-danger/10 text-danger border-danger/30' : 'bg-primary/10 text-primary border-primary/30'}`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-mono text-primary font-bold uppercase mt-1 tracking-widest">{task.tenant}</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {task.status !== 'Complete' && (
                                                <button onClick={(e) => handleCompleteTask(task.id, e)} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-success/10 text-success text-[9px] font-black uppercase tracking-widest border border-success/20 hover:bg-success hover:text-white transition-all active:scale-95">
                                                    <CheckIcon className="w-3 h-3" /> Finalize
                                                </button>
                                            )}
                                            <span className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-widest shadow-sm transition-colors duration-500 ${
                                                task.status === 'Complete' ? 'bg-success/10 text-success border-success/30' : 
                                                'bg-primary/10 text-primary border-primary/30 animate-pulse'
                                            }`}>
                                                {task.status}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-text-secondary font-medium line-clamp-2 leading-relaxed italic">"{task.description}"</p>
                                    <div className="flex items-center gap-6 pt-2">
                                        <div className="flex-1 h-1 bg-component rounded-full overflow-hidden border border-border/30">
                                            <div className={`h-full transition-all duration-1000 shadow-glow-primary ${task.status === 'Complete' ? 'bg-success' : 'bg-primary'}`} style={{ width: `${task.progress}%` }}></div>
                                        </div>
                                        <ShieldCheckIcon className="w-4 h-4 text-text-secondary opacity-40 hover:opacity-100 transition-opacity cursor-help" />
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="xl:col-span-4 space-y-6">
                    <HumanInterfaceSection />
                </div>
            </div>
        </div>
    );
};
