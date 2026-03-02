
import React, { useState } from 'react';
import { ACSLogo, AppLogo } from './FlowViewLogo';
import { ShieldCheckIcon, FingerPrintIcon, UserIcon, DocumentTextIcon, LockClosedIcon } from './ui/Icons';
import { usePersona, PERSONAS } from '../contexts/PersonaContext';
import { IValtModal } from './IValtModal';

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const { setPersonaId } = usePersona();
  const [showIValt, setShowIValt] = useState(false);
  const [phone] = useState('+1 555-0199'); // Default demo phone for biometric link

  const handlePersonaLogin = (personaId: string) => {
    setPersonaId(personaId);
    onLogin();
  };

  const handleStartIValt = () => {
    setShowIValt(true);
  };

  const handleIValtSuccess = () => {
    setPersonaId('service'); // Default to Service Manager on biometric success
    setShowIValt(false);
    onLogin();
  };

  const getPersonaIcon = (id: string) => {
      switch(id) {
          case 'service': return <UserIcon className="w-6 h-6" />;
          case 'sales': return <DocumentTextIcon className="w-6 h-6" />;
          case 'admin': return <LockClosedIcon className="w-6 h-6" />;
          default: return <UserIcon className="w-6 h-6" />;
      }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans text-text-primary">
      {/* Subtle vertical lines background decoration */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'linear-gradient(to right, var(--accent-primary) 1px, transparent 1px)', backgroundSize: '80px 100%' }}></div>
      
      {/* Decorative scanning line animation */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent-primary/5 to-transparent h-20 w-full animate-scanline pointer-events-none"></div>

      <div className="w-full max-w-sm mx-auto z-10 relative animate-fade-in-scale">
        <div className="flex flex-col items-center mb-8">
            <AppLogo className="w-12 h-12 text-accent-primary mb-4" />
            <h1 className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-widest uppercase leading-none font-serif-display mb-2">FlowView</h1>
            <p className="text-accent-primary text-[10px] font-bold uppercase tracking-[0.3em]">COMPLIANCE CENTER</p>
            <div className="w-16 h-px bg-accent-primary/30 mt-6"></div>
        </div>

        <div className="space-y-6">
            <p className="text-[10px] font-bold text-text-dim uppercase tracking-[0.3em] text-center">Sign in as</p>
            
            <div className="space-y-3">
                {Object.values(PERSONAS).map(p => (
                    <button
                        key={p.id}
                        onClick={() => handlePersonaLogin(p.id)}
                        className="w-full flex items-center gap-4 p-4 rounded-xl border border-border-default bg-bg-card hover:border-accent-primary hover:bg-accent-muted transition-all text-left group"
                    >
                        <div className={`w-10 h-10 rounded-lg border border-border-default flex items-center justify-center text-accent-primary group-hover:border-accent-primary group-hover:scale-110 transition-all shrink-0`}>
                            {getPersonaIcon(p.id)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-text-primary truncate uppercase tracking-widest font-sans-ui">{p.name}</p>
                            <p className="text-[10px] text-text-dim font-medium leading-tight">{p.role}</p>
                        </div>
                        <svg className="w-4 h-4 text-text-faint group-hover:text-accent-primary group-hover:translate-x-1 transition-all shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                ))}
            </div>

            <div className="relative py-2 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-divider"></div></div>
                <span className="relative px-3 bg-bg-primary text-[9px] font-bold text-text-dim uppercase tracking-widest">or</span>
            </div>

            <button 
              onClick={handleStartIValt}
              className="w-full border border-accent-primary/50 hover:bg-accent-primary/10 text-accent-primary font-black py-4 rounded-xl text-[10px] uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 active:scale-95"
            >
              Biometric Login
              <FingerPrintIcon className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center gap-2 mt-8 pt-6">
                <div className="flex items-center gap-1.5 text-accent-primary">
                    <ShieldCheckIcon className="w-3 h-3" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em]">FlowView Trust Fabric</span>
                </div>
                <p className="text-text-dim text-[9px] text-center font-bold uppercase tracking-[0.1em]">
                    ACS Therapy • Jefferson City, MO
                </p>
            </div>
        </div>
      </div>

      {showIValt && (
        <IValtModal 
          phoneNumber={phone}
          onSuccess={handleIValtSuccess}
          onCancel={() => setShowIValt(false)}
        />
      )}
    </div>
  );
};
