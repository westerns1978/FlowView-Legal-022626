
import React, { useState, useMemo } from 'react';
import { Card } from '../ui/Card';
import { 
    CalendarIcon, 
    ClockIcon, 
    MapPinIcon, 
    UserIcon, 
    SparklesIcon,
    ChevronRightIcon,
    ScaleIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon
} from '../ui/Icons';

interface CalendarEvent {
    id: string;
    title: string;
    type: 'Court Date' | 'Filing Deadline' | 'Client Meeting' | 'Deposition';
    date: string;
    time: string;
    location: string;
    matter: string;
    priority: 'High' | 'Medium' | 'Low';
    status: 'Pending' | 'Completed' | 'Overdue';
}

const MOCK_EVENTS: CalendarEvent[] = [
    {
        id: 'EVT-001',
        title: 'Motion to Dismiss Hearing',
        type: 'Court Date',
        date: '2024-05-15',
        time: '09:30 AM',
        location: 'Superior Court, Room 402',
        matter: 'Smith v. Jones Corp',
        priority: 'High',
        status: 'Pending'
    },
    {
        id: 'EVT-002',
        title: 'Discovery Response Deadline',
        type: 'Filing Deadline',
        date: '2024-05-16',
        time: '05:00 PM',
        location: 'Electronic Filing',
        matter: 'Tech Solutions IP Dispute',
        priority: 'High',
        status: 'Pending'
    },
    {
        id: 'EVT-003',
        title: 'Pre-Trial Settlement Conference',
        type: 'Client Meeting',
        date: '2024-05-18',
        time: '02:00 PM',
        location: 'Main Conference Room',
        matter: 'Doe Personal Injury',
        priority: 'Medium',
        status: 'Pending'
    },
    {
        id: 'EVT-004',
        title: 'Deposition of Key Witness',
        type: 'Deposition',
        date: '2024-05-20',
        time: '10:00 AM',
        location: 'Remote via Zoom',
        matter: 'Global Logistics Contract',
        priority: 'High',
        status: 'Pending'
    },
    {
        id: 'EVT-005',
        title: 'Appellate Brief Filing',
        type: 'Filing Deadline',
        date: '2024-05-22',
        time: '11:59 PM',
        location: 'Appellate Court Portal',
        matter: 'State v. Miller Appeal',
        priority: 'High',
        status: 'Pending'
    }
];

