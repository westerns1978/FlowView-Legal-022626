
import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { 
    ChatBubbleLeftRightIcon, 
    UserGroupIcon, 
    LockClosedIcon, 
    SparklesIcon,
    PaperAirplaneIcon,
    UserIcon,
    ShieldCheckIcon,
    MagnifyingGlassIcon,
    InformationCircleIcon
} from '../ui/Icons';

interface Message {
    id: string;
    sender: string;
    content: string;
    timestamp: string;
    isAi?: boolean;
    isMe?: boolean;
}

interface Channel {
    id: string;
    name: string;
    type: 'Internal' | 'Client' | 'Co-Counsel';
    lastMessage: string;
    unread?: number;
}

const MOCK_CHANNELS: Channel[] = [
    { id: 'ch-1', name: 'Internal: Litigation Team', type: 'Internal', lastMessage: 'The brief is ready for review.', unread: 2 },
    { id: 'ch-2', name: 'Client: Smith v. Jones', type: 'Client', lastMessage: 'Thank you for the update.', unread: 0 },
    { id: 'ch-3', name: 'Co-Counsel: Global Logistics', type: 'Co-Counsel', lastMessage: 'We need to discuss the discovery strategy.', unread: 5 },
    { id: 'ch-4', name: 'Internal: Managing Partners', type: 'Internal', lastMessage: 'Quarterly targets have been met.', unread: 0 },
];

const MOCK_MESSAGES: Message[] = [
    { id: 'm-1', sender: 'Sarah Miller', content: 'I have finished the initial draft of the motion to dismiss for the Smith case.', timestamp: '10:30 AM' },
    { id: 'm-2', sender: 'John Davis', content: 'Great work, Sarah. I will take a look at it after lunch.', timestamp: '10:35 AM' },
    { id: 'm-3', sender: 'AI Assistant', content: 'I have analyzed the draft and identified 3 potential areas for improvement based on recent 9th Circuit rulings.', timestamp: '10:36 AM', isAi: true },
    { id: 'm-4', sender: 'Sarah Miller', content: 'Thanks, AI. Can you highlight those sections for me?', timestamp: '10:40 AM' },
    { id: 'm-5', sender: 'Me', content: 'I am joining the review now. Let\'s aim to file by EOD.', timestamp: '10:45 AM', isMe: true },
];

