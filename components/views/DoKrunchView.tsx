
import React, { useState, useRef, DragEvent } from 'react';
import { useToast } from '../../contexts/ToastContext';
import { Card } from '../ui/Card';
import { ArrowUpTrayIcon, CheckBadgeIcon, SparklesIcon, BrainCircuitIcon } from '../ui/Icons';
import { analyzeDocument } from '../../services/geminiService';

interface DoKrunchViewProps {
    onOpenAiCommandCenter: (prompt: string) => void;
    openScanner: (onScanComplete: (imageData: string) => void) => void;
}

interface UploadedFile {
    name: string;
    content: string; // Mock content
}

interface ExtractedData {
    key: string;
    value: string;
}

const DoKrunchViewInternal: React.FC<DoKrunchViewProps> = ({ onOpenAiCommandCenter, openScanner }) => {
    const [file, setFile] = useState<UploadedFile | null>(null);
    const [goal, setGoal] = useState<string>("Extract key terms, risks, and renewal dates.");
    const [isLoading, setIsLoading] = useState(false);
    const [extractedData, setExtractedData] = useState<ExtractedData[] | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    const handleFileSelect = (selectedFile: File) => {
        setFile({ name: selectedFile.name, content: "This is a mock document content for SOW-123..." });
        setExtractedData(null); // Reset previous results
    };
    
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragOver(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };
    
    const handleAnalyze = async () => {
        if (!file || !goal) return;
        setIsLoading(true);
        setExtractedData(null);
        try {
            const result = await analyzeDocument(goal, file.content);
            setExtractedData(result.extractedData);
            showToast("Document analysis complete!");
        } catch (error) {
            console.error("Error analyzing document:", error);
            showToast("AI analysis failed. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleFeedToHub = () => {
        showToast("Success! Structured data fed to Knowledge Hub. 🧠");
        onOpenAiCommandCenter(`The data from ${file?.name} has been added to the knowledge base. What new insights can we find?`);
    }

    const dropzoneClasses = `p-8 rounded-xl border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${isDragOver ? 'border-primary bg-primary/10' : 'border-border'}`;

    return (
        <Card className="max-w-4xl mx-auto animate-fade-in">
             <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                    <BrainCircuitIcon className="w-8 h-8"/>
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-text-primary">FlowCapture Workspace</h2>
                    <p className="text-text-secondary">Transform unstructured documents into actionable, structured data.</p>
                </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Intake & Goal */}
                <div className="space-y-4">
                    <div>
                        <h3 className="font-bold text-text-primary mb-2">1. Document Intake</h3>
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={dropzoneClasses}
                        >
                             <input ref={fileInputRef} type="file" className="hidden" onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])} />
                             {file ? (
                                <>
                                 <CheckBadgeIcon className="w-10 h-10 text-success mb-2"/>
                                 <p className="font-semibold text-text-primary">{file.name}</p>
                                 <p className="text-xs text-text-secondary">Click to upload another file</p>
                                </>
                             ) : (
                                <>
                                 <ArrowUpTrayIcon className="w-10 h-10 text-text-secondary mb-2" />
                                 <p className="font-semibold text-text-primary">Drag & Drop Document</p>
                                </>
                             )}
                        </div>
                    </div>
                     <div>
                        <h3 className="font-bold text-text-primary mb-2">2. Define Your Goal</h3>
                         <textarea
                            value={goal}
                            onChange={e => setGoal(e.target.value)}
                            className="w-full p-3 border rounded-lg h-24 focus:ring-2 focus:ring-primary focus:outline-none bg-background border-border text-text-primary text-sm"
                            placeholder="e.g., Extract all client obligations and deliverables..."
                        />
                    </div>
                    <button 
                        onClick={handleAnalyze} 
                        disabled={!file || !goal || isLoading}
                        className="w-full flex items-center justify-center gap-2 p-3 rounded-lg bg-primary text-white font-bold hover:bg-accent transition disabled:opacity-60"
                    >
                        <SparklesIcon className="w-5 h-5"/>
                        {isLoading ? "Analyzing..." : "Analyze with AI"}
                    </button>
                </div>

                {/* Right Column: Results */}
                <div className="bg-component-light p-4 rounded-xl border border-border">
                     <h3 className="font-bold text-text-primary mb-2">3. Review & Action</h3>
                     {isLoading && (
                        <div className="flex items-center justify-center h-full text-text-secondary">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                            AI is processing...
                        </div>
                     )}
                     {extractedData && (
                        <div className="space-y-3 animate-fade-in">
                             <div className="max-h-64 overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="sticky top-0 bg-component-light">
                                        <tr>
                                            <th className="p-2 text-left font-semibold text-text-secondary border-b-2 border-border">Key</th>
                                            <th className="p-2 text-left font-semibold text-text-secondary border-b-2 border-border">Value</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {extractedData.map(item => (
                                            <tr key={item.key}>
                                                <td className="p-2 font-semibold text-text-primary align-top">{item.key}</td>
                                                <td className="p-2 text-text-secondary">{item.value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                             </div>
                             <button
                                onClick={handleFeedToHub} 
                                className="w-full flex items-center justify-center gap-2 p-2 rounded-lg bg-success text-white font-bold hover:bg-success/90 transition"
                            >
                                <BrainCircuitIcon className="w-5 h-5"/>
                                Feed to Knowledge Hub
                            </button>
                        </div>
                     )}
                     {!isLoading && !extractedData && (
                        <div className="flex items-center justify-center h-full text-center text-text-secondary p-4">
                            <p>Analysis results will appear here once you provide a document and a goal.</p>
                        </div>
                     )}
                </div>
             </div>
        </Card>
    );
};

export const DoKrunchView = React.memo(DoKrunchViewInternal);
