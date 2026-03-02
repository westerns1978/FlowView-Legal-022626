import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangleIcon } from './ui/Icons';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-background flex items-center justify-center p-4">
                    <div className="text-center max-w-lg p-8 bg-component rounded-lg border border-danger">
                        <AlertTriangleIcon className="w-12 h-12 text-danger mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-text-primary">Something went wrong.</h1>
                        <p className="text-text-secondary mt-2">
                            A component has encountered an error. Please try refreshing the page.
                        </p>
                    </div>
                </div>
            );
        }
        return (this as any).props.children;
    }
}