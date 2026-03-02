
# Project Sentinel v2.0: The Fraud-Proof BI Command Center 📊

**Project Sentinel v2.0** is an enterprise-grade, fraud-resistant Business Intelligence (BI) Command Center built on Google Cloud. It transforms siloed operational data—from FreshDesk, QuickBooks, QuoteWerks, and more—into a unified, real-time **"digital thread."** Powered by the Google Gemini API and a Retrieval-Augmented Generation (RAG) architecture, it moves beyond reactive dashboards to provide proactive, prescriptive, and grounded insights.

## 🔮 Project Vision: The Digital Thread & The Trust Triangle

The core philosophy of Sentinel v2.0 is the **Digital Thread**, a concept that connects events across the entire business lifecycle to provide the AI with complete context:

> An opportunity in **QuoteWerks** becomes a project in **Freshdesk**, which generates billable hours and expenses in **QuickBooks**, leading to a recurring service contract managed in our **RenewIT 360** hub.

This is hardened by the **WestFlow Trust Triangle**, our key differentiator:
1.  **Authenticity (C2PA)**: Documents are verified at intake to prevent fraud.
2.  **Logic (Fine-tuned RAG LLM)**: AI insights are grounded in enterprise data, eliminating hallucinations.
3.  **Empathy (User-Centric OKRs)**: Recommendations are aligned with the user's strategic goals.

---

## 🚀 Core Features

### 📲 Offline-First for Field Staff (PWA)

Sentinel is a fully-featured **Progressive Web App (PWA)**, designed for reliability in the field with offline access to the application shell and cached data, ensuring it's always accessible.

### 🤖 AI-Powered Core (Gemini API with RAG)

-   **Natural Language Query (NLQ)**: Ask complex questions in plain English. The AI uses a RAG pipeline to search internal documents and `Google Search` for real-time web data to provide grounded, verifiable answers with citations.
-   **Proactive Insights & Anomaly Detection**: The dashboard proactively flags opportunities and risks, such as margin erosion or high-performing team members, without waiting for user prompts.
-   **Prescriptive Analytics**: AI-generated reports now include "Recommended Next Action" buttons, allowing users to trigger workflows (e.g., "Draft retention email") directly from an insight.
-   **Storytelling & Reporting**: Generate comprehensive weekly briefings with AI-powered narratives, interactive charts, and C2PA-stamped PDF exports for secure sharing.

### 🏠 Key Dashboard Views

-   **At-a-Glance**: The central landing page with a dynamic AI morning briefing, customizable KPIs, and a high-level team utilization overview.
-   **Customer 360°**: A unified view of any client, aggregating contracts, opportunities, tickets, and financials, complete with an AI-generated lifecycle analysis.
-   **Sales Pipeline**: An end-to-end view of the sales process with an AI-powered risk assessment built into the interactive funnel chart.
-   **RenewIT 360**: A dedicated suite for managing recurring revenue, analyzing profitability, and identifying co-termination opportunities.
-   **DoKrunch AI Workspace**: A guided workflow for AI-powered document intelligence. Securely upload or scan contracts, SOWs, and receipts. The AI extracts structured data, verifies integrity using C2PA, and feeds the information into the central Knowledge Hub.
-   **Data Fabric**: A backend simulation portal to manage data sources, upload new datasets, and use the AI to generate production-ready Python ELT scripts for Google Cloud Functions.
-   **Team & Analysis**: Deep-dive into team performance, travel history, and inventory. A gamification module with leaderboards and achievements boosts morale and engagement.

---

## 🛠️ Technology Stack

-   **Frontend**: React, TypeScript, Tailwind CSS
-   **AI Engine**: Google Gemini API (`@google/genai`)
-   **Charting**: Recharts
-   **Offline Capability**: Service Worker for PWA functionality.
-   **Document Interaction**: jsPDF and html2canvas for reporting.
-   **Simulated Backend**: The app simulates a robust GCP architecture with Cloud Functions, BigQuery, and a Vector DB for the RAG pipeline.

---

## 🔮 Future Roadmap & Strategic Suggestions

This prototype lays a powerful foundation. Here are strategic enhancements to elevate it into an indispensable business tool:

1.  **📱 Mobile-First Responsive Experience**:
    -   **Suggestion**: Implement the strategy outlined in `MobileStrategy.md`. Develop a fully responsive layout that adapts based on user role. For example, a Sales Manager on their phone sees a simplified pipeline view, while a CEO sees top-level financial KPIs.
    -   **Benefit**: Delivers a focused, actionable experience for users on the go, ensuring the tool is always within reach.

2.  **🌐 Real-Time Data Integration & Offline Sync**:
    -   **Suggestion**: Transition from static data to live API calls. Implement a backend service to handle real-time webhooks. Use IndexedDB to store fetched data, allowing users to view and interact with cached data while offline.
    -   **Benefit**: The dashboard would reflect business changes instantly and provide true offline functionality, making AI insights hyper-relevant and timely.

3.  **🤖 AI-Powered Workflow Builder**:
    -   **Suggestion**: Create a new "Workflows" module where users can build automation rules using natural language. For example: *"When a deal stage changes to 'Won' in the Sales Pipeline, automatically create a draft contract in RenewIT 360 and generate a project kick-off ticket in Freshdesk."*
    -   **Benefit**: This transforms the dashboard from a BI tool into a true operational system, actively reducing manual work and ensuring process consistency.

4.  **🎨 Deeper Personalization & Custom Dashboards**:
    -   **Suggestion**: Allow users to create multiple, fully customizable dashboards via a drag-and-drop interface. Empower them to create new widgets simply by asking the AI (e.g., "Create a chart showing ticket volume vs. profitability for Chris Gray").
    -   **Benefit**: Enables each user to build a command center that perfectly matches their unique workflow, dramatically increasing adoption and utility.

5.  **🔔 Proactive Push Notifications**:
    -   **Suggestion**: Integrate a notification service to push critical, AI-surfaced alerts directly to users' devices (e.g., "Alert: The ACME Corp contract, valued at $45k, has exceeded its estimated hours by 10%. A change order may be required.").
    -   **Benefit**: Turns the dashboard into a proactive coach that actively helps users stay ahead of problems and capitalize on opportunities.
