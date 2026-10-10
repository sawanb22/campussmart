import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api/client';

export interface SiteContentContextType {
    content: Record<string, any>;
    loading: boolean;
    refresh: () => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextType>({
    content: {},
    loading: true,
    refresh: async () => { },
});

export const SiteContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [content, setContent] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);

    const refresh = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/content');

            // Parse JSON values only for structured objects and arrays, preserving strings like phone numbers
            const parsedContent: Record<string, any> = {};
            for (const key in data) {
                const val = data[key];
                if (typeof val === 'string' && (val.trim().startsWith('{') || val.trim().startsWith('['))) {
                    try {
                        parsedContent[key] = JSON.parse(val);
                    } catch {
                        parsedContent[key] = val;
                    }
                } else {
                    parsedContent[key] = val;
                }
            }
            setContent(parsedContent);
        } catch (error) {
            console.warn('[SiteContentContext] Failed to load site content. Preserving previous state:', error);
            // State is intentionally retained
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();

        const handleInvalidate = (payload: any) => {
            if (payload?.type === 'INVALIDATE_ALL') {
                refresh();
            }
        };

        const onCustomEvent = ((e: CustomEvent) => {
            handleInvalidate(e.detail);
        }) as EventListener;

        if (typeof window !== 'undefined') {
            window.addEventListener('cm_cms_channel', onCustomEvent);
        }

        let channel: BroadcastChannel | null = null;
        if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
            try {
                channel = new BroadcastChannel('cm_cms_channel');
                channel.onmessage = (e) => handleInvalidate(e.data);
            } catch {
                // Ignore BroadcastChannel errors
            }
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('cm_cms_channel', onCustomEvent);
            }
            if (channel) {
                try {
                    channel.close();
                } catch {
                    // Ignore channel closure errors
                }
            }
        };
    }, []);

    return (
        <SiteContentContext.Provider value={{ content, loading, refresh }}>
            {children}
        </SiteContentContext.Provider>
    );
};

export const useSiteContent = () => useContext(SiteContentContext);
