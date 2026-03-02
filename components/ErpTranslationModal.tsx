
import React, { useState, useEffect } from 'react';
import { CloseIcon, BotIcon, ServerStackIcon, ArrowRightIcon, CheckCircleIcon, CodeBracketIcon, SparklesIcon } from './ui/Icons';

interface ErpTranslationModalProps {
    isOpen: boolean;
    onClose: () => void;
    robotName: string;
}

export const ErpTranslationModal: React.FC<ErpTranslationModalProps> = ({ isOpen, onClose, robotName }) => {
    const [step, setStep] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setStep(0);
            const timer1 = setTimeout(() => setStep(1), 800);
            const timer2 = setTimeout(() => setStep(2), 2000); // Allow time to read middle step
            return () => { clearTimeout(timer1); clearTimeout(timer2); };
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[60] backdrop-blur-sm" onClick={onClose}>
            <div 
                className="bg-[#0f172a] rounded-2xl shadow-2xl w-full max-w-6xl h-[80vh] flex flex-col border border-slate-700 overflow-hidden" 
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-700 bg-slate-900 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
                            <SparklesIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Universal Data Translator</h3>
                            <p className="text-slate-400 text-sm">Real-time mapping: Session Telemetry &rarr; LegalServer LMS</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <CloseIcon className="w-8 h-8" />
                    </button>
                </div>

                {/* Main Content - 3 Column Layout */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-700 overflow-hidden">
                    
                    {/* Column 1: The Client (Source) */}
                    <div className="p-6 bg-slate-900/50 flex flex-col relative group">
                        <div className="flex items-center gap-2 mb-4 text-blue-400">
                            <BotIcon className="w-5 h-5" />
                            <span className="font-bold uppercase tracking-wider text-xs">Source: {robotName}</span>
                        </div>
                        <div className="absolute top-6 right-6">
                            <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-1 rounded font-mono border border-blue-500/30">Protocol: MQTT/JSON</span>
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2">Raw Telemetry Stream</h4>
                        <p className="text-slate-400 text-sm mb-4">High-frequency, unstructured data stream from the session.</p>
                        
                        <div className="flex-1 bg-black rounded-xl p-4 font-mono text-xs text-green-400 overflow-y-auto border border-slate-800 shadow-inner">
                            <div className="opacity-50 mb-2">{"// Incoming packet stream (10hz)"}</div>
                            <pre className="whitespace-pre-wrap">
{`{
  "client_id": "quasi_c2_x88",
  "timestamp": "${new Date().toISOString()}",
  "session": {
    "duration_min": 60,
    "integrity_score": 0.98,
    "compliance_v": 24.1
  },
  "state": "ACTIVE_SESSION",
  "alerts": [
    {
      "code": "C04_COMPLIANCE",
      "severity": "LOW"
    }
  ],
  "session_ticks": 8849201
}`}
                            </pre>
                        </div>
                    </div>

                    {/* Column 2: WestFlow Engine (The Bridge) */}
                    <div className="p-6 bg-slate-900 flex flex-col relative">
                        <div className={`absolute inset-0 bg-blue-500/5 transition-opacity duration-1000 ${step >= 1 ? 'opacity-100' : 'opacity-0'}`}></div>
                        <div className="flex items-center gap-2 mb-4 text-purple-400 relative z-10">
                            <CodeBracketIcon className="w-5 h-5" />
                            <span className="font-bold uppercase tracking-wider text-xs">ACS Normalization Engine</span>
                        </div>
                        
                        <div className="flex flex-col items-center justify-center flex-1 space-y-6 relative z-10">
                            {/* Transformation Steps */}
                            <div className={`transform transition-all duration-500 ${step >= 1 ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}>
                                <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 w-full max-w-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                                        <span className="text-white font-bold text-sm">1. Noise Filtering</span>
                                    </div>
                                    <p className="text-slate-400 text-xs">Discarding standard heartbeat. Isolating "C04" compliance event.</p>
                                </div>
                            </div>

                            <div className="h-8 w-0.5 bg-slate-700"></div>

                            <div className={`transform transition-all duration-500 delay-100 ${step >= 1 ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}>
                                <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 w-full max-w-sm">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></div>
                                        <span className="text-white font-bold text-sm">2. Context Enrichment (RAG)</span>
                                    </div>
                                    <p className="text-slate-400 text-xs">Lookup: "C04" = "Compliance Gap". Matched to Case #C-9921 SLA terms.</p>
                                </div>
                            </div>

                            <div className="h-8 w-0.5 bg-slate-700"></div>

                            <div className={`transform transition-all duration-500 delay-200 ${step >= 1 ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}>
                                <div className="bg-slate-800 p-4 rounded-lg border border-slate-600 w-full max-w-sm shadow-[0_0_20px_rgba(168,85,247,0.1)]">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="text-white font-bold text-sm">3. LegalServer Schema Mapping</span>
                                    </div>
                                    <p className="text-slate-400 text-xs">Converting to `dbo.ComplianceActions` structure.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Column 3: LegalServer (Destination) */}
                    <div className="p-6 bg-slate-900/50 flex flex-col relative">
                        <div className={`absolute inset-0 bg-green-500/5 transition-opacity duration-1000 ${step >= 2 ? 'opacity-100' : 'opacity-0'}`}></div>
                        <div className="flex items-center gap-2 mb-4 text-green-400 relative z-10">
                            <ServerStackIcon className="w-5 h-5" />
                            <span className="font-bold uppercase tracking-wider text-xs">Dest: LegalServer (ALN)</span>
                        </div>
                        <div className="absolute top-6 right-6 relative z-10">
                            <span className="bg-green-500/20 text-green-400 text-[10px] px-2 py-1 rounded font-mono border border-green-500/30">Table: dbo.ComplianceActions</span>
                        </div>
                        <h4 className="text-lg font-bold text-white mb-2 relative z-10">ERP Transaction Record</h4>
                        <p className="text-slate-400 text-sm mb-4 relative z-10">Ready for ingestion via ALN Connector (Port 9780).</p>

                        <div className={`flex-1 bg-white rounded-xl p-4 font-mono text-xs text-slate-800 overflow-y-auto border border-slate-300 shadow-lg relative z-10 transition-all duration-500 ${step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                             <div className="opacity-50 mb-2 text-slate-500">{"<!-- Validated XML Payload for ALN -->"}</div>
                             <pre className="whitespace-pre-wrap">
{`<ComplianceAction>
  <Credentials>
    <User>ACS_LEGAL_Bot</User>
    <Token>***********</Token>
  </Credentials>
  <Transaction>
    <Type>INSERT</Type>
    <Table>ComplianceActions</Table>
    <Data>
      <CustomerID>C-9921</CustomerID>
      <ClientID>CL-CLIENT-08</ClientID>
      <ActionType>Auto-Generated</ActionType>
      <ProblemCode>C_COMPLIANCE_GAP</ProblemCode>
      <Description>
        [AI Generated] Client ${robotName} reporting persistent compliance gap in Program B. 
        Self-reconciliation failed 3x. 
        Requires manual review.
      </Description>
      <Priority>High</Priority>
      <SessionReading>
        <Type>Duration</Type>
        <Value>8849</Value>
      </SessionReading>
    </Data>
  </Transaction>
</ComplianceAction>`}
                            </pre>
                            {step >= 2 && (
                                <div className="mt-4 flex items-center justify-center gap-2 bg-green-100 text-green-700 p-2 rounded border border-green-200">
                                    <CheckCircleIcon className="w-5 h-5"/>
                                    <span className="font-bold">Validated against LegalServer Schema</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
