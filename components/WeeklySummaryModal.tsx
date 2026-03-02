import React, { useState, useEffect, useRef } from 'react';
import { WeeklySummary, ChatMessage } from '../types';
import { generateImage, ai } from '../services/geminiService';
import { SparklesIcon, DownloadIcon, CloseIcon } from './ui/Icons';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


// --- Helper Components ---

const Loader: React.FC<{ text?: string }> = ({ text = "Generating Weekly Briefing..." }) => (
    <div className="flex flex-col items-center justify-center p-8 text-center min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-accent mb-4"></div>
        <p className="text-lg text-text-secondary font-semibold">{text}</p>
        <p className="text-sm text-text-secondary">The AI is analyzing the week's data. Please wait.</p>
    </div>
);

const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
    const isUser = message.sender === 'user';
    return (
        <div className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div className={`prose prose-sm max-w-md p-3 rounded-lg shadow-sm ${isUser ? 'bg-primary text-white prose-invert' : 'bg-component text-text-primary'}`}>
                <p>{message.text}</p>
            </div>
        </div>
    );
};

// --- Main Component ---
interface WeeklySummaryModalProps {
    isOpen: boolean;
    onClose: () => void;
    summaryData: WeeklySummary | null;
    isLoading: boolean;
}

export const WeeklySummaryModal: React.FC<WeeklySummaryModalProps> = ({ isOpen, onClose, summaryData, isLoading }) => {
    const modalRef = useRef<HTMLDivElement>(null);
    const reportContentRef = useRef<HTMLDivElement>(null);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [isImageLoading, setIsImageLoading] = useState(false);
    const [isPdfLoading, setIsPdfLoading] = useState(false);
    
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatWindowRef = useRef<HTMLDivElement>(null);

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

    useEffect(() => {
        if (summaryData && summaryData.imagePrompt && isOpen) {
            const fetchImage = async () => {
                setIsImageLoading(true);
                try {
                    const url = await generateImage(summaryData.imagePrompt);
                    setImageUrl(url);
                } catch (error) {
                    console.error("Failed to generate summary image:", error);
                    setImageUrl('');
                } finally {
                    setIsImageLoading(false);
                }
            };
            fetchImage();
            setChatMessages([{ id: 'init-chat', sender: 'ai', text: "I'm ready to answer questions about this briefing. What would you like to know?" }]);
        }
    }, [summaryData, isOpen]);
    
    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
        }
    }, [chatMessages, isChatLoading]);

    const handleChatSend = async () => {
        const userMessage = chatInput.trim();
        if (!userMessage || isChatLoading || !summaryData) return;

        setChatMessages(prev => [...prev, { id: `user-${Date.now()}`, sender: 'user', text: userMessage }]);
        setChatInput('');
        setIsChatLoading(true);
        
        const systemInstruction = `You are an AI assistant inside a modal displaying a weekly summary report. Your knowledge is strictly limited to the data within this report. Answer the user's questions based *only* on the following context. Do not use any external knowledge. Report Context: ${JSON.stringify(summaryData)}`;
        // FIX: Updated model name to gemini-3-flash-preview per guidelines
        const chat = ai.chats.create({ model: 'gemini-3-flash-preview', config: { systemInstruction } });
        
        try {
            // FIX: The sendMessage method expects an object with a `message` property.
            const response = await chat.sendMessage({ message: userMessage });
            setChatMessages(prev => [...prev, { id: `ai-${Date.now()}`, sender: 'ai', text: response.text }]);
        } catch (error) {
            console.error("Chat error:", error);
            setChatMessages(prev => [...prev, { id: `ai-err-${Date.now()}`, sender: 'ai', text: "I had trouble processing that. Please try again." }]);
        } finally {
            setIsChatLoading(false);
        }
    };
    
    const handleDownloadPdf = async () => {
        const reportElement = reportContentRef.current;
        if (!reportElement) return;
        setIsPdfLoading(true);

        const canvas = await html2canvas(reportElement, { 
            scale: 2, 
            useCORS: true,
            backgroundColor: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff'
        });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'px', format: [canvas.width, canvas.height] });

        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save(`Weekly-Briefing-${summaryData?.title.replace(/\s+/g, '-')}.pdf`);

        setIsPdfLoading(false);
    };

    if (!isOpen) return null;

    const renderContent = () => {
        if (isLoading || !summaryData) {
            return <Loader />;
        }

        return (
            <div ref={reportContentRef} className="p-1 bg-component text-text-primary">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    <div className="md:col-span-1 lg:col-span-3 space-y-4">
                        <div className="relative w-full aspect-video rounded-lg bg-component-light overflow-hidden">
                            {isImageLoading && <div className="absolute inset-0 flex items-center justify-center text-text-secondary">Generating image...</div>}
                            {imageUrl && <img src={imageUrl} alt={summaryData.title} className="w-full h-full object-cover" crossOrigin="anonymous" />}
                        </div>
                        <div>
                            <h4 className="font-bold text-text-primary">Key Insights</h4>
                            <p className="text-sm text-text-secondary mt-1">{summaryData.insights}</p>
                        </div>
                        <div>
                            <h4 className="font-bold text-text-primary">Manager's Talking Points</h4>
                            <ul className="list-disc list-inside text-sm text-text-secondary mt-1 space-y-1">
                                {summaryData.talkingPoints.map((point, i) => <li key={i}>{point}</li>)}
                            </ul>
                        </div>
                    </div>

                    <div className="md:col-span-1 lg:col-span-2 flex flex-col bg-component-light p-4 rounded-lg border border-border">
                        <div>
                             <h4 className="font-bold text-text-primary text-lg">Weekly KPIs</h4>
                             <div className="grid grid-cols-2 gap-3 mt-2">
                                 {summaryData.kpis.map(kpi => (
                                    <div key={kpi.label} className="bg-component p-3 rounded-md shadow-sm border border-border">
                                        <p className="text-xs text-text-secondary font-medium">{kpi.label}</p>
                                        <p className="text-lg font-bold text-primary">{kpi.value}</p>
                                    </div>
                                 ))}
                             </div>
                        </div>

                        <div className="flex-grow flex flex-col mt-4 overflow-hidden">
                            <h4 className="font-bold text-text-primary mb-2">Ask About this Report</h4>
                            <div ref={chatWindowRef} className="flex-grow space-y-3 overflow-y-auto pr-2">
                                {chatMessages.map((msg, i) => <ChatBubble key={i} message={msg} />)}
                                {isChatLoading && <ChatBubble message={{ id: 'loading-bubble', sender: 'ai', text: "..." }} />}
                            </div>
                             <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                                <input
                                    type="text"
                                    value={chatInput}
                                    onChange={e => setChatInput(e.target.value)}
                                    onKeyPress={e => e.key === 'Enter' && handleChatSend()}
                                    className="flex-grow p-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-accent bg-component border-border text-text-primary"
                                    placeholder="Drill down on details..."
                                    disabled={isChatLoading}
                                />
                                <button onClick={handleChatSend} disabled={isChatLoading || !chatInput} className="bg-primary text-white p-2 rounded-md hover:bg-accent disabled:opacity-70">
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div ref={modalRef} className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm" onClick={e => e.target === modalRef.current && closeModal()}>
            <div className={`bg-component rounded-xl shadow-2xl w-full max-w-5xl transform flex flex-col border border-border ${isAnimatingOut ? 'animate-fade-out-scale' : 'animate-fade-in-scale'}`}>
                <div className="flex justify-between items-center p-5 border-b border-border">
                    <h3 className="text-xl font-bold text-text-primary flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-primary"/> 
                        {isLoading || !summaryData ? 'Generating Briefing' : summaryData.title}
                    </h3>
                    <button onClick={closeModal} className="text-text-secondary hover:text-text-primary"><CloseIcon className="w-6 h-6" /></button>
                </div>
                <div className="p-6 overflow-y-auto max-h-[80vh]">
                    {renderContent()}
                </div>
                 <div className="flex items-center justify-between gap-4 p-4 border-t border-border bg-component-light rounded-b-xl">
                    <button 
                        onClick={handleDownloadPdf}
                        disabled={isPdfLoading || isLoading || !summaryData}
                        className="bg-success text-white font-semibold py-2 px-4 rounded-lg hover:bg-success/90 transition flex items-center gap-2 disabled:opacity-70"
                    >
                        <DownloadIcon className="w-5 h-5" />
                        {isPdfLoading ? 'Creating PDF...' : 'Download PDF'}
                    </button>
                    <button 
                        onClick={closeModal} 
                        className="bg-component text-text-secondary font-semibold py-2 px-4 rounded-lg hover:bg-border transition border border-border"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};