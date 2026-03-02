
import { Contract, FdTicket, SalesOpportunity, ClientHealth } from '../types';

/**
 * Calculates a client's health score based on various factors.
 * This is a proof-of-concept algorithm.
 */
export const calculateClientHealth = (
    clientName: string,
    contracts: Contract[],
    tickets: { subject: string }[],
    opportunities: SalesOpportunity[]
): ClientHealth => {
    // --- 1. Profitability ---
    const clientContracts = contracts.filter(c => c.clientName === clientName);
    let totalProfit = 0;
    let totalPrice = 0;
    clientContracts.forEach(c => {
        totalPrice += c.recurringPrice;
        totalProfit += c.recurringPrice - c.recurringCost;
    });
    const avgProfitability = totalPrice > 0 ? (totalProfit / totalPrice) * 100 : 0;
    const profitabilityScore = Math.max(0, Math.min(100, avgProfitability * 2.5)); // Scale profitability

    // --- 2. Service Strain ---
    const clientTickets = tickets; // Already filtered
    const serviceStrain = clientTickets.length;
    // Lower score for more tickets. Cap at a reasonable number.
    const serviceStrainScore = Math.max(0, 100 - (serviceStrain * 10));

    // --- 3. Renewal Status ---
    const today = new Date();
    const fortyFiveDaysFromNow = new Date(today);
    fortyFiveDaysFromNow.setDate(today.getDate() + 45);
    
    const atRiskContracts = clientContracts.filter(c => {
        const endDate = new Date(c.endDate);
        return endDate >= today && endDate <= fortyFiveDaysFromNow;
    });
    const atRiskCount = atRiskContracts.length;
    const renewalRiskScore = atRiskCount > 0 ? 0 : 100;

    // --- 4. Growth Opportunity ---
    const clientOpportunities = opportunities.filter(
        opp => opp.soldToCompany === clientName && opp.oppStage !== 'CONTRACTED'
    );
    const growthOpportunityValue = clientOpportunities.reduce((sum, opp) => sum + opp.totalAmt, 0);

    // --- Final Score Calculation (Weighted Average) ---
    const finalScore = 
        (profitabilityScore * 0.4) + 
        (serviceStrainScore * 0.2) + 
        (renewalRiskScore * 0.4);

    return {
        score: Math.round(finalScore),
        profitability: avgProfitability,
        serviceStrain: serviceStrain,
        renewalStatus: {
            atRiskCount,
            status: atRiskCount > 0 ? 'At Risk' : 'Healthy',
        },
        growthOpportunity: growthOpportunityValue,
    };
};
