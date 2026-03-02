import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { getQuickSuggestion } from '../../services/geminiService';
import { SparklesIcon, MailIcon, CloseIcon } from './Icons';
import { Employee } from '../../types';

interface AiHoverTooltipProps {
    prompt?: string;
    targetPosition?: { top: number; left: number };
    onClose?: () => void;
    mode?: 'static' | 'dynamic';
    staticContent?: string;
    icon?: React.ReactNode;
    onClick?: () => void; // CHECKPOINT: onClick prop added for interactivity.
}

export const AiHoverTooltip: React.FC<AiHoverTooltipProps> = ({ prompt, targetPosition, onClose, mode = 'dynamic', staticContent, icon, onClick }) => {
    const [suggestion, setSuggestion] = useState('');
    const [isLoading, setIsLoading] = useState(mode === 'dynamic');
    const tooltipRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (mode === 'dynamic' && prompt) {
            let isMounted = true;
            setIsLoading(true);
            getQuickSuggestion(prompt)
                .then(result => {
                    if (isMounted) {
                        setSuggestion(result);
                    }
                })
                .catch(err => {
                    console.error("Failed to get AI suggestion:", err);
                    if (isMounted) {
                        setSuggestion("Could not load suggestion.");
                    }
                })
                .finally(() => {
                    if (isMounted) {
                        setIsLoading(false);
                    }
                });
            return () => { isMounted = false; };
        }
    }, [prompt, mode]);

    if (mode === 'static') {
        return (
            <button onClick={onClick} className="relative group p-1.5 rounded-full hover:bg-danger/10 transition-colors">
                {icon}
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-max max-w-xs bg-component text-text-primary text-xs rounded-md shadow-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-border">
                    {staticContent}
                </div>
            </button>
        );
    }

    if (!targetPosition) return null;

    const tooltipStyle: React.CSSProperties = {
        position: 'fixed',
        top: targetPosition.top,
        left: targetPosition.left,
        transform: 'translate(-50%, -110%)',
        zIndex: 50,
    };

    return createPortal(
        <div ref={tooltipRef} style={tooltipStyle} className="w-64 bg-component rounded-lg shadow-xl border border-border p-3 animate-fade-in-scale">
            {isLoading ? (
                <div className="flex items-center text-sm text-text-secondary">
                    <SparklesIcon className="w-4 h-4 mr-2 animate-pulse text-primary"/>
                    <span>AI is thinking...</span>
                </div>
            ) : (
                <p className="text-sm text-text-primary">{suggestion}</p>
            )}
        </div>,
        document.body
    );
};


// CHECKPOINT: New, self-contained modal component for displaying fraud alerts.
// It can be imported and used wherever an actionable alert is needed.
export const FraudAlertModal: React.FC<{ employee: Employee; onClose: () => void }> = ({ employee, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[60] backdrop-blur-sm" onClick={onClose}>
            <div
                onClick={e => e.stopPropagation()}
                className={`bg-component rounded-2xl shadow-2xl w-full max-w-lg transform flex flex-col border border-danger animate-fade-in-scale`}
            >
                <header className="p-5 border-b border-border flex justify-between items-center">
                    <h3 className="text-xl font-bold text-danger flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6"/> AI Fraud Alert
                    </h3>
                    <button onClick={onClose} className="text-text-secondary hover:text-text-primary"><CloseIcon className="w-6 h-6" /></button>
                </header>
                <div className="p-6 space-y-4">
                    <p className="text-text-secondary">AI has flagged a high expense claim for <strong className="text-text-primary">{employee.name}</strong> that requires your review.</p>
                    <div className="bg-background p-4 rounded-lg border border-border">
                        <div className="flex justify-between py-2 border-b border-border">
                            <span className="font-semibold text-text-secondary">Employee:</span>
                            <span className="font-medium text-text-primary">{employee.name}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-border">
                            <span className="font-semibold text-text-secondary">Total Expenses Claimed:</span>
                            <span className="font-medium text-danger">${employee.expenses.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-2">
                            <span className="font-semibold text-text-secondary">AI Flag Reason:</span>
                            <span className="font-medium text-text-primary text-right">{employee.aiFlag}</span>
                        </div>
                    </div>
                     <p className="text-xs text-text-secondary">This alert is generated when an employee's expenses are significantly higher than the team average. Please verify the receipts and approve or deny the claim in your expense management system.</p>
                </div>
                 <footer className="p-4 border-t border-border bg-component-light flex items-center justify-end gap-3 rounded-b-2xl">
                    <button onClick={onClose} className="bg-component text-text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-border border border-border">Dismiss</button>
                    <button onClick={() => { onClose(); }} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-accent flex items-center gap-2">
                        <MailIcon className="w-5 h-5"/> Notify Finance
                    </button>
                 </footer>
            </div>
        </div>
    );
};