export const CommsView: React.FC<{ onOpenAiCommandCenter: (p: string) => void }> = ({ onOpenAiCommandCenter }) => {
    const [selectedChannelId, setSelectedChannelId] = useState(MOCK_CHANNELS[0].id);
    const [messageInput, setMessageInput] = useState('');

    const selectedChannel = useMemo(() => 
        MOCK_CHANNELS.find(c => c.id === selectedChannelId), 
    [selectedChannelId]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput) return;
        // In a real app, we'd add the message to the list
        setMessageInput('');
    };

    return (
        <div className="flex h-full animate-fade-in overflow-hidden border border-divider rounded-[32px] bg-bg-card shadow-2xl max-w-[1600px] mx-auto w-full">
            {/* Sidebar */}
            <div className="w-80 border-r border-divider flex flex-col bg-bg-secondary/30">
                <div className="p-6 border-b border-divider">
                    <h2 className="text-xl font-bold text-text-primary font-serif-display mb-4">Secure Comms</h2>
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
                        <input 
                            type="text" 
                            placeholder="Search channels..." 
                            className="w-full pl-9 pr-4 py-2 bg-bg-card border border-divider rounded-xl text-xs outline-none focus:border-accent-primary transition-all font-sans-ui"
                        />
                    </div>
                </div>
                
                <div className="flex-grow overflow-y-auto custom-scrollbar">
                    {MOCK_CHANNELS.map((channel) => (
                        <div 
                            key={channel.id}
                            onClick={() => setSelectedChannelId(channel.id)}
                            className={`p-4 cursor-pointer border-b border-divider/50 transition-all hover:bg-bg-secondary ${
                                selectedChannelId === channel.id ? 'bg-bg-secondary border-l-4 border-l-accent-primary' : ''
                            }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border ${
                                    channel.type === 'Internal' ? 'text-accent-primary border-accent-primary/20 bg-accent-primary/5' :
                                    channel.type === 'Client' ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/5' :
                                    'text-risk-medium border-risk-medium/20 bg-risk-medium/5'
                                }`}>
                                    {channel.type}
                                </span>
                                {channel.unread ? (
                                    <span className="bg-risk-high text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">{channel.unread}</span>
                                ) : null}
                            </div>
                            <h3 className="text-sm font-bold text-text-primary truncate font-sans-ui">{channel.name}</h3>
                            <p className="text-[10px] text-text-dim truncate mt-1 italic font-serif-body">{channel.lastMessage}</p>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-divider bg-bg-secondary/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-accent-primary flex items-center justify-center text-bg-primary font-bold">JD</div>
                        <div>
                            <p className="text-xs font-bold text-text-primary">John Davis</p>
                            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Online
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-grow flex flex-col bg-bg-card relative">
                {/* Chat Header */}
                <div className="p-4 border-b border-divider flex justify-between items-center bg-bg-card/80 backdrop-blur-sm sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center text-accent-primary border border-divider">
                            <ChatBubbleLeftRightIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-text-primary font-serif-display">{selectedChannel?.name}</h3>
                            <div className="flex items-center gap-2 text-[10px] text-text-dim font-bold uppercase tracking-widest">
                                <LockClosedIcon className="w-3 h-3 text-emerald-500" />
                                End-to-End Encrypted
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => onOpenAiCommandCenter(`Summarize the recent messages in ${selectedChannel?.name}`)}
                            className="flex items-center gap-2 bg-accent-primary/10 text-accent-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent-primary hover:text-bg-primary transition-all"
                        >
                            <SparklesIcon className="w-3.5 h-3.5" />
                            Summarize Thread
                        </button>
                        <button className="p-2 text-text-dim hover:text-text-primary transition-colors">
                            <InformationCircleIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar bg-bg-secondary/10">
                    <div className="text-center">
                        <span className="text-[10px] font-bold text-text-dim uppercase tracking-[0.3em] bg-bg-secondary px-4 py-1 rounded-full border border-divider">Today</span>
                    </div>

                    {MOCK_MESSAGES.map((msg) => (
                        <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] flex gap-3 ${msg.isMe ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                                    msg.isAi ? 'bg-accent-primary/10 border-accent-primary/20 text-accent-primary' : 
                                    msg.isMe ? 'bg-bg-secondary border-divider text-text-primary' :
                                    'bg-bg-secondary border-divider text-text-primary'
                                }`}>
                                    {msg.isAi ? <SparklesIcon className="w-4 h-4" /> : <UserIcon className="w-4 h-4" />}
                                </div>
                                <div>
                                    <div className={`flex items-center gap-2 mb-1 ${msg.isMe ? 'justify-end' : ''}`}>
                                        <span className="text-[10px] font-black text-text-primary uppercase tracking-widest font-sans-ui">{msg.sender}</span>
                                        <span className="text-[9px] text-text-dim font-bold">{msg.timestamp}</span>
                                    </div>
                                    <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                        msg.isAi ? 'bg-gradient-to-br from-accent-subtle to-bg-card border border-accent-border text-text-primary font-serif-body italic' :
                                        msg.isMe ? 'bg-accent-primary text-bg-primary font-sans-ui font-medium' :
                                        'bg-bg-card border border-divider text-text-primary font-sans-ui'
                                    }`}>
                                        {msg.content}
                                    </div>
                                    {msg.isAi && (
                                        <div className="mt-2 flex gap-2">
                                            <button className="text-[9px] font-black uppercase tracking-widest text-accent-primary hover:underline">Apply Suggestions</button>
                                            <button className="text-[9px] font-black uppercase tracking-widest text-text-dim hover:underline">Dismiss</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-divider bg-bg-card">
                    <div className="flex items-center gap-3 mb-3">
                        <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Secure Legal Channel Active</span>
                    </div>
                    <form onSubmit={handleSendMessage} className="relative">
                        <textarea 
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            placeholder="Type a secure message..."
                            className="w-full p-4 pr-16 bg-bg-secondary/30 border border-divider rounded-2xl outline-none focus:border-accent-primary transition-all text-sm font-sans-ui resize-none h-24"
                        />
                        <button 
                            type="submit"
                            className="absolute right-4 bottom-4 w-10 h-10 bg-accent-primary text-bg-primary rounded-xl flex items-center justify-center hover:brightness-110 transition-all shadow-lg shadow-accent-primary/20"
                        >
                            <PaperAirplaneIcon className="w-5 h-5 -rotate-45" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
