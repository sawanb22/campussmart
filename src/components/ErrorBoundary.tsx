import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isChunkError: boolean;
}

const CHUNK_RELOAD_KEY = 'cm_chunk_reload_ts';
const RELOAD_DEBOUNCE_MS = 3000;

function isChunkLoadError(error: Error | null): boolean {
  if (!error) return false;
  const msg = String(error.message || '');
  return (
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('error loading dynamically imported module') ||
    msg.includes('Loading chunk') ||
    msg.includes('dynamically imported')
  );
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    isChunkError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      isChunkError: isChunkLoadError(error),
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in React ErrorBoundary:', error, errorInfo);

    // Auto-heal chunk errors on stale deployments
    if (isChunkLoadError(error)) {
      const lastReload = parseInt(sessionStorage.getItem(CHUNK_RELOAD_KEY) || '0', 10);
      const now = Date.now();
      if (now - lastReload > RELOAD_DEBOUNCE_MS) {
        sessionStorage.setItem(CHUNK_RELOAD_KEY, String(now));
        window.location.reload();
      }
    }
  }

  public render() {
    if (this.state.hasError) {
      if (this.state.isChunkError) {
        // Transparent auto-reload on deployment chunk changes: silently reload without intrusive prompt
        try {
          window.location.reload();
        } catch {
          // Ignore reload error in SSR/non-browser contexts
        }
        return (
          <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="w-8 h-8 border-4 border-cm-blue border-t-transparent rounded-full animate-spin" />
          </div>
        );
      }

      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50 text-slate-800 text-center">
          <div className="max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-500 mb-6">
              An unexpected error occurred while rendering the page.
            </p>
            <div className="bg-slate-100 p-3 rounded-lg text-left text-xs font-mono text-slate-700 overflow-auto max-h-32 mb-6">
              {this.state.error?.message || 'Unknown error'}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-md cursor-pointer"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

