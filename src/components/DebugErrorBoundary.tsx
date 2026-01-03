import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class DebugErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
        errorInfo: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="p-8 bg-red-50 text-red-900 min-h-screen font-mono">
                    <h1 className="text-2xl font-bold mb-4">Something went wrong.</h1>
                    <div className="bg-white p-4 rounded shadow border border-red-200 overflow-auto">
                        <p className="font-bold mb-2">{this.state.error?.toString()}</p>
                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">
                            {this.state.errorInfo?.componentStack}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
