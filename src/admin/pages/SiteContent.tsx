import { useEffect, useState } from 'react';
import { Save, RotateCcw, Facebook, Twitter, Youtube, Instagram, Linkedin, Link2 } from 'lucide-react';
import api from '../api/client';
import { broadcastCmsInvalidation } from '@/hooks/usePageData';

interface ContentMap { [key: string]: string; }

const CONTENT_LABELS: Record<string, string> = {
    about_text: 'About Text',
    contact_phone: 'Contact Phone',
    contact_email: 'Contact Email',
    contact_address: 'Contact Address',
};

const SOCIAL_LINKS: { key: string; label: string; icon: typeof Facebook; placeholder: string }[] = [
    { key: 'social_facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://www.facebook.com/yourpage' },
    { key: 'social_twitter', label: 'X (Twitter)', icon: Twitter, placeholder: 'https://x.com/yourhandle' },
    { key: 'social_youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://www.youtube.com/@yourchannel' },
    { key: 'social_instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://www.instagram.com/yourpage' },
    { key: 'social_linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://www.linkedin.com/company/yourpage' },
    { key: 'social_pinterest', label: 'Pinterest', icon: Link2, placeholder: 'https://in.pinterest.com/yourpage' },
];

const HOMEPAGE_MANAGED_KEYS = new Set([
    'home_hero',
    'home_features',
    'home_services',
    'home_sidebar',
    'home_categories',
    'ticker_announcements',
    'collaborations',
]);

export default function SiteContent() {
    const [content, setContent] = useState<ContentMap>({});
    const [original, setOriginal] = useState<ContentMap>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const fetch = async () => {
        const { data } = await api.get('/content');
        setContent(data);
        setOriginal(data);
        setLoading(false);
    };

    useEffect(() => { fetch(); }, []);

    const save = async () => {
        setSaving(true);
        setSaveError(null);
        try {
            // Filter out keys managed exclusively by HomepageEditor
            const payload: ContentMap = {};
            for (const [key, value] of Object.entries(content)) {
                if (!HOMEPAGE_MANAGED_KEYS.has(key)) {
                    payload[key] = value;
                }
            }
            await api.put('/content', payload);
            setOriginal(content);
            setSaved(true);

            // Broadcast cache invalidation across all tabs
            broadcastCmsInvalidation({ type: 'INVALIDATE_ALL' });

            setTimeout(() => setSaved(false), 2000);
        } catch (err: any) {
            console.error('Failed to save site content:', err);
            const msg = err?.response?.data?.error || 'Failed to save changes. Please try again.';
            setSaveError(msg);
            alert(`Save failed: ${msg}`);
        } finally {
            setSaving(false);
        }
    };

    const hasChanges = JSON.stringify(content) !== JSON.stringify(original);

    if (loading) return <div className="p-8 text-gray-400">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-20">
            {/* Sticky Header Editor Actions */}
            <div className="sticky top-0 z-[60] -mx-6 px-6 py-4 bg-white/90 backdrop-blur-md border-b border-gray-200 flex items-center justify-between mb-8 shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Site Content</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Global website text, headings, and contact details</p>
                </div>
                <div className="flex items-center gap-3">
                    {hasChanges && (
                        <button onClick={fetch} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2">
                            <RotateCcw className="w-4 h-4" /> Reset
                        </button>
                    )}
                    <button onClick={save} disabled={saving || !hasChanges}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 ${saving || !hasChanges ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                        <Save className="w-4 h-4" /> {saving ? 'Saving...' : saved ? '✓ Changes Saved!' : 'Save All Changes'}
                    </button>
                </div>
            </div>

            {saveError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold flex items-center justify-between">
                    <span>⚠️ {saveError}</span>
                    <button onClick={() => setSaveError(null)} className="text-red-500 hover:text-red-700 font-bold ml-4">✕</button>
                </div>
            )}

            <div className="space-y-8">
                {/* Website Settings Section */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                            Website Content
                        </h2>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {Object.entries(CONTENT_LABELS).map(([key, label]) => (
                            <div key={key} className={key.includes('subtitle') || key.includes('text') || key.includes('address') ? "col-span-full space-y-1.5" : "space-y-1.5"}>
                                <label className="block text-sm font-bold text-gray-700">{label}</label>
                                {key.includes('subtitle') || key.includes('text') || key.includes('address') ? (
                                    <textarea
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none shadow-sm"
                                        rows={3}
                                        value={content[key] || ''}
                                        onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                                    />
                                ) : (
                                    <input
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                                        value={content[key] || ''}
                                        onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Social Media Links Section */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                            Social Media Links
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">Shown in the site header and footer. Leave a field blank to hide that icon.</p>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        {SOCIAL_LINKS.map(({ key, label, icon: Icon, placeholder }) => (
                            <div key={key} className="space-y-1.5">
                                <label className="flex items-center gap-2 text-sm font-bold text-gray-700">
                                    <Icon className="w-4 h-4 text-blue-600" /> {label}
                                </label>
                                <input
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                                    placeholder={placeholder}
                                    value={content[key] || ''}
                                    onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Homepage Sections Notice */}
                <div className="bg-blue-50/60 rounded-2xl border border-blue-100 p-6 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Link2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-sm">Managing Homepage Sections?</h3>
                        <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                            Hero Banner, Service Cards, Feature Cards, Categories, Ticker Announcements, and Partner Institutions are structured objects protected from text corruption and managed in the Homepage Editor.
                        </p>
                        <a
                            href="/admin/homepage-editor"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 mt-2.5 bg-white px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm"
                        >
                            Open Homepage Editor →
                        </a>
                    </div>
                </div>

                {/* Custom Content Section */}
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
                        <h2 className="font-bold text-gray-900 flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                            Custom Content Keys
                        </h2>
                    </div>
                    <div className="p-6 space-y-6">
                        <p className="text-sm text-gray-500">Generic configuration keys for various site components.</p>
                        <div className="space-y-3">
                            {Object.entries(content)
                                .filter(([key]) => !CONTENT_LABELS[key] && !SOCIAL_LINKS.some((s) => s.key === key) && !HOMEPAGE_MANAGED_KEYS.has(key))
                                .map(([key, value]) => (
                                    <div key={key} className="flex gap-4 items-start bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                        <div className="flex-shrink-0 w-32 truncate text-xs font-bold bg-blue-50 text-blue-700 px-3 py-2 rounded-lg mt-0.5 border border-blue-100 text-center">{key}</div>
                                        <input
                                            className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm bg-white"
                                            value={value}
                                            onChange={(e) => setContent({ ...content, [key]: e.target.value })}
                                        />
                                    </div>
                                ))}
                            <div className="flex gap-3 bg-blue-50/30 p-4 rounded-xl border border-blue-100/50 mt-6">
                                <input id="new-key" className="w-32 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none bg-white" placeholder="new_key" />
                                <input id="new-value" className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none bg-white" placeholder="value" />
                                <button
                                    onClick={() => {
                                        const k = (document.getElementById('new-key') as HTMLInputElement).value.trim();
                                        const v = (document.getElementById('new-value') as HTMLInputElement).value.trim();
                                        if (k) setContent({ ...content, [k]: v });
                                    }}
                                    className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                                >
                                    + Add New Key
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

