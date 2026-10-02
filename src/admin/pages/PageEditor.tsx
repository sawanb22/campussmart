import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import api from '../api/client';
import MediaImageField from '../components/MediaImageField';
import { clearPageDataCache, broadcastCmsInvalidation } from '@/hooks/usePageData';
import { pageDefaults } from '../pageDefaults';

// ─── Types ───────────────────────────────────────────────────────────────────
interface CardItem {
    title: string;
    description: string;
    image?: string;
    count?: number;
    name?: string;
    href?: string;
    categories?: string[];
}

interface PageData {
    heroTitle?: string;
    heroSubtitle?: string;
    heroImage?: string;
    section1Title?: string;
    section2Title?: string;
    ctaTitle?: string;
    ctaSubtitle?: string;
    cards?: CardItem[];
    features?: string[];
}

interface Page {
    id: number;
    title: string;
    slug: string;
    template: string | null;
    pageData: string | null;
    published: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function parsePageData(raw: string | null): PageData {
    if (!raw) return {};
    try { return JSON.parse(raw); } catch { return {}; }
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function Field({ label, value, onChange, multiline = false, placeholder = '' }: {
    label: string; value: string; onChange: (v: string) => void;
    multiline?: boolean; placeholder?: string;
}) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
            {multiline ? (
                <textarea
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cm-blue/30 resize-none"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                />
            ) : (
                <input
                    type="text"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cm-blue/30"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder={placeholder}
                />
            )}
        </div>
    );
}

function ImagePreviewField({ label, value, onChange }: {
    label: string; value: string; onChange: (v: string) => void;
}) {
    return <MediaImageField label={label} value={value} onChange={onChange} />;
}

// ─── Main Editor ─────────────────────────────────────────────────────────────
export default function PageEditor() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [page, setPage] = useState<Page | null>(null);
    const [data, setData] = useState<PageData>({});
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saveError, setSaveError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const { data: p } = await api.get(`/pages/${id}`);
                setPage(p);
                const parsed = parsePageData(p.pageData);
                const effectiveDefaults = pageDefaults[p.slug] || pageDefaults[p.template || ''] || {};
                const initialData = { ...effectiveDefaults };
                Object.entries(parsed).forEach(([k, v]) => {
                    if (v !== undefined && v !== null) {
                        (initialData as any)[k] = v;
                    }
                });
                setData(initialData);
            } catch (err) {
                console.error(`Failed to load page ${id}:`, err);
            }
            setLoading(false);
        };
        load();
    }, [id]);

    const set = (key: keyof PageData, value: any) =>
        setData(prev => ({ ...prev, [key]: value }));

    const setCard = (index: number, field: keyof CardItem, value: any) => {
        const cards = [...(data.cards ?? [])];
        cards[index] = { ...cards[index], [field]: value };
        set('cards', cards);
    };

    const addCard = () =>
        set('cards', [...(data.cards ?? []), { title: 'New Item', description: '', image: '', href: '' }]);

    const removeCard = (i: number) =>
        set('cards', (data.cards ?? []).filter((_, idx) => idx !== i));

    const setFeature = (i: number, v: string) => {
        const features = [...(data.features ?? [])];
        features[i] = v;
        set('features', features);
    };

    const addFeature = () => set('features', [...(data.features ?? []), 'New feature']);
    const removeFeature = (i: number) =>
        set('features', (data.features ?? []).filter((_, idx) => idx !== i));

    const save = async () => {
        if (!page || loading || saving) return;
        setSaving(true);
        setSaveError(null);
        try {
            await api.put(`/pages/${page.id}`, {
                title: page.title,
                published: page.published,
                pageData: JSON.stringify(data),
            });
            clearPageDataCache(page.slug);
            clearPageDataCache();
            broadcastCmsInvalidation({ type: 'INVALIDATE_PAGE', slug: page.slug });
            broadcastCmsInvalidation({ type: 'INVALIDATE_ALL' });
            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (err: any) {
            console.error(`Failed to save page ${page.slug}:`, err);
            const msg = err?.response?.data?.error || 'Failed to save page changes. Please try again.';
            setSaveError(msg);
            alert(`Save failed: ${msg}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-8 text-gray-400">Loading page editor...</div>;
    if (!page) return <div className="p-8 text-red-500">Page not found.</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto space-y-8 relative">
            {/* Header */}
            <div className="sticky top-0 z-50 -mx-6 -mt-6 px-6 py-4 mb-2 bg-white/90 backdrop-blur-md border-b border-gray-200 flex items-center justify-between shadow-sm rounded-t-xl">
                <div className="flex items-center gap-3">
                    <button onClick={() => navigate('/admin/pages')} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ArrowLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <div>
                        <p className="text-xs text-gray-400 font-mono">/{page.slug}</p>
                        <h1 className="text-xl font-bold text-gray-900">Edit Page: {page.title}</h1>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <a href={`/${page.slug}`} target="_blank" rel="noreferrer"
                        className="px-4 py-2 text-sm border border-gray-200 bg-white rounded-lg hover:bg-gray-50 transition-colors text-gray-600 shadow-sm">
                        View Live ↗
                    </a>
                    <button onClick={save} disabled={saving || loading}
                        className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-colors shadow-md ${
                            saving || loading ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-cm-blue text-white hover:bg-cm-blue-dark'
                        }`}>
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
                    </button>
                </div>
            </div>

            {saveError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold flex items-center justify-between">
                    <span>⚠️ {saveError}</span>
                    <button onClick={() => setSaveError(null)} className="text-red-500 hover:text-red-700 font-bold ml-4">✕</button>
                </div>
            )}

            {/* Page Title */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5 shadow-sm">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Page Settings</h2>
                <Field label="Page Title" value={page.title} onChange={v => setPage(p => p ? { ...p, title: v } : p)} />
                <div className="flex items-center gap-3">
                    <label className="text-sm font-semibold text-gray-700">Status</label>
                    <button
                        onClick={() => setPage(p => p ? { ...p, published: !p.published } : p)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${page.published ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                        {page.published ? 'Published' : 'Draft'}
                    </button>
                </div>
            </div>

            {/* Hero Section */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5 shadow-sm">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Hero Section</h2>
                <Field label="Hero Title *" value={data.heroTitle ?? ''} onChange={v => set('heroTitle', v)} placeholder="e.g. AI & Machine Learning" />
                <Field label="Hero Subtitle" value={data.heroSubtitle ?? ''} onChange={v => set('heroSubtitle', v)} multiline placeholder="Supporting text below the title..." />
                <ImagePreviewField label="Hero Background Image" value={data.heroImage ?? ''} onChange={v => set('heroImage', v)} />
            </div>

            {/* Section Headings */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5 shadow-sm">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Section Headings</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <Field label="Section 1 Heading" value={data.section1Title ?? ''} onChange={v => set('section1Title', v)} placeholder="e.g. Our Design Services" />
                    <Field label="Section 2 Heading" value={data.section2Title ?? ''} onChange={v => set('section2Title', v)} placeholder="e.g. Why Choose Us?" />
                </div>
            </div>

            {/* Cards Editor */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                        Cards / Items ({(data.cards ?? []).length})
                    </h2>
                    <button onClick={addCard}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-cm-blue text-white text-xs rounded-lg font-semibold hover:bg-cm-blue-dark transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Add Card
                    </button>
                </div>

                {(data.cards ?? []).length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-6 border-2 border-dashed border-gray-100 rounded-lg">
                        No cards defined. Click "Add Card" to create one.
                    </p>
                )}

                <div className="space-y-4">
                    {(data.cards ?? []).map((card, i) => (
                        <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-400">Card {i + 1}</span>
                                <button onClick={() => removeCard(i)} className="p-1 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <Field label="Title" value={card.title ?? ''} onChange={v => setCard(i, 'title', v)} />
                                <Field label="Description" value={card.description ?? ''} onChange={v => setCard(i, 'description', v)} />
                                <Field label="Detail Page Link (optional)" value={card.href ?? ''} onChange={v => setCard(i, 'href', v)} placeholder="Auto-generated from title if blank" />
                                <Field
                                    label="Categories (comma-separated)"
                                    value={(card.categories ?? []).join(', ')}
                                    onChange={v => setCard(i, 'categories', v.split(',').map(s => s.trim()).filter(Boolean))}
                                    placeholder="e.g. Science Labs, Safety & Wet Labs"
                                />
                            </div>
                            <MediaImageField label="Image" value={card.image ?? ''} onChange={v => setCard(i, 'image', v)} previewClassName="h-24" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Feature List Editor */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5 shadow-sm">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                        Feature List ({(data.features ?? []).length})
                    </h2>
                    <button onClick={addFeature}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white text-xs rounded-lg font-semibold hover:bg-emerald-600 transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Add Feature
                    </button>
                </div>

                {(data.features ?? []).length === 0 && (
                    <p className="text-sm text-gray-400 text-center py-6 border-2 border-dashed border-gray-100 rounded-lg">
                        No bullet features defined. Click "Add Feature" to add them.
                    </p>
                )}

                <div className="space-y-2">
                    {(data.features ?? []).map((f, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <input
                                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                                value={f}
                                onChange={e => setFeature(i, e.target.value)}
                            />
                            <button onClick={() => removeFeature(i)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors">
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* CTA Section */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 space-y-5 shadow-sm">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Call-to-Action Section</h2>
                <Field label="CTA Heading" value={data.ctaTitle ?? ''} onChange={v => set('ctaTitle', v)} placeholder="e.g. Ready to Design Your Campus?" />
                <Field label="CTA Subtitle" value={data.ctaSubtitle ?? ''} onChange={v => set('ctaSubtitle', v)} multiline placeholder="Supporting text..." />
            </div>

            {/* Save button at bottom */}
            <div className="flex justify-end pb-8">
                <button onClick={save} disabled={saving}
                    className="flex items-center gap-2 px-8 py-3 bg-cm-blue text-white rounded-xl text-sm font-bold hover:bg-cm-blue-dark transition-colors disabled:opacity-60 shadow-lg">
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : saved ? '✓ All Changes Saved!' : 'Save All Changes'}
                </button>
            </div>
        </div>
    );
}
