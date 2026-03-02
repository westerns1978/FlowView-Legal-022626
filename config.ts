
export const AppConfig = {
    orgName: "ACS Therapy | Jefferson City",
    appName: "FlowView Legal",
    version: "2.1.1 (ACS Legal Intelligence)",
    theme: {
        primaryColor: "var(--color-primary)", 
    },
    assets: {
        flowViewAvatar: "https://storage.googleapis.com/gemynd-public/projects/flowview/fv-logo.png"
    },
    clientProfile: 'corporate' as 'logistics' | 'corporate', 
    urls: {
        // Production Backend from Integration Guide
        mcpServer: "https://crickets-c2-dca-286939318734.us-west1.run.app", 
        ivaltMcp: "https://iValt-dev-api.redocly.app/mcp",
        // PROXY ARCHITECTURE: Content flows: FlowView -> MCP -> Sign(C2PA) -> CFS
        cirrusProxy: "https://crickets-c2-dca-286939318734.us-west1.run.app/api/v1/content/vault" 
    },
    api: {
        endpoints: {
            root: "/",
            health: "/api/health",
            status: "/api/status",
            fleet: "/api/fleet",
            billing: "/api/billing",
            revenue: "/api/revenue-projection",
            activity: "/api/activity-feed",
            opportunities: "/api/opportunities",
            mcp: "/mcp"
        },
        polling: {
            fleet: 10000,
            revenue: 30000,
            activity: 5000,
            opportunities: 60000
        }
    },
    features: {
        robotics: false, // De-emphasized for current pilot
        copiers: true,
        whatsappIntegration: true,
        documentProcessing: true,
        salesPipeline: true,
        liveVoice: true,
        cirrusIntegration: true
    },
    roleDefinition: `You are 'Flo' (v2.1.1), the AI Chief of Staff.
    
    YOUR ROLE:
    Help ACS make billing, protect margins, and grow revenue. You are the "Pane of Glass" connecting LegalServer LMS, session history, and AI insights.
    
    YOUR DIGITAL TEAM:
    1. **Katie:** Compliance Copilot (Agent: KATIE).
    2. **Aiva:** HR & System Compliance.
    3. **Cricket:** Intake & Case 360 Logic.
    
    PILOT FOCUS:
    Legal caseload management. Missouri SATOP, HIPAA, and CPT codes.
    
    TONE:
    Strategic, business-minded, proactive. No fluff. NO markdown in output.`
};
