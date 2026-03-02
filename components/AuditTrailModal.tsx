
import React, { useRef, useState, useEffect } from 'react';
import { CloseIcon, ShieldIcon, CheckBadgeIcon, FingerPrintIcon } from './ui/Icons';
import { AuditTrailData } from '../types';

interface AuditTrailModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: AuditTrailData | null;
}

const InfoRow: React.FC<{ label: string; value: string; isHash?: boolean }> = ({ label, value, isHash = false }) => (
    <div className="flex justify-between items-center py-2 border-b border-border">
        <span className="font-semibold text-text-secondary text-sm">{label}</span>
        <span className={`font-mono text-xs text-text-primary ${isHash ? 'truncate max-w-[200px]' : ''}`} title={value}>{value}</span>
    </div>
);

export const AuditTrailModal: React.FC<AuditTrailModalProps> = ({ isOpen, onClose, data }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [activeTab, setActiveTab] = useState<'summary' | 'manifest'>('summary');

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

    if (!isOpen || !data) return null;

    return (
        <div ref={modalRef} className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[60] backdrop-blur-sm" onClick={closeModal}>
            <div
                onClick={e => e.stopPropagation()}
                className={`bg-component rounded-2xl shadow-2xl w-full max-w-lg transform flex flex-col border border-border ${isAnimatingOut ? 'animate-fade-out-scale' : 'animate-fade-in-scale'}`}
            >
                <header className="p-5 border-b border-border flex justify-between items-center">
                    <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                        <ShieldIcon className="w-6 h-6 text-primary"/> 
                        C2PA Provenance
                    </h3>
                    <button onClick={closeModal} className="text-text-secondary hover:text-text-primary"><CloseIcon className="w-6 h-6" /></button>
                </header>
                
                {/* Tabs */}
                <div className="flex border-b border-border">
                    <button 
                        className={`flex-1 py-2 text-sm font-semibold ${activeTab === 'summary' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}
                        onClick={() => setActiveTab('summary')}
                    >
                        Summary
                    </button>
                    <button 
                        className={`flex-1 py-2 text-sm font-semibold ${activeTab === 'manifest' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}
                        onClick={() => setActiveTab('manifest')}
                    >
                        Manifest Data (JUMBF)
                    </button>
                </div>

                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    {activeTab === 'summary' ? (
                        <>
                            <div className="bg-background p-4 rounded-lg border border-border">
                                <h4 className="font-semibold text-text-primary mb-2">Asset Details</h4>
                                <InfoRow label="Name" value={data.documentName} />
                                <InfoRow label="Type" value={data.documentType} />
                            </div>
                             <div className="bg-background p-4 rounded-lg border border-border">
                                <h4 className="font-semibold text-text-primary mb-2">Cryptographic Seal</h4>
                                <InfoRow label="Timestamp" value={new Date(data.c2pa.timestamp).toLocaleString()} />
                                <InfoRow label="Asset Hash" value={data.c2pa.hash} isHash />
                                <InfoRow label="Signer" value={data.c2pa.issuer} />
                            </div>
                            <div className="flex items-center gap-3 p-3 rounded-md bg-success/10 text-success border border-success/20">
                                <CheckBadgeIcon className="w-6 h-6 flex-shrink-0" />
                                <div>
                                    <strong className="block">Authenticity Verified</strong>
                                    <span className="text-xs opacity-90">This asset has not been tampered with since signing.</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-xs text-text-secondary">
                                This represents the decoded JSON structure from the C2PA manifest store (JUMBF box).
                            </p>
                            {data.c2pa.manifest ? (
                                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-xs font-mono overflow-x-auto">
                                    {JSON.stringify(data.c2pa.manifest, null, 2)}
                                </pre>
                            ) : (
                                <div className="text-center p-8 text-text-secondary italic">
                                    No extended manifest data available.
                                </div>
                            )}
                        </div>
                    )}
                </div>

                 <footer className="p-4 border-t border-border bg-component-light flex items-center justify-between rounded-b-2xl">
                    <div className="flex items-center gap-1 text-xs text-text-secondary">
                        <FingerPrintIcon className="w-4 h-4" />
                        <span>Powered by FlowHub Trust Engine</span>
                    </div>
                    <button onClick={closeModal} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-accent">
                        Close
                    </button>
                 </footer>

            </div>
        </div>
    );
};
