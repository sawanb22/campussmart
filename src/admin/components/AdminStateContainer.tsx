import React from 'react';
import { AlertCircle, RotateCcw, Loader2 } from 'lucide-react';
import { clearAdminCache } from '../api/client';

interface AdminStateContainerProps {
    loading: boolean;
    error?: string | null;
    onRetry?: () => void | Promise<void>;
    cachePrefix?: string;
    loadingMessage?: string;
    empty?: boolean;
    emptyMessage?: string;
    children: React.ReactNode;
}

export default function AdminStateContainer({
    loading,
    error,
    onRetry,
    cachePrefix,
    loadingMessage = 'Loading data...',
    empty = false,
    emptyMessage = 'No records found.',
    children,
}: AdminStateContainerProps) {
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin text-cm-blue mb-3" />
                <span className="text-sm font-medium tracking-wide">{loadingMessage}</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50/70 p-6 my-4 text-center">
                <div className="flex items-center justify-center gap-2 text-red-700 font-semibold mb-2">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>Failed to load data</span>
                </div>
                <p className="text-sm text-red-600 mb-4 max-w-lg mx-auto">{error}</p>
                {onRetry && (
                    <button
                        type="button"
                        onClick={() => {
                            clearAdminCache(cachePrefix);
                            onRetry();
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                    >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Retry Loading
                    </button>
                )}
            </div>
        );
    }

    if (empty) {
        return (
            <div className="rounded-xl border border-gray-100 bg-white p-12 text-center text-slate-400 my-4 shadow-sm">
                <p className="text-sm font-medium">{emptyMessage}</p>
            </div>
        );
    }

    return <>{children}</>;
}
