
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Persona {
    id: string;
    name: string;
    role: string;
    icon: string;
    color: string;
    defaultView: string;
    visibleViews: string[];
    contractsDefaultSub: string;
    floSystemPrompt: string;
}

const FORMAT_RULES = `
CRITICAL FORMAT RULES: 
1. Start each line with the arrow character →
2. Maximum 3 lines
3. No markdown (no **, no ##, no bullets)
4. No greeting — the UI handles the greeting separately
5. Each line should be one fact + one number, under 80 characters
`;

export const PERSONAS: Record<string, Persona> = {
    service: {
        id: 'service',
        name: 'Practice Owner',
        role: 'Caseload, compliance & revenue',
        icon: '👨‍⚕️',
        color: 'bg-sky-500',
        defaultView: 'dashboard',
        visibleViews: ['dashboard', 'matters', 'documents', 'reviews', 'research', 'comms', 'calendar', 'settings'],
        contractsDefaultSub: 'dashboard',
        floSystemPrompt: `You are Flo, the AI compliance assistant for a practice owner. Focus on unbilled sessions, compliance actions, and caseload health. Use 'at-risk cases' instead of 'churn'. ${FORMAT_RULES}`
    },
    sales: {
        id: 'sales',
        name: 'Office Manager',
        role: 'Intake, billing & scheduling',
        icon: '📋',
        color: 'bg-green-500',
        defaultView: 'research',
        visibleViews: ['dashboard', 'matters', 'documents', 'reviews', 'research', 'comms', 'calendar', 'settings'],
        contractsDefaultSub: 'ops',
        floSystemPrompt: `You are Flo, the AI compliance assistant for an office manager. Focus on intake pipeline, billing status, and scheduling. Use 'at-risk cases' instead of 'churn'. ${FORMAT_RULES}`
    },
    admin: {
        id: 'admin',
        name: 'Administrator',
        role: 'Full platform access',
        icon: '⚙️',
        color: 'bg-slate-500',
        defaultView: 'dashboard',
        visibleViews: ['dashboard', 'matters', 'documents', 'reviews', 'research', 'comms', 'calendar', 'settings'],
        contractsDefaultSub: 'dashboard',
        floSystemPrompt: `You are Flo, the AI compliance assistant for a practice administrator. Provide a comprehensive overview of caseload, compliance, and revenue. Use 'at-risk cases' instead of 'churn'. ${FORMAT_RULES}`
    }
};

interface PersonaContextType {
    persona: Persona;
    setPersonaId: (id: string) => void;
}

const PersonaContext = createContext<PersonaContextType>({
    persona: PERSONAS.service,
    setPersonaId: () => {}
});

export const usePersona = () => useContext(PersonaContext);

export const PersonaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [personaId, setPersonaId] = useState<string>(() => {
        return localStorage.getItem('flowview-persona') || 'service';
    });

    useEffect(() => {
        localStorage.setItem('flowview-persona', personaId);
    }, [personaId]);

    const persona = PERSONAS[personaId] || PERSONAS.service;

    return (
        <PersonaContext.Provider value={{ persona, setPersonaId }}>
            {children}
        </PersonaContext.Provider>
    );
};
