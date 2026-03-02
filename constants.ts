// Derived data has been moved to a dynamic processor in `data/dataProcessor.ts`
// This file now only holds static constant definitions.

// Example prompts for the AI Analyst chat interface
export const PROMPT_CARDS = [
    { title: 'Compliance At Risk', description: 'Analyze current compliance risks.', prompt: "What's my compliance at risk this month?" },
    { title: 'Case Status', description: 'Identify cases that require attention.', prompt: "Which cases need attention?" },
    { title: 'Top Providers', description: 'Get a list of high-achieving providers.', prompt: "Show me my top providers" },
    { title: 'Latest Trends', description: 'Discover important trends in your caseload.', prompt: "What trends should I know about?" }
];