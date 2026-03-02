
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
    CloseIcon, CameraIcon, InboxArrowDownIcon, ShieldCheckIcon, WarningIcon 
} from './ui/Icons';
import { analyzeImage } from '../services/geminiService';
import { flowview } from '../lib/westflow-client';

interface FlowCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onShowToast: (message: string) => void;
    initialTab?: 'home' | 'upload' | 'camera';
}

type Tab = 'home' | 'upload' | 'camera';
type CaptureState = 'idle' | 'requesting' | 'previewing' | 'processing' | 'vaulting' | 'complete' | 'error';

const ActionButton: React.FC<{ icon: React.ReactNode; label: string; subLabel?: string; onClick: () => void; primary?: boolean; }> = ({ icon, label, subLabel, onClick, primary }) => (
    <button onClick={onClick} className={`flex flex-col items-start p-6 rounded-2xl border transition-all duration-300 group ${primary ? 'bg-primary/5 border-primary/30 hover:bg-primary/10 shadow-sm' : 'bg-component border-border hover:border-primary/50'}`}>
        <div className={`p-3 rounded-xl mb-3 ${primary ? 'bg-primary text-white shadow-lg' : 'bg-component-light text-text-secondary group-hover:text-primary group-hover:bg-white'}`}>{icon}</div>
        <span className={`font-bold text-sm ${primary ? 'text-primary' : 'text-text-primary'}`}>{label}</span>
        {subLabel && <span className="text-[10px] text-text-secondary mt-0.5">{subLabel}</span>}
    </button>
);

