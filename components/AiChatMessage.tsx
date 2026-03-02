

import React from 'react';
import { ChatMessage, ContentBlock, ActionButton, AuditTrailEvent } from '../types';
import { AiChartRenderer } from './AiChartRenderer';
import { SparklesIcon, CopyButton, CheckBadgeIcon, AlertTriangleIcon, TimerIcon, LinkIcon, ShieldCheckIcon, FileTextIcon } from './ui/Icons';
import { useTheme } from '../App';

// --- Sub-components for rendering different block types ---

const TitleBlock: React.FC<{ text: string }> = ({ text }) => (
    <h3 className="text-xl font-bold text-text-primary !mt-0" dangerouslySetInnerHTML={{ __html: ((window as any).marked as any).parseInline(text || '') }}></h3>
);

const SubheaderBlock: React.FC<{ text: string }> = ({ text }) => (
    <h4 className="text-lg font-semibold text-text-secondary border-b border-border-color pb-1" dangerouslySetInnerHTML={{ __html: ((window as any).marked as any).parseInline(text || '') }}></h4>
);

const ParagraphBlock: React.FC<{ text: string }> = ({ text }) => (
    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-p:text-text-secondary prose-headings:text-text-primary prose-strong:text-text-primary" dangerouslySetInnerHTML={{ __html: (window as any).marked.parse(text || '') }} />
);

