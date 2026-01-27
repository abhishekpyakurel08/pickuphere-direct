import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
                    <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
                        <AlertTriangle className="w-10 h-10 text-destructive" />
                    </div>
                    <h1 className="text-3xl font-black text-foreground mb-4 uppercase tracking-tighter">Something went wrong</h1>
                    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                        We encountered an unexpected error. Our team has been notified. Please try refreshing the page.
                    </p>
                    <div className="flex gap-4">
                        <Button
                            onClick={() => window.location.reload()}
                            className="btn-gradient-primary rounded-xl px-8 h-12 font-bold shadow-lg"
                        >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Refresh Page
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => window.location.href = '/'}
                            className="rounded-xl px-8 h-12 font-bold"
                        >
                            Return Home
                        </Button>
                    </div>

                    {process.env.NODE_ENV === 'development' && (
                        <div className="mt-12 p-6 bg-muted rounded-2xl text-left max-w-2xl overflow-auto border">
                            <p className="text-sm font-mono text-destructive">{this.state.error?.toString()}</p>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