export const FlowCaptureModal: React.FC<FlowCaptureModalProps> = ({ isOpen, onClose, onShowToast, initialTab = 'home' }) => {
    const [activeTab, setActiveTab] = useState<Tab>(initialTab);
    const [captureState, setCaptureState] = useState<CaptureState>('idle');
    const [capturedItem, setCapturedItem] = useState<{ type: string, name: string, preview?: string } | null>(null);
    const [analysisSummary, setAnalysisSummary] = useState('');
    
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    const startCamera = async () => {
        setCaptureState('requesting');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play();
                    setCaptureState('previewing');
                };
            }
        } catch (err) {
            console.error("Camera access failed:", err);
            setCaptureState('error');
        }
    };

    const takePhoto = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(videoRef.current, 0, 0);
            const dataUrl = canvas.toDataURL('image/jpeg');
            stopCamera();
            processCapture({ type: 'image/jpeg', name: `photo_${Date.now()}.jpg`, preview: dataUrl });
        }
    };

    const processCapture = async (item: { type: string, name: string, preview?: string }) => {
        setCapturedItem(item);
        setCaptureState('processing');
        try {
            // 1. Vision AI analysis
            const summary = await analyzeImage(item.preview || '', "Extract technical specs, serial numbers, and maintenance state for ACS-LEGAL records.");
            setAnalysisSummary(summary);
            
            // 2. Persist to Vault
            setCaptureState('vaulting');
            const result = await flowview.saveIngestedContent({
                name: item.name,
                type: item.type,
                summary: summary,
                preview: item.preview
            });

            if (result.success) {
                setCaptureState('complete');
                onShowToast("Content successfully secured in ACS Vault.");
            } else {
                // FIX: Fallback to a default error message to resolve TypeScript error where result.error might be undefined.
                throw new Error(result.error || "Vault synchronization failed.");
            }
        } catch (e) {
            console.error("Ingestion failed:", e);
            setCaptureState('error');
            onShowToast("Vault synchronization failed.");
        }
    };

    const handleBackToHub = () => {
        stopCamera();
        setCaptureState('idle');
        setActiveTab('home');
        setCapturedItem(null);
        setAnalysisSummary('');
    };

    useEffect(() => {
        if (isOpen && activeTab === 'camera') {
            startCamera();
        }
        return () => stopCamera();
    }, [isOpen, activeTab]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in" onClick={handleBackToHub}>
             <div onClick={e => e.stopPropagation()} className="bg-component w-full max-w-2xl min-h-[520px] rounded-[32px] shadow-2xl overflow-hidden border border-white/10 flex flex-col transition-all duration-500">
                <div className="p-6 bg-white/5 border-b border-white/10 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-xl text-text-primary tracking-tight">FlowCapture Hub</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <p className="text-[10px] text-text-secondary font-mono uppercase tracking-widest">Live Vault Encryption Active</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors"><CloseIcon className="w-6 h-6 text-text-secondary"/></button>
                </div>

                <div className="p-8 flex-grow flex flex-col justify-center">
                    {captureState === 'idle' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in-up">
                            <ActionButton 
                                icon={<CameraIcon className="w-8 h-8"/>} 
                                label="AI Camera" 
                                subLabel="Evidence Capture" 
                                onClick={() => setActiveTab('camera')} 
                                primary 
                            />
                            <ActionButton 
                                icon={<InboxArrowDownIcon className="w-8 h-8"/>} 
                                label="File Upload" 
                                subLabel="Bulk Document Ingest" 
                                onClick={() => fileInputRef.current?.click()} 
                            />
                            <input 
                                ref={fileInputRef} 
                                type="file" 
                                className="hidden" 
                                onChange={e => {
                                    if (e.target.files?.[0]) {
                                        const file = e.target.files[0];
                                        const reader = new FileReader();
                                        reader.onload = (ev) => processCapture({ 
                                            type: file.type, 
                                            name: file.name, 
                                            preview: ev.target?.result as string 
                                        });
                                        reader.readAsDataURL(file);
                                    }
                                }} 
                            />
                        </div>
                    )}

                    {activeTab === 'camera' && (captureState === 'previewing' || captureState === 'requesting') && (
                        <div className="flex flex-col items-center gap-8 w-full max-w-md mx-auto">
                            <div className="relative w-full aspect-[4/3] bg-black rounded-3xl overflow-hidden border border-white/10 shadow-2xl group">
                                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                                {captureState === 'requesting' && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-bold uppercase tracking-widest animate-pulse">
                                        Initializing Stream...
                                    </div>
                                )}
                            </div>
                            {captureState === 'previewing' && (
                                <button onClick={takePhoto} className="w-20 h-20 rounded-full border-8 border-white/20 p-1 group transition-all hover:scale-110 active:scale-95 shadow-glow-primary">
                                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center shadow-lg group-hover:bg-primary transition-colors">
                                        <CameraIcon className="w-8 h-8 text-black group-hover:text-white transition-colors" />
                                    </div>
                                </button>
                            )}
                        </div>
                    )}

                    {(captureState === 'processing' || captureState === 'vaulting' || captureState === 'complete') && (
                        <div className="flex flex-col items-center justify-center space-y-8 animate-fade-in w-full max-w-lg mx-auto text-center">
                            {capturedItem?.preview && (
                                <div className="relative">
                                    <img src={capturedItem.preview} className="max-h-48 rounded-2xl shadow-xl border border-white/10 rotate-1 group-hover:rotate-0 transition-transform" />
                                    <div className="absolute -top-3 -right-3 p-2 bg-emerald-500 rounded-full text-white shadow-lg border-2 border-white"><ShieldCheckIcon className="w-4 h-4"/></div>
                                </div>
                            )}
                            <div className="w-full">
                                {captureState === 'complete' ? (
                                    <div className="bg-emerald-500/5 p-6 rounded-[24px] border border-emerald-500/20 animate-fade-in-scale">
                                        <div className="flex items-center justify-center gap-3 text-emerald-500 mb-4">
                                            <ShieldCheckIcon className="w-6 h-6"/>
                                            <span className="text-sm font-black uppercase tracking-[0.2em]">Evidence Secured</span>
                                        </div>
                                        <div className="text-xs text-left text-text-secondary leading-relaxed bg-white/5 p-4 rounded-xl max-h-48 overflow-y-auto prose prose-invert custom-scrollbar" dangerouslySetInnerHTML={{ __html: (window as any).marked ? (window as any).marked.parse(analysisSummary) : analysisSummary }}></div>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto shadow-glow-primary"></div>
                                        <p className="text-primary font-bold uppercase text-[10px] tracking-[0.4em] animate-pulse">
                                            {captureState === 'processing' ? 'Vision Engine Analysis...' : 'Writing to ACS-Vault...'}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {captureState === 'error' && (
                        <div className="flex flex-col items-center justify-center text-center p-8 bg-danger/5 rounded-[32px] border border-danger/20 animate-fade-in max-w-sm mx-auto">
                            <WarningIcon className="w-16 h-16 text-danger mb-4 opacity-80" />
                            <h4 className="font-bold text-lg text-text-primary mb-2">Vaulting Failure</h4>
                            <p className="text-sm text-text-secondary mb-6 leading-relaxed">Could not establish a secure handshake with the storage node.</p>
                            <button onClick={handleBackToHub} className="w-full px-6 py-3 bg-primary text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg">Back to Hub</button>
                        </div>
                    )}
                </div>

                {captureState === 'complete' && (
                    <div className="p-6 bg-white/5 border-t border-white/10 flex gap-4">
                         <button onClick={handleBackToHub} className="flex-1 py-4 rounded-2xl bg-component border border-border font-black uppercase tracking-widest text-[10px] hover:bg-white transition-all">New Capture</button>
                         <button onClick={onClose} className="flex-1 py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-lg hover:brightness-110 transition-all">Close Hub</button>
                    </div>
                )}
            </div>
        </div>
    );
};