const TableBlock: React.FC<{ headers: string[], rows: (string | number)[][] }> = ({ headers, rows }) => (
    <div className="overflow-x-auto my-2 border border-border-color rounded-lg bg-background">
        <table className="min-w-full text-xs">
            <thead className="bg-component">
                <tr>
                    {(headers || []).map((header, i) => <th key={i} className="p-2 text-left font-semibold text-text-secondary">{header}</th>)}
                </tr>
            </thead>
            <tbody className="divide-y divide-border-color">
                {(rows || []).map((row, i) => (
                    <tr key={i} className="hover:bg-component-lighter">
                        {row.map((cell, j) => <td key={j} className="p-2 whitespace-nowrap text-text-primary">{cell}</td>)}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const MetricBlock: React.FC<{ label: string; value: string; status?: string }> = ({ label, value, status }) => {
    const { theme } = useTheme();
    const statusClasses: { [key: string]: string } = {
        success: theme === 'dark' ? 'bg-green-900/50 text-green-300 border-green-700/50' : 'bg-green-50 text-green-700 border-green-200',
        warning: theme === 'dark' ? 'bg-yellow-900/50 text-yellow-300 border-yellow-700/50' : 'bg-yellow-50 text-yellow-700 border-yellow-200',
        danger: theme === 'dark' ? 'bg-red-900/50 text-red-300 border-red-700/50' : 'bg-red-50 text-red-700 border-red-200',
        neutral: theme === 'dark' ? 'bg-gray-700 text-gray-200 border-gray-600' : 'bg-component text-slate-600 border-slate-200',
    };
    const color = statusClasses[status || 'neutral'] || statusClasses.neutral;
    return (
        <div className={`p-3 rounded-lg border ${color}`}>
            <p className="text-xs font-semibold uppercase tracking-wider opacity-80">{label || 'Metric'}</p>
            <p className="text-xl font-bold">{value || '-'}</p>
        </div>
    );
};


const ActionsBlock: React.FC<{ buttons: ActionButton[], onClick: (prompt: string) => void }> = ({ buttons, onClick }) => (
    <div className="flex flex-wrap gap-2 pt-2 border-t border-border-color/50 mt-2">
        {(buttons || []).map((button, index) => (
            <button
                key={index}
                onClick={() => onClick(button.action)}
                className="text-xs bg-background hover:bg-border-color text-text-secondary font-semibold py-1.5 px-3 rounded-full transition-all duration-200 border border-border-color"
            >
                {button.label}
            </button>
        ))}
    </div>
);

const VerificationBlock: React.FC<{ status: 'verified' | 'tampered' | 'pending'; text: string; trail?: AuditTrailEvent[] }> = ({ status, text, trail }) => {
    const statusInfo = {
        verified: { icon: CheckBadgeIcon, color: 'text-success bg-success/10 border-success/20' },
        tampered: { icon: AlertTriangleIcon, color: 'text-danger bg-danger/10 border-danger/20' },
        pending: { icon: TimerIcon, color: 'text-warning bg-warning/10 border-warning/20' }
    }[status];
    const Icon = statusInfo.icon;

    return (
        <div className="space-y-2">
            <div className={`flex items-center gap-2 text-sm p-2 rounded-md border ${statusInfo.color}`}>
                <Icon className="w-5 h-5 flex-shrink-0" />
                <strong className="font-semibold">{text}</strong>
            </div>
            {trail && (
                <div className="text-xs text-text-secondary pl-2 border-l-2 border-border ml-2">
                    <p className="font-semibold mb-1">Provenance Chain:</p>
                    {trail.map((event, index) => (
                        <div key={index} className="relative pl-4 pb-2 last:pb-0">
                             <div className="absolute left-[-5px] top-1 w-2 h-2 rounded-full bg-border"></div>
                             <p className="font-medium text-text-primary">{event.step}</p>
                             <p className="text-text-secondary">{event.details}</p>
                             <p className="text-text-secondary opacity-70">{event.timestamp}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const GroundingSources: React.FC<{ metadata: any }> = ({ metadata }) => {
    if (!metadata?.groundingChunks || metadata.groundingChunks.length === 0) {
        return null;
    }
    
    const webSources = metadata.groundingChunks
        .map((chunk: any) => chunk.web)
        .filter((web: any) => web && web.uri);
    
    // Extract Maps sources if available. Note: The API structure may present maps data in various ways,
    // but based on standard response, we look for chunks with 'maps' property.
    // We will filter chunks that have the 'maps' property populated.
    // Check if the 'maps' property exists on the chunk directly or nested.
    // Assuming chunk structure could contain { web: ... } or { maps: ... }
    // In some versions of the SDK/API, maps data is distinct. 
    // We will inspect all chunks.
    
    // Let's aggregate sources into a unified list for display.
    
    return (
        <div className="mt-3 pt-3 border-t border-border-color/50">
            <h5 className="text-xs font-semibold text-text-secondary mb-2 flex items-center gap-1.5">
                <LinkIcon className="w-4 h-4" />
                Sources & Locations
            </h5>
            <ol className="list-decimal list-inside space-y-1 text-xs">
                {metadata.groundingChunks.map((chunk: any, index: number) => {
                    if (chunk.web?.uri) {
                        return (
                             <li key={index} className="text-primary truncate">
                                <a 
                                    href={chunk.web.uri} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    title={chunk.web.title}
                                    className="hover:underline"
                                >
                                    {chunk.web.title || chunk.web.uri}
                                </a>
                            </li>
                        );
                    }
                    if (chunk.maps?.placeId) {
                         // Google Maps grounding chunk
                         // Construct a Google Maps URL using the place ID or URI if provided
                         const mapsUrl = chunk.maps.uri || `https://www.google.com/maps/place/?q=place_id:${chunk.maps.placeId}`;
                         const title = chunk.maps.title || chunk.maps.address || "Map Location";
                         return (
                            <li key={index} className="text-primary truncate">
                                <span className="text-text-secondary mr-1">📍</span>
                                <a
                                    href={mapsUrl}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    title={title}
                                    className="hover:underline"
                                >
                                    {title}
                                </a>
                            </li>
                         );
                    }
                    return null;
                })}
            </ol>
        </div>
    );
};


const renderBlock = (block: ContentBlock, key: number, onActionClick: (prompt: string) => void) => {
    switch (block.type) {
        case 'title': return <TitleBlock key={key} text={block.text} />;
        case 'subheader': return <SubheaderBlock key={key} text={block.text} />;
        case 'paragraph': return <ParagraphBlock key={key} text={block.text} />;
        case 'table': return <TableBlock key={key} headers={block.headers} rows={block.rows} />;
        case 'metric': return <MetricBlock key={key} label={block.label} value={block.value} status={block.status} />;
        case 'chart': return block.chartData ? <div key={key} className="mt-2 bg-background p-2 rounded-md border border-border-color"><AiChartRenderer chartData={block.chartData} /></div> : null;
        case 'actions': return block.buttons ? <ActionsBlock key={key} buttons={block.buttons} onClick={onActionClick} /> : null;
        case 'verification': return <VerificationBlock key={key} status={block.status} text={block.text} trail={block.trail} />;
        case 'image_prompt': return null; // This block is handled in the parent for generation
        default: return <p key={key} className="text-xs text-danger">Unsupported content block type.</p>;
    }
};


// --- Main Chat Message Component ---

interface AiChatMessageProps {
    message: ChatMessage;
    onActionClick: (prompt: string) => void;
}

export const AiChatMessage: React.FC<AiChatMessageProps> = ({ message, onActionClick }) => {
    const { theme } = useTheme();
    const isUser = message.sender === 'user';
    
    if (isUser) {
        const proseClass = theme === 'light' ? 'prose-invert' : '';
        return (
            <div className="flex items-end gap-2.5 justify-end animate-fade-in">
                <div className={`prose prose-sm max-w-2xl chat-bubble--user ${proseClass}`}>
                    {message.imageUrl && (
                        <img src={message.imageUrl} alt="User upload" className="rounded-md max-w-full h-auto mb-2" />
                    )}
                    {message.documentName && (
                        <div className="flex items-center gap-2 p-2 bg-white/20 rounded-md mb-2">
                            <FileTextIcon className="w-5 h-5 text-white flex-shrink-0" />
                            <span className="font-semibold truncate">{message.documentName}</span>
                        </div>
                    )}
                    {message.text && <p>{message.text}</p>}
                </div>
            </div>
        );
    }
    
    const hasBlocks = message.blocks && message.blocks.length > 0;

    // For AI messages, render the structured blocks or fallback to text.
    return (
        <div className="flex items-start gap-2.5 justify-start animate-fade-in">
            <div className="sentinel-avatar">S</div>
            <div className="max-w-2xl w-full">
                <div className="chat-bubble--sentinel space-y-3">
                    {hasBlocks ? 
                        (message.blocks || []).map((block, index) => renderBlock(block, index, onActionClick))
                      : (
                        <div className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-p:text-text-secondary prose-headings:text-text-primary prose-strong:text-text-primary" dangerouslySetInnerHTML={{ __html: (window as any).marked.parse(message.text || '...') }} />
                      )
                    }
                    
                    {message.imageIsLoading && (
                        <div className="mt-4 flex items-center justify-center text-sm text-text-secondary">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent mr-2"></div>
                            Generating image...
                        </div>
                    )}
                    {message.imageUrl && (
                         <div className="mt-2">
                            <img src={message.imageUrl} alt="AI generated content" className="rounded-lg shadow-md max-w-full h-auto" />
                         </div>
                    )}

                    {message.groundingMetadata && <GroundingSources metadata={message.groundingMetadata} />}
                </div>
                <div className="flex justify-between items-center mt-1.5 px-1">
                    <div className="flex items-center gap-1.5 text-xs text-trust-c2pa font-semibold">
                       <ShieldCheckIcon className="w-4 h-4"/>
                       <span>C2PA Verified</span>
                    </div>
                    {message.text && <CopyButton text={message.text} />}
                </div>
            </div>
        </div>
    );
};