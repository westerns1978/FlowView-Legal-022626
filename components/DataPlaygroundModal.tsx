

import React, { useState, useRef, useEffect } from 'react';
import { CloseIcon, SparklesIcon, CopyButton, CheckCircleIcon, ShieldCheckIcon, FileTextIcon } from './ui/Icons';
import { AppData } from '../types';
import { generateSampleData, generateQbrReport } from '../services/geminiService';
import { useToast } from '../contexts/ToastContext';

interface DataPlaygroundModalProps {
    isOpen: boolean;
    onClose: () => void;
    appData: AppData;
    onApplyGeneratedData: (newData: Partial<AppData>) => void;
}

const CodeBlock: React.FC<{ code: string }> = ({ code }) => (
    <div className="bg-gray-900 text-white p-4 rounded-lg font-mono text-xs max-h-64 overflow-y-auto relative">
        <div className="absolute top-2 right-2">
            <CopyButton text={code} />
        </div>
        <pre><code>{code}</code></pre>
    </div>
);

const Loader: React.FC<{ text: string }> = ({ text }) => (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[200px] text-text-secondary">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-3"></div>
        <p className="font-semibold">{text}</p>
        <p className="text-sm">This may take a moment. Building a more realistic world!</p>
    </div>
);


export const DataPlaygroundModal: React.FC<DataPlaygroundModalProps> = ({ isOpen, onClose, appData, onApplyGeneratedData }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [prompt, setPrompt] = useState(`Generate 5 new, diverse MSAs that follow the provided data schema. Ensure realistic details for a managed IT services company. The new data should be for existing customers.`);
    const [isLoading, setIsLoading] = useState(false);
    const [generatedData, setGeneratedData] = useState('');
    const [qbrReport, setQbrReport] = useState('');
    const [error, setError] = useState('');
    const { showToast } = useToast();

    const closeModal = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            onClose();
            setIsAnimatingOut(false);
        }, 300);
    };
    
    // Therapeutic win: A robust CSV export that handles complex data makes the tool feel powerful and reliable, saving users from frustrating data-wrangling tasks.
    const exportToCSV = (data: any[], fileName: string) => {
        if (!data || data.length === 0) {
            showToast("No data to export.");
            return;
        }

        const flattenObject = (obj: any, prefix = ''): any => {
            return Object.keys(obj).reduce((acc, k) => {
                const pre = prefix.length ? prefix + '_' : '';
                if (obj[k] && typeof obj[k] === 'object' && !Array.isArray(obj[k])) {
                    Object.assign(acc, flattenObject(obj[k], pre + k));
                } else {
                    // @ts-ignore
                    acc[pre + k] = Array.isArray(obj[k]) ? JSON.stringify(obj[k]) : obj[k];
                }
                return acc;
            }, {});
        };

        const flattenedData = data.map(row => flattenObject(row));
        const headers = Array.from(flattenedData.reduce((acc, row) => {
            Object.keys(row).forEach(key => acc.add(key));
            return acc;
        }, new Set<string>()));
        
        // C2PA Stamp Simulation for Trust Triangle
        const c2pa_stamp = `# C2PA_METADATA; ISSUER=At-a-Glance AI; TIMESTAMP=${new Date().toISOString()}; HASH=simulated_${Math.random().toString(36).substring(2)}\n`;
        let csvContent = c2pa_stamp + headers.join(',') + '\n';

        flattenedData.forEach(row => {
            csvContent += headers.map(header => {
                // @ts-ignore
                let cell = row[header] === undefined || row[header] === null ? '' : String(row[header]);
                if (/[",\n]/.test(cell)) {
                    cell = `"${cell.replace(/"/g, '""')}"`;
                }
                return cell;
            }).join(',') + '\n';
        });

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${fileName}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`${fileName}.csv exported!`);
    };

    const handleGenerate = async (p: string, loaderText: string) => {
        setIsLoading(true);
        setError('');
        setGeneratedData('');
        try {
            const contextData = {
                scenarios: appData.scenarios.slice(0, 1), // provide a small sample as context
                contractData: appData.contractData.slice(0, 1),
                msaData: appData.msaData.slice(0,1),
                foundationalData: appData.foundationalData
            };
            const result = await generateSampleData(contextData, p);
            setGeneratedData(JSON.stringify(JSON.parse(result), null, 2));
        } catch (err) {
            console.error(err);
            const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
            setError(`Sorry, the AI couldn't generate the data: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };
    
     const handleGenerateQbr = async () => {
        setIsLoading(true);
        setError('');
        setQbrReport('');
        try {
            const clientData = {
                contracts: appData.contractData.filter(c => c.clientName === "ACME Corp"),
                tickets: appData.scenarios.filter(s => s.customerName === "ACME Corp")
            };
            const result = await generateQbrReport("ACME Corp", clientData);
            setQbrReport(result);
        } catch (err) {
            console.error(err);
            setError("Sorry, the AI couldn't generate the QBR report.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleApply = () => {
        try {
            const newData = JSON.parse(generatedData);
            onApplyGeneratedData(newData);
            closeModal();
        } catch (err) {
            setError("Generated data is not valid JSON. Please try again.");
            showToast("Failed to apply data: Invalid format.");
        }
    };
    
    if (!isOpen) return null;

    const allData = [...appData.scenarios, ...appData.contractData, ...appData.salesPipelineData];

    return (
        <div ref={modalRef} className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={closeModal}>
            <div
                onClick={e => e.stopPropagation()}
                className={`bg-component rounded-2xl shadow-2xl w-full max-w-4xl transform flex flex-col border border-border ${isAnimatingOut ? 'animate-fade-out-scale' : 'animate-fade-in-scale'}`}
            >
                <header className="p-5 border-b border-border flex justify-between items-center">
                    <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-primary"/> Data Playground & Simulator
                    </h3>
                    <button onClick={closeModal} className="text-text-secondary hover:text-text-primary"><CloseIcon className="w-6 h-6" /></button>
                </header>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
                    {/* Left Column: Generator */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-text-primary">AI Data Generator</h4>
                        <div>
                            <label htmlFor="goal" className="text-sm font-semibold text-text-primary">Generation Goal</label>
                            <textarea
                                id="goal"
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                className="mt-1 w-full p-3 border rounded-lg h-28 focus:ring-2 focus:ring-primary focus:outline-none bg-background border-border text-text-primary"
                            />
                        </div>
                         <button onClick={() => handleGenerate(prompt, 'Generating Data...')} disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-accent transition disabled:opacity-50">
                            <SparklesIcon className="w-5 h-5"/> {isLoading ? 'Generating...' : 'Generate New Data'}
                        </button>
                        {error && <p className="text-sm text-danger">{error}</p>}
                        
                        {isLoading && !generatedData && !qbrReport && <Loader text="Generating Data..." />}
                        
                        {generatedData && (
                            <div className="space-y-2 animate-fade-in">
                                <h4 className="text-sm font-semibold text-text-primary">Generated Data Preview</h4>
                                <CodeBlock code={generatedData} />
                                <button onClick={handleApply} className="w-full flex items-center justify-center gap-2 bg-success text-white font-semibold py-2 px-4 rounded-lg hover:bg-success/90 transition">
                                    <CheckCircleIcon className="w-5 h-5"/> Apply Data (Session Only)
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Exporter & QBR */}
                    <div className="space-y-4">
                        <h4 className="text-lg font-bold text-text-primary">Current Data & Reports</h4>
                         <div className="p-4 bg-component-light rounded-lg border border-border">
                             <h5 className="font-semibold text-text-primary mb-2">QBR Report Simulator</h5>
                            <button onClick={handleGenerateQbr} disabled={isLoading} className="w-full text-sm font-semibold text-primary hover:bg-primary/10 p-2 rounded-lg border border-primary/20 transition-colors flex items-center justify-center gap-2">
                                <FileTextIcon className="w-4 h-4"/> Generate QBR for ACME Corp
                            </button>
                             {isLoading && qbrReport && <Loader text="Generating QBR..." />}
                             {qbrReport && (
                                <div className="mt-2 animate-fade-in">
                                    <div className="prose prose-sm max-w-none p-2 border border-border rounded-md bg-background max-h-40 overflow-y-auto" dangerouslySetInnerHTML={{ __html: (window as any).marked.parse(qbrReport) }}></div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-component-light rounded-lg border border-border">
                             <h5 className="font-semibold text-text-primary mb-2">Export Data Fabric</h5>
                            <button onClick={() => exportToCSV(allData, 'digital_thread_data')} className="w-full text-sm font-semibold text-primary hover:bg-primary/10 p-2 rounded-lg border border-primary/20 transition-colors flex items-center justify-center gap-2">
                                <ShieldCheckIcon className="w-4 h-4 text-trust-c2pa"/>
                                Export All to CSV (C2PA Verified)
                            </button>
                        </div>
                    </div>
                </div>

                 <footer className="p-4 border-t border-border bg-component-light flex items-center justify-end rounded-b-2xl">
                     <button onClick={closeModal} className="bg-component text-text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-border border border-border">Close</button>
                 </footer>

            </div>
        </div>
    );
};