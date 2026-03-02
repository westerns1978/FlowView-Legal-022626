import React, { useState, useRef, useEffect } from 'react';
import { CloseIcon, ShieldCheckIcon, IValtLogo, CheckCircleIcon, SparklesIcon, FileTextIcon } from './ui/Icons';
import { AuditTrailData } from '../types';
import html2canvas from 'html2canvas';

interface TrustSendModalProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenAuditTrail: (data: AuditTrailData) => void;
}

type SendState = 'preview' | 'authenticating' | 'sending' | 'success' | 'error';
type ProgressStep = 'C2PA' | 'Transmission' | 'Blockchain' | 'Done';

const C2PABadge: React.FC = () => (
    <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-md flex items-center gap-1.5 text-xs border border-trust-c2pa/50 shadow-lg">
        <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-trust-c2pa opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-trust-c2pa"></span>
        </div>
        C2PA Verified
    </div>
);


const ProgressIndicator: React.FC<{ text: string, status: 'pending' | 'active' | 'complete' }> = ({ text, status }) => {
    return (
        <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                status === 'active' ? 'border-primary animate-spin' : 
                status === 'complete' ? 'border-success bg-success' : 'border-border'
            }`}>
                {status === 'complete' && <CheckCircleIcon className="w-4 h-4 text-white" />}
            </div>
            <span className={`font-semibold ${
                 status === 'active' ? 'text-primary' : 
                 status === 'complete' ? 'text-text-primary' : 'text-text-secondary'
            }`}>{text}</span>
        </div>
    );
};

const TrustSendModal: React.FC<TrustSendModalProps> = ({ isOpen, onClose, onOpenAuditTrail }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [sendState, setSendState] = useState<SendState>('preview');
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [isHipaa, setIsHipaa] = useState(true);
    const [recipient, setRecipient] = useState('');
    const [activeStep, setActiveStep] = useState<ProgressStep | null>(null);
    const [transactionHash, setTransactionHash] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Reset state on open
            setSendState('preview');
            setRecipient('');
            setIsHipaa(true);
            setActiveStep(null);
            setTransactionHash('');

            // Capture the dashboard screenshot after a short delay for rendering
            setTimeout(() => {
                const element = document.querySelector<HTMLElement>('#root > div'); // Capture the main app container
                if (element) {
                    html2canvas(element, { 
                        useCORS: true, 
                        backgroundColor: document.documentElement.classList.contains('dark') ? '#030712' : '#F9FAFB',
                        ignoreElements: (el) => el.classList.contains('z-30') || el.classList.contains('z-50') // Ignore self and command bar
                    }).then(canvas => {
                        setPreviewImage(canvas.toDataURL('image/png'));
                    });
                }
            }, 100);
        }
    }, [isOpen]);

    const closeModal = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            onClose();
            setIsAnimatingOut(false);
        }, 300);
    };

    const handleSend = () => {
        setSendState('authenticating');
        setTimeout(() => { // Simulate iVALT MFA
            setSendState('sending');
            setActiveStep('C2PA');
            setTimeout(() => { // Simulate C2PA
                setActiveStep('Transmission');
                setTimeout(() => { // Simulate Secure Send
                    setActiveStep('Blockchain');
                    const hash = '0x' + [...Array(64)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
                    setTransactionHash(hash);
                    setTimeout(() => { // Simulate Blockchain log
                        setActiveStep('Done');
                        setSendState('success');
                    }, 1000);
                }, 1500);
            }, 1500);
        }, 2000);
    };

    const handleViewAuditTrail = () => {
        const auditData: AuditTrailData = {
            documentName: 'Dashboard Snapshot',
            documentType: 'Secure Transmission',
            c2pa: {
                timestamp: new Date().toISOString(),
                hash: transactionHash,
                issuer: 'Barlea Blockchain (simulated)'
            }
        };
        onOpenAuditTrail(auditData);
        closeModal();
    };

    const renderContent = () => {
        switch (sendState) {
            case 'authenticating':
                return (
                    <div className="text-center p-8 space-y-4">
                        <IValtLogo className="w-16 h-16 mx-auto animate-pulse" />
                        <h3 className="text-xl font-bold text-text-primary">iVALT Authentication</h3>
                        <p className="text-text-secondary">Please check your mobile device to approve the sign-in request.</p>
                    </div>
                );
            case 'sending':
                return (
                     <div className="p-8 space-y-4">
                        <h3 className="text-xl font-bold text-center text-text-primary">Sending Securely...</h3>
                        <ProgressIndicator text="Verifying authenticity (C2PA)" status={activeStep === 'C2PA' ? 'active' : 'complete'} />
                        <ProgressIndicator text="Encrypting and transmitting" status={activeStep === 'Transmission' ? 'active' : activeStep === 'Blockchain' || activeStep === 'Done' ? 'complete' : 'pending'} />
                        <ProgressIndicator text="Logging to Barlea blockchain" status={activeStep === 'Blockchain' ? 'active' : activeStep === 'Done' ? 'complete' : 'pending'} />
                    </div>
                );
            case 'success':
                 return (
                     <div className="text-center p-8 space-y-4">
                        <CheckCircleIcon className="w-16 h-16 mx-auto text-success" />
                        <h3 className="text-xl font-bold text-text-primary">Document Sent Successfully!</h3>
                        <p className="text-text-secondary">An immutable record of this transmission has been logged to the blockchain.</p>
                        <div className="bg-background p-2 rounded-md border border-border text-xs font-mono text-primary truncate">{transactionHash}</div>
                    </div>
                 );
            case 'preview':
            default:
                return (
                    <div className="p-6 space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-text-primary">Recipient</label>
                            <input value={recipient} onChange={e => setRecipient(e.target.value)} type="email" placeholder="Enter recipient's email or fax number" className="mt-1 w-full p-3 border rounded-lg focus:ring-2 focus:ring-accent focus:outline-none bg-background border-border-color text-text-primary" />
                        </div>
                        <div>
                            <label className="text-sm font-semibold text-text-primary">Document Preview</label>
                            <div className="mt-1 bg-background p-2 rounded-lg border border-border relative">
                                {previewImage ? (
                                    <>
                                        <img src={previewImage} alt="Dashboard Preview" className="rounded-md w-full h-auto object-cover max-h-32"/>
                                        <C2PABadge />
                                    </>
                                 ) : <div className="h-32 flex items-center justify-center text-text-secondary">Capturing dashboard...</div>}
                            </div>
                        </div>
                        <label htmlFor="hipaa-toggle" className="flex items-center justify-between p-3 bg-component-light rounded-lg border border-border-color cursor-pointer">
                            <div className="flex items-center gap-3">
                                <ShieldCheckIcon className="w-6 h-6 text-primary" />
                                <span className="font-semibold text-text-primary">Encrypt for HIPAA Compliance</span>
                            </div>
                            <div className="relative">
                                <input type="checkbox" id="hipaa-toggle" className="sr-only" checked={isHipaa} onChange={() => setIsHipaa(!isHipaa)} />
                                <div className={`block w-10 h-6 rounded-full transition-colors ${isHipaa ? 'bg-primary' : 'bg-border'}`}></div>
                                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition flex items-center justify-center ${isHipaa ? 'transform translate-x-full' : ''}`}>
                                     {isHipaa && <ShieldCheckIcon className="w-3 h-3 text-primary" />}
                                </div>
                            </div>
                        </label>
                    </div>
                );
        }
    };
    
    const renderFooter = () => {
        switch (sendState) {
            case 'success':
                 return (
                    <>
                        <button onClick={closeModal} className="bg-component text-text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-border-color border border-border-color">Close</button>
                        <button onClick={handleViewAuditTrail} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-accent">View on Blockchain</button>
                    </>
                 );
            case 'preview':
                return (
                     <>
                        <button onClick={closeModal} className="bg-component text-text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-border-color border border-border-color">Cancel</button>
                        <button onClick={handleSend} disabled={!recipient || !previewImage} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-accent disabled:opacity-50">Authenticate & Send</button>
                    </>
                );
            default:
                return null;
        }
    }

    if (!isOpen) return null;

    return (
        <div ref={modalRef} className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={closeModal}>
            <div
                onClick={e => e.stopPropagation()}
                className={`bg-component rounded-2xl shadow-2xl w-full max-w-lg transform flex flex-col border border-border ${isAnimatingOut ? 'animate-fade-out-scale' : 'animate-fade-in-scale'}`}
            >
                <header className="p-5 border-b border-border flex justify-between items-center">
                    <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-primary"/> TrustSend
                    </h3>
                    <button onClick={closeModal} className="text-text-secondary hover:text-text-primary"><CloseIcon className="w-6 h-6" /></button>
                </header>

                {renderContent()}

                <footer className="p-4 border-t border-border bg-component-light flex items-center justify-end gap-3 rounded-b-2xl">
                    {renderFooter()}
                </footer>
            </div>
        </div>
    );
};

export default TrustSendModal;