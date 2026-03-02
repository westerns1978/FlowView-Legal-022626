
import React, { useState, useRef, useEffect } from 'react';
import { IValtService, IValtAuthStatus } from '../services/iValtService';

interface Props {
  phoneNumber: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function IValtModal({ phoneNumber, onSuccess, onCancel }: Props) {
  const [status, setStatus] = useState<IValtAuthStatus>({
    status: 'pending',
    message: 'Initializing biometric link...',
  });
  
  const locked = useRef(false);
  const service = useRef(new IValtService());
  const hasStarted = useRef(false);

  const startAuth = async () => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    try {
      await service.current.initiateHandshake(phoneNumber);
      setStatus({ status: 'pending', message: 'Check your phone now' });

      service.current.startPolling(
        (s) => {
          if (locked.current) return;
          if (s.status === 'success') {
            locked.current = true;
          }
          setStatus(s);
        },
        onSuccess,
        (err) => {
          if (!locked.current) {
            setStatus({ status: 'failed', message: err });
          }
        }
      );
    } catch (err) {
      setStatus({
        status: 'failed',
        message: err instanceof Error ? err.message : 'Handshake failed',
      });
    }
  };

  useEffect(() => {
    startAuth(); // Immediate trigger
    return () => {
      service.current.cancel();
      locked.current = true;
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100] animate-fade-in">
      <div className="bg-slate-900 rounded-[40px] p-10 max-w-md w-full mx-4 border border-primary/30 shadow-[0_0_100px_rgba(2,132,199,0.2)] text-center animate-fade-in-scale">
        
        <div className="w-20 h-20 bg-primary/20 rounded-[28px] flex items-center justify-center text-primary mx-auto mb-8 shadow-glow-primary relative">
            <div className="absolute inset-0 rounded-[28px] border-2 border-primary/20 animate-ping"></div>
            <span className="text-4xl relative z-10">🔐</span>
        </div>

        <div className="space-y-4 mb-10">
          {status.status === 'pending' && (
            <div className="text-primary text-6xl animate-pulse">👆</div>
          )}
          {status.status === 'success' && (
            <div className="text-success text-6xl">✓</div>
          )}
          {status.status === 'failed' && (
            <div className="text-danger text-6xl">✗</div>
          )}
          
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter">{status.message}</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">WestFlow Secure Uplink</p>
        </div>

        <div className="bg-white/5 rounded-2xl p-4 mb-8 border border-white/5 relative overflow-hidden">
          {/* Scanning line for effect */}
          <div className="absolute top-0 left-0 w-full h-[1px] bg-primary/40 animate-scanline"></div>
          
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-widest mb-1 opacity-60">Target Identity</p>
          <p className="text-white font-mono text-base font-bold tracking-[0.2em]">
            {`••• ••• ${phoneNumber.slice(-4)}`}
          </p>
        </div>

        {status.status === 'failed' ? (
          <button
            onClick={onCancel}
            className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black py-4 rounded-2xl text-[10px] uppercase tracking-[0.3em] transition-all"
          >
            Return to Login
          </button>
        ) : (
          <button
            onClick={onCancel}
            className="text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] transition-colors"
          >
            Cancel Handshake
          </button>
        )}
      </div>
    </div>
  );
}
