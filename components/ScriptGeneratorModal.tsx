import React, { useState, useRef, useEffect } from 'react';
import { CloseIcon, SparklesIcon, CopyButton, CheckCircleIcon } from './ui/Icons';
import { generateEltScript } from '../services/geminiService';

interface ScriptGeneratorModalProps {
    isOpen: boolean;
    onClose: () => void;
    source: string;
    onSimulateSync: (source: string) => void;
}

const CodeBlock: React.FC<{ code: string }> = ({ code }) => (
    <div className="bg-gray-900 text-white p-4 rounded-lg font-mono text-xs max-h-64 overflow-y-auto relative">
        <div className="absolute top-2 right-2">
            <CopyButton text={code} />
        </div>
        <pre><code className="language-python">{code}</code></pre>
    </div>
);

const Loader: React.FC = () => (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px] text-text-secondary">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
        <p className="font-semibold">AI is generating your Python script...</p>
        <p className="text-sm">This may take a moment. One step closer to automation!</p>
    </div>
);


export const ScriptGeneratorModal: React.FC<ScriptGeneratorModalProps> = ({ isOpen, onClose, source, onSimulateSync }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [goal, setGoal] = useState(`Load all new invoices from the last 7 days into BigQuery.`);
    const [isLoading, setIsLoading] = useState(false);
    const [generatedScript, setGeneratedScript] = useState('');
    const [error, setError] = useState('');

    const closeModal = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            onClose();
            setIsAnimatingOut(false);
        }, 300);
    };

    const handleGenerate = async () => {
        if (!goal.trim()) {
            setError("Please define a goal for the script.");
            return;
        }
        setIsLoading(true);
        setError('');
        setGeneratedScript('');

        try {
            const script = await generateEltScript(source, goal);
            setGeneratedScript(script);
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(`Sorry, the AI couldn't generate the script: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleDeploy = () => {
        onSimulateSync(source);
        closeModal();
    }

    useEffect(() => {
        if (isOpen) {
            // Reset state on open, but keep the goal
            setIsLoading(false);
            setGeneratedScript('');
            setError('');
        }
    }, [isOpen, source]);
    
    if (!isOpen) return null;

    return (
        <div ref={modalRef} className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={closeModal}>
            <div
                onClick={e => e.stopPropagation()}
                className={`bg-component rounded-2xl shadow-2xl w-full max-w-2xl transform flex flex-col border border-border ${isAnimatingOut ? 'animate-fade-out-scale' : 'animate-fade-in-scale'}`}
            >
                <header className="p-5 border-b border-border flex justify-between items-center">
                    <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-primary"/> AI Script Generator: {source}
                    </h3>
                    <button onClick={closeModal} className="text-text-secondary hover:text-text-primary"><CloseIcon className="w-6 h-6" /></button>
                </header>

                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label htmlFor="goal" className="text-sm font-semibold text-text-primary">1. Define Your Goal</label>
                        <p className="text-xs text-text-secondary mb-2">Describe the data you want to sync in plain English. This simple step helps reduce anxiety around complex coding tasks.</p>
                        <textarea
                            id="goal"
                            value={goal}
                            onChange={e => setGoal(e.target.value)}
                            className="w-full p-3 border rounded-lg h-20 focus:ring-2 focus:ring-primary focus:outline-none bg-background border-border text-text-primary"
                            placeholder="e.g., Load all new invoices from the last 7 days into BigQuery."
                        />
                         {error && <p className="text-sm text-danger mt-1">{error}</p>}
                    </div>

                    <div className="text-center">
                         <button onClick={handleGenerate} disabled={isLoading || !goal.trim()} className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2 px-6 rounded-lg hover:bg-accent transition disabled:opacity-50">
                            <SparklesIcon className="w-5 h-5"/> Generate Python Script
                        </button>
                    </div>

                    {isLoading && <Loader />}
                    
                    {generatedScript && (
                        <div className="space-y-2 animate-fade-in">
                            <h4 className="text-sm font-semibold text-text-primary">2. Review Generated Script</h4>
                            <CodeBlock code={generatedScript} />
                        </div>
                    )}
                </div>

                <footer className="p-4 border-t border-border bg-component-light flex items-center justify-end gap-3 rounded-b-2xl">
                    <button onClick={closeModal} className="bg-component text-text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-border border border-border">Cancel</button>
                    <button 
                        onClick={handleDeploy}
                        disabled={!generatedScript} 
                        className="bg-success text-white font-semibold py-2 px-4 rounded-lg hover:bg-success/90 transition flex items-center gap-2 disabled:opacity-50"
                    >
                        <CheckCircleIcon className="w-5 h-5" /> Simulate Deploy & Sync
                    </button>
                </footer>
            </div>
        </div>
    );
};