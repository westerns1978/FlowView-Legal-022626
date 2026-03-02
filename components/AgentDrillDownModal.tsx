
import React, { useMemo } from 'react';
import { AppData, FdTicket } from '../types';
import { Card } from './ui/Card';
import { CloseIcon, SparklesIcon } from './ui/Icons';
import { DateRange } from '../contexts/DateRangeContext';

interface JobBreakdownItem {
    job_id: number;
    job_subject: string;
    hours: number;
    expenses: number;
}

interface AgentDrillDownModalProps {
    employeeName: string;
    appData: AppData;
    onClose: () => void;
    dateRange: DateRange;
    onOpenAiCommandCenter: (prompt: string, aiMode: 'chat' | 'report', isFollowUp: boolean, uiContext?: string) => void;
}

export const AgentDrillDownModal: React.FC<AgentDrillDownModalProps> = ({
    employeeName,
    appData,
    onClose,
    dateRange,
    onOpenAiCommandCenter,
}) => {
    const employee = useMemo(() => {
        return appData.foundationalData.technicians.find(t => t.name === employeeName);
    }, [employeeName, appData.foundationalData.technicians]);

    const drillDownStats = useMemo(() => {
        if (!employee) return { totalHours: 0, travelHours: 0, totalExpenses: 0, jobBreakdown: [] };

        const { startDate, endDate } = dateRange;
        
        const agentActivities = appData.fdActivities.filter(act => {
            const actDate = new Date(act.start_time);
            return act.fd_agent_id === employee.id && actDate >= startDate && actDate <= endDate;
        });

        const expensesList = (appData as any).enterpriseExpenses || [];
        const agentExpenses = expensesList.filter((exp: any) => {
             const expDate = new Date(exp.expense_date);
             return exp.fd_agent_id === employee.id && expDate >= startDate && expDate <= endDate;
        });

        const totalHours = agentActivities.reduce((sum, act) => sum + (act.billable_hours || 0), 0);

        const travelHours = agentActivities.reduce((sum, act) => {
            const ticket = appData.fdTickets.find(t => t.id === act.fd_ticket_id);
            if (ticket && ticket.subject.toLowerCase().includes('travel')) {
                return sum + (act.billable_hours || 0);
            }
            return sum;
        }, 0);
        
        const totalExpenses = agentExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0);

        const jobBreakdown = agentActivities.reduce((acc, act) => {
            const ticket = appData.fdTickets.find(t => t.id === act.fd_ticket_id);
            if (!ticket) return acc;
            
            if (!acc[ticket.id]) {
                acc[ticket.id] = {
                    job_id: ticket.id,
                    job_subject: ticket.subject,
                    hours: 0,
                    expenses: 0,
                };
            }
            acc[ticket.id].hours += act.billable_hours || 0;
            return acc;
        }, {} as Record<string, JobBreakdownItem>);
        
        agentExpenses.forEach((exp: any) => {
            if (exp.fd_ticket_id && jobBreakdown[exp.fd_ticket_id]) {
                jobBreakdown[exp.fd_ticket_id].expenses += exp.amount;
            }
        });

        return {
            totalHours,
            travelHours,
            totalExpenses,
            jobBreakdown: Object.values(jobBreakdown),
        };

    }, [employee, appData, dateRange]);
    
    // Performance Review Prompt: Hardwired with actual metrics for grounding
    const performanceReviewPrompt = `Flo, please provide an executive performance summary for ${employeeName} for the period ${dateRange.startDate.toLocaleDateString()} to ${dateRange.endDate.toLocaleDateString()}. Focus on the ${drillDownStats.totalHours.toFixed(2)} billable hours and $${drillDownStats.totalExpenses.toFixed(2)} in expenses found in the data fabric.`;

    if (!employee) return null;

    return (
        <div className="drill-down-overlay animate-fade-in" onClick={onClose}>
            <div className="drill-down-content" onClick={e => e.stopPropagation()}>
                <Card className="rounded-[32px] border border-border shadow-2xl overflow-hidden">
                    <div className="flex justify-between items-center mb-6 p-2">
                        <div>
                            <h4 className="text-2xl font-black text-text-primary uppercase tracking-tighter">Drill-Down: {employeeName}</h4>
                            <p className="text-[10px] text-text-secondary font-black uppercase tracking-[0.2em] mt-1">
                                Temporal Range: {dateRange.startDate.toLocaleDateString()} - {dateRange.endDate.toLocaleDateString()}
                            </p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-component-light text-text-secondary transition-all">
                            <CloseIcon className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-component-light p-6 rounded-2xl border border-border text-center group hover:border-primary transition-all">
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2 opacity-60">Billable Engine</p>
                            <p className="text-4xl font-black text-primary font-mono tracking-tighter">{drillDownStats.totalHours.toFixed(2)}</p>
                            <p className="text-[9px] text-primary font-bold uppercase mt-2">Active Hours</p>
                        </div>
                        <div className="bg-component-light p-6 rounded-2xl border border-border text-center group hover:border-primary transition-all">
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2 opacity-60">Travel Nodes</p>
                            <p className="text-4xl font-black text-text-primary font-mono tracking-tighter">{drillDownStats.travelHours.toFixed(2)}</p>
                            <p className="text-[9px] text-text-secondary font-bold uppercase mt-2">Transit Hours</p>
                        </div>
                        <div className="bg-component-light p-6 rounded-2xl border border-border text-center group hover:border-primary transition-all">
                            <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest mb-2 opacity-60">Capital Outflow</p>
                            <p className="text-4xl font-black text-text-primary font-mono tracking-tighter">${drillDownStats.totalExpenses.toFixed(2)}</p>
                            <p className="text-[9px] text-text-secondary font-bold uppercase mt-2">Cycle Expenses</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between mb-4 px-2">
                         <h5 className="text-[10px] font-black text-text-secondary uppercase tracking-[0.4em]">Node Execution Ledger</h5>
                    </div>
                     <div className="overflow-x-auto border border-border rounded-2xl max-h-64 shadow-inner bg-component-light/40">
                        <table className="min-w-full text-sm">
                            <thead className="bg-component-light/80 sticky top-0 backdrop-blur-md">
                                <tr className="text-[10px] font-black text-text-secondary uppercase tracking-widest">
                                    <th className="p-4 text-left">Fabric ID</th>
                                    <th className="p-4 text-left w-1/2">Operational Subject</th>
                                    <th className="p-4 text-right">Throughput</th>
                                    <th className="p-4 text-right">Flow ($)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/40">
                                {drillDownStats.jobBreakdown.map((job: JobBreakdownItem) => (
                                    <tr key={job.job_id} className="hover:bg-white dark:hover:bg-slate-800 transition-colors">
                                        <td className="p-4 font-mono text-[11px] font-bold text-primary">#{job.job_id}</td>
                                        <td className="p-4 font-bold text-text-primary uppercase tracking-tight text-xs">{job.job_subject}</td>
                                        <td className="p-4 text-right font-mono font-bold text-text-primary">{job.hours.toFixed(2)}</td>
                                        <td className="p-4 text-right font-mono font-bold text-text-secondary">${job.expenses.toFixed(2)}</td>
                                    </tr>
                                ))}
                                 {drillDownStats.jobBreakdown.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-[10px] font-black uppercase text-text-secondary opacity-40 tracking-[0.3em]">No jobs located in this cycle</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                     <button 
                        onClick={() => onOpenAiCommandCenter(performanceReviewPrompt, 'chat', false, JSON.stringify(drillDownStats))} 
                        className="mt-6 w-full py-4 bg-primary text-white text-[11px] font-black uppercase tracking-[0.4em] rounded-2xl shadow-xl hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-3 group"
                    >
                        <SparklesIcon className="w-5 h-5 group-hover:rotate-12 transition-transform"/>
                        Generate Strategic Intelligence Briefing
                    </button>
                </Card>
            </div>
        </div>
    );
};
