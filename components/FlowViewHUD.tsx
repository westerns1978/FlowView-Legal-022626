
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from '../types';
import { 
    MicrophoneIcon, Send, ArrowDownIcon, BotIcon, 
    CodeBracketIcon, CameraIcon, CloseIcon, ShieldCheckIcon, SpeakerWaveIcon 
} from './ui/Icons';
import { liveGemini } from '../services/liveGeminiService';
import { AiChatMessage } from './AiChatMessage';

interface FlowViewHUDProps {
    chatMessages: ChatMessage[];
    onSendMessage: (prompt: string, aiMode: 'chat' | 'report', isFollowUp: boolean) => void;
    isThinking: boolean;
    isMicLocked: boolean; 
    isExpanded: boolean;
    onToggle: () => void;
}

type AgentPersona = 'Flo' | 'Katie' | 'Cricket';

export const FlowViewHUD: React.FC<FlowViewHUDProps> = ({ chatMessages, onSendMessage, isThinking, isMicLocked, isExpanded, onToggle }) => {
    const [mode, setMode] = useState<'chat' | 'voice'>('chat');
    const [persona, setPersona] = useState<AgentPersona>('Flo');
    const [input, setInput] = useState('');
    const [showVisualSensor, setShowVisualSensor] = useState(false);
    
    const chatEndRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const frameIntervalRef = useRef<number | null>(null);

    const floAvatar = "https://storage.googleapis.com/westerns1978-digital-assets/Miscellaneous/connie-ai.png";

    useEffect(() => {
        if (isExpanded) {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, isExpanded, isThinking]);

    const personas: Record<AgentPersona, { role: string, color: string, avatar: string }> = {
        'Flo': { role: 'Chief of Staff', color: 'from-[#2E86AB] to-blue-900', avatar: floAvatar },
        'Katie': { role: 'Compliance Specialist', color: 'from-emerald-400 to-teal-600', avatar: '' },
        'Cricket': { role: 'Intake Specialist', color: 'from-indigo-500 to-purple-600', avatar: '' }
    };

    const stopVisualSensor = useCallback(() => {
        if (frameIntervalRef.current) {
            window.clearInterval(frameIntervalRef.current);
            frameIntervalRef.current = null;
        }
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(t => t.stop());
            videoRef.current.srcObject = null;
        }
        setShowVisualSensor(false);
    }, []);

    const startVisualSensor = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setShowVisualSensor(true);
                
                if (mode === 'voice') {
                    const canvas = document.createElement('canvas');
                    frameIntervalRef.current = window.setInterval(() => {
                        if (!videoRef.current) return;
                        canvas.width = videoRef.current.videoWidth;
                        canvas.height = videoRef.current.videoHeight;
                        const ctx = canvas.getContext('2d');
                        ctx?.drawImage(videoRef.current, 0, 0);
                        const base64 = canvas.toDataURL('image/jpeg', 0.6);
                        liveGemini.sendImage(base64);
                    }, 1000); 
                }
            }
        } catch (err) {
            console.error("Visual sensor failed:", err);
        }
    };

    const handleToggle = () => {
        onToggle();
        if (isExpanded) {
            if (mode === 'voice') stopVoice();
            stopVisualSensor();
        }
    };

    const startVoice = () => {
        if (isMicLocked) return;
        setMode('voice');
        onToggle();
        liveGemini.connect(() => {}, () => stopVoice());
    };

    const stopVoice = () => {
        setMode('chat');
        if (frameIntervalRef.current) {
            window.clearInterval(frameIntervalRef.current);
            frameIntervalRef.current = null;
        }
        liveGemini.disconnect();
    };

    const handleSend = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isThinking) return;
        onSendMessage(`[AGENT:${persona}] ${input}`, 'chat', false);
        setInput('');
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            <div className={`
                transition-all duration-500 ease-out origin-bottom-right overflow-hidden
                ${isExpanded ? 'w-[90vw] sm:w-[480px] h-[720px] opacity-100 scale-100 rounded-3xl' : 'w-0 h-0 opacity-0 scale-90 rounded-full'}
                bg-[#020617]/95 backdrop-blur-3xl border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                         <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${personas[persona].color} p-0.5 shadow-lg relative`}>
                            <div className="w-full h-full rounded-[10px] bg-black/40 flex items-center justify-center overflow-hidden">
                                {personas[persona].avatar ? (
                                    <img src={personas[persona].avatar} className="w-full h-full object-cover" alt={persona} />
                                ) : (
                                    <BotIcon className="w-6 h-6 text-white"/>
                                )}
                            </div>
                            {isThinking && (
                                <div className="absolute -bottom-1 -right-1 p-1 bg-primary rounded-full shadow-lg border border-white/20">
                                    <SpeakerWaveIcon className="w-2.5 h-2.5 text-white animate-pulse" />
                                </div>
                            )}
                         </div>
                         <div>
                            <span className="block font-bold text-white text-sm">{persona} — {personas[persona].role}</span>
                            <span className="block text-[9px] text-white/40 uppercase tracking-[0.2em]">ACS LEGAL FABRIC</span>
                         </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={showVisualSensor ? stopVisualSensor : startVisualSensor}
                            className={`p-2 rounded-lg transition-all ${showVisualSensor ? 'bg-primary text-white shadow-glow-primary' : 'bg-white/5 text-white/40 hover:text-white'}`}
                            title="Visual Sensor"
                        >
                            <CameraIcon className="w-5 h-5" />
                        </button>
                        <button onClick={handleToggle} className="text-white/60 hover:text-white">
                            <ArrowDownIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Visual Sensor Panel */}
                {showVisualSensor && (
                    <div className="relative w-full aspect-video bg-black border-b border-white/10 overflow-hidden group">
                        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded border border-white/10">
                            <div className="w-2 h-2 rounded-full bg-danger animate-pulse"></div>
                            <span className="text-[10px] font-mono text-white font-black uppercase tracking-widest">Visual Audit Active</span>
                        </div>
                        <div className="absolute bottom-3 right-3">
                            <ShieldCheckIcon className="w-6 h-6 text-trust-c2pa drop-shadow-lg" />
                        </div>
                    </div>
                )}

                {/* Chat Display */}
                <div className="flex-1 overflow-hidden relative bg-transparent">
                    <div className="absolute inset-0 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                        {chatMessages.length === 0 && (
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-slate-300 text-sm italic">
                                "Good morning, Dan. What would you like to know about today's compliance operations?"
                            </div>
                        )}
                        {chatMessages.map((msg) => (
                            <AiChatMessage key={msg.id} message={msg} onActionClick={(prompt) => onSendMessage(prompt, 'chat', true)} />
                        ))}
                        {isThinking && (
                            <div className="flex items-start gap-3 px-1 animate-fade-in">
                                <div className="sentinel-avatar bg-slate-800 border-2 border-[#2E86AB]">
                                    <img src={floAvatar} className="w-full h-full object-cover rounded-full" alt="Flo" />
                                </div>
                                <div className="space-y-2 py-2">
                                    <p className="text-[10px] font-mono text-[#2E86AB] animate-pulse tracking-widest">GEMINI_3_REASONING_IN_PROGRESS...</p>
                                    <div className="w-32 h-1 bg-white/5 rounded-full overflow-hidden">
                                        <div className="h-full bg-[#2E86AB] animate-progress-indeterminate"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                </div>

                {/* Input Controls */}
                <div className="p-5 bg-white/5 border-t border-white/10">
                    <form onSubmit={handleSend} className="relative flex items-center gap-3">
                        <button 
                            type="button"
                            onClick={mode === 'voice' ? stopVoice : startVoice}
                            disabled={isMicLocked}
                            className={`p-3 rounded-2xl transition-all ${
                                mode === 'voice' ? 'bg-danger text-white animate-pulse' : 
                                isMicLocked ? 'text-white/10 cursor-not-allowed' : 'text-white/50 hover:text-white hover:bg-white/10 hover:scale-110'
                            }`}
                        >
                            <MicrophoneIcon className="w-6 h-6" />
                        </button>
                        <input 
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={mode === 'voice' ? "Listening for audit commands..." : `Command ${persona}...`}
                            className="flex-1 bg-black/60 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white placeholder-white/10 focus:outline-none focus:border-primary/40 transition-all font-medium"
                        />
                        <button 
                            type="submit"
                            disabled={!input.trim() || isThinking}
                            className={`p-3 rounded-2xl bg-gradient-to-br ${personas[persona].color} text-white hover:brightness-125 disabled:opacity-30 disabled:grayscale transition shadow-[0_0_20px_rgba(46,134,171,0.2)]`}
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Launch FAB with Flo Avatar */}
            <button 
                onClick={handleToggle}
                title="Ask Flo"
                className={`relative w-16 h-16 rounded-3xl shadow-2xl transition-all duration-700 hover:scale-110 active:scale-95 z-50 ${isExpanded ? 'scale-0 opacity-0' : 'scale-100 opacity-100'} animate-pulse-glow`}
            >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-[#2E86AB] via-[#2E86AB] to-blue-900 opacity-80 shadow-[0_0_30px_rgba(46,134,171,0.4)]"></div>
                <div className="absolute inset-0.5 rounded-3xl bg-[#020617] flex flex-col items-center justify-center overflow-hidden border border-white/10 group">
                    <img src={floAvatar} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt="Ask Flo" />
                    <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
            </button>
        </div>
    );
};
