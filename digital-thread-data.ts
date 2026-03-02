import { Contract, SalesOpportunity, TravelLogEntry, InventoryItem, MsPoint, ProcessingResult } from './types';
import sampleData, { enterpriseExpenses as sampleExpenses } from './data/sampleData.ts';
import { enterpriseUsers } from './data/flowview-users';
import { flowview } from './lib/westflow-client';

const DEBUG = false; // Set to true for development logging

// --- Mutable Data Stores ---
export let travelData: TravelLogEntry[] = [];
export let inventoryData: InventoryItem[] = [];
export let enterpriseExpenses: any[] = [];
export let users: any[] = [];
export let pointsData: MsPoint[] = [];
export let fdAgents: any[] = [];
export let fdTickets: any[] = [];
export let fdActivities: any[] = [];
export let salesOpportunityData: any[] = [];
export let logData: any[] = [];
export let pointLogData: any[] = [];
export let fdAgentMemberData: any[] = [];
export let fdConversationsLocationsData: any[] = [];
export let fdTicketConversationsData: any[] = [];
export let itemsData: any[] = [];
export let reviewData: any[] = [];
export let rolePoolData: any[] = [];
export let stockData: any[] = [];
export let typesData: any[] = [];
export let uomData: any[] = [];
export let versionData: any[] = [];
export let ticketMemberData: any[] = [];
export let rolesData: any[] = [];


// --- Static Data ---
export const scenarios = sampleData.scenarios as any[];
export const contractData: Contract[] = sampleData.contractData as Contract[];
export let salesPipelineData: SalesOpportunity[] = [];
export const msaData = sampleData.msaData as any[];

const defaultCustomers = [
    { id: 'CUST-HAL', name: 'Henderson & Associates LLP', industry: 'Legal', healthScore: 85 },
    { id: 'CUST-SMM', name: 'St. Mary\'s Medical Center', industry: 'Healthcare', healthScore: 78 },
    { id: 'CUST-BTM', name: 'BlueTech Manufacturing Inc', industry: 'Manufacturing', healthScore: 72 },
    { id: 'CUST-DLF', name: 'Downtown Law Firm', industry: 'Legal', healthScore: 88 },
    { id: 'CUST-LRM', name: 'Lexington Regional Medical', industry: 'Healthcare', healthScore: 71 },
    { id: 'CUST-FCS', name: 'Fayette County Schools', industry: 'Education', healthScore: 82 },
    { id: 'CUST-CBH', name: 'Central Baptist Hospital', industry: 'Healthcare', healthScore: 88 },
    { id: 'CUST-KAW', name: 'Kentucky American Water', industry: 'Utilities', healthScore: 79 },
    { id: 'CUST-UKM', name: 'University of Kentucky Medical', industry: 'Healthcare', healthScore: 91 },
    { id: 'CUST-LFUG', name: 'Lexington Fayette Urban County Gov', industry: 'Government', healthScore: 76 }
];

export const foundationalData = {
    customers: defaultCustomers,
    technicians: [] as any[],
    serviceCatalog: [
        { id: 'SVC-SATOP', name: 'SATOP Assessment', unitPrice: 1500 },
        { id: 'SVC-LMS', name: 'LegalServer Integration', unitPrice: 2500 },
        { id: 'SVC-COMP', name: 'Compliance Audit', unitPrice: 1200 },
    ]
};

export const loadClients = async () => {
    try {
        const customers = await flowview.getClients();
        if (customers.length > 0) {
            foundationalData.customers = customers.map(c => ({
                id: c.id,
                name: c.customer_name,
                industry: c.industry,
                healthScore: c.health_score,
                tier: c.tier,
                clientCount: c.client_count,
                monthlyBilling: parseFloat(c.monthly_billing),
                caseStatus: c.case_status,
                primaryContact: c.primary_contact
            }));
        }
    } catch (e) {
        console.error('Failed to load clients, using defaults');
    }
};

export const loadIntakeOpportunities = async () => {
    try {
        const opps = await flowview.getIntakeOpportunities();
        if (opps.length > 0) {
            salesPipelineData.length = 0;
            opps.forEach(o => {
                const customer = foundationalData.customers.find(c => c.id === o.customer_id);
                salesPipelineData.push({
                    opportunityName: o.opportunity_name,
                    soldToCompany: customer?.name || '',
                    customerId: o.customer_id,
                    oppStage: o.stage,
                    totalAmt: parseFloat(o.value),
                    lineOfBusiness: o.program_type,
                    salesRep: o.assigned_rep,
                    estCloseDate: o.est_close_date,
                    probability: o.probability,
                    lastModified: o.updated_at || o.created_at
                });
            });
        }
    } catch (e) {
        console.error('Failed to load intake opportunities, using sample data');
    }
};

