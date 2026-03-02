
import React, { useState, useRef, DragEvent, useMemo } from 'react';
import { CloseIcon, SparklesIcon, ArrowUpTrayIcon, DocumentMagnifyingGlassIcon, LinkIcon, GoogleDriveIcon, SharepointIcon, BoxIcon, CheckBadgeIcon } from './ui/Icons';
import { useToast } from '../contexts/ToastContext';
import { AuditTrailData } from '../types';

interface DoKrunchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onShowToast: (message: string) => void;
    onOpenAuditTrail: (data: AuditTrailData) => void;
    onShowOpportunityAlert: (message: string, view: 'sales-pipeline' | 'renewit-ops') => void;
}

type CrunchState = 'idle' | 'crunching' | 'crunched' | 'error';
interface UploadedFile {
    name: string;
    type: 'pdf' | 'image' | 'doc';
    size: string;
    clientName: string;
}

const ProgressBar: React.FC = () => (
    <div className="w-full h-1.5 bg-primary/20 rounded-full mx-auto mt-2 overflow-hidden">
        <div className="w-full h-full bg-primary animate-pulse-fast"></div>
    </div>
);

export const DoKrunchModal: React.FC<DoKrunchModalProps> = ({ isOpen, onClose, onShowToast, onOpenAuditTrail, onShowOpportunityAlert }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [crunchState, setCrunchState] = useState<CrunchState>('idle');
    const [file, setFile] = useState<UploadedFile | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const closeModal = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            onClose();
            setIsAnimatingOut(false);
            setFile(null);
            setCrunchState('idle');
        }, 300);
    };

    const handleFileSelect = (selectedFile: File) => {
        setCrunchState('idle');
        const fileType = selectedFile.name.split('.').pop()?.toLowerCase();
        setFile({
            name: selectedFile.name,
            type: fileType === 'pdf' ? 'pdf' : 'image',
            size: `${(selectedFile.size / 1024).toFixed(1)} KB`,
            clientName: "Global Corp"
        });
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };
    
    const handleCrunch = () => {
        if (!file) return;
        setCrunchState('crunching');
        setTimeout(() => {
            setCrunchState('crunched');
            onShowToast("Document processed successfully!");
        }, 2000);
    };
    
    const handleTeardown = () => {
        if (!file) return;
        onShowToast("Data linked to Sales Pipeline!");
        onShowOpportunityAlert(`New SOW detected for ${file.clientName}. Flagged for potential 10-20% upsell. Review now?`, 'sales-pipeline');
        closeModal();
    };
    
    const handleAutoIntake = (source: string) => {
        onShowToast(`Simulating auto-intake from ${source}...`);
        setTimeout(() => {
            setFile({ name: 'New_SOW_ACME.pdf', type: 'pdf', size: '78.4 KB', clientName: 'ACME Corp' });
            onShowToast(`${source} sync complete!`);
        }, 1500);
    };

    const auditData: AuditTrailData | null = useMemo(() => {
        if (!file) return null;
        return {
            documentName: file.name,
            documentType: file.type === 'pdf' ? 'SOW' : 'Receipt',
            c2pa: {
                timestamp: new Date().toISOString(),
                hash: '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join(''),
                issuer: 'FlowCapture AI Engine'
            }
        };
    }, [file]);

    if (!isOpen) return null;

    const dropzoneClasses = `bg-component-lighter p-6 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-colors duration-300 min-h-[160px] ${isDragOver ? 'border-accent bg-primary/10' : 'border-border'}`;

    return (
        <div ref={modalRef} className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={closeModal}>
            <div
                onClick={e => e.stopPropagation()}
                className={`bg-component rounded-2xl shadow-2xl w-full max-w-xl transform flex flex-col border border-border ${isAnimatingOut ? 'animate-fade-out-scale' : 'animate-fade-in-scale'}`}
            >
                <header className="p-5 border-b border-border flex justify-between items-center">
                    <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-primary"/> FlowCapture Document Center
                    </h3>
                    <button onClick={closeModal} className="text-text-secondary hover:text-text-primary"><CloseIcon className="w-6 h-6" /></button>
                </header>

                <div className="p-6 space-y-4">
                    <div 
                        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }} 
                        onDragLeave={() => setIsDragOver(false)} 
                        onDrop={handleDrop} 
                        className={dropzoneClasses}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])} className="hidden" accept="application/pdf,image/*" />
                        <ArrowUpTrayIcon className="w-10 h-10 text-text-secondary mb-2" />
                        <p className="font-semibold text-text-primary">Drag & Drop Document Here</p>
                        <p className="text-sm text-text-secondary">or click to browse</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-xs text-text-secondary whitespace-nowrap">Auto-Intake from:</span>
                        <div className="w-full border-t border-border"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => handleAutoIntake('Sharepoint')} className="flex items-center justify-center gap-2 text-sm bg-component-light hover:bg-border text-text-secondary font-semibold py-2 px-3 rounded-lg transition border border-border"><SharepointIcon className="w-5 h-5"/> Sharepoint</button>
                        <button onClick={() => handleAutoIntake('Google Drive')} className="flex items-center justify-center gap-2 text-sm bg-component-light hover:bg-border text-text-secondary font-semibold py-2 px-3 rounded-lg transition border border-border"><GoogleDriveIcon className="w-5 h-5"/> Google Drive</button>
                        <button onClick={() => handleAutoIntake('Box')} className="flex items-center justify-center gap-2 text-sm bg-component-light hover:bg-border text-text-secondary font-semibold py-2 px-3 rounded-lg transition border border-border"><BoxIcon className="w-5 h-5"/> Box</button>
                    </div>

                    {file && (
                        <div className="bg-background p-3 rounded-lg border border-border animate-fade-in">
                            <h4 className="font-semibold text-text-primary">Ready to Process:</h4>
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium">{file.name}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-text-secondary">{file.size}</span>
                                    {crunchState === 'crunched' && auditData && (
                                        <button onClick={() => onOpenAuditTrail(auditData)} title="C2PA Verified">
                                            <CheckBadgeIcon className="w-5 h-5 text-success" />
                                        </button>
                                    )}
                                </div>
                            </div>
                            {crunchState === 'crunching' && <ProgressBar />}
                        </div>
                    )}
                </div>

                <footer className="p-4 border-t border-border bg-component-light flex items-center justify-end gap-3 rounded-b-2xl">
                    <button onClick={handleCrunch} disabled={!file || crunchState === 'crunching'} className="flex-1 flex items-center justify-center gap-2 bg-component hover:bg-border text-text-secondary font-bold py-2 px-3 rounded-lg transition border border-border disabled:opacity-50">
                        <DocumentMagnifyingGlassIcon className="w-5 h-5"/> Process Document
                    </button>
                    <button onClick={handleTeardown} disabled={crunchState !== 'crunched'} className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-bold py-2 px-3 rounded-lg transition hover:bg-accent disabled:opacity-50">
                        <LinkIcon className="w-5 h-5"/> Teardown & Link
                    </button>
                </footer>
            </div>
        </div>
    );
};
