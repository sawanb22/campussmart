import { useEffect, useState } from 'react';
import { Save, RotateCcw, Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import api from '../api/client';
import MediaImageField from '../components/MediaImageField';
import { CATEGORY_ICONS, DEFAULT_CATEGORIES, type CategoryItem } from '@/components/sections/category-bar';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { defaultServices } from '@/components/sections/service-cards';
import { defaultFaqs, type FaqItem } from '@/components/sections/faq-section';
import { broadcastCmsInvalidation } from '@/hooks/usePageData';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                    {title}
                </h2>
            </div>
            <div className="p-6 space-y-6">{children}</div>
        </div>
    );
}

function Field({ label, value, onChange, multiline = false, hint = '', placeholder = '' }: {
    label: string; value: string; onChange: (v: string) => void;
    multiline?: boolean; hint?: string; placeholder?: string;
}) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-700 flex items-center justify-between">
                {label}
                {hint && <span className="text-gray-400 font-normal text-[10px] uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded">{hint}</span>}
            </label>
            {multiline
                ? <textarea rows={3} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none shadow-sm" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
                : <input className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
            }
        </div>
    );
}

export default function HomepageEditor() {
    const { refresh } = useSiteContent();
    const [heroData, setHeroData] = useState<any>({
        eyebrow: 'Future-ready campus infrastructure',
        title: 'Design. Build.\nDigitize. Operate.\nFuture-Ready Campuses.',
        subtitle: 'Physical + Digital',
        ctaLabel: 'Schedule Campus Audit →',
        ctaHref: '/contact-us',
        image: '',
    });
    const [features, setFeatures] = useState<any[]>([]);
    const [services, setServices] = useState<any[]>([]);
    const [sidebar, setSidebar] = useState<any>({ classifieds: [], resources: [], completedProjects: [], contacts: [] });
    const [tickerAnnouncements, setTickerAnnouncements] = useState<string[]>([]);
    const [collaborations, setCollaborations] = useState<any[]>([]);
    const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);
    const [faqs, setFaqs] = useState<FaqItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/content');
            try {
                const savedHero = JSON.parse(data.home_hero || '{}');
                setHeroData((current: any) => ({ ...current, ...savedHero }));
            } catch { /**/ }
            try {
                const savedFeatures = data.home_features ? JSON.parse(data.home_features) : [];
                setFeatures(savedFeatures.map((feature: any) => feature.title === 'Smart Classrooms'
                    ? { ...feature, href: '/smart-classrooms' }
                    : feature.title === 'AR / VR Learning' || feature.title === 'AR/VR Learning'
                        ? { ...feature, href: '/ar-vr-learning' }
                        : feature));
            } catch { /**/ }
            try {
                const parsedServices = data.home_services !== undefined && data.home_services !== null
                    ? JSON.parse(data.home_services)
                    : null;
                setServices(Array.isArray(parsedServices) ? parsedServices : defaultServices);
            } catch {
                setServices(defaultServices);
            }
            try { setSidebar(data.home_sidebar ? JSON.parse(data.home_sidebar) : { classifieds: [], resources: [], completedProjects: [], contacts: [] }); } catch { /**/ }
            try { setTickerAnnouncements(data.ticker_announcements ? JSON.parse(data.ticker_announcements) : [
                "Digital Transformation Summit: 15 May 2026",
                "New AI-Powered Learning Stations now available for pre-order",
                "Join our upcoming Campus Design Webinar on 15th April 2026",
                "Latest UGC Guidelines for Digital Campus implemented across 50+ institutions",
                "Explore our new range of ergonomic Campus Furniture in the Lookbook",
            ]); } catch { /**/ }
            try { setCategories(data.home_categories ? JSON.parse(data.home_categories) : DEFAULT_CATEGORIES); } catch { /**/ }
            try { setCollaborations(data.collaborations ? JSON.parse(data.collaborations) : [
                { name: 'Stanford University' },
                { name: 'MIT Labs' },
                { name: 'Oxford Library' },
                { name: 'Cambridge Tech' },
                { name: 'Harvard Research' },
                { name: 'Yale Architecture' },
                { name: 'Princeton Science' },
                { name: 'Columbia Design' },
            ]); } catch { /**/ }
            try {
                const parsedFaqs = data.home_faqs !== undefined && data.home_faqs !== null
                    ? JSON.parse(data.home_faqs)
                    : null;
                setFaqs(Array.isArray(parsedFaqs) ? parsedFaqs : defaultFaqs);
            } catch {
                setFaqs(defaultFaqs);
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    useEffect(() => { fetchContent(); }, []);

    const saveContent = async () => {
        if (loading) return;
        setSaving(true);
        setSaveError(null);
        try {
            await api.put('/content', {
                home_hero: JSON.stringify(heroData),
                home_features: JSON.stringify(features),
                home_services: JSON.stringify(services),
                home_sidebar: JSON.stringify(sidebar),
                home_categories: JSON.stringify(categories),
                ticker_announcements: JSON.stringify(tickerAnnouncements),
                collaborations: JSON.stringify(collaborations),
                home_faqs: JSON.stringify(faqs),
            });
            await refresh();

            // Broadcast cache invalidation across all tabs
            broadcastCmsInvalidation({ type: 'INVALIDATE_ALL' });

            setSaved(true);
            setTimeout(() => setSaved(false), 2500);
        } catch (e: any) {
            console.error('Failed to save homepage content:', e);
            const msg = e?.response?.data?.error || 'Failed to save homepage changes. Please try again.';
            setSaveError(msg);
            alert(`Save failed: ${msg}`);
        } finally {
            setSaving(false);
        }
    };

    // Feature helpers
    const addFeature = () => setFeatures([...features, { title: 'New Feature', description: 'Description', tag: 'New', color: '#3B82F6', h: 250, href: '/', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=90' }]);
    const upFeature = (i: number, k: string, v: any) => { const a = [...features]; a[i] = { ...a[i], [k]: v }; setFeatures(a); };
    const delFeature = (i: number) => setFeatures(features.filter((_, idx) => idx !== i));

    // Service helpers
    const addService = () => setServices([...services, { title: 'New Service', bgColor: '#3B82F6', textColor: '#ffffff', href: '/' }]);
    const upService = (i: number, k: string, v: any) => { const a = [...services]; a[i] = { ...a[i], [k]: v }; setServices(a); };
    const delService = (i: number) => setServices(services.filter((_, idx) => idx !== i));

    // Category icon helpers
    const addCategory = () => setCategories([...categories, { icon: 'Circle', label: 'New Category', href: '/' }]);
    const upCategory = (i: number, k: keyof CategoryItem, v: string) => { const a = [...categories]; a[i] = { ...a[i], [k]: v }; setCategories(a); };
    const delCategory = (i: number) => setCategories(categories.filter((_, idx) => idx !== i));

    // Sidebar helpers
    const setSidebarList = (key: string, list: any[]) => setSidebar((p: any) => ({ ...p, [key]: list }));
    const upListItem = (key: string, i: number, field: string, val: string) => {
        const list = [...(sidebar[key] || [])]; list[i] = { ...list[i], [field]: val }; setSidebarList(key, list);
    };
    const addListItem = (key: string, extra: any = {}) => setSidebarList(key, [...(sidebar[key] || []), { label: 'New Item', href: '/', ...extra }]);
    const delListItem = (key: string, i: number) => setSidebarList(key, (sidebar[key] || []).filter((_: any, idx: number) => idx !== i));

    // FAQ helpers
    const addFaq = () => setFaqs([...faqs, { question: 'New Frequently Asked Question?', answer: 'Provide an answer here.' }]);
    const upFaq = (i: number, k: keyof FaqItem, v: string) => {
        const a = [...faqs];
        a[i] = { ...a[i], [k]: v };
        setFaqs(a);
    };
    const delFaq = (i: number) => setFaqs(faqs.filter((_, idx) => idx !== i));
    const moveFaq = (i: number, dir: 'up' | 'down') => {
        const newIdx = dir === 'up' ? i - 1 : i + 1;
        if (newIdx < 0 || newIdx >= faqs.length) return;
        const a = [...faqs];
        const [moved] = a.splice(i, 1);
        a.splice(newIdx, 0, moved);
        setFaqs(a);
    };
    const resetFaqsToDefault = () => {
        if (window.confirm('Reset all FAQs to the standard 5 default questions? Unsaved changes will be replaced.')) {
            setFaqs(defaultFaqs);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><p className="text-gray-400 text-sm">Loading editor…</p></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Sticky Header Editor Actions */}
            <div className="sticky top-0 z-[60] -mx-6 px-6 py-4 bg-white/90 backdrop-blur-md border-b border-gray-200 flex items-center justify-between mb-8 shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Hero / Banner Editor</h1>
                    <p className="text-xs text-gray-500 mt-0.5">Homepage hero, service cards, features, and sidebar</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={fetchContent} className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-all flex items-center gap-2">
                        <RotateCcw className="w-4 h-4" /> Reset
                    </button>
                    <button onClick={saveContent} disabled={saving || loading}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 ${saving || loading ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving…' : saved ? '✓ Changes Saved!' : 'Save All Changes'}
                    </button>
                </div>
            </div>

            {saveError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold flex items-center justify-between">
                    <span>⚠️ {saveError}</span>
                    <button onClick={() => setSaveError(null)} className="text-red-500 hover:text-red-700 font-bold ml-4">✕</button>
                </div>
            )}


            {/* ── Hero Banner ── */}
            <Section title="🖼 Hero Banner">
                <div className="space-y-4">
                    <Field label="Hero Eyebrow" value={heroData.eyebrow || ''} onChange={v => setHeroData((p: any) => ({ ...p, eyebrow: v }))} placeholder="Future-ready campus infrastructure" />
                    <Field label="Hero Title" value={heroData.title || ''} onChange={v => setHeroData((p: any) => ({ ...p, title: v }))} multiline placeholder="Design. Build.&#10;Digitize. Operate.&#10;Future-Ready Campuses." />
                    <Field label="Hero Subtitle" value={heroData.subtitle || ''} onChange={v => setHeroData((p: any) => ({ ...p, subtitle: v }))} placeholder="Physical + Digital" />
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="CTA Label" value={heroData.ctaLabel || ''} onChange={v => setHeroData((p: any) => ({ ...p, ctaLabel: v }))} placeholder="Schedule Campus Audit →" />
                        <Field label="CTA Link" value={heroData.ctaHref || ''} onChange={v => setHeroData((p: any) => ({ ...p, ctaHref: v }))} placeholder="/contact-us" />
                    </div>
                    <MediaImageField label="Background Image" value={heroData.image || ''} onChange={v => setHeroData((p: any) => ({ ...p, image: v }))} previewClassName="h-36 rounded-xl" />
                </div>
            </Section>

            {/* ── Service Cards ── */}
            <Section title="🎨 Service Cards (4 big colored links)">
                <div className="space-y-3 mb-4">
                    <p className="text-xs text-gray-400">These are the 4 colored section cards below the hero: Furniture, Campus Design, Sports, AI/Digital.</p>
                    {services.map((s, i) => (
                        <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50/40">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Card {i + 1}</span>
                                <button onClick={() => delService(i)} className="flex items-center gap-1 px-2 py-1 text-red-500 hover:bg-red-50 rounded-lg text-xs"><Trash2 className="w-3.5 h-3.5" /> Remove</button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Title" value={s.title} onChange={v => upService(i, 'title', v)} />
                                <Field label="Link (href)" value={s.href} onChange={v => upService(i, 'href', v)} placeholder="/furniture-design-supply" />
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-gray-600">Background Colour</label>
                                    <div className="flex gap-2 items-center">
                                        <input type="color" className="h-9 w-12 border border-gray-200 rounded-lg p-1 cursor-pointer" value={s.bgColor} onChange={e => upService(i, 'bgColor', e.target.value)} />
                                        <span className="text-sm text-gray-500">{s.bgColor}</span>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-gray-600">Text Colour</label>
                                    <div className="flex gap-2 items-center">
                                        <input type="color" className="h-9 w-12 border border-gray-200 rounded-lg p-1 cursor-pointer" value={s.textColor} onChange={e => upService(i, 'textColor', e.target.value)} />
                                        <span className="text-sm text-gray-500">{s.textColor}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button onClick={addService} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Add Service Card
                    </button>
                </div>
            </Section>

            {/* ── Category Icon Bar ── */}
            <Section title={`🔗 Category Icon Bar (${categories.length})`}>
                <p className="text-xs text-gray-400 mb-4">The row of icon links right below the header (Campus Design, Furniture, AI/ML, etc). Rename any label, change its icon, or point it at a different page.</p>
                <div className="space-y-3">
                    {categories.map((cat, i) => {
                        const Icon = CATEGORY_ICONS[cat.icon] || CATEGORY_ICONS.Circle;
                        return (
                            <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50/40">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wide">
                                        <Icon className="w-4 h-4 text-gray-500" /> Icon {i + 1}
                                    </span>
                                    <button onClick={() => delCategory(i)} className="flex items-center gap-1 px-2 py-1 text-red-500 hover:bg-red-50 rounded-lg text-xs"><Trash2 className="w-3.5 h-3.5" /> Remove</button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <Field label="Label" value={cat.label} onChange={v => upCategory(i, 'label', v)} placeholder="AI INFRA" />
                                    <Field label="Link (href)" value={cat.href} onChange={v => upCategory(i, 'href', v)} placeholder="/ai-ml" />
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-bold text-gray-700">Icon</label>
                                        <select
                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm bg-white"
                                            value={cat.icon}
                                            onChange={e => upCategory(i, 'icon', e.target.value)}
                                        >
                                            {Object.keys(CATEGORY_ICONS).map(name => (
                                                <option key={name} value={name}>{name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <button onClick={addCategory} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Add Icon
                    </button>
                </div>
            </Section>

            {/* ── Feature Cards ── */}
            <Section title={`🪟 Masonry Feature Cards (${features.length})`}>
                <p className="text-xs text-gray-400 mb-4">The masonry grid of category cards shown on the homepage. Edit title, description, tag, image, link and card height.</p>
                <div className="space-y-4">
                    {features.length === 0 && (
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">No feature cards. Click Add Card.</div>
                    )}
                    {features.map((f, i) => (
                        <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50/40">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">Card {i + 1} — {f.title}</span>
                                <button onClick={() => delFeature(i)} className="flex items-center gap-1 px-2 py-1 text-red-500 hover:bg-red-50 rounded-lg text-xs"><Trash2 className="w-3.5 h-3.5" /> Remove</button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Title" value={f.title} onChange={v => upFeature(i, 'title', v)} />
                                <div className="space-y-1">
                                    <label className="block text-xs font-semibold text-gray-600">Tag & Colour</label>
                                    <div className="flex gap-2">
                                        <input type="color" className="h-9 w-12 border border-gray-200 rounded-lg p-1 cursor-pointer" value={f.color} onChange={e => upFeature(i, 'color', e.target.value)} />
                                        <input className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" value={f.tag} onChange={e => upFeature(i, 'tag', e.target.value)} />
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <Field label="Description" value={f.description} onChange={v => upFeature(i, 'description', v)} multiline />
                                </div>
                                <MediaImageField label="Image" value={f.image || ''} onChange={v => upFeature(i, 'image', v)} previewClassName="h-20" />
                                <div className="space-y-3">
                                    <Field label="Link (href)" value={f.href} onChange={v => upFeature(i, 'href', v)} placeholder="/page-slug" />
                                    <div className="space-y-1">
                                        <label className="block text-xs font-semibold text-gray-600">Height (px)</label>
                                        <input type="number" className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" value={f.h} onChange={e => upFeature(i, 'h', parseInt(e.target.value) || 250)} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button onClick={addFeature} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Add Feature Card
                    </button>
                </div>
            </Section>

            {/* ── Sidebar ── */}
            <Section title="📋 Sidebar Panels">
                <div className="space-y-6">
                    {/* Classifieds */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-gray-700">Classifieds Links</h3>
                            <button onClick={() => addListItem('classifieds')} className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"><Plus className="w-3 h-3" /> Add</button>
                        </div>
                        <div className="space-y-2">
                            {(sidebar.classifieds || []).map((item: any, i: number) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <input placeholder="Label" className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none" value={item.label} onChange={e => upListItem('classifieds', i, 'label', e.target.value)} />
                                    <input placeholder="href" className="w-40 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none" value={item.href} onChange={e => upListItem('classifieds', i, 'href', e.target.value)} />
                                    <button onClick={() => delListItem('classifieds', i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Resources */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-gray-700">Resource Links</h3>
                            <button onClick={() => addListItem('resources')} className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"><Plus className="w-3 h-3" /> Add</button>
                        </div>
                        <div className="space-y-2">
                            {(sidebar.resources || []).map((item: any, i: number) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <input placeholder="Label" className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none" value={item.label} onChange={e => upListItem('resources', i, 'label', e.target.value)} />
                                    <input placeholder="href" className="w-40 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none" value={item.href} onChange={e => upListItem('resources', i, 'href', e.target.value)} />
                                    <button onClick={() => delListItem('resources', i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Completed Projects */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-gray-700">Completed Projects Links</h3>
                            <button onClick={() => addListItem('completedProjects')} className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"><Plus className="w-3 h-3" /> Add</button>
                        </div>
                        <div className="space-y-2">
                            {(sidebar.completedProjects || []).map((item: any, i: number) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <input placeholder="Label" className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none" value={item.label} onChange={e => upListItem('completedProjects', i, 'label', e.target.value)} />
                                    <input placeholder="href" className="w-40 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none" value={item.href} onChange={e => upListItem('completedProjects', i, 'href', e.target.value)} />
                                    <button onClick={() => delListItem('completedProjects', i)} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Contact blocks */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-bold text-gray-700">Contact Blocks</h3>
                            <button onClick={() => addListItem('contacts', { bg: '#3B82F6', contact: '', isEmail: false })} className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700"><Plus className="w-3 h-3" /> Add</button>
                        </div>
                        <div className="space-y-3">
                            {(sidebar.contacts || []).map((c: any, i: number) => (
                                <div key={i} className="border border-gray-200 rounded-xl p-3 bg-gray-50/40">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-xs font-bold text-gray-400">Block {i + 1}</span>
                                        <button onClick={() => delListItem('contacts', i)} className="p-1 text-red-400 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Field label="Title" value={c.title || ''} onChange={v => upListItem('contacts', i, 'title', v)} />
                                        <Field label="Contact (phone/email)" value={c.contact || ''} onChange={v => upListItem('contacts', i, 'contact', v)} />
                                        <Field label="href (tel: or mailto:)" value={c.href || ''} onChange={v => upListItem('contacts', i, 'href', v)} />
                                        <div className="space-y-1">
                                            <label className="block text-xs font-semibold text-gray-600">Background Colour</label>
                                            <div className="flex gap-2 items-center">
                                                <input type="color" className="h-8 w-10 border border-gray-200 rounded p-0.5 cursor-pointer" value={c.bg || '#3B82F6'} onChange={e => upListItem('contacts', i, 'bg', e.target.value)} />
                                                <span className="text-xs text-gray-400">{c.bg}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>
            
            {/* ── Ticker & Collaborations ── */}
            <Section title="📣 Latest Updates Ticker">
                <p className="text-xs text-gray-400 mb-4">Each line here will scroll across the top bar under the header.</p>
                <div className="space-y-2">
                    {tickerAnnouncements.map((ann, i) => (
                        <div key={i} className="flex gap-2 items-center">
                            <input className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" value={ann} onChange={e => {
                                const a = [...tickerAnnouncements]; a[i] = e.target.value; setTickerAnnouncements(a);
                            }} />
                            <button onClick={() => setTickerAnnouncements(tickerAnnouncements.filter((_, idx) => idx !== i))} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    ))}
                    <button onClick={() => setTickerAnnouncements([...tickerAnnouncements, 'New announcement text'])} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Add Announcement
                    </button>
                </div>
            </Section>

            <Section title="🤝 Institutions / Collaborations">
                <p className="text-xs text-gray-400 mb-4">The scrolling logo/name bar for trusted institutions.</p>
                <div className="space-y-2">
                    {collaborations.map((collab, i) => (
                        <div key={i} className="flex gap-2 items-center">
                            <input placeholder="Institution Name" className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none" value={collab.name} onChange={e => {
                                const a = [...collaborations]; a[i] = { ...a[i], name: e.target.value }; setCollaborations(a);
                            }} />
                            <button onClick={() => setCollaborations(collaborations.filter((_, idx) => idx !== i))} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    ))}
                    <button onClick={() => setCollaborations([...collaborations, { name: 'New Institution' }])} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors">
                        <Plus className="w-3.5 h-3.5" /> Add Institution
                    </button>
                </div>
            </Section>

            <Section title={`❓ Frequently Asked Questions (FAQ) (${faqs.length})`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                    <p className="text-xs text-gray-500">
                        Manage questions and answers displayed on the homepage FAQ accordion and the dedicated FAQ page.
                    </p>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={resetFaqsToDefault}
                            type="button"
                            className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                        >
                            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
                        </button>
                        <button
                            onClick={addFaq}
                            type="button"
                            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-xs"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add Question
                        </button>
                    </div>
                </div>

                <div className="space-y-4">
                    {faqs.length === 0 && (
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center text-gray-400 text-sm">
                            <p className="font-semibold text-gray-600 mb-1">No FAQs configured</p>
                            <p className="text-xs mb-4">Click "Add Question" to create one or "Reset Defaults" to restore the 5 standard questions.</p>
                            <button
                                onClick={resetFaqsToDefault}
                                type="button"
                                className="px-4 py-2 bg-blue-50 text-blue-600 font-bold text-xs rounded-lg hover:bg-blue-100 transition-colors"
                            >
                                Restore Standard 5 Questions
                            </button>
                        </div>
                    )}

                    {faqs.map((faq, i) => (
                        <div key={i} className="border border-gray-200 rounded-xl p-4 bg-gray-50/50 hover:border-gray-300 transition-colors">
                            <div className="flex items-center justify-between mb-3 border-b border-gray-200/60 pb-2.5">
                                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-mono font-bold">
                                        {i + 1}
                                    </span>
                                    <span>FAQ #{i + 1}</span>
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        type="button"
                                        onClick={() => moveFaq(i, 'up')}
                                        disabled={i === 0}
                                        title="Move Up"
                                        className="p-1.5 text-gray-500 hover:bg-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                                    >
                                        <ChevronUp className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveFaq(i, 'down')}
                                        disabled={i === faqs.length - 1}
                                        title="Move Down"
                                        className="p-1.5 text-gray-500 hover:bg-white rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                                    >
                                        <ChevronDown className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => delFaq(i)}
                                        title="Remove FAQ"
                                        className="flex items-center gap-1 px-2 py-1 text-red-500 hover:bg-red-50 rounded-lg text-xs font-semibold ml-1"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Remove
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Field
                                    label="Question"
                                    value={faq.question}
                                    onChange={v => upFaq(i, 'question', v)}
                                    placeholder="e.g. What turnkey infrastructure does CampusMart provide?"
                                />
                                <Field
                                    label="Answer"
                                    value={faq.answer}
                                    onChange={v => upFaq(i, 'answer', v)}
                                    multiline
                                    placeholder="Provide a comprehensive and clear answer..."
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            {/* Bottom Save */}
            <div className="flex justify-end pb-8">
                <button onClick={saveContent} disabled={saving || loading}
                    className={`flex items-center gap-2 px-8 py-3 rounded-xl font-bold transition-colors shadow-md ${saving || loading ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving…' : saved ? '✓ All Changes Saved!' : 'Save All Changes'}
                </button>
            </div>
        </div>
    );
}
