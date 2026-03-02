# Mobile Experience Strategy for At-a-Glance

This document outlines the design and logic for adapting the At-a-Glance Dashboard for a role-based mobile experience, ensuring key personnel have access to critical, context-aware information on the go.

## Guiding Principles
- **Role-Centric:** Display only the most relevant information for the user's role.
- **Action-Oriented:** Every screen should facilitate a clear, immediate action.
- **AI-First:** The AI Command Bar must be easily accessible as the primary interaction method.
- **Readability:** Prioritize large text, clear charts, and high-contrast elements.

---

## Role 1: Sales Manager

The Sales Manager's mobile experience is focused on pipeline health, deal velocity, and team performance. The primary view will be a simplified version of the `SalesPipelineView`.

### Primary Mobile Dashboard for Sales Manager

1.  **Key KPIs (Top of Screen):**
    *   Total Pipeline Value
    *   Win Rate (%)
    *   Forecasted Close (30 days)

2.  **Primary Chart: Pipeline by Stage (`FunnelChart`)**
    *   The funnel chart provides the best high-level view of pipeline health on a small screen. It will be the only chart displayed to avoid clutter.
    *   Tapping on a funnel stage will filter the opportunity list below.

3.  **Opportunity List Adaptation:**
    *   The table will be converted into a vertically scrolling list of cards. Each card represents one opportunity.
    *   **Visible Columns per Card:** `OpportunityName`, `SoldToCompany`, `TotalAmt`, and `EstCloseDate`.
    *   **Horizontal Scroll for Details:** To avoid clutter, secondary information like `SalesRep` and `OppStage` will be accessible by horizontally scrolling the card content.
    *   **"Stale" Indicator:** Opportunities with no updates in over 14 days will have a prominent red dot or warning icon.

---

## Role 2: CEO / Owner

The CEO/Owner's experience is about the overall health of the business. The dashboard will be a curated set of the most critical KPIs from across the entire application.

### Primary Mobile Dashboard for CEO/Owner

1.  **Critical KPIs (The "Big Three"):**
    *   **Revenue-at-Risk:** This is the most critical financial health metric. Sourced from `RenewITView`.
    *   **Total Pipeline Value:** The primary indicator of future growth. Sourced from `SalesPipelineView`.
    *   **Average Billable %:** A key indicator of operational efficiency and profitability. Sourced from the `AtAGlanceView`/`TeamView`.

2.  **Drill-Down Capability:**
    *   Each KPI card will be tappable. Tapping a card will navigate to a simplified, mobile-friendly version of its source view (e.g., tapping "Revenue-at-Risk" opens a filtered list of at-risk contracts from RenewIT 360).

### Mobile AI Interaction (Both Roles)

The **AI Command Bar** is central to the mobile experience.

*   **Persistent Floating Action Button (FAB):** A FAB with the `SparklesIcon` will be persistently displayed in the bottom-right corner of the screen.
*   **Launch AI Command Center:** Tapping the FAB will launch the `AiCommandCenterModal` fullscreen, allowing for voice or text input. The context of the current view (e.g., "Sales Pipeline") will be passed to the AI, just like the desktop version.
*   **"New..." Menu:** A long-press on the FAB will open the "New..." menu, allowing quick access to "Field Report" or "Process Document" without leaving the current screen.
