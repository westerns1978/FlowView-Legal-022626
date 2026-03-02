
import { AppConfig } from '../config';

export interface CaseloadClient {
    id: string;
    type: 'client';
    model: string;
    status: string;
    location: string;
    battery?: number;
    toner?: number;
}

export interface CaseloadResponse {
    total_clients: number;
    clients: CaseloadClient[];
}

export interface BillingProjection {
    current_monthly: number;
    growth_percentage: number;
    projected_annual: number;
    last_updated?: string;
}

export interface ActivityEvent {
    title: string;
    billing: string;
    timestamp: string;
    device_id: string;
    description: string;
    task_type?: string;
    alnStatus?: string;
}

export interface Opportunity {
    type: 'RISK' | 'UPSELL' | 'COMPLIANCE';
    impact: string;
    description: string;
    recommendation: string;
    priority?: number;
}

// --- STORY MODE STATE ---
let storyTick = 0;
// We increment this tick every time data is fetched to simulate a timeline
const incrementStory = () => {
    storyTick = (storyTick + 1) % 60; // 60-step loop
};

class DCAApiService {
    private baseUrl: string;

    constructor() {
        this.baseUrl = AppConfig.urls.mcpServer;
    }

    private async fetchJson<T>(endpoint: string): Promise<T> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000); 

            const response = await fetch(`${this.baseUrl}${endpoint}`, { 
                signal: controller.signal,
                headers: { 'Accept': 'application/json' }
            });
            
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            // Fallback to Simulation
            return this.getMockData<T>(endpoint);
        }
    }

    // --- MOCK DATA GENERATOR (The Narrative Engine) ---
    private getMockData<T>(endpoint: string): T {
        // Increment story logic on fleet fetch (primary heartbeat)
        if (endpoint === AppConfig.api.endpoints.fleet) incrementStory();

        const isIncidentActive = storyTick > 15 && storyTick < 45;
        const isResolutionPhase = storyTick >= 45;

        switch (endpoint) {
            case AppConfig.api.endpoints.fleet:
                return {
                    total_clients: 4,
                    clients: [
                        { 
                            id: 'Client-01', 
                            type: 'client', 
                            model: 'SATOP-L1', 
                            // STORY: Client goes into Error mode between tick 15 and 45
                            status: isIncidentActive ? 'Compliance Gap' : 'Active Session', 
                            location: 'Zone B', 
                            battery: Math.max(20, 78 - storyTick) 
                        },
                        { id: 'Client-02', type: 'client', model: 'SATOP-L2', status: 'In-Session', location: 'Lobby', battery: 42 },
                        { id: 'Client-03', type: 'client', model: 'SATOP-L3', status: 'Idle', location: 'Dock', battery: 95 },
                        { id: 'Client-04', type: 'client', model: 'SATOP-L4', status: 'Compliance Gap', location: '2nd Floor', toner: 12 }
                    ]
                } as unknown as T;
            
            case AppConfig.api.endpoints.revenue:
                return {
                    current_monthly: 6445.0 + (storyTick * 5), // Billing ticks up visibly
                    growth_percentage: 18.6,
                    projected_annual: 77340.0,
                    last_updated: new Date().toISOString()
                } as unknown as T;

            case AppConfig.api.endpoints.activity:
                const events: ActivityEvent[] = [];
                
                // 1. Always happening: Normal Reads
                events.push({ 
                    title: "Universal Session Log", 
                    description: "Session Complete -> Specialized Log", 
                    billing: "$2.50 (Outcome)", 
                    timestamp: new Date().toISOString(), 
                    device_id: "Client-03",
                    alnStatus: "Synced to LegalServer"
                });

                // 2. STORY EVENT: The Incident (Tick 15-20)
                if (storyTick >= 15 && storyTick <= 25) {
                    events.unshift({
                        title: "CRITICAL COMPLIANCE ALERT",
                        description: "COMPLIANCE_GAP_C04 -> Auto-Action #99420",
                        billing: "$0.00",
                        timestamp: new Date(Date.now() - 1000).toISOString(),
                        device_id: "Client-01",
                        alnStatus: "Action Created (ComplianceActions)"
                    });
                }

                // 3. STORY EVENT: The Resolution (Tick 45+)
                if (storyTick >= 45) {
                    events.unshift({
                        title: "Compliance Resolved",
                        description: "Remote Integrity Check via MCP -> Action Closed",
                        billing: "$45.00 (Remote Fix)",
                        timestamp: new Date().toISOString(),
                        device_id: "Client-01",
                        alnStatus: "Synced to LegalServer"
                    });
                }

                return events as unknown as T;

            case AppConfig.api.endpoints.opportunities:
                return [
                    { type: 'RISK', description: "High compliance gap rate on Unit 4", impact: "-$200/mo", recommendation: "Dispatch Compliance Officer" },
                    { type: 'UPSELL', description: "Wi-Fi deadzone in Warehouse", impact: "+$5k Project", recommendation: "Propose Mesh Upgrade" }
                ] as unknown as T;

            default:
                return {} as T;
        }
    }

    async getServiceInfo() {
        return this.fetchJson<{ service: string; version: string; status: string; }>(AppConfig.api.endpoints.root);
    }

    async getFleet(): Promise<CaseloadResponse> {
        return this.fetchJson<CaseloadResponse>(AppConfig.api.endpoints.fleet);
    }

    async getRevenueProjection(): Promise<BillingProjection> {
        return this.fetchJson<BillingProjection>(AppConfig.api.endpoints.revenue);
    }

    async getActivityFeed(): Promise<ActivityEvent[]> {
        return this.fetchJson<ActivityEvent[]>(AppConfig.api.endpoints.activity);
    }

    async getOpportunities(): Promise<Opportunity[]> {
        return this.fetchJson<Opportunity[]>(AppConfig.api.endpoints.opportunities);
    }

    async callMCP(method: string, params: any = {}) {
        console.log(`[MCP] Calling method: ${method}`, params);
        return { status: 'success', method, result: 'Simulated MCP Action Queued' };
    }
}

export const dcaApi = new DCAApiService();
