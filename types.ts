
export interface CommandMetrics {
  unbilledLabor: { total_unbilled: number; total_pages: number };
  serviceTickets: { open_count: number; avg_response_hours: number };
  customerRevenue: Record<string, number>;
  integrityStream: any[];
  fleetHealth: { total_devices: number; online_count: number; uptime_percent: number };
}

export interface FdAgent {
  id: number;
  name: string;
  email: string;
  status: string;
  department: string;
  hourly_rate: number;
}

export interface FdTicket {
  id: number;
  fd_agent_id: number;
  subject: string;
  status: string;
  completion_percent: number;
  estimated_hours: number;
  actual_hours: number;
  invoiced_amount: number;
  client_id: string;
  lastUpdated?: number;
}

export interface FdActivity {
    id: number;
    fd_agent_id: number;
    fd_ticket_id: number;
    activity_type: string;
    start_time: string;
    end_time: string;
    billable_hours: number;
}

export interface SalesOpportunity {
    opportunityName: string;
    soldToCompany: string;
    customerId?: string;
    oppNo?: string;
    lastModified: string;
    oppDate?: string;
    oppStage: string; // 'PROSPECTING' | 'PROPOSED' | 'IN_REVIEW' | 'CONTRACTED' | 'LOST'
    salesRep: string;
    totalAmt: number;
    estCloseDate?: string;
    createdDate?: string;
    lineOfBusiness: string;
    probability?: number;
    lastUpdated?: number;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  hours: number;
  billablePct: number;
  tickets: number;
  expenses: number;
  lastUpdated?: number;
  createdAt: number;
  aiFlag?: string;
  points?: number;
  is_active?: boolean;
}

export interface DrillDownData {
  [key: string]: FdTicket[];
}

export interface AiChartData {
    type: 'bar' | 'pie' | 'funnel';
    data: any[];
    nameKey?: string;
    dataKey: string;
}

export interface ActionButton {
    label: string;
    action: string;
}

export interface AuditTrailEvent {
    step: string;
    details: string;
    timestamp: string;
}

export type ContentBlock = 
    | { type: 'title'; text: string }
    | { type: 'subheader'; text: string }
    | { type: 'paragraph'; text: string }
    | { type: 'table'; headers: string[]; rows: (string | number)[][] }
    | { type: 'metric'; label: string; value: string; status?: 'success' | 'warning' | 'danger' | 'neutral' }
    | { type: 'chart'; chartData: AiChartData }
    | { type: 'actions'; buttons: ActionButton[] }
    | { type: 'image_prompt'; text: string }
    | { type: 'verification'; status: 'verified' | 'tampered' | 'pending'; text: string; trail?: AuditTrailEvent[] };

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  imageUrl?: string;
  imageIsLoading?: boolean;
  documentName?: string;
  blocks?: ContentBlock[];
  groundingMetadata?: any;
}

export interface Alert {
    id: string;
    type: 'warning' | 'success' | 'info';
    message: string;
}

export interface WeeklySummary {
    title: string;
    kpis: { label: string; value: string; }[];
    insights: string;
    talkingPoints: string[];
    imagePrompt: string;
}

export interface Achievement {
    id:string;
    title: string;
    description: string;
    icon: string;
    unlocked: boolean;
}

export interface Kpi {
    title: string;
    description: string;
    icon: 'acquisition' | 'satisfaction' | 'sprint' | 'innovation' | 'resolution';
}

export type UserRole = 'employee' | null;

export interface Contract {
    contractId: string;
    clientId: string;
    clientName: string;
    serviceName: string;
    vendor: 'Microsoft' | 'Cisco' | 'Dell' | 'VMware' | 'Internal' | 'Konica' | 'Canon' | 'Ricoh';
    startDate: string;
    endDate: string;
    recurringCost: number;
    recurringPrice: number;
    status: 'Active' | 'Renewing' | 'At Risk' | 'Expired' | 'Paid';
    schedule?: { date: string; purpose: string; }[];
    performanceRating?: number;
    customerFeedback?: string;
    lastUpdated?: number;
}

export interface ClientHealth {
    score: number;
    profitability: number;
    serviceStrain: number;
    renewalStatus: { atRiskCount: number; status: 'Healthy' | 'At Risk' };
    growthOpportunity: number;
}

export interface C2PAManifest {
    label: string;
    claim_generator: string;
    title: string;
    format: string;
    instance_id: string;
    thumbnail?: string;
    ingredients: Array<{
        title: string;
        format: string;
        instance_id: string;
    }>;
    assertions: Array<{
        label: string;
        data: any;
    }>;
    signature_info: {
        issuer: string;
        time: string;
    }
}

export interface AuditTrailData {
    documentName: string;
    documentType: string;
    c2pa: {
        timestamp: string;
        hash: string;
        issuer: string;
        manifest?: C2PAManifest;
    }
}

export interface CommandPaletteItem {
    type: 'client' | 'ai_command';
    id: string;
    label: string;
    description?: string;
}

export interface TravelLogEntry {
    id: number;
    fd_ticket_id: number | null;
    user_id: string;
    check_in: string;
    check_out: string | null;
    checkin_location: string;
    checkout_location: string | null;
}

export interface InventoryItem {
    id: number;
    warehouse_id: number;
    name: string;
    quantity: number;
    createdAt: string;
    updatedAt: string;
    c2pa_hash?: string;
}

export interface ProcessingResult {
    fileName: string;
    status: 'success' | 'warning' | 'error';
    recordCount: number;
    messages: string[];
    fileSize: number;
}

export interface MsPoint {
    fd_agent_id: number;
    points_earned: number;
}

export type ScannerState = 'idle' | 'fetching_scanners' | 'ready' | 'sending_command' | 'scanning' | 'processing' | 'complete' | 'no_scanners_found' | 'error';

export interface Scanner {
    id: string;
    name: string;
}

export interface Opportunity {
    name: string;
    value: number;
    status: string;
    lastUpdatedDays: number;
}

export interface UploadedFileRecord {
    id: string;
    file_name: string;
    file_path: string;
    file_type: string;
    file_size: number;
    public_url: string;
    org_id: string;
    uploaded_by: string;
    uploaded_at: string;
    summary?: string;
    metadata?: any;
}

export interface AgentKnowledgeRecord {
    id: string;
    org_id: string;
    content: string;
    source: string;
    created_at: string;
}

export interface OnboardingRecord {
    worker_id: string;
    full_name: string;
    status: string;
    last_action_at: string;
    metadata?: any;
}

export interface AppData {
    foundationalData: any;
    scenarios: any[];
    contractData: Contract[];
    msaData: any[];
    salesPipelineData: SalesOpportunity[];
    travelData: TravelLogEntry[];
    inventoryData: InventoryItem[];
    fdTickets: any[];
    fdActivities: any[];
    utilizationData: Employee[];
    drillDownData: DrillDownData;
    opportunityData: any;
    achievementsData: Achievement[];
    userProfileData: { name: string; points: number; };
    enterpriseExpenses: any[];
}

export interface IngestedAsset {
    id: string;
    file_path?: string;
    public_url?: string;
}

export interface WestFlowResponse {
    success: boolean;
    error?: string;
    data?: any;
    pending_billing?: number;
    unbilled_completed_service?: number;
    payroll_delta?: number;
    labor_savings?: number;
    labor_hours?: number;
    robot_tasks?: number;
    robot_billing?: number;
    copier_billing?: number;
}

export interface ERPStatus {
    target: string;
    status: string;
    latency: string;
    lastSync: string;
}