export const CalendarView: React.FC<{ onOpenAiCommandCenter: (p: string) => void }> = ({ onOpenAiCommandCenter }) => {
    const [filter, setFilter] = useState<'All' | 'Court Date' | 'Filing Deadline' | 'Client Meeting'>('All');

    const filteredEvents = useMemo(() => {
        if (filter === 'All') return MOCK_EVENTS;
        return MOCK_EVENTS.filter(e => e.type === filter);
    }, [filter]);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'text-risk-high bg-risk-high/10 border-risk-high/20';
            case 'Medium': return 'text-risk-medium bg-risk-medium/10 border-risk-medium/20';
            case 'Low': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            default: return 'text-text-dim bg-bg-secondary border-divider';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Court Date': return <ScaleIcon className="w-5 h-5" />;
            case 'Filing Deadline': return <CalendarIcon className="w-5 h-5" />;
            case 'Client Meeting': return <UserIcon className="w-5 h-5" />;
            case 'Deposition': return <ClockIcon className="w-5 h-5" />;
            default: return <CalendarIcon className="w-5 h-5" />;
        }
    };

    return (
        <div className="flex flex-col h-full space-y-6 animate-fade-in px-4 lg:px-8 w-full pb-10 pt-2 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-text-primary tracking-tight font-serif-display">Legal Calendar</h1>
                    <p className="text-text-dim text-sm font-serif-body italic">Critical deadlines and court appearances.</p>
                </div>
                <div className="flex bg-bg-secondary p-1 rounded-2xl border border-divider shadow-inner">
                    {['All', 'Court Date', 'Filing Deadline', 'Client Meeting'].map((t) => (
                        <button 
                            key={t}
                            onClick={() => setFilter(t as any)}
                            className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${
                                filter === t ? 'bg-accent-primary text-bg-primary shadow-lg' : 'text-text-dim hover:text-text-primary'
                            }`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Timeline View */}
                <div className="lg:col-span-8 space-y-6">
                    {filteredEvents.map((event, idx) => (
                        <div key={event.id} className="relative pl-8 group">
                            {/* Timeline line */}
                            {idx !== filteredEvents.length - 1 && (
                                <div className="absolute left-[15px] top-10 bottom-0 w-0.5 bg-divider group-hover:bg-accent-primary/30 transition-colors" />
                            )}
                            
                            {/* Timeline dot */}
                            <div className={`absolute left-0 top-2 w-8 h-8 rounded-full border-4 border-bg-primary flex items-center justify-center z-10 transition-all group-hover:scale-110 ${
                                event.priority === 'High' ? 'bg-risk-high' : 'bg-accent-primary'
                            }`}>
                                <div className="w-2 h-2 rounded-full bg-white" />
                            </div>

                            <Card className="p-6 hover:shadow-xl transition-all border-l-4 hover:border-accent-primary group-hover:translate-x-1">
                                <div className="flex flex-col md:flex-row justify-between gap-4">
                                    <div className="flex-grow">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase tracking-widest font-sans-ui flex items-center gap-1.5 ${getPriorityColor(event.priority)}`}>
                                                {event.priority === 'High' && <ExclamationTriangleIcon className="w-3 h-3" />}
                                                {event.priority} Priority
                                            </span>
                                            <span className="text-[10px] font-bold text-text-dim uppercase tracking-widest font-sans-ui flex items-center gap-1.5">
                                                {getTypeIcon(event.type)}
                                                {event.type}
                                            </span>
                                        </div>
                                        <h3 className="text-xl font-semibold text-text-primary font-serif-display mb-1">{event.title}</h3>
                                        <p className="text-accent-primary text-sm font-bold uppercase tracking-widest font-sans-ui mb-3">{event.matter}</p>
                                        
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-text-dim font-serif-body italic">
                                            <div className="flex items-center gap-2">
                                                <ClockIcon className="w-4 h-4 text-accent-primary" />
                                                <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} at {event.time}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPinIcon className="w-4 h-4 text-accent-primary" />
                                                <span>{event.location}</span>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="flex flex-row md:flex-col justify-end items-center md:items-end gap-3 shrink-0">
                                        <button 
                                            onClick={() => onOpenAiCommandCenter(`Draft ${event.type === 'Filing Deadline' ? 'filing' : 'briefing'} for ${event.title}`)}
                                            className="flex items-center gap-2 bg-accent-primary/10 text-accent-primary px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-accent-primary hover:text-bg-primary transition-all group/btn"
                                        >
                                            <SparklesIcon className="w-3.5 h-3.5 group-hover/btn:animate-pulse" />
                                            {event.type === 'Filing Deadline' ? 'Draft Filing' : 'Draft Briefing'}
                                        </button>
                                        <button className="p-2 text-text-dim hover:text-text-primary transition-colors">
                                            <ChevronRightIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    ))}
                </div>

                {/* Sidebar Stats */}
                <div className="lg:col-span-4 space-y-6">
                    <Card className="p-6 bg-bg-card border border-divider">
                        <h3 className="text-xs font-black text-text-dim uppercase tracking-widest mb-6 font-sans-ui">Deadline Summary</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-risk-high/10 flex items-center justify-center text-risk-high">
                                        <ExclamationTriangleIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-text-primary">Urgent Deadlines</p>
                                        <p className="text-[10px] text-text-dim uppercase tracking-wider">Next 48 Hours</p>
                                    </div>
                                </div>
                                <span className="text-2xl font-black text-risk-high">3</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                                        <ScaleIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-text-primary">Court Dates</p>
                                        <p className="text-[10px] text-text-dim uppercase tracking-wider">This Week</p>
                                    </div>
                                </div>
                                <span className="text-2xl font-black text-accent-primary">5</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                        <CheckCircleIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-text-primary">Completed</p>
                                        <p className="text-[10px] text-text-dim uppercase tracking-wider">This Month</p>
                                    </div>
                                </div>
                                <span className="text-2xl font-black text-emerald-500">12</span>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6 bg-gradient-to-br from-accent-subtle to-bg-card border border-accent-border">
                        <div className="flex items-center gap-3 mb-4">
                            <SparklesIcon className="w-5 h-5 text-accent-primary" />
                            <h3 className="text-xs font-black text-accent-primary uppercase tracking-widest font-sans-ui">AI Calendar Insight</h3>
                        </div>
                        <p className="text-text-primary font-serif-body italic text-sm leading-relaxed">
                            "You have a heavy litigation schedule on Wednesday. I recommend drafting the Smith v. Jones brief today to avoid the filing bottleneck."
                        </p>
                        <button 
                            onClick={() => onOpenAiCommandCenter("Optimize my litigation schedule for this week")}
                            className="w-full mt-6 bg-accent-primary text-bg-primary py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:brightness-110 transition-all shadow-lg shadow-accent-primary/20"
                        >
                            Optimize Schedule
                        </button>
                    </Card>
                </div>
            </div>
        </div>
    );
};
