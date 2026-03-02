
import React, { useState, useMemo, useEffect } from 'react';
import { AppData, TravelLogEntry } from '../../types';
import { Card } from '../ui/Card';
import { ArrowUpTrayIcon, ServerStackIcon } from '../ui/Icons';

type SortConfig = { key: keyof TravelLogEntry, direction: 'ascending' | 'descending' };
type ViewMode = 'list' | 'map';

const SortableHeader: React.FC<{
    label: string;
    sortKey: keyof TravelLogEntry;
    sortConfig: SortConfig;
    requestSort: (key: keyof TravelLogEntry) => void;
}> = ({ label, sortKey, sortConfig, requestSort }) => {
    const isSorted = sortConfig.key === sortKey;
    const directionIcon = isSorted ? (sortConfig.direction === 'ascending' ? '▲' : '▼') : '';
    return (
        <th className="p-3 text-left font-semibold text-text-secondary">
            <button onClick={() => requestSort(sortKey)} className="flex items-center gap-1 hover:text-text-primary">
                {label} <span className="text-xs">{directionIcon}</span>
            </button>
        </th>
    );
};

const FleetMap: React.FC<{ data: TravelLogEntry[] }> = ({ data }) => {
    return (
        <div className="relative w-full h-[500px] bg-[#e8eaed] rounded-[32px] overflow-hidden border border-border shadow-inner">
            <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ 
                backgroundImage: 'url("https://placehold.co/1200x800/e8eaed/a0aec0?text=ACS-LEGAL+Geospatial+Fabric")' 
            }}>
                <div className="w-full h-full flex flex-col items-center justify-center bg-white/20 backdrop-blur-[1px]">
                     <div className="p-5 bg-white/95 rounded-2xl shadow-2xl text-center border border-white">
                        <p className="font-black text-slate-800 uppercase tracking-tighter">Live Deployment Map</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{data.length} Nodes reporting position</p>
                     </div>
                </div>
            </div>
            
            <div className="absolute top-6 left-6 bg-white p-2 rounded-xl shadow-xl z-10 flex flex-col gap-2 border border-slate-200">
                <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 text-slate-600 font-black text-xl">+</button>
                <div className="h-[1px] w-8 bg-slate-100 mx-auto"></div>
                <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 text-slate-600 font-black text-xl">-</button>
            </div>

            <div className="absolute top-6 right-6 bg-slate-900 px-4 py-2.5 rounded-2xl shadow-2xl z-10 flex items-center gap-3 border border-white/10">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_#10b981]"></div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Active GPS Tunnel</span>
            </div>
            
            <div className="absolute bottom-6 left-6 bg-white/90 px-3 py-1.5 rounded-lg text-[9px] font-bold text-slate-500 shadow-sm border border-slate-200">
                Fabric Data ©2025 WestFlow Engineering
            </div>

            <div className="absolute bottom-6 right-6 bg-white/95 p-4 rounded-2xl shadow-xl z-10 border border-slate-200 space-y-2">
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-sky-500 flex items-center justify-center text-[8px] text-white shadow-sm">🤖</div>
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Autonomous Program</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full bg-slate-600 flex items-center justify-center text-[8px] text-white shadow-sm">🖨️</div>
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Managed Client Node</span>
                </div>
            </div>

            {data.slice(0, 15).map((entry, i) => {
                const isRobot = i % 3 === 0; 
                const markerColor = isRobot ? "#0284c7" : "#475569";
                const glowColor = isRobot ? "rgba(2, 132, 199, 0.4)" : "rgba(71, 85, 105, 0.4)";
                const icon = isRobot ? "🤖" : "🖨️";

                return (
                    <div 
                        key={entry.id}
                        className="absolute group cursor-pointer transform transition-all hover:scale-125 hover:-translate-y-3 duration-300"
                        style={{ 
                            left: `${15 + (i * 6) + (Math.random() * 4)}%`, 
                            top: `${20 + (i * 5) + (Math.random() * 8)}%` 
                        }}
                    >
                        <div className="relative">
                            {/* Device Type Badge Background */}
                            <div className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 animate-pulse transition-opacity" style={{ backgroundColor: glowColor }}></div>
                            
                            <svg width="40" height="52" viewBox="0 0 30 42" fill="none" className="drop-shadow-2xl relative z-10">
                                <path d="M15 0C6.71573 0 0 6.71573 0 15C0 26.25 15 42 15 42C15 42 30 26.25 30 15C30 6.71573 23.2843 0 15 0Z" fill={markerColor}/>
                                <circle cx="15" cy="15" r="11" fill="white"/>
                            </svg>
                            <div className="absolute top-1.5 left-1.5 w-7 h-7 flex items-center justify-center text-[15px] z-20">
                                {icon}
                            </div>
                            
                            {/* Type indicator mini-badge */}
                            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center shadow-md z-30 ${isRobot ? 'bg-sky-400' : 'bg-slate-500'}`}>
                                <div className="w-1 h-1 rounded-full bg-white"></div>
                            </div>
                        </div>
                        
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-slate-900 text-white px-4 py-3 rounded-[20px] shadow-2xl opacity-0 group-hover:opacity-100 transition-all z-40 whitespace-nowrap pointer-events-none border border-white/20 scale-90 group-hover:scale-100 origin-bottom">
                            <div className="flex items-center gap-3 mb-2">
                                <div className={`p-1.5 rounded-lg ${isRobot ? 'bg-sky-500' : 'bg-slate-700'}`}>
                                    <span className="text-xs">{icon}</span>
                                </div>
                                <div>
                                    <div className="font-black uppercase tracking-tighter text-sm">{isRobot ? 'Program Unit' : 'Client Node'}</div>
                                    <div className="text-[8px] font-mono text-emerald-400 font-bold uppercase tracking-widest">Linked Identity: Verified</div>
                                </div>
                            </div>
                            <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] border-t border-white/5 pt-2">
                                Location: {entry.checkin_location}
                            </div>
                            <div className="absolute bottom-[-6px] left-1/2 -translate-x-1/2 w-3 h-3 bg-slate-900 rotate-45 border-r border-b border-white/20"></div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export const TravelHistoryView: React.FC<{ appData: AppData; filterByEmployeeId?: number | null; onClearFilter: () => void }> = ({ appData, filterByEmployeeId, onClearFilter }) => {
    const { travelData, foundationalData } = appData;
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'check_in', direction: 'descending' });
    const [selectedUserId, setSelectedUserId] = useState<string | 'all'>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    
    useEffect(() => {
        if (filterByEmployeeId) {
            const employee = (foundationalData.technicians || []).find(t => t.id === filterByEmployeeId);
            if (employee && employee.uuid) {
                setSelectedUserId(employee.uuid);
            }
        } else {
            setSelectedUserId('all');
        }
    }, [filterByEmployeeId, foundationalData.technicians]);

    const userNameMap = useMemo(() => {
        return (foundationalData.technicians || []).reduce((acc, tech) => {
            if(tech.uuid) acc[tech.uuid] = tech.name;
            return acc;
        }, {} as Record<string, string>);
    }, [foundationalData.technicians]);

    const sortedAndFilteredData = useMemo(() => {
        let filteredData = [...(travelData || [])];

        if (selectedUserId !== 'all') {
            filteredData = filteredData.filter(item => item.user_id === selectedUserId);
        }

        filteredData.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];
            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });

        return filteredData;
    }, [travelData, sortConfig, selectedUserId]);
    
     const requestSort = (key: keyof TravelLogEntry) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    return (
        <div className="space-y-4 animate-fade-in">
            <Card className="p-0 overflow-hidden">
                <div className="p-6 border-b border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 bg-component/40">
                    <div>
                        <h3 className="text-xl font-black text-text-primary uppercase tracking-tighter">Geospatial Caseload Orchestration</h3>
                        <p className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-1">Live Fabric Handshake: SYNC_OK</p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex bg-component-light rounded-xl p-1 border border-border shadow-inner">
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'list' ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:text-text-primary'}`}
                            >
                                List
                            </button>
                            <button 
                                onClick={() => setViewMode('map')}
                                className={`px-5 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${viewMode === 'map' ? 'bg-primary text-white shadow-lg' : 'text-text-secondary hover:text-text-primary'}`}
                            >
                                Map
                            </button>
                        </div>
                        <select
                            value={selectedUserId}
                            onChange={(e) => {
                                setSelectedUserId(e.target.value);
                                if (e.target.value === 'all') onClearFilter();
                            }}
                            className="p-2.5 border border-border rounded-xl bg-white dark:bg-slate-800 text-[11px] font-black uppercase tracking-widest shadow-sm outline-none focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="all">All Client Nodes</option>
                            {(foundationalData.technicians || []).map(tech => (
                                tech.uuid && <option key={tech.uuid} value={tech.uuid}>{tech.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {viewMode === 'list' ? (
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left">
                            <thead className="bg-component-light/80 border-b border-border">
                                <tr className="text-[10px] font-black text-text-secondary uppercase tracking-[0.2em]">
                                    <SortableHeader label="Entity Identity" sortKey="user_id" sortConfig={sortConfig} requestSort={requestSort} />
                                    <SortableHeader label="Ingest TS" sortKey="check_in" sortConfig={sortConfig} requestSort={requestSort} />
                                    <SortableHeader label="Operational Context" sortKey="checkin_location" sortConfig={sortConfig} requestSort={requestSort} />
                                    <SortableHeader label="Release TS" sortKey="check_out" sortConfig={sortConfig} requestSort={requestSort} />
                                    <SortableHeader label="Compliance Action" sortKey="fd_ticket_id" sortConfig={sortConfig} requestSort={requestSort} />
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                                {sortedAndFilteredData.map(item => (
                                    <tr key={item.id} className="hover:bg-primary/5 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-component border border-border flex items-center justify-center text-text-secondary group-hover:text-primary transition-colors shadow-inner font-black text-[10px]">
                                                    {userNameMap[item.user_id]?.charAt(0) || '?'}
                                                </div>
                                                <div className="font-black text-text-primary text-xs uppercase tracking-tight">
                                                    {userNameMap[item.user_id] || 'Unknown Identity'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-[11px] font-mono font-bold text-text-secondary">
                                            {new Date(item.check_in).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                        </td>
                                        <td className="p-4 text-[11px] font-black text-text-primary uppercase tracking-tight">
                                            {item.checkin_location}
                                        </td>
                                        <td className="p-4 text-[11px] font-mono font-bold text-text-secondary">
                                            {item.check_out ? new Date(item.check_out).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : <span className="text-emerald-500 animate-pulse">ACTIVE_COMPLIANCE_SESSION</span>}
                                        </td>
                                        <td className="p-4">
                                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-[9px] font-black text-slate-500 uppercase tracking-widest border border-border">
                                                <ServerStackIcon className="w-3 h-3"/>
                                                #{item.fd_ticket_id || 'LOCAL'}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {sortedAndFilteredData.length === 0 && (
                            <div className="p-20 text-center flex flex-col items-center gap-4 opacity-30">
                                <ArrowUpTrayIcon className="w-12 h-12" />
                                <p className="font-black uppercase tracking-[0.3em] text-xs">Zero Client Nodes Located</p>
                            </div>
                        )}
                    </div>
                ) : (
                    <FleetMap data={sortedAndFilteredData} />
                )}
            </Card>
        </div>
    );
};
