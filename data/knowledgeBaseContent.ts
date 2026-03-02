export const CORE_KNOWLEDGE_BASE = `
# FLOWVIEW LEGAL: THE COMPLIANCE ORCHESTRATION LAYER

## 1. THE PROBLEM: THE "COMPLIANCE" BARRIER
The Legal & Compliance Sector faces a disconnect: rapidly evolving with digital session monitoring and AI-driven compliance, but relying on LegalServer—an LMS designed for case management.
- **Sessions Speak:** Data-rich formats like JSON (Duration, integrity scores, compliance metrics).
- **LMS Speak:** Traditional metrics (Session Logs, Billing Codes, Case Status).
- **Consequence:** This "compliance barrier" forces providers to manually translate session data or manage separate systems, leading to time-consuming, error-prone processes and significant billing leakage. Without a bridge, providers risk missing billable events.

## 2. THE SOLUTION: ACS LEGAL FABRIC (THE UNIVERSAL BRIDGE)
ACS Legal Fabric acts as the "Rosetta Stone," translating raw telemetry from sessions and compliance events into actionable data LegalServer can process natively.
- **Normalization Engine:** Converts session metrics into LMS accounting.
- **Revenue Assurance:** Ensures every provider action is captured and billed.

## 3. THE "UNIVERSAL SESSION" LOGIC
We translate Session Metrics to LMS Accounting using specific mappings:
1. **Log 1 (Standard):** Maps to **Clinical Session Minutes**.
   - *Logic:* Total Session Time / 60.
   - *Use Case:* Individual Therapy, Group Sessions (Hourly Billing).
2. **Log 2 (Specialized):** Maps to **Program Completion**.
   - *Logic:* Successful Program Milestone OR Assessment.
   - *Use Case:* SATOP Evaluations, Lab Logistics (Outcome Billing).
3. **Case Progress:** Maps to **Program Integrity**.
   - *Logic:* Linear Milestone Achievement.
   - *Use Case:* Compliance Overage / Predictive Review.

## 4. THE ECOSYSTEM STACK (The "Layer Cake")
1.  **Top Layer (Application):** **FlowView Legal**. The Integrator & Service Provider.
2.  **Middle Layer (Market Maker):** **ACS Legal Fabric**. The Go-to-Market Channel. Connects Providers to Practices.
3.  **Provider Layer:** **Program Providers**. The organizations (e.g., SATOP, DMV).
4.  **Foundation Layer:** **ACS Standard**. The Universal Standard (API).

## 5. THE ACS ARCHITECTURE
-   **The ACS Engine:** A serverless, multi-tenant cloud backend (Google Cloud Run + Vertex AI).
-   **The ACS Bridge (MCP):** A secure on-premise connector. It solves the "Firewall Problem" by initiating a secure outbound HTTPS tunnel to the cloud. It writes to **LegalServer** via the ALN (ACS Legal Network) standard on Port 9780.
-   **The Trust Triangle:** Authenticity (C2PA), Logic (Grounded RAG), Empathy (User-Centric).
`;