export const loadSessionContracts = async () => {
    try {
        const contracts = await flowview.getSessionContracts();
        if (contracts.length > 0) {
            contractData.length = 0;
            contracts.forEach(c => {
                const customer = foundationalData.customers.find(cust => cust.name === c.customer_name);
                contractData.push({
                    contractId: c.contract_number,
                    clientId: customer?.id || '',
                    clientName: c.customer_name,
                    serviceName: `Session Contract (${c.billing_frequency})` as any,
                    vendor: 'Internal',
                    startDate: c.start_date,
                    endDate: c.end_date,
                    recurringCost: 0,
                    recurringPrice: 0,
                    status: c.status === 'ACTIVE' ? 'Active' : c.status as any,
                    schedule: [],
                    performanceRating: 4,
                    customerFeedback: ''
                });
            });
        }
    } catch (e) {
        console.error('Failed to load session contracts, using sample data');
    }
};

const extractArray = (data: any): { array: any[] | null; keyFound: string | null } => {
    if (!data) return { array: null, keyFound: null };
    if (Array.isArray(data)) return { array: data, keyFound: '(root)' };
    
    if (typeof data === 'object' && data !== null) {
        const commonKeys = ['data', 'records', 'results', 'items'];
        for (const key of commonKeys) {
            if (Array.isArray(data[key])) {
                return { array: data[key], keyFound: key };
            }
        }
        for (const key in data) {
            if (Object.prototype.hasOwnProperty.call(data, key) && Array.isArray(data[key])) {
                return { array: data[key], keyFound: key };
            }
        }
    }
    return { array: null, keyFound: null };
};

export const mergePostgresJson = (jsonData: { [fileName: string]: { content: any, size: number } }): {
    totalRowCount: number;
    results: ProcessingResult[];
} => {
    let totalRowCount = 0;
    const results: ProcessingResult[] = [];
    
    const fileHandlers: { [key: string]: (data: any[], result: ProcessingResult) => void } = {
        'users': (d, r) => { users = d; r.recordCount = d.length; },
        'fd_agents': (d, r) => { fdAgents = d; r.recordCount = d.length; },
        'check_in': (d, r) => { travelData = d; r.recordCount = d.length; },
        'travel_log': (d, r) => { travelData = d; r.recordCount = d.length; },
        'warehouse': (d, r) => { inventoryData = d; r.recordCount = d.length; },
        'ms_point': (d, r) => { pointsData = d; r.recordCount = d.length; },
        'fd_tickets': (d, r) => { fdTickets = d; r.recordCount = d.length; },
        'fd_activities': (d, r) => { fdActivities = d; r.recordCount = d.length; },
        'sales_opportunity': (d, r) => { salesOpportunityData = d; r.recordCount = d.length; },
        'log': (d, r) => { logData = d; r.recordCount = d.length; },
        'point_log': (d, r) => { pointLogData = d; r.recordCount = d.length; },
        'fd_agent_member': (d, r) => { fdAgentMemberData = d; r.recordCount = d.length; },
        'fd_conversations_locations': (d, r) => { fdConversationsLocationsData = d; r.recordCount = d.length; },
        'fd_ticket_conversations': (d, r) => { fdTicketConversationsData = d; r.recordCount = d.length; },
        'items': (d, r) => { itemsData = d; r.recordCount = d.length; },
        'review': (d, r) => { reviewData = d; r.recordCount = d.length; },
        'role_pool': (d, r) => { rolePoolData = d; r.recordCount = d.length; },
        'stock': (d, r) => { stockData = d; r.recordCount = d.length; },
        'types': (d, r) => { typesData = d; r.recordCount = d.length; },
        'uom': (d, r) => { uomData = d; r.recordCount = d.length; },
        'version': (d, r) => { versionData = d; r.recordCount = d.length; },
        'roles': (d, r) => { rolesData = d; r.recordCount = d.length; },
        'ticket_member': (d, r) => { ticketMemberData = d; r.recordCount = d.length; },
        'fd_expense_log': (data, r) => {
             enterpriseExpenses = data;
             r.recordCount = data.length;
        },
    };

    for (const fileName of Object.keys(jsonData)) {
        const fileData = jsonData[fileName];
        const result: ProcessingResult = {
            fileName,
            status: 'success',
            recordCount: 0,
            messages: [],
            fileSize: fileData.size
        };

        if (fileData.content === null) {
            result.status = 'error';
            result.messages.push('Failed to parse JSON. The file may be corrupt or not valid JSON.');
            results.push(result);
            continue;
        }

        const { array: arrayData, keyFound } = extractArray(fileData.content);

        if (!arrayData) {
            result.status = 'warning';
            const keys = typeof fileData.content === 'object' && fileData.content !== null ? Object.keys(fileData.content).join(', ') : 'Not an object';
            result.messages.push(`No data array found. Found object with keys: [${keys}].`);
            results.push(result);
            continue;
        }
        
        if(keyFound) result.messages.push(`Located data array using key: "${keyFound}".`);

        if (arrayData.length === 0) {
            result.status = 'warning';
            result.messages.push('File contains an empty data array. 0 records were processed.');
            results.push(result);
            continue;
        }

        const tableName = fileName.replace('.json', '');
        const handler = fileHandlers[tableName];

        if (handler) {
            try {
                handler(arrayData, result);
                totalRowCount += result.recordCount;
                result.messages.push(`Successfully processed ${result.recordCount} records.`);
            } catch (e) {
                result.status = 'error';
                result.messages.push(`An error occurred while processing the data: ${e instanceof Error ? e.message : 'Unknown error'}`);
            }
        } else {
            result.status = 'warning';
            if (tableName !== 'config') {
                 result.messages.push(`No handler was found for this file. It was ignored.`);
            } else {
                result.status = 'success';
                result.messages.push(`Configuration file was noted. 0 records processed.`);
            }
        }
        results.push(result);
    }
    
    buildFoundationalData();
    
    if (DEBUG) console.log(`%c[Data Fabric] Import Complete: ${totalRowCount} rows processed.`, 'background: #16a34a; color: white; padding: 2px 4px; border-radius: 3px;');

    return { totalRowCount, results };
};


const buildFoundationalData = () => {
    if (users.length === 0) {
        users = enterpriseUsers.map((pUser, index) => ({
             id: pUser.id, uuid: pUser.id, first_name: pUser.name.split(' ')[0], last_name: pUser.name.split(' ').slice(1).join(' ') || 'User',
             email: `${pUser.id}@acs-legal.io`, role: 'Compliance Officer', hourly_rate: 85.0,
             created_at: new Date(Date.now() - (36 - index) * 1000 * 60 * 60 * 24 * 7).toISOString(),
             fd_agent_id: index + 1 
        }));
    }

    if (enterpriseExpenses.length === 0) {
        enterpriseExpenses = sampleExpenses.map((exp, i) => {
            const user = users[i % users.length];
            return {
                ...exp,
                fd_agent_id: user.fd_agent_id,
                expense_date: new Date().toISOString()
            };
        });
    }

    if (inventoryData.length === 0) {
        inventoryData = [
            { id: 101, warehouse_id: 1, name: "SATOP Assessment Kit", quantity: 45, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 102, warehouse_id: 1, name: "Counseling Workbook", quantity: 12, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 103, warehouse_id: 2, name: "Compliance Manual", quantity: 8, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 104, warehouse_id: 1, name: "Drug Test Kit", quantity: 22, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 105, warehouse_id: 3, name: "Evaluation Form", quantity: 5, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
            { id: 106, warehouse_id: 2, name: "Referral Document", quantity: 30, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        ];
    }

    if (travelData.length === 0) {
        travelData = users.slice(0, 10).map((u, i) => ({
            id: i + 1000,
            fd_ticket_id: 5000 + i,
            user_id: u.uuid,
            check_in: new Date(Date.now() - (i * 3600000)).toISOString(),
            check_out: new Date(Date.now() - (i * 3600000) + 7200000).toISOString(),
            checkin_location: ["Downtown HQ", "North Branch", "Westside Clinic", "City Center", "Tech Park"][i % 5],
            checkout_location: ["Downtown HQ", "North Branch", "Westside Clinic", "City Center", "Tech Park"][i % 5]
        }));
    }

    const agentIdToNameMap = fdAgents.reduce((acc, agent) => {
        const userMatch = users.find(u => u.fd_agent_id === agent.id);
        acc[agent.id] = userMatch ? `${userMatch.first_name} ${userMatch.last_name}` : `${agent.first_name} ${agent.last_name}`;
        return acc;
    }, {} as Record<number, string>);

    const expensesByName = enterpriseExpenses.reduce((acc, expense) => {
        let name = "Unknown Agent";
        if (expense.technicianName) {
             name = expense.technicianName;
        } else {
             name = agentIdToNameMap[expense.fd_agent_id] || users.find(u => u.fd_agent_id === expense.fd_agent_id)?.name || "Unknown Agent";
             if (name === "Unknown Agent") {
                 const u = users.find(u => u.fd_agent_id === expense.fd_agent_id);
                 if (u) name = u.name || `${u.first_name} ${u.last_name}`;
             }
        }
        
        if (name !== "Unknown Agent") {
            const amount = parseFloat(String(expense.amount || 0));
            acc[name] = (acc[name] || 0) + amount;
        }
        return acc;
    }, {} as Record<string, number>);
    
    const pointsByFdAgentId = pointsData.reduce((acc: Record<number, number>, point) => {
        const agentId = point.fd_agent_id;
        acc[agentId] = (acc[agentId] || 0) + (parseInt(String(point.points_earned), 10) || 0);
        return acc;
    }, {});

    foundationalData.technicians = users.map((user) => {
        const fullName = user.name || `${user.first_name} ${user.last_name}`;
        const totalPoints = pointsByFdAgentId[user.fd_agent_id] || user.totalPoints || 0;
        
        return {
            id: user.fd_agent_id,
            uuid: user.id || user.uuid,
            name: fullName,
            email: user.email,
            role: user.role || 'Compliance Officer',
            hourlyRate: user.hourly_rate || 85.00,
            points: totalPoints,
            totalExpenses: expensesByName[fullName] || 0.00,
            createdAt: new Date(user.created_at).getTime(),
            is_active: true
        };
    });
};

buildFoundationalData();