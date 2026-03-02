import React, { useState, useEffect, useMemo } from 'react';
import { foundationalData } from '../data/digital-thread-data';
import { CommandPaletteItem } from '../types';
import { SparklesIcon, UserGroupIcon } from './ui/Icons';

export const suggestions: Record<string, string[]> = {
    'dashboard': [
        "Show me a breakdown of all team expenses by category.",
        "Which contracts are currently at risk?",
        "Show me the latest travel check-ins.",
        "Give me an overview of all active projects."
    ],
    'research': [
        "Analyze the profitability of contracts for this client.",
        "Summarize the recent service tickets.",
        "Which contracts are renewing soon?",
        "What are the open sales opportunities?"
    ],
    'reviews': [
        "Analyze the current sales pipeline composition.",
        "What factors contribute to our win rate?",
        "Which line of business has the highest average deal size?",
        "List all opportunities forecasted to close in the next 30 days."
    ],
    'matters': [
        "Summarize the profitability of all active contracts.",
        "Show me contracts expiring in the next 90 days.",
        "Identify co-termination opportunities."
    ],
    'comms': [
        "Who has the highest billable utilization?",
        "Show me the travel history for the team.",
        "Generate a performance review for [Employee Name]."
    ],
    'settings': [
        "Analyze ROI trends for the last quarter.",
        "Break down expenses by category.",
        "Identify areas for cost reduction."
    ],
    'calendar': [
        "Check battery status of all robots.",
        "Send Tony Pi to the charging station."
    ],
    'documents': [
        "Search the secure evidence repository.",
        "Review C2PA signed certificates.",
        "View recent document ingest logs."
    ]
};

interface CommandPaletteProps {
    onClose: () => void;
    query: string;
    setQuery: (query: string) => void;
    onOpenAiCommandCenter: (query: string) => void;
    onSelectEntity: (entity: { type: string, id: string }) => void;
    currentView: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ onClose, query, setQuery, onOpenAiCommandCenter, onSelectEntity, currentView }) => {
    const [activeIndex, setActiveIndex] = useState(0);

    const filteredItems = useMemo((): CommandPaletteItem[] => {
        const lowerCaseQuery = query.toLowerCase();
        
        if (query.startsWith('>')) {
            const aiQuery = query.substring(1).trim().toLowerCase();
            const relevantPrompts = suggestions[currentView] || suggestions['dashboard'];
            return relevantPrompts
                .filter(prompt => prompt.toLowerCase().includes(aiQuery))
                .map(prompt => ({
                    type: 'ai_command',
                    id: prompt,
                    label: prompt,
                    description: `Ask AI about ${currentView.replace(/-/g, ' ')}`,
                }));
        }

        const matchesQuery = (text: string) => text.toLowerCase().includes(lowerCaseQuery);

        if (query.length > 0) {
            const results: CommandPaletteItem[] = [];

            // Add Vault search
            if (matchesQuery("vault") || matchesQuery("repository") || matchesQuery("files")) {
                results.push({
                    type: 'ai_command',
                    id: 'nav-vault',
                    label: 'Go to Vault Repository',
                    description: 'Open secure storage for evidence and certificates'
                });
            }

            // Add Client search
            const clients = foundationalData.customers
                .filter(client => matchesQuery(client.name))
                .map(client => ({
                    type: 'client',
                    id: client.id,
                    label: client.name,
                    description: `Go to ${client.name}'s 360° view`,
                }));
            
            return [...results, ...clients as CommandPaletteItem[]];
        }
        
        // Show default suggestions if query is empty
        return (suggestions[currentView] || suggestions['dashboard']).slice(0, 4).map(prompt => ({
            type: 'ai_command',
            id: prompt,
            label: prompt,
            description: `Ask AI about ${currentView.replace(/-/g, ' ')}`,
        }));

    }, [query, currentView]);
    
    useEffect(() => {
        setActiveIndex(0);
    }, [query]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIndex(prev => (prev + 1) % filteredItems.length);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIndex(prev => (prev - 1 + filteredItems.length) % filteredItems.length);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const item = filteredItems[activeIndex];
                if (item) handleSelect(item);
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [filteredItems, activeIndex]);

    const handleSelect = (item: CommandPaletteItem) => {
        if (item.id === 'nav-vault') {
            onOpenAiCommandCenter('vault'); // This is caught by the navigation handler in App.tsx
        } else if (item.type === 'ai_command') {
            onOpenAiCommandCenter(item.label);
        } else if (item.type === 'client') {
            onSelectEntity({ type: 'client', id: item.id });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div
                className="fixed top-1/4 left-1/2 -translate-x-1/2 w-full max-w-lg bg-component rounded-xl shadow-2xl border border-border"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-2">
                    <input
                        autoFocus
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search clients, ask AI, or go to 'Vault'..."
                        className="w-full bg-transparent p-2 text-lg outline-none text-text-primary"
                    />
                </div>
                <div className="border-t border-border max-h-80 overflow-y-auto">
                    {filteredItems.length > 0 ? (
                        <ul>
                            {filteredItems.map((item, index) => (
                                <li key={item.id}
                                    onMouseEnter={() => setActiveIndex(index)}
                                    onClick={() => handleSelect(item)}
                                    className={`flex items-center gap-3 p-3 cursor-pointer ${index === activeIndex ? 'bg-primary/10 text-primary' : 'text-text-primary'}`}
                                >
                                    {item.type === 'client' ? <UserGroupIcon className="w-5 h-5 flex-shrink-0" /> : <SparklesIcon className="w-5 h-5 flex-shrink-0" />}
                                    <div>
                                        <p className="font-semibold">{item.label}</p>
                                        {item.description && <p className={`text-xs ${index === activeIndex ? 'text-primary/80' : 'text-text-secondary'}`}>{item.description}</p>}
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="p-6 text-center text-text-secondary">No results found.</p>
                    )}
                </div>
                 <div className="text-xs text-text-secondary p-2 border-t border-border bg-component-light rounded-b-xl">
                    <strong>Tip:</strong> Type `&gt;` to filter for AI commands or search "Vault" to go to repository.
                </div>
            </div>
        </div>
    );
};