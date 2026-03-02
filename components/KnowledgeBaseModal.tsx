
import React, { useState, useRef, useEffect } from 'react';
import { CloseIcon, ServerStackIcon } from './ui/Icons';

interface KnowledgeBaseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onShowToast: (message: string) => void;
}

export const KnowledgeBaseModal: React.FC<KnowledgeBaseModalProps> = ({ isOpen, onClose, onShowToast }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [companyProfile, setCompanyProfile] = useState("FlowOrchestrator Solutions is a forward-thinking technology provider transitioning from a traditional hardware reseller to a 'Digital Workforce' provider. We leverage the WestFlow platform to deliver high-margin, recurring revenue services (AI Agents) to our clients in the government and non-profit sectors.");
    const [companyOkrs, setCompanyOkrs] = useState("Q3 Goal: Reduce 'Revenue at Risk' by 15% using predictive renewal alerts.\nQ3 Goal: Increase adoption of 'Katie' (Service Agent) to improve First-Call Resolution by 10%.\nKey Initiative: Upsell 'Aiva' (HR Agent) to 5 existing copier clients.");
    const [isSyncingQb, setIsSyncingQb] = useState(false);
    const [isSyncingQw, setIsSyncingQw] = useState(false);

    const closeModal = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            onClose();
            setIsAnimatingOut(false);
        }, 300);
    };

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeModal();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const handleSync = (syncType: 'qb' | 'qw') => {
        const setter = syncType === 'qb' ? setIsSyncingQb : setIsSyncingQw;
        const sourceName = syncType === 'qb' ? 'QuickBooks' : 'QuoteWerks';
        
        setter(true);
        setTimeout(() => {
            setter(false);
            onShowToast(`Knowledge Hub synced with ${sourceName} data!`);
        }, 2500);
    }
    
    if (!isOpen) return null;

    return (
        <div ref={modalRef} className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={e => e.target === modalRef.current && closeModal()}>
            <div className={`bg-component rounded-xl shadow-2xl w-full max-w-2xl transform flex flex-col border border-border-color ${isAnimatingOut ? 'animate-fade-out-scale' : 'animate-fade-in-scale'}`}>
                <div className="flex justify-between items-center p-5 border-b border-border-color">
                    <h3 className="text-xl font-bold text-text-primary flex items-center gap-2"><ServerStackIcon className="w-6 h-6 text-primary"/> Knowledge Hub</h3>
                    <button onClick={closeModal} className="text-text-secondary hover:text-text-primary"><CloseIcon className="w-6 h-6" /></button>
                </div>

                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                    <div>
                        <h4 className="font-semibold text-text-primary mb-2">Company Profile</h4>
                        <p className="text-sm text-text-secondary mb-2">This summary is added to the AI's system prompt to provide core business context for every query.</p>
                        <textarea 
                            value={companyProfile}
                            onChange={e => setCompanyProfile(e.target.value)}
                            className="w-full p-3 border rounded-lg h-24 focus:ring-2 focus:ring-accent focus:outline-none bg-background border-border-color text-text-primary"
                            placeholder="Describe your company's mission, primary services, and target customers..."
                        />
                    </div>

                     <div>
                        <h4 className="font-semibold text-text-primary mb-2">Company Goals & OKRs</h4>
                        <p className="text-sm text-text-secondary mb-2">Provide strategic goals to align the AI's analysis and recommendations.</p>
                        <textarea 
                            value={companyOkrs}
                            onChange={e => setCompanyOkrs(e.target.value)}
                            className="w-full p-3 border rounded-lg h-24 focus:ring-2 focus:ring-accent focus:outline-none bg-background border-border-color text-text-primary font-mono text-xs"
                            placeholder="e.g., Q3 Goal: Increase recurring revenue by 15%."
                        />
                    </div>

                    <div>
                        <h4 className="font-semibold text-text-primary mb-2">Data Source Sync</h4>
                        <p className="text-sm text-text-secondary mb-3">Sync data from external systems to enrich the AI's "digital thread" knowledge base for more accurate analysis. (This is a simulation).</p>
                        <div className="space-y-3">
                             <button onClick={() => handleSync('qw')} disabled={isSyncingQw} className="w-full flex items-center justify-between p-4 bg-component-lighter rounded-lg border border-border-color hover:bg-border-color transition disabled:opacity-70">
                                <div className="flex items-center gap-3">
                                    <img src="https://www.quotewerks.com/favicon.ico" alt="QuoteWerks Logo" className="w-6 h-6" />
                                    <span className="font-semibold">Sync with QuoteWerks</span>
                                </div>
                                {isSyncingQw ? <div className="flex items-center gap-2 text-sm text-primary"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>Syncing...</div> : <span className="text-sm text-text-secondary">Opportunities & Quotes</span>}
                            </button>
                             <button onClick={() => handleSync('qb')} disabled={isSyncingQb} className="w-full flex items-center justify-between p-4 bg-component-lighter rounded-lg border border-border-color hover:bg-border-color transition disabled:opacity-70">
                                <div className="flex items-center gap-3">
                                    <img src="https://www.intuit.com/etc.clientlibs/intuit/clientlibs/clientlib-base/resources/images/favicons/quickbooks/favicon.ico" alt="QuickBooks Logo" className="w-6 h-6" />
                                    <span className="font-semibold">Sync with QuickBooks</span>
                                </div>
                                {isSyncingQb ? <div className="flex items-center gap-2 text-sm text-primary"><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>Syncing...</div> : <span className="text-sm text-text-secondary">Invoices & Expenses</span>}
                            </button>
                        </div>
                    </div>
                </div>

                 <div className="flex items-center justify-end gap-3 p-4 border-t border-border-color bg-component-lighter rounded-b-xl">
                    <button onClick={closeModal} className="bg-component text-text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-border-color transition border border-border-color">
                        Cancel
                    </button>
                    <button onClick={() => { onShowToast("Knowledge Hub updated!"); closeModal(); }} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-accent transition flex items-center gap-2">
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};
