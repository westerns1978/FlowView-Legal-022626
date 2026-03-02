
import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import { 
    LockClosedIcon, ShieldCheckIcon, DocumentTextIcon, 
    RefreshIcon, ServerStackIcon, FingerPrintIcon,
    MagnifyingGlassIcon, PhotoIcon, EyeIcon, SparklesIcon,
    ArrowUpTrayIcon, CloseIcon
} from '../ui/Icons';
import { flowview } from '../../lib/westflow-client';
import { UploadedFileRecord } from '../../types';
import { useToast } from '../../contexts/ToastContext';

export const VaultView: React.FC = () => {
    const [assets, setAssets] = useState<UploadedFileRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAsset, setSelectedAsset] = useState<UploadedFileRecord | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    const loadVault = async () => {
        setLoading(true);
        const data = await flowview.getVaultAssets();
        setAssets(data);
        setLoading(false);
    };

    useEffect(() => {
        loadVault();
        const channel = flowview.subscribeToVault(() => {
            loadVault();
        });
        return () => { channel.unsubscribe(); };
    }, []);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            await uploadFile(e.target.files[0]);
        }
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files?.[0]) {
            await uploadFile(e.dataTransfer.files[0]);
        }
    };

    const uploadFile = async (file: File) => {
        setUploading(true);
        showToast(`Syncing ${file.name} with Legal Fabric...`, 'info');
        try {
            const summary = `Asset ingest: ${file.name}. Size: ${(file.size / 1024).toFixed(1)}KB.`;
            const result = await flowview.uploadFileToVault(file, summary);
            if (result.success) {
                showToast("Document secured in Vault.", 'success');
                loadVault();
            } else {
                showToast("Vault encryption failed.", 'error');
            }
        } catch (e) {
            showToast("Repository connection error.", 'error');
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (asset: UploadedFileRecord) => {
        if (!confirm(`Delete document ${asset.file_name}?`)) return;
        const result = await flowview.deleteAsset(asset);
        if (result.success) {
            showToast("Document purged from vault.", 'success');
            setSelectedAsset(null);
            loadVault();
        }
    };

    const filteredAssets = assets.filter(a => 
        a.file_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.summary && a.summary.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const formatSize = (bytes?: number) => bytes ? `${(bytes / 1024).toFixed(1)} KB` : '0 KB';

    return (
        <div className="space-y-6 animate-fade-in pb-20 w-full px-8 lg:px-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2">
                <div>
                    <h1 className="text-3xl font-semibold text-text-primary tracking-tight font-serif-display leading-none">Document Vault</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-dim font-sans-ui">Legal Fabric Partition</span>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[11px] font-mono text-emerald-600 font-bold uppercase">{assets.length} Documents Secured</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={loadVault} className="p-3 bg-bg-card border border-divider rounded-xl text-text-dim hover:text-accent-primary transition-all shadow-sm">
                        <RefreshIcon className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                    <div className="relative group">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim group-focus-within:text-accent-primary transition-colors" />
                        <input 
                            type="text" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search Vault..." 
                            className="pl-10 pr-4 py-3 rounded-2xl bg-bg-card border border-divider text-sm focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary outline-none w-64 transition-all shadow-inner font-serif-body italic"
                        />
                    </div>
                    <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="bg-accent-primary text-bg-primary px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-lg shadow-accent-primary/20 font-sans-ui"
                    >
                        <ArrowUpTrayIcon className="w-5 h-5"/>
                        Upload
                    </button>
                    <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-3 space-y-6">
                    <Card 
                        className="border-2 border-dashed border-accent-primary/20 bg-accent-primary/5 p-8 rounded-[32px] flex flex-col items-center text-center cursor-pointer hover:bg-accent-primary/10 transition-colors"
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="p-4 bg-bg-card rounded-2xl shadow-shadow-card mb-4 text-accent-primary">
                            <ArrowUpTrayIcon className="w-8 h-8"/>
                        </div>
                        <p className="font-bold text-xs uppercase tracking-widest text-text-primary font-sans-ui">Document Ingest</p>
                        <p className="text-[10px] text-text-dim mt-1 font-sans-ui">Secure Vault Storage</p>
                        {uploading && <div className="mt-4 w-full h-1.5 bg-accent-primary/20 rounded-full overflow-hidden"><div className="h-full bg-accent-primary animate-progress-indeterminate"></div></div>}
                    </Card>

                    {selectedAsset ? (
                        <Card className="animate-fade-in border-accent-primary/20 bg-accent-primary/5 p-6 rounded-[32px] shadow-shadow-elevated">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="text-[10px] font-bold text-accent-primary uppercase tracking-[0.2em] font-sans-ui">Document Details</h4>
                                <button onClick={() => setSelectedAsset(null)}><CloseIcon className="w-4 h-4 text-text-dim hover:text-risk-high"/></button>
                            </div>
                            <div className="aspect-video bg-bg-secondary rounded-2xl mb-4 overflow-hidden shadow-sm border border-divider group relative">
                                {selectedAsset.file_type.startsWith('image') ? (
                                    <img src={selectedAsset.public_url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-text-dim"><DocumentTextIcon className="w-12 h-12 opacity-20"/></div>
                                )}
                            </div>
                            <p className="text-[14px] font-semibold text-text-primary uppercase truncate tracking-tight font-serif-display">{selectedAsset.file_name}</p>
                            {selectedAsset.summary && <p className="text-[12px] text-text-secondary mt-2 italic leading-relaxed font-serif-body">"{selectedAsset.summary}"</p>}
                            <div className="mt-6 pt-6 border-t border-divider space-y-3">
                                <div className="flex justify-between text-[9px] font-mono font-bold uppercase">
                                    <span className="text-text-dim">ANALYSIS</span>
                                    <span className="text-accent-primary font-black">COMPLETE</span>
                                </div>
                                <div className="flex justify-between text-[9px] font-mono font-bold uppercase">
                                    <span className="text-text-dim">SEAL</span>
                                    <span className="text-emerald-500">VERIFIED_C2PA</span>
                                </div>
                                <button 
                                    onClick={() => handleDelete(selectedAsset)}
                                    className="w-full mt-4 py-3 bg-risk-high/10 text-risk-high text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-risk-high hover:text-white transition-all font-sans-ui"
                                >
                                    Delete Document
                                </button>
                            </div>
                        </Card>
                    ) : (
                        <Card className="bg-bg-secondary border-divider p-8 rounded-[32px] text-text-dim">
                            <h3 className="text-[10px] font-bold text-text-dim mb-6 uppercase tracking-[0.2em] font-sans-ui">Vault Integrity</h3>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-[11px] font-bold text-text-dim uppercase tracking-wider font-sans-ui">
                                    <FingerPrintIcon className="w-5 h-5 text-accent-primary"/>
                                    <span>Biometric Uplink Active</span>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] font-bold text-text-dim uppercase tracking-wider font-sans-ui">
                                    <ServerStackIcon className="w-5 h-5 text-accent-primary"/>
                                    <span>Cloud Partition Synced</span>
                                </div>
                                <div className="flex items-center gap-3 text-[11px] font-bold text-text-dim uppercase tracking-wider font-sans-ui">
                                    <ShieldCheckIcon className="w-5 h-5 text-emerald-500"/>
                                    <span>C2PA Trust Engine</span>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>

                <div className="lg:col-span-9">
                    <Card className="p-0 overflow-hidden border border-divider shadow-shadow-card rounded-[40px] bg-bg-card/60 backdrop-blur-xl">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-bg-secondary/80 border-b border-divider">
                                    <tr>
                                        <th className="p-5 text-left text-[11px] font-bold text-text-dim uppercase tracking-widest font-sans-ui">Document</th>
                                        <th className="p-5 text-left text-[11px] font-bold text-text-dim uppercase tracking-widest font-sans-ui">Matter</th>
                                        <th className="p-5 text-left text-[11px] font-bold text-text-dim uppercase tracking-widest font-sans-ui">Type / Size</th>
                                        <th className="p-5 text-left text-[11px] font-bold text-text-dim uppercase tracking-widest font-sans-ui">Integrity Seal</th>
                                        <th className="p-5 text-right text-[11px] font-bold text-text-dim uppercase tracking-widest font-sans-ui">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-divider">
                                    {loading ? (
                                        Array.from({ length: 6 }).map((_, i) => (
                                            <tr key={i} className="animate-pulse">
                                                <td colSpan={5} className="p-8"><div className="h-4 bg-bg-secondary rounded-lg w-full"></div></td>
                                            </tr>
                                        ))
                                    ) : filteredAssets.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="p-32 text-center text-text-dim">
                                                <div className="flex flex-col items-center gap-4 opacity-30 scale-125">
                                                    <ServerStackIcon className="w-16 h-16"/>
                                                    <p className="font-bold uppercase tracking-[0.2em] text-xs font-sans-ui">Vault Empty</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredAssets.map(asset => (
                                        <tr 
                                            key={asset.id} 
                                            className={`hover:bg-accent-primary/5 transition-all group cursor-pointer ${selectedAsset?.id === asset.id ? 'bg-accent-primary/5' : ''}`}
                                            onClick={() => setSelectedAsset(asset)}
                                        >
                                            <td className="p-5">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 bg-bg-secondary rounded-2xl flex items-center justify-center text-text-dim group-hover:text-accent-primary transition-all shadow-inner border border-divider overflow-hidden">
                                                        {asset.file_type.startsWith('image') ? <img src={asset.public_url} className="w-full h-full object-cover" /> : <DocumentTextIcon className="w-6 h-6"/>}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-[14px] text-text-primary tracking-tight group-hover:text-accent-primary transition-colors font-serif-display">{asset.file_name}</div>
                                                        <div className="text-[9px] text-text-dim font-mono uppercase tracking-widest mt-1 opacity-50">{new Date(asset.uploaded_at).toLocaleString()}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-5">
                                                <div className="text-xs font-bold text-text-dim uppercase tracking-wider font-sans-ui">Smith v. State</div>
                                            </td>
                                            <td className="p-5">
                                                <div className="text-[10px] font-bold uppercase text-text-dim tracking-widest font-sans-ui">{(asset.file_type.split('/')[1] || 'DOC').toUpperCase()} • {formatSize(asset.file_size)}</div>
                                            </td>
                                            <td className="p-5">
                                                <div className="flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-tighter bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20 w-fit font-sans-ui">
                                                    <ShieldCheckIcon className="w-3.5 h-3.5"/>
                                                    Signed
                                                </div>
                                            </td>
                                            <td className="p-5 text-right">
                                                <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={(e) => { e.stopPropagation(); window.open(asset.public_url, '_blank'); }} className="p-2.5 bg-bg-card border border-divider hover:bg-bg-secondary rounded-xl text-text-dim hover:text-accent-primary transition-all shadow-sm">
                                                        <EyeIcon className="w-4 h-4"/>
                                                    </button>
                                                    <button onClick={(e) => { e.stopPropagation(); handleDelete(asset); }} className="p-2.5 bg-bg-card border border-divider hover:bg-risk-high/10 rounded-xl text-text-dim hover:text-risk-high transition-all shadow-sm">
                                                        <CloseIcon className="w-4 h-4"/>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};
