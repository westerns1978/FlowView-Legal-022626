import React, { useState, useRef, DragEvent } from 'react';
import { ArrowUpTrayIcon, SupabaseIcon, CheckCircleIcon } from './ui/Icons';
import { useToast } from '../contexts/ToastContext';

// --- UI Sub-components (similar to Shadcn UI) ---

const Label: React.FC<{ htmlFor: string; children: React.ReactNode; className?: string }> = ({ htmlFor, children, className }) => (
    <label htmlFor={htmlFor} className={`text-sm font-semibold text-text-primary ${className}`}>{children}</label>
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
    <input {...props} className={`mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary focus:outline-none bg-background border-border text-text-primary ${props.className}`} />
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = (props) => (
    <button {...props} className={`w-full flex items-center justify-center gap-2 bg-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-accent transition disabled:opacity-60 disabled:cursor-not-allowed ${props.className}`}>
        {props.children}
    </button>
);

const Spinner: React.FC = () => <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>;

// --- Main Component ---

interface PostgresConnectorCardProps {
    onOpenDataPlayground: () => void;
}

type Status = 'idle' | 'loading' | 'success' | 'error';

export const PostgresConnectorCard: React.FC<PostgresConnectorCardProps> = ({ onOpenDataPlayground }) => {
    const [finalStatus, setFinalStatus] = useState<{ connected: boolean; projectUrl: string }>({ connected: false, projectUrl: '' });

    // Supabase-specific state
    const supabaseUrl = 'https://putspnvbnsuwycuvleuh.supabase.co';
    const [databaseName, setDatabaseName] = useState('postgres');
    const [connectionStatus, setConnectionStatus] = useState<Status>('idle');
    const [sqlFile, setSqlFile] = useState<File | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const [importStatus, setImportStatus] = useState<Status>('idle');
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    // Simulate testing Supabase connection
    const testConnection = () => {
        setConnectionStatus('loading');
        setTimeout(() => {
            // In a real app, you'd use the Supabase client here.
            // For this simulation, we'll assume success.
            setConnectionStatus('success');
            showToast(`Successfully connected to Supabase project!`);
        }, 2000);
    };
    
    // Simulate importing data
    const importData = () => {
        setImportStatus('loading');
        setTimeout(() => {
            setImportStatus('success');
            showToast('SQL import operation initiated.');
        }, 2500);
    };
    
    const handleSaveConnection = () => {
        setFinalStatus({ connected: true, projectUrl: supabaseUrl });
    };

    const handleFileSelect = (selectedFile: File | null) => {
        if (selectedFile && selectedFile.name.endsWith('.sql')) {
            setSqlFile(selectedFile);
        } else {
            showToast("Invalid file type. Please upload a .sql file.");
        }
    };
    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault(); e.stopPropagation(); setIsDragOver(false);
        if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
    };

    if (finalStatus.connected) {
        return (
            <div className="bg-component p-4 rounded-xl h-full flex flex-col justify-center items-center text-center space-y-3">
                <CheckCircleIcon className="w-12 h-12 text-success" />
                <h3 className="text-lg font-bold text-text-primary">Connection Saved!</h3>
                <p className="text-sm text-text-secondary">
                    Your workspace is now connected to the Supabase project.
                </p>
                <button onClick={onOpenDataPlayground} className="text-sm font-semibold text-primary hover:underline">
                    Test in Data Playground &rarr;
                </button>
            </div>
        );
    }

    return (
        <div className="bg-component p-4 rounded-xl h-full flex flex-col space-y-3">
            <h3 className="text-lg font-bold text-text-primary flex items-center gap-2">
                <SupabaseIcon className="w-6 h-6" />
                Supabase Database Connector
            </h3>
            
            <div className="space-y-3 animate-fade-in">
                <div>
                    <Label htmlFor="supabaseUrl">Supabase Project URL</Label>
                    <Input id="supabaseUrl" value={supabaseUrl} readOnly className="bg-component-light cursor-not-allowed" />
                </div>
                <div>
                    <Label htmlFor="dbName">Database Name</Label>
                    <Input id="dbName" value={databaseName} onChange={e => setDatabaseName(e.target.value)} />
                </div>
                <p className="text-xs text-text-secondary">The Supabase API key is securely accessed from environment variables.</p>
                
                <Button onClick={testConnection} disabled={connectionStatus === 'loading'}>
                    {connectionStatus === 'loading' && <Spinner />}
                    Test Connection
                </Button>

                {connectionStatus === 'success' && (
                    <div className="space-y-3 pt-3 border-t border-border animate-fade-in">
                        <div
                            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                            onDragLeave={() => setIsDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            className={`p-4 rounded-lg border-2 border-dashed flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${isDragOver ? 'border-primary bg-primary/10' : 'border-border'}`}
                        >
                            <input ref={fileInputRef} type="file" className="hidden" accept=".sql" onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)} />
                            {sqlFile ? (
                                <>
                                    <CheckCircleIcon className="w-6 h-6 text-success mb-1" />
                                    <p className="font-semibold text-text-primary text-sm">{sqlFile.name}</p>
                                </>
                            ) : (
                                <>
                                    <ArrowUpTrayIcon className="w-6 h-6 text-text-secondary mb-1" />
                                    <p className="font-semibold text-text-primary text-sm">Drop .sql file to import</p>
                                </>
                            )}
                        </div>
                        <Button onClick={importData} disabled={!sqlFile || importStatus === 'loading' || importStatus === 'success'}>
                            {importStatus === 'loading' ? <Spinner /> : importStatus === 'success' ? <CheckCircleIcon className="w-5 h-5"/> : null}
                            {importStatus === 'success' ? 'Import Initiated' : 'Import Data'}
                        </Button>
                         <Button onClick={handleSaveConnection} className="bg-success hover:bg-success/90">Save Connection for Workspace</Button>
                    </div>
                )}
            </div>
        </div>
    );
};