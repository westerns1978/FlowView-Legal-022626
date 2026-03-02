import React, { useState, useEffect, createContext, useContext } from 'react';
import { CheckCircleIcon, WarningIcon, InfoIcon } from '../components/ui/Icons';

type ToastType = 'success' | 'error' | 'info';

interface ToastContextType {
    showToast: (message: string, type?: ToastType) => void;
}
export const ToastContext = createContext<ToastContextType | null>(null);

const Toast: React.FC<{ message: string; type: ToastType; onDismiss: () => void }> = ({ message, type, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onDismiss();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    const iconMap = {
        success: <CheckCircleIcon className="w-5 h-5 text-success" />,
        error: <WarningIcon className="w-5 h-5 text-danger" />,
        info: <InfoIcon className="w-5 h-5 text-primary" />,
    };

    const baseClasses = "fixed bottom-24 md:bottom-10 left-1/2 -translate-x-1/2 py-2 px-5 rounded-full shadow-lg flex items-center gap-2 animate-slide-in-up z-[100] border";

    const colorMap = {
        success: 'bg-component text-text-primary border-border',
        error: 'bg-danger/10 text-danger border-danger/20',
        info: 'bg-primary/10 text-primary border-primary/20'
    };

    return (
        <div className={`${baseClasses} ${colorMap[type] || colorMap.success}`}>
            {iconMap[type]}
            <span className="font-semibold">{message}</span>
        </div>
    );
};

export const ToastProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
    const showToast = (message: string, type: ToastType = 'success') => {
        setToast({ message, type });
    };
    
    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
        </ToastContext.Provider>
    );
}

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within a ToastProvider");
    return context;
}