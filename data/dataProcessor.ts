
import { AppData, Employee, DrillDownData, SalesOpportunity, FdTicket, Achievement } from '../types';
import { DateRange } from '../contexts/DateRangeContext';

const DEBUG = false; // Set to true for development logging

export const processData = (baseData: {
    foundationalData: any,
    scenarios: any[],
    salesPipelineData: any[],
    contractData: any[],
    msaData: any[],
    travelData: any[],
    inventoryData: any[],
    fdTickets: any[], 
    fdActivities: any[], 
    enterpriseExpenses?: any[]; 
}, dateRange: DateRange): Omit<AppData, 'foundationalData' | 'scenarios' | 'salesPipelineData' | 'contractData' | 'msaData' | 'travelData' | 'inventoryData' | 'fdTickets' | 'fdActivities' | 'enterpriseExpenses'> => {
    
    const { foundationalData, fdTickets, fdActivities: allFdActivities, enterpriseExpenses } = baseData;
    const { technicians } = foundationalData;
    
    const { startDate, endDate } = dateRange;

    const allActs = allFdActivities || [];
    if (allActs.length > 0) {
        const sorted = [...allActs].sort((a,b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
        const dbStart = new Date(sorted[0].start_time);
        const dbEnd = new Date(sorted[sorted.length-1].start_time);
        
        if (DEBUG) console.log(`[Fabric Audit] Date Filter: UI(${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}) vs DB(${dbStart.toLocaleDateString()} - ${dbEnd.toLocaleDateString()})`);
        
        if (dbEnd < startDate || dbStart > endDate) {
            if (DEBUG) console.warn("⚠️ [Fabric Audit] DATABASE DATA IS OUTSIDE CURRENT UI DATE RANGE. Metrics will appear as 0.00.");
        }
    }

    const fdActivities = allActs.filter(act => {
        const actDate = new Date(act.start_time);
        return actDate >= startDate && actDate <= endDate;
    });

    const activeTechnicians = (technicians || []).filter((tech: any) => tech.is_active);

    const utilizationData: Employee[] = activeTechnicians.map((technician: any) => {
        let totalHours = 0;
        let billableHours = 0;
        const ticketSet = new Set<string>();

        const techAgentId = Number(technician.id);
        
        const activities = fdActivities.filter((act: any) => Number(act.fd_agent_id) === techAgentId);
        
        activities.forEach((activity: any) => {
            const startTime = new Date(activity.start_time).getTime();
            const endTime = new Date(activity.end_time).getTime();
            
            let duration = 0;
            if (!isNaN(startTime) && !isNaN(endTime) && endTime > startTime) {
                duration = (endTime - startTime) / (1000 * 60 * 60);
            } else if (activity.billable_hours) {
                duration = Number(activity.billable_hours);
            }
            
            totalHours += duration;
            billableHours += Number(activity.billable_hours || 0);
            
            if (activity.fd_ticket_id) {
                ticketSet.add(activity.fd_ticket_id.toString());
            }
        });
        
        const billablePct = totalHours > 0 ? (billableHours / totalHours) * 100 : 0;
        
        const expensesList = enterpriseExpenses || [];
        const techExpenses = expensesList
            .filter((exp: any) => {
                const expDate = new Date(exp.expense_date);
                return Number(exp.fd_agent_id) === techAgentId && expDate >= startDate && expDate <= endDate;
            })
            .reduce((sum: number, exp: any) => sum + Number(exp.amount || 0), 0);
            
        const lastActivity = activities.sort((a,b) => new Date(b.end_time).getTime() - new Date(a.end_time).getTime())[0];

        const calcPoints = Math.round((billableHours * 10) + (activities.length * 5));
        const efficiencyScore = Math.min(100, Math.round((billableHours / (40 / Math.max(1, activeTechnicians.length))) * 100));

        return {
            id: technician.id,
            name: technician.name,
            email: technician.email,
            hours: totalHours,
            billablePct: Math.min(100, Math.round(billablePct)),
            tickets: ticketSet.size,
            expenses: techExpenses,
            lastUpdated: lastActivity ? new Date(lastActivity.end_time).getTime() : undefined,
            createdAt: lastActivity ? new Date(lastActivity.end_time).getTime() : technician.createdAt,
            points: (technician.points || 0) + calcPoints,
            efficiencyScore 
        } as any; 
    });

    const processedUtilization = utilizationData.map(emp => {
        const totalTeamExpenses = utilizationData.reduce((sum, e) => sum + e.expenses, 0);
        const averageExpense = totalTeamExpenses / Math.max(1, utilizationData.length);
        const highExpenseThreshold = Math.max(200, averageExpense * 1.5); 

        if (emp.expenses > highExpenseThreshold && emp.expenses > 0) {
             return { ...emp, aiFlag: `High Outlier: $${emp.expenses.toFixed(2)}. Verify receipts.` };
        }
        return emp;
    });

    const drillDownData: DrillDownData = {};
    activeTechnicians.forEach((technician: any) => {
        const techTickets = new Map<number, FdTicket>();
        const techAgentId = Number(technician.id);
        const activities = (allFdActivities || []).filter((act: any) => Number(act.fd_agent_id) === techAgentId);
        activities.forEach((act: any) => {
            const ticket = fdTickets.find((t:any) => t.id === Number(act.fd_ticket_id));
            if(ticket && !techTickets.has(ticket.id)){
                techTickets.set(ticket.id, ticket);
            }
        });
        drillDownData[technician.name] = Array.from(techTickets.values());
    });

    const staleOpportunity = (baseData.salesPipelineData as SalesOpportunity[])
        .filter(opp => opp.oppStage === 'PROPOSED')
        .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())[0];
        
    const opportunityData = staleOpportunity ? {
        name: staleOpportunity.opportunityName,
        value: staleOpportunity.totalAmt,
        status: staleOpportunity.oppStage,
        lastUpdatedDays: Math.floor((new Date().getTime() - new Date(staleOpportunity.lastModified).getTime()) / (1000 * 3600 * 24))
    } : { name: 'No stale opportunities', value: 0, status: '', lastUpdatedDays: 0 };
    
    const achievementsData: Achievement[] = [
        { id: 'high-utilizer', title: "Power User", description: "Maintain >90% billable utilization.", icon: "⚡", unlocked: processedUtilization.some(e => e.billablePct > 90) },
        { id: 'expense-whiz', title: "Fiscal Officer", description: "Process 5+ expenses in one cycle.", icon: "🏦", unlocked: true },
        { id: 'road-master', title: "Road Warrior", description: "Log check-ins at 3 distinct sites.", icon: "🚗", unlocked: true }
    ];
    
    const userProfileData = {
        name: "Earl Philpot",
        points: processedUtilization.reduce((sum, emp) => sum + (emp.points || 0), 0)
    };

    return { utilizationData: processedUtilization, drillDownData, opportunityData, achievementsData, userProfileData };
};
