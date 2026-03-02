
import React from 'react';
import { Card } from './ui/Card';
import { useActivityFeed } from '../hooks/useDCAData';
import { ClockIcon, CheckCircleIcon, ServerStackIcon } from './ui/Icons'; 

const formatTimeAgo = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    return `${minutes}m ago`;
};

export const LiveActivityFeed: React.FC = () => {
    const { data: events, loading } = useActivityFeed(true);

    return (
        <Card className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-text-primary flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                    </span>
                    Live Data Stream
                </h3>
                <span className="text-[10px] font-mono text-text-secondary bg-component-light px-2 py-1 rounded border border-border">
                    Port 9780 (Secure)
                </span>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
                {loading && <p className="text-xs text-text-secondary text-center">Connecting to WestFlow Stream...</p>}
                
                {!loading && events.length === 0 && (
                    <p className="text-xs text-text-secondary text-center">No recent activity.</p>
                )}

                {events.map((event, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-component-light border border-border/50 hover:border-primary/30 transition-colors group">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-xs font-bold text-primary">{event.device_id}</span>
                            <span className="text-[10px] text-text-secondary flex items-center gap-1">
                                <ClockIcon className="w-3 h-3" />
                                {formatTimeAgo(event.timestamp)}
                            </span>
                        </div>
                        <p className="text-xs text-text-primary mb-2">{event.title}: {event.description}</p>
                        
                        {/* ALN Integration Pill */}
                        <div className="flex items-center justify-between border-t border-border/50 pt-2 mt-2">
                            <div className="flex items-center gap-1.5">
                                <ServerStackIcon className="w-3 h-3 text-text-secondary opacity-50" />
                                <span className={`text-[9px] font-bold uppercase tracking-wider ${event.esnStatus === 'Synced to LegalServer' ? 'text-success' : 'text-warning'}`}>
                                    {event.esnStatus || 'Queued for ALN'}
                                </span>
                            </div>
                            {event.esnStatus === 'Synced to LegalServer' && (
                                <CheckCircleIcon className="w-3 h-3 text-success" />
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
};
