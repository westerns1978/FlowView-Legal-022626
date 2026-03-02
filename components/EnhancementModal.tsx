

import React, { useState, useEffect, useRef } from 'react';
import { SparklesIcon, CopyIcon, ArrowUpTrayIcon, CloseIcon, CheckIcon, ScannerIcon, MicrophoneIcon, CameraIcon } from './ui/Icons';
import { generateUpsellPitch, generateReportAnalysis } from '../services/geminiService';

interface FieldReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onShowToast: (message: string) => void;
    openScanner: (onScanComplete: (imageData: string) => void) => void;
    openVideoCapture: (onVideoComplete: (videoBlob: Blob) => void) => void;
}

const AiActionSpinner: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex items-center justify-center gap-2">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
        <span>{text}</span>
    </div>
);

// Helper to convert base64 to File
const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) throw new Error('Invalid data URL');
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type:mime});
}


export const FieldReportModal: React.FC<FieldReportModalProps> = ({ isOpen, onClose, onShowToast, openScanner, openVideoCapture }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [summary, setSummary] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [video, setVideo] = useState<Blob | null>(null);
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [showUpsell, setShowUpsell] = useState(false);
    const [upsellNotes, setUpsellNotes] = useState('');
    const [generatedPitch, setGeneratedPitch] = useState('');
    const [isPitchLoading, setIsPitchLoading] = useState(false);
    const [pitchCopied, setPitchCopied] = useState(false);
    const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');
    
    // Initialize Speech Recognition
    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                // Append final transcript to existing summary
                setSummary(prev => prev + finalTranscript);
            };

            recognitionRef.current.onerror = (event: any) => console.error("Speech recognition error", event.error);
            recognitionRef.current.onend = () => setIsListening(false);
        }
    }, []);

    const toggleListening = () => {
        if (!recognitionRef.current) return;
        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
        setIsListening(!isListening);
    };

    const resetState = () => {
        setSummary('');
        setImage(null);
        if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
        setVideo(null);
        if(videoPreview) URL.revokeObjectURL(videoPreview);
        setVideoPreview(null);
        setShowUpsell(false);
        setUpsellNotes('');
        setGeneratedPitch('');
        setAnalysisResult('');
    };

    const closeModal = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            onClose();
            setIsAnimatingOut(false);
            resetState();
        }, 300);
    };

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeModal();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, []);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImage(file);
            const previewUrl = URL.createObjectURL(file);
            if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
            setImagePreview(previewUrl);
        }
    };
    
    const handleScanComplete = (imageData: string) => {
        const file = dataURLtoFile(imageData, `scan-${Date.now()}.jpg`);
        setImage(file);
        if (imagePreview && imagePreview.startsWith('blob:')) URL.revokeObjectURL(imagePreview);
        setImagePreview(imageData);
        onShowToast('Scan attached successfully!');
    };
    
    const handleOpenScanner = () => {
        openScanner(handleScanComplete);
    };

    const handleVideoComplete = (videoBlob: Blob) => {
        setVideo(videoBlob);
        const previewUrl = URL.createObjectURL(videoBlob);
        if(videoPreview) URL.revokeObjectURL(videoPreview);
        setVideoPreview(previewUrl);
        onShowToast('Video attached successfully!');
    };
    
    const handleOpenVideoCapture = () => {
        openVideoCapture(handleVideoComplete);
    }


    const handleSubmit = () => {
        onShowToast(`+25 Points! Field report submitted. 📝`);
        closeModal();
    };

    const handleGeneratePitch = async () => {
        if (!upsellNotes.trim() || isPitchLoading) return;
        setIsPitchLoading(true);
        setGeneratedPitch('');
        try {
            const pitch = await generateUpsellPitch(upsellNotes, "the client");
            setGeneratedPitch(pitch);
        } catch (error) {
            console.error("Failed to generate pitch:", error);
            onShowToast("AI couldn't connect. Please try again.");
        } finally {
            setIsPitchLoading(false);
        }
    };

    const handleCopyPitch = () => {
        if (!generatedPitch || pitchCopied) return;
        navigator.clipboard.writeText(generatedPitch).then(() => {
            setPitchCopied(true);
            setTimeout(() => { setPitchCopied(false); }, 2000);
        });
    };

    const handleAiAnalysis = async () => {
        if (!summary.trim() || isAnalysisLoading) return;
        setIsAnalysisLoading(true);
        setAnalysisResult('');
        try {
            const result = await generateReportAnalysis(summary, upsellNotes);
            setAnalysisResult(result);
        } catch (error) {
            console.error("Failed to get AI analysis:", error);
            onShowToast("AI analysis failed. Please try again.");
        } finally {
            setIsAnalysisLoading(false);
        }
    }

    if (!isOpen) return null;

    return (
        <div ref={modalRef} className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={e => e.target === modalRef.current && closeModal()}>
            <div className={`bg-component rounded-xl shadow-2xl w-full max-w-lg transform flex flex-col border border-border-color ${isAnimatingOut ? 'animate-fade-out-scale' : 'animate-fade-in-scale'}`}>
                <div className="flex justify-between items-center p-5 border-b border-border-color">
                    <h3 className="text-xl font-bold text-text-primary">Create Field Service Report</h3>
                    <button onClick={closeModal} className="text-text-secondary hover:text-text-primary"><CloseIcon className="w-6 h-6" /></button>
                </div>
                <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="text-sm font-semibold text-text-primary">Work Summary</label>
                        <div className="relative">
                            <textarea value={summary} onChange={e => setSummary(e.target.value)} className="mt-1 w-full p-3 border rounded-lg h-28 focus:ring-2 focus:ring-accent focus:outline-none bg-background border-border-color text-text-primary pr-10" placeholder="Describe the work completed..."></textarea>
                            <button onClick={toggleListening} className={`absolute top-2 right-2 p-2 rounded-full ${isListening ? 'bg-danger/20 text-danger animate-pulse' : 'text-text-secondary hover:bg-component-lighter'}`} title={isListening ? 'Stop Dictation' : 'Start Dictation'}>
                                <MicrophoneIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-text-primary">Attach Evidence</label>
                         <div className="mt-1 grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <label htmlFor="file-upload" className="flex items-center justify-center gap-2 bg-component text-text-secondary font-semibold py-3 px-3 rounded-lg transition hover:bg-border-color cursor-pointer border-2 border-dashed border-border-color">
                                <ArrowUpTrayIcon className="w-5 h-5"/> Photo
                            </label>
                            <button onClick={handleOpenScanner} className="flex items-center justify-center gap-2 bg-component text-text-secondary font-semibold py-3 px-3 rounded-lg transition hover:bg-border-color cursor-pointer border-2 border-dashed border-border-color">
                                <ScannerIcon className="w-5 h-5"/> Scan Doc
                            </button>
                            <button onClick={handleOpenVideoCapture} className="flex items-center justify-center gap-2 bg-component text-text-secondary font-semibold py-3 px-3 rounded-lg transition hover:bg-border-color cursor-pointer border-2 border-dashed border-border-color">
                                <CameraIcon className="w-5 h-5"/> Video
                            </button>
                         </div>
                        <input id="file-upload" type="file" onChange={handleFileChange} className="hidden" accept="image/*" />
                        {imagePreview && (
                            <div className="mt-2 relative group">
                                <img src={imagePreview} alt="Attachment preview" className="rounded-md w-full max-h-48 object-cover"/>
                                <button onClick={() => { setImage(null); setImagePreview(null); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CloseIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                        {videoPreview && (
                             <div className="mt-2 relative group">
                                <video src={videoPreview} controls className="rounded-md w-full max-h-48 object-cover" />
                                <button onClick={() => { setVideo(null); setVideoPreview(null); }} className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <CloseIcon className="w-4 h-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-component-lighter p-4 rounded-lg border border-border-color space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-semibold text-text-primary">Upsell Opportunity</h4>
                            <label htmlFor="upsell-toggle" className="flex items-center cursor-pointer">
                                <div className="relative">
                                    <input type="checkbox" id="upsell-toggle" className="sr-only" checked={showUpsell} onChange={() => setShowUpsell(!showUpsell)} />
                                    <div className="block bg-border-color w-10 h-6 rounded-full"></div>
                                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition ${showUpsell ? 'transform translate-x-full bg-primary' : ''}`}></div>
                                </div>
                            </label>
                        </div>
                        {showUpsell && (
                            <div className="space-y-3 animate-fade-in">
                                <div>
                                    <label className="text-sm font-semibold text-text-primary">Notes for Sales Team</label>
                                    <textarea value={upsellNotes} onChange={e => setUpsellNotes(e.target.value)} className="mt-1 w-full p-2 border rounded-lg h-20 focus:ring-2 focus:ring-accent focus:outline-none bg-background border-border-color text-text-primary" placeholder="e.g., Client's server rack is a mess, recommend a cable management solution. Their WiFi signal is weak in the warehouse..."></textarea>
                                </div>
                                <button onClick={handleGeneratePitch} disabled={isPitchLoading || !upsellNotes.trim()} className="w-full flex items-center justify-center gap-2 bg-primary/10 text-primary text-sm font-bold py-2 px-3 rounded-lg transition hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed">
                                    {isPitchLoading ? <AiActionSpinner text="Generating..." /> : <><SparklesIcon className="w-4 h-4" /><span>Generate Client Pitch</span></>}
                                </button>
                                {generatedPitch && (
                                    <div className="bg-background p-3 rounded-md border border-border-color space-y-2">
                                        <p className="text-sm text-text-secondary italic">{generatedPitch}</p>
                                        <button onClick={handleCopyPitch} className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:underline">
                                            {pitchCopied ? <CheckIcon className="w-4 h-4 text-success" /> : <CopyIcon className="w-4 h-4" />}
                                            {pitchCopied ? 'Copied!' : 'Copy Pitch'}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                 <div className="flex items-center justify-between gap-3 p-4 border-t border-border-color bg-component-lighter rounded-b-xl">
                     <button onClick={handleAiAnalysis} disabled={!summary.trim() || isAnalysisLoading} className="bg-component text-primary font-semibold py-2 px-4 rounded-lg hover:bg-primary/10 transition border border-border-color flex items-center gap-2 disabled:opacity-50">
                        {isAnalysisLoading ? <AiActionSpinner text="Analyzing..." /> : <><SparklesIcon className="w-5 h-5"/> AI Assist</>}
                    </button>
                    <div className="flex items-center gap-3">
                        <button onClick={closeModal} className="bg-component text-text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-border-color transition border border-border-color">
                            Cancel
                        </button>
                        <button onClick={handleSubmit} disabled={!summary && !image && !video} className="bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-accent transition flex items-center gap-2 disabled:opacity-50">
                            Submit Report
                        </button>
                    </div>
                </div>
                {analysisResult && (
                    <div className="p-4 border-t border-border-color bg-background rounded-b-xl animate-fade-in">
                        <h4 className="font-semibold text-text-primary mb-2">AI Analysis & Suggestions</h4>
                        <div className="prose prose-sm dark:prose-invert max-w-none text-text-secondary" dangerouslySetInnerHTML={{ __html: (window as any).marked.parse(analysisResult) }}></div>
                    </div>
                )}
            </div>
        </div>
    );
};