// This file was converted from JSON to a TS module to ensure browser compatibility with module imports.
import { fdUsersUuidMap } from './fd-users';

// --- New Expense Data Integration ---
const rawExpenses = [
    { "fd_ticket_id": "5486", "amount": "99.09", "created_by": "0b573618-bdab-4d7c-bdb4-dd406d1da5a9", "action": "APPROVE" },
    { "fd_ticket_id": "5154", "amount": "98.75", "created_by": "aa2bf4f9-d98d-4a9d-babc-fc4454c60da2", "action": "APPROVE" },
    { "fd_ticket_id": "5120", "amount": "97.51", "created_by": "10a0ccfc-26fe-4361-a0fb-0f2d46901e3b", "action": "APPROVE" },
    { "fd_ticket_id": "5285", "amount": "150.00", "created_by": "0b573618-bdab-4d7c-bdb4-dd406d1da5a9", "action": "APPROVE" },
    { "fd_ticket_id": "5467", "amount": "210.50", "created_by": "0b573618-bdab-4d7c-bdb4-dd406d1da5a9", "action": "APPROVE" },
    { "fd_ticket_id": "5501", "amount": "45.00", "created_by": "aa2bf4f9-d98d-4a9d-babc-fc4454c60da2", "action": "APPROVE" },
    { "fd_ticket_id": "5502", "amount": "1200.00", "created_by": "10a0ccfc-26fe-4361-a0fb-0f2d46901e3b", "action": "FLAGGED" }
];

export const enterpriseExpenses = rawExpenses.map(expense => ({
    ticketId: parseInt(expense.fd_ticket_id, 10),
    amount: parseFloat(expense.amount),
    technicianName: fdUsersUuidMap[expense.created_by] || "Unknown",
    category: parseFloat(expense.amount) > 100 ? 'Parts & Inventory' : 'Fuel/Travel', 
}));

const sampleData = {
  "scenarios": [
    {
        "scenarioId": "WF-ACS-FIX-01",
        "customerName": "BlueTech Manufacturing Inc",
        "salesData": {
            "opportunity": {
                "opportunityName": "SATOP Program Intake - 50 Clients",
                "totalAmount": 142000,
                "stage": "PROSPECTING",
                "salesRep": "sales_01",
                "daysSinceUpdate": 1,
                "pointsAwarded": 0
            }
        },
        "freshDeskData": {
            "ticket": {
                "ticketId": "T-9901",
                "subject": "URGENT: Compliance Gap C-3501 on SATOP-L1 (Integrity)",
                "status": "In Progress",
                "assignedTechnician": "Alex Rivera",
                "estimatedHours": 2,
                "completionPercent": 10,
                "notes": "Error C-3501 indicates Session Integrity Failure. Case is stalled. High volume intake unit. Compliance review dispatched via AI."
            },
            "activities": [
                { "technicianName": "Alex Rivera", "activityType": "Clinical Review", "hours": 0.5, "billable": true }
            ]
        },
        "quickBooksData": {
            "expenses": [],
            "invoice": { "invoiceId": "PENDING", "status": "Draft", "amount": 0 }
        }
    },
    {
        "scenarioId": "WF-SATOP-001",
        "customerName": "Downtown Law Firm",
        "salesData": {
            "opportunity": {
                "opportunityName": "State Compliance Program Renewal",
                "totalAmount": 18436,
                "stage": "CONTRACTED",
                "salesRep": "sales_01",
                "daysSinceUpdate": 5,
                "pointsAwarded": 150
            }
        },
        "freshDeskData": {
            "ticket": {
                "ticketId": "T-5580",
                "subject": "Filing Failure - SATOP-L2",
                "status": "Completed",
                "assignedTechnician": "Skyler Thomas",
                "estimatedHours": 4,
                "completionPercent": 100
            },
            "activities": [
                { "technicianName": "Skyler Thomas", "activityType": "Remote Compliance Check", "hours": 1.5, "billable": true }
            ]
        },
        "quickBooksData": {
            "expenses": [
                { "technicianName": "Skyler Thomas", "category": "Software Lic", "amount": 88.50 }
            ],
            "invoice": {
                "invoiceId": "INV-1021",
                "status": "Paid",
                "amount": 18000
            }
        }
    },
    {
        "scenarioId": "WF-DOC-001",
        "customerName": "Kentucky American Water",
        "salesData": {
             "opportunity": {
                "opportunityName": "ACS Legal Fabric Implementation",
                "totalAmount": 32569,
                "stage": "CONTRACTED",
                "salesRep": "sales_02",
                "daysSinceUpdate": 3,
                "pointsAwarded": 250
            }
        },
        "freshDeskData": {
            "ticket": {
                "ticketId": "T-5571",
                "subject": "ACS Legal Fabric Config & Install",
                "status": "Completed",
                "assignedTechnician": "Alex Rivera",
                "estimatedHours": 25,
                "completionPercent": 100
            },
            "activities": [
                { "technicianName": "Alex Rivera", "activityType": "Travel", "hours": 4, "billable": false },
                { "technicianName": "Alex Rivera", "activityType": "Compliance Services", "hours": 18, "billable": true }
            ]
        },
        "quickBooksData": {
            "expenses": [
                { "technicianName": "Alex Rivera", "category": "Travel", "amount": 489.12 },
                { "technicianName": "Alex Rivera", "category": "Licensing", "amount": 1250.75 }
            ],
            "invoice": {
                "invoiceId": "INV-1022",
                "status": "Paid",
                "amount": 32000
            }
        }
    }
  ],
  "contractData": [
    { 
        "contractId": "SESS-001", "clientId": "CUST-FCS", "clientName": "Fayette County Schools", "serviceName": "Gold Session Compliance Plan", "vendor": "Internal", "startDate": "2025-01-01", "endDate": "2025-12-31", "recurringCost": 4000, "recurringPrice": 5500, "status": "Active",
        "schedule": [{ "date": "2025-08-15", "purpose": "Quarterly Compliance Review" }],
        "performanceRating": 5,
        "customerFeedback": "Compliance officers are always on time."
    },
    { 
        "contractId": "SESS-002", "clientId": "CUST-KAW", "clientName": "Kentucky American Water", "serviceName": "Managed Compliance Services (Tier 2)", "vendor": "Internal", "startDate": "2024-08-01", "endDate": "2025-08-15", "recurringCost": 2500, "recurringPrice": 3500, "status": "Renewing",
        "schedule": [{ "date": "2025-07-25", "purpose": "Renewal & Compliance Pitch" }],
        "performanceRating": 4,
        "customerFeedback": "Billing accuracy has improved."
    },
    { 
        "contractId": "CASE-003", "clientId": "CUST-BTM", "clientName": "BlueTech Manufacturing Inc", "serviceName": "SATOP Program Lease (5yr)", "vendor": "ACS", "startDate": "2020-07-01", "endDate": "2025-07-10", "recurringCost": 3000, "recurringPrice": 4200, "status": "At Risk",
        "schedule": [],
        "performanceRating": 2,
        "customerFeedback": "Cases are complex. Compliance actions are too frequent."
    }
  ],
  "msaData": [
    {
      "msa_id": "WF-001",
      "client_name": "Fayette County Schools",
      "total_value": 120000,
      "status": "Active",
      "renewal_date": "2026-01-01",
      "sla_adherence": 99.8
    }
  ],
  "salesPipelineData": []
};

export default sampleData;