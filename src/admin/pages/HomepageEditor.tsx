import { useEffect, useState } from 'react';
import { Save, RotateCcw, Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, LayoutGrid, Palette, Type, Sliders } from 'lucide-react';
import api from '../api/client';
import MediaImageField from '../components/MediaImageField';
import { CATEGORY_ICONS, DEFAULT_CATEGORIES, type CategoryItem } from '@/components/sections/category-bar';
import { useSiteContent } from '@/contexts/SiteContentContext';
import { defaultServices } from '@/components/sections/service-cards';
import { DEFAULT_RESOURCES, type ResourceItem } from '@/components/sections/resources';
import { broadcastCmsInvalidation } from '@/hooks/usePageData';

function Section({
    title,
    children,
    isLive,
    onToggleLive,
    badge,
}: {
    title: string;
    children: React.ReactNode;
    isLive?: boolean;
    onToggleLive?: () => void;
    badge?: string;
}) {
    return (
        <div className={`rounded-2xl border shadow-sm overflow-hidden transition-all ${
            isLive === false
                ? 'bg-slate-50/70 border-slate-300 ring-1 ring-slate-300/40'
                : 'bg-white border-gray-200'
        }`}>
            <div className={`px-6 py-4 border-b flex items-center justify-between flex-wrap gap-3 ${
                isLive === false ? 'bg-slate-100/80 border-slate-200' : 'bg-gray-50/50 border-gray-100'
            }`}>
                <div className="flex items-center gap-3">
                    <span className={`w-1.5 h-6 rounded-full ${isLive === false ? 'bg-slate-400' : 'bg-blue-600'}`}></span>
                    <h2 className={`font-bold flex items-center gap-2 ${isLive === false ? 'text-slate-600' : 'text-gray-900'}`}>
                        {title}
                        {badge && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 uppercase">
                                {badge}
                            </span>
                        )}
                    </h2>
                </div>

                {onToggleLive && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onToggleLive}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                                isLive !== false
                                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 ring-2 ring-emerald-500/20'
                                    : 'bg-slate-200 text-slate-700 hover:bg-slate-300 ring-2 ring-slate-400/20'
                            }`}
                            title={isLive !== false ? 'Click to hide this entire section from public homepage' : 'Click to make this section live on public homepage'}
                        >
                            {isLive !== false ? (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                                    <span>● Live on Homepage</span>
                                </>
                            ) : (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                    <span>○ Not Live (Hidden)</span>
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {isLive === false && (
                <div className="px-6 py-2.5 bg-amber-50/80 border-b border-amber-200 flex items-center justify-between text-xs text-amber-900">
                    <span className="flex items-center gap-2">
                        <EyeOff className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>This section is currently <strong>Not Live (Hidden)</strong> and will not appear on the public homepage.</span>
                    </span>
                    <button
                        type="button"
                        onClick={onToggleLive}
                        className="text-xs font-bold text-amber-900 bg-amber-200/60 hover:bg-amber-200 px-2.5 py-1 rounded-lg transition-colors"
                    >
                        Publish Live
                    </button>
                </div>
            )}

            <div className={`p-6 space-y-6 ${isLive === false ? 'opacity-85' : ''}`}>{children}</div>
        </div>
    );
}

function ItemLivePill({
    isLive,
    onToggle,
}: {
    isLive: boolean;
    onToggle: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                isLive
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-slate-100 text-slate-500 border border-slate-200 hover:bg-slate-200'
            }`}
            title={isLive ? 'Click to hide this item from the public grid' : 'Click to make this item live'}
        >
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
            <span>{isLive ? 'Live' : 'Hidden'}</span>
        </button>
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

function VisibilityToggle({ label, isHidden, onToggle }: { label: string; isHidden: boolean; onToggle: () => void }) {
    return (
        <button
            type="button"
            onClick={onToggle}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all text-xs font-semibold ${
                isHidden
                    ? 'bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100'
                    : 'bg-emerald-50/60 border-emerald-200 text-emerald-900 hover:bg-emerald-50'
            }`}
        >
            <span className="flex items-center gap-2">
                {isHidden ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-emerald-600" />}
                <span>{label}</span>
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                isHidden ? 'bg-gray-200 text-gray-600' : 'bg-emerald-100 text-emerald-700'
            }`}>
                {isHidden ? 'Hidden' : 'Live'}
            </span>
        </button>
    );
}

const HEADING_FONT_OPTIONS = [
    { value: 'poppins', label: 'Poppins (Default Sans-Serif)' },
    { value: 'playfair', label: 'Playfair Display (Editorial Serif)' },
    { value: 'grotesk', label: 'Space Grotesk (Modern Tech)' },
    { value: 'opensans', label: 'Open Sans (Clean Neutral)' },
    { value: 'system', label: 'System Sans (Native OS)' },
];

const BODY_FONT_OPTIONS = [
    { value: 'opensans', label: 'Open Sans (Default High-Legibility)' },
    { value: 'poppins', label: 'Poppins (Geometric)' },
    { value: 'grotesk', label: 'Space Grotesk (Modern Tech)' },
    { value: 'system', label: 'System Sans (Native OS)' },
];

const HERO_BG_OPTIONS = [
    { value: 'blue', label: 'Deep Blue (Default #001f52)' },
    { value: 'slate', label: 'Slate Dark (#0f172a)' },
    { value: 'stone', label: 'Stone Dark (#1c1917)' },
    { value: 'amber', label: 'Warm Amber (#451a03)' },
    { value: 'white', label: 'Clean White' },
    { value: 'paper', label: 'Paper Off-White (#f8f7f4)' },
];

const HERO_LAYOUT_OPTIONS = [
    { value: 'split-right', label: 'Split Right (Default Left Content / Right Image)' },
    { value: 'split-left', label: 'Split Left (Right Content / Left Image)' },
    { value: 'centered', label: 'Centered (Hero Headline & Buttons Centered)' },
    { value: 'minimal', label: 'Minimal (Compact Padding)' },
];

export default function HomepageEditor() {
    const { refresh } = useSiteContent();

    // ── Page Controls (Typography, Layout, Theme, Master Visibility) ──
    const [pageStyles, setPageStyles] = useState<{
        headingFont?: string;
        bodyFont?: string;
        primaryColor?: string;
        heroBg?: string;
        heroLayout?: string;
        hideCategories?: boolean;
        hideTicker?: boolean;
        hideSearchBar?: boolean;
        hideHero?: boolean;
        hideServices?: boolean;
        hideFeatures?: boolean;
        hideResources?: boolean;
        hidePartnershipForm?: boolean;
        hideCollaborations?: boolean;
    }>({
        headingFont: 'poppins',
        bodyFont: 'opensans',
        primaryColor: '#002B66',
        heroBg: 'blue',
        heroLayout: 'split-right',
        hideCategories: false,
        hideTicker: false,
        hideSearchBar: false,
        hideHero: false,
        hideServices: false,
        hideFeatures: false,
        hideResources: false,
        hidePartnershipForm: false,
        hideCollaborations: false,
    });

    const upStyle = (k: string, v: any) => setPageStyles((p: any) => ({ ...p, [k]: v }));

    // ── Hero Section ──
    const [heroData, setHeroData] = useState<any>({
        eyebrow: 'Future-ready campus infrastructure',
        title: 'Design. Build.\nDigitize. Operate.\nFuture-Ready Campuses.',
        subtitle: 'Physical + Digital',
        ctaLabel: 'Schedule Campus Audit →',
        ctaHref: '/contact-us',
        image: '',
    });

    // ── Feature Cards ──
    const [features, setFeatures] = useState<any[]>([]);

    // ── 4 Services ──
    const [services, setServices] = useState<any[]>([]);

    // ── Sidebar Blocks ──
    const [sidebar, setSidebar] = useState<any>({ classifieds: [], resources: [], completedProjects: [], contacts: [] });

    // ── Resources Section ──
    const [resourcesHeading, setResourcesHeading] = useState('Resources & Catalogues');
    const [resourcesSubtitle, setResourcesSubtitle] = useState('Explore our curated guides, product showrooms, and official frameworks to inspire your next campus project.');
    const [resources, setResources] = useState<ResourceItem[]>(DEFAULT_RESOURCES);

    // ── Partnership Section ──
    const [partnership, setPartnership] = useState({
        formTitle: 'Partnership Enquiry Form',
        formSubtitle: "Please fill out the form and we'll get back to you as soon as possible.",
        readyTitle: 'Ready to talk?',
        readyText: 'At Campus Mart, we have the expertise in guiding you to set up your new campus project and help you maximize the performance of your campus while also figuring out your return on investment. We have the expertise in guiding you to set up your new campus project and help you maximize.',
        whatsappNumber: '919966109191',
        whatsappText: 'Connect On WhatsApp',
        phoneNumber: '+919966109191',
        phoneText: 'Call Us 9966109191',
    });

    const upPartnership = (k: string, v: string) => setPartnership((p: any) => ({ ...p, [k]: v }));

    // ── Micro-Copy & Tickers ──
    const [tickerTitle, setTickerTitle] = useState('LATEST UPDATES');
    const [searchPlaceholder, setSearchPlaceholder] = useState('Search: I need a design for an AI STATION');
    const [collaborationsTitle, setCollaborationsTitle] = useState('Trusted By Leading Institutions Worldwide');
    const [tickerAnnouncements, setTickerAnnouncements] = useState<string[]>([]);
    const [collaborations, setCollaborations] = useState<any[]>([]);
    const [categories, setCategories] = useState<CategoryItem[]>(DEFAULT_CATEGORIES);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/content');

            // Page Styles & Controls
            try {
                if (data.home_styles) {
                    const parsed = JSON.parse(data.home_styles);
                    setPageStyles((prev) => ({ ...prev, ...parsed }));
                }
            } catch { /**/ }

            // Hero
            try {
                const savedHero = JSON.parse(data.home_hero || '{}');
                setHeroData((current: any) => ({ ...current, ...savedHero }));
            } catch { /**/ }

            // Feature cards
            try {
                const savedFeatures = data.home_features ? JSON.parse(data.home_features) : [];
                setFeatures(savedFeatures.map((feature: any) => feature.title === 'Smart Classrooms'
                    ? { ...feature, href: '/smart-classrooms' }
                    : feature.title === 'AR / VR Learning' || feature.title === 'AR/VR Learning'
                        ? { ...feature, href: '/ar-vr-experiences' }
                        : feature));
            } catch { /**/ }

            // Services
            try {
                const parsedServices = data.home_services !== undefined && data.home_services !== null
                    ? JSON.parse(data.home_services)
                    : null;
                setServices(Array.isArray(parsedServices) ? parsedServices : defaultServices);
            } catch {
                setServices(defaultServices);
            }

            // Sidebar
            try { setSidebar(data.home_sidebar ? JSON.parse(data.home_sidebar) : { classifieds: [], resources: [], completedProjects: [], contacts: [] }); } catch { /**/ }

            // Resources
            try {
                if (data.home_resources) {
                    const parsedRes = JSON.parse(data.home_resources);
                    if (parsedRes && typeof parsedRes === 'object') {
                        if (parsedRes.heading) setResourcesHeading(parsedRes.heading);
                        if (parsedRes.subtitle) setResourcesSubtitle(parsedRes.subtitle);
                        if (Array.isArray(parsedRes.items) && parsedRes.items.length > 0) {
                            setResources(parsedRes.items);
                        }
                    }
                }
            } catch { /**/ }

            // Partnership
            try {
                if (data.home_partnership) {
                    const parsedPart = JSON.parse(data.home_partnership);
                    if (parsedPart && typeof parsedPart === 'object') {
                        setPartnership((prev) => ({ ...prev, ...parsedPart }));
                    }
                }
            } catch { /**/ }

            // Micro-copy
            if (typeof data.ticker_title === 'string' && data.ticker_title) {
                setTickerTitle(data.ticker_title);
            }
            if (typeof data.home_search_placeholder === 'string' && data.home_search_placeholder) {
                setSearchPlaceholder(data.home_search_placeholder);
            }
            if (typeof data.collaborations_title === 'string' && data.collaborations_title) {
                setCollaborationsTitle(data.collaborations_title);
            }

            // Ticker Announcements
            try { setTickerAnnouncements(data.ticker_announcements ? JSON.parse(data.ticker_announcements) : [
                "Digital Transformation Summit: 15 May 2026",
                "New AI-Powered Learning Stations now available for pre-order",
                "Join our upcoming Campus Design Webinar on 15th April 2026",
                "Latest UGC Guidelines for Digital Campus implemented across 50+ institutions",
                "Explore our new range of ergonomic Campus Furniture in the Lookbook",
            ]); } catch { /**/ }

            // Categories
            try { setCategories(data.home_categories ? JSON.parse(data.home_categories) : DEFAULT_CATEGORIES); } catch { /**/ }

            // Collaborations
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
                ticker_title: tickerTitle,
                collaborations: JSON.stringify(collaborations),
                collaborations_title: collaborationsTitle,
                home_search_placeholder: searchPlaceholder,
                home_styles: JSON.stringify(pageStyles),
                home_resources: JSON.stringify({
                    heading: resourcesHeading,
                    subtitle: resourcesSubtitle,
                    items: resources,
                }),
                home_partnership: JSON.stringify(partnership),
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
    const addFeature = () => setFeatures([...features, { title: 'New Feature', description: 'Description', tag: 'New', color: '#3B82F6', h: 250, href: '/', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=90', active: true }]);
    const upFeature = (i: number, k: string, v: any) => { const a = [...features]; a[i] = { ...a[i], [k]: v }; setFeatures(a); };
    const delFeature = (i: number) => setFeatures(features.filter((_, idx) => idx !== i));

    // Service helpers
    const addService = () => setServices([...services, { title: 'New Service', bgColor: '#3B82F6', textColor: '#ffffff', href: '/', active: true }]);
    const upService = (i: number, k: string, v: any) => { const a = [...services]; a[i] = { ...a[i], [k]: v }; setServices(a); };
    const delService = (i: number) => setServices(services.filter((_, idx) => idx !== i));

    // Resources helpers
    const addResource = () => setResources([...resources, {
        title: 'New Resource Guide',
        description: 'Comprehensive overview and guidance for educational infrastructure.',
        image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800',
        color: '#0ea5e9',
        tag: 'GUIDE',
        href: '/catalogues',
        active: true,
    }]);
    const upResource = (i: number, k: keyof ResourceItem, v: any) => { const a = [...resources]; a[i] = { ...a[i], [k]: v }; setResources(a); };
    const delResource = (i: number) => setResources(resources.filter((_, idx) => idx !== i));
    const moveResource = (i: number, dir: -1 | 1) => {
        const target = i + dir;
        if (target < 0 || target >= resources.length) return;
        const a = [...resources];
        const temp = a[i];
        a[i] = a[target];
        a[target] = temp;
        setResources(a);
    };

    // Category icon helpers
    const addCategory = () => setCategories([...categories, { icon: 'Circle', label: 'New Category', href: '/', active: true }]);
    const upCategory = (i: number, k: keyof CategoryItem, v: any) => { const a = [...categories]; a[i] = { ...a[i], [k]: v }; setCategories(a); };
    const delCategory = (i: number) => setCategories(categories.filter((_, idx) => idx !== i));

    // Sidebar helpers
    const setSidebarList = (key: string, list: any[]) => setSidebar((p: any) => ({ ...p, [key]: list }));
    const upListItem = (key: string, i: number, field: string, val: any) => {
        const list = [...(sidebar[key] || [])];
        list[i] = { ...list[i], [field]: val };
        setSidebarList(key, list);
    };
    const addListItem = (key: string, defaults: any) => setSidebarList(key, [...(sidebar[key] || []), defaults]);
    const delListItem = (key: string, i: number) => setSidebarList(key, (sidebar[key] || []).filter((_: any, idx: number) => idx !== i));

    if (loading) return <div className="flex items-center justify-center h-64"><p className="text-gray-400 text-sm">Loading editor…</p></div>;

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            {/* Sticky Header Editor Actions */}
            <div className="sticky top-0 z-[60] -mx-6 px-6 py-4 bg-white/90 backdrop-blur-md border-b border-gray-200 flex items-center justify-between mb-8 shadow-sm">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span>Homepage Visual Editor</span>
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full uppercase tracking-wider">Full CMS Controls</span>
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">Customize styling, section visibility, content blocks, cards, and copy</p>
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

            {/* ── Page Controls & Master Visibility Panel ── */}
            <Section title="⚙️ Page Controls & Master Section Visibility">
                <div className="space-y-6">
                    {/* Typography & Accent Color */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-gray-700 flex items-center gap-1.5">
                                <Type className="w-4 h-4 text-gray-500" /> Heading Font
                            </label>
                            <select
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={pageStyles.headingFont || 'poppins'}
                                onChange={e => upStyle('headingFont', e.target.value)}
                            >
                                {HEADING_FONT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-gray-700 flex items-center gap-1.5">
                                <Type className="w-4 h-4 text-gray-500" /> Body Font
                            </label>
                            <select
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={pageStyles.bodyFont || 'opensans'}
                                onChange={e => upStyle('bodyFont', e.target.value)}
                            >
                                {BODY_FONT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-gray-700 flex items-center gap-1.5">
                                <Palette className="w-4 h-4 text-gray-500" /> Brand Accent Color
                            </label>
                            <div className="flex gap-2 items-center">
                                <input
                                    type="color"
                                    className="h-10 w-12 border border-gray-200 rounded-xl p-1 cursor-pointer bg-white"
                                    value={pageStyles.primaryColor || '#002B66'}
                                    onChange={e => upStyle('primaryColor', e.target.value)}
                                />
                                <input
                                    type="text"
                                    className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                    value={pageStyles.primaryColor || '#002B66'}
                                    onChange={e => upStyle('primaryColor', e.target.value)}
                                    placeholder="#002B66"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Hero Theme & Layout */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-gray-700 flex items-center gap-1.5">
                                <Palette className="w-4 h-4 text-gray-500" /> Hero Background Theme
                            </label>
                            <select
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={pageStyles.heroBg || 'blue'}
                                onChange={e => upStyle('heroBg', e.target.value)}
                            >
                                {HERO_BG_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-gray-700 flex items-center gap-1.5">
                                <LayoutGrid className="w-4 h-4 text-gray-500" /> Hero Layout Mode
                            </label>
                            <select
                                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                                value={pageStyles.heroLayout || 'split-right'}
                                onChange={e => upStyle('heroLayout', e.target.value)}
                            >
                                {HERO_LAYOUT_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Master Section Visibility Grid */}
                    <div className="pt-2 border-t border-gray-100">
                        <label className="block text-sm font-bold text-gray-800 mb-1 flex items-center gap-1.5">
                            <Sliders className="w-4 h-4 text-gray-500" /> Master Section Live / Hide Toggles (9 Sections)
                        </label>
                        <p className="text-xs text-gray-500 mb-3">Quick-switch sections live or hidden on the public homepage. You can also toggle each section directly in its card header below.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                            <VisibilityToggle
                                label="Hero Section"
                                isHidden={!!pageStyles.hideHero}
                                onToggle={() => upStyle('hideHero', !pageStyles.hideHero)}
                            />
                            <VisibilityToggle
                                label="Category Icon Bar"
                                isHidden={!!pageStyles.hideCategories}
                                onToggle={() => upStyle('hideCategories', !pageStyles.hideCategories)}
                            />
                            <VisibilityToggle
                                label="Latest Updates Ticker"
                                isHidden={!!pageStyles.hideTicker}
                                onToggle={() => upStyle('hideTicker', !pageStyles.hideTicker)}
                            />
                            <VisibilityToggle
                                label="Global Search Bar"
                                isHidden={!!pageStyles.hideSearchBar}
                                onToggle={() => upStyle('hideSearchBar', !pageStyles.hideSearchBar)}
                            />
                            <VisibilityToggle
                                label="4 Service Cards"
                                isHidden={!!pageStyles.hideServices}
                                onToggle={() => upStyle('hideServices', !pageStyles.hideServices)}
                            />
                            <VisibilityToggle
                                label="Feature Cards & Sidebar"
                                isHidden={!!pageStyles.hideFeatures}
                                onToggle={() => upStyle('hideFeatures', !pageStyles.hideFeatures)}
                            />
                            <VisibilityToggle
                                label="Resources & Catalogues"
                                isHidden={!!pageStyles.hideResources}
                                onToggle={() => upStyle('hideResources', !pageStyles.hideResources)}
                            />
                            <VisibilityToggle
                                label="Partnership Form Section"
                                isHidden={!!pageStyles.hidePartnershipForm}
                                onToggle={() => upStyle('hidePartnershipForm', !pageStyles.hidePartnershipForm)}
                            />
                            <VisibilityToggle
                                label="Institutions / Collab Ticker"
                                isHidden={!!pageStyles.hideCollaborations}
                                onToggle={() => upStyle('hideCollaborations', !pageStyles.hideCollaborations)}
                            />
                        </div>
                    </div>
                </div>
            </Section>

            {/* ── 1. Hero Banner Content ── */}
            <Section
                title="🖼 Hero Banner Content"
                isLive={!pageStyles.hideHero}
                onToggleLive={() => upStyle('hideHero', !pageStyles.hideHero)}
            >
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

            {/* ── 2. Category Icons ── */}
            <Section
                title="🏷️ Category Icons Bar"
                isLive={!pageStyles.hideCategories}
                onToggleLive={() => upStyle('hideCategories', !pageStyles.hideCategories)}
            >
                <p className="text-xs text-gray-400 mb-4">Edit labels, destination links, icons, and live status in the quick navigation bar.</p>
                <div className="space-y-3">
                    {categories.map((cat, i) => {
                        const Icon = CATEGORY_ICONS[cat.icon] || CATEGORY_ICONS.Circle;
                        const isLive = cat.active !== false;
                        return (
                            <div key={i} className={`border rounded-xl p-4 transition-all ${isLive ? 'border-gray-200 bg-gray-50/40' : 'border-gray-200 bg-slate-100/60 opacity-70'}`}>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wide">
                                        <Icon className="w-4 h-4 text-gray-600" /> Icon {i + 1}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <ItemLivePill isLive={isLive} onToggle={() => upCategory(i, 'active', !isLive)} />
                                        <button onClick={() => delCategory(i)} className="flex items-center gap-1 px-2 py-1 text-red-500 hover:bg-red-50 rounded-lg text-xs font-semibold"><Trash2 className="w-3.5 h-3.5" /> Remove</button>
                                    </div>
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
                    <button onClick={addCategory} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                        <Plus className="w-3.5 h-3.5" /> Add Icon
                    </button>
                </div>
            </Section>

            {/* ── 3. Latest Updates Ticker ── */}
            <Section
                title="📣 Latest Updates Ticker"
                isLive={!pageStyles.hideTicker}
                onToggleLive={() => upStyle('hideTicker', !pageStyles.hideTicker)}
            >
                <div className="space-y-4">
                    <Field
                        label="Ticker Badge Label"
                        value={tickerTitle}
                        onChange={setTickerTitle}
                        placeholder="LATEST UPDATES"
                        hint="Appears on the left angled tab"
                    />
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Scrolling Announcement Lines</label>
                        <p className="text-xs text-gray-400 mb-3">Each line will scroll across the top bar under the header.</p>
                        <div className="space-y-2">
                            {tickerAnnouncements.map((ann, i) => (
                                <div key={i} className="flex gap-2 items-center">
                                    <input className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={ann} onChange={e => {
                                        const a = [...tickerAnnouncements]; a[i] = e.target.value; setTickerAnnouncements(a);
                                    }} />
                                    <button onClick={() => setTickerAnnouncements(tickerAnnouncements.filter((_, idx) => idx !== i))} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            ))}
                            <button onClick={() => setTickerAnnouncements([...tickerAnnouncements, 'New announcement text'])} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                                <Plus className="w-3.5 h-3.5" /> Add Announcement
                            </button>
                        </div>
                    </div>
                </div>
            </Section>

            {/* ── 4. Global Search Bar ── */}
            <Section
                title="🔍 Global Search Bar"
                isLive={!pageStyles.hideSearchBar}
                onToggleLive={() => upStyle('hideSearchBar', !pageStyles.hideSearchBar)}
            >
                <Field
                    label="Search Input Placeholder"
                    value={searchPlaceholder}
                    onChange={setSearchPlaceholder}
                    placeholder="Search: I need a design for an AI STATION"
                    hint="Shown inside the yellow search bar on the homepage"
                />
            </Section>

            {/* ── 5. Service Cards ── */}
            <Section
                title="⚡ 4 Highlight Service Cards"
                isLive={!pageStyles.hideServices}
                onToggleLive={() => upStyle('hideServices', !pageStyles.hideServices)}
            >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {services.map((svc: any, i) => {
                        const isLive = svc.active !== false;
                        return (
                            <div key={i} className={`border rounded-xl p-4 space-y-3 transition-all ${isLive ? 'border-gray-200 bg-gray-50/40' : 'border-gray-200 bg-slate-100/60 opacity-70'}`}>
                                <div className="flex justify-between items-center pb-1 border-b border-gray-200">
                                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Card {i + 1}</span>
                                    <div className="flex items-center gap-2">
                                        <ItemLivePill isLive={isLive} onToggle={() => upService(i, 'active', !isLive)} />
                                        {services.length > 1 && (
                                            <button onClick={() => delService(i)} className="text-red-500 hover:text-red-700 text-xs font-semibold flex items-center gap-1"><Trash2 className="w-3.5 h-3.5" /> Remove</button>
                                        )}
                                    </div>
                                </div>
                                <Field label="Card Title" value={svc.title} onChange={v => upService(i, 'title', v)} placeholder="e.g. Transform Campus Infrastructure" />
                                <Field label="Link (href)" value={svc.href || '/'} onChange={v => upService(i, 'href', v)} placeholder="/contact-us" />
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Background Color</label>
                                        <div className="flex gap-2 items-center">
                                            <input type="color" className="h-8 w-10 border border-gray-200 rounded p-0.5 cursor-pointer" value={svc.bgColor || '#3B82F6'} onChange={e => upService(i, 'bgColor', e.target.value)} />
                                            <span className="text-xs text-gray-500">{svc.bgColor}</span>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Text Color</label>
                                        <div className="flex gap-2 items-center">
                                            <input type="color" className="h-8 w-10 border border-gray-200 rounded p-0.5 cursor-pointer" value={svc.textColor || '#ffffff'} onChange={e => upService(i, 'textColor', e.target.value)} />
                                            <span className="text-xs text-gray-500">{svc.textColor}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
                {services.length < 8 && (
                    <button onClick={addService} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors mt-4 shadow-sm">
                        <Plus className="w-3.5 h-3.5" /> Add Service Card
                    </button>
                )}
            </Section>

            {/* ── 6. Feature Cards & Sidebar ── */}
            <Section
                title={`🪟 Homepage Feature Cards (${features.length}) — Change Image & Text`}
                isLive={!pageStyles.hideFeatures}
                onToggleLive={() => upStyle('hideFeatures', !pageStyles.hideFeatures)}
            >
                <p className="text-xs text-gray-400 mb-4">Edit the cards on the homepage: change image, title, description, badge tag, color, destination link, and live/hidden state.</p>
                <div className="space-y-4">
                    {features.length === 0 && (
                        <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center text-gray-400 text-sm">
                            No cards yet. Click "Add Card" below.
                        </div>
                    )}
                    {features.map((card, i) => {
                        const isLive = card.active !== false;
                        return (
                            <div key={i} className={`border rounded-2xl p-4 space-y-4 transition-all ${isLive ? 'border-gray-200 bg-gray-50/50' : 'border-gray-200 bg-slate-100/60 opacity-70'}`}>
                                <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                                    <span className="font-bold text-sm text-gray-700 flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">{i + 1}</span>
                                        {card.title || 'Untitled Card'}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <ItemLivePill isLive={isLive} onToggle={() => upFeature(i, 'active', !isLive)} />
                                        <button onClick={() => delFeature(i)} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors font-semibold">
                                            <Trash2 className="w-3.5 h-3.5" /> Remove
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <Field label="Card Title" value={card.title || ''} onChange={v => upFeature(i, 'title', v)} placeholder="e.g. Smart Classrooms" />
                                        <Field label="Description" value={card.description || ''} onChange={v => upFeature(i, 'description', v)} multiline placeholder="Short description of this solution" />
                                        <div className="grid grid-cols-2 gap-2">
                                            <Field label="Badge Tag" value={card.tag || ''} onChange={v => upFeature(i, 'tag', v)} placeholder="e.g. Turnkey, AI, Labs" />
                                            <Field label="Link (href)" value={card.href || ''} onChange={v => upFeature(i, 'href', v)} placeholder="/smart-classrooms" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="block text-xs font-semibold text-gray-600">Badge & Button Color</label>
                                            <div className="flex gap-2 items-center">
                                                <input type="color" className="h-8 w-12 border border-gray-200 rounded p-0.5 cursor-pointer bg-white" value={card.color || '#3B82F6'} onChange={e => upFeature(i, 'color', e.target.value)} />
                                                <input type="text" className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-28 focus:outline-none" value={card.color || '#3B82F6'} onChange={e => upFeature(i, 'color', e.target.value)} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <MediaImageField label="Card Image" value={card.image || ''} onChange={v => upFeature(i, 'image', v)} previewClassName="h-44 rounded-xl" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <button onClick={addFeature} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
                        <Plus className="w-4 h-4" /> Add Card
                    </button>
                </div>
            </Section>

            {/* ── 7. Resources & Catalogues Section ── */}
            <Section
                title={`📚 Resources & Catalogues Section (${resources.length} Cards)`}
                isLive={!pageStyles.hideResources}
                onToggleLive={() => upStyle('hideResources', !pageStyles.hideResources)}
            >
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-200">
                        <Field
                            label="Section Heading"
                            value={resourcesHeading}
                            onChange={setResourcesHeading}
                            placeholder="Resources & Catalogues"
                        />
                        <Field
                            label="Section Subtitle"
                            value={resourcesSubtitle}
                            onChange={setResourcesSubtitle}
                            placeholder="Explore our curated guides, product showrooms..."
                        />
                    </div>

                    <div className="space-y-4">
                        {resources.map((item, i) => {
                            const isLive = item.active !== false;
                            return (
                                <div key={i} className={`border rounded-2xl p-4 space-y-4 transition-all ${isLive ? 'border-gray-200 bg-gray-50/50' : 'border-gray-200 bg-slate-100/60 opacity-70'}`}>
                                    <div className="flex items-center justify-between pb-2 border-b border-gray-200">
                                        <span className="font-bold text-sm text-gray-700 flex items-center gap-2">
                                            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-black flex items-center justify-center">{i + 1}</span>
                                            {item.title || 'Untitled Resource'}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <ItemLivePill isLive={isLive} onToggle={() => upResource(i, 'active', !isLive)} />
                                            <button
                                                type="button"
                                                onClick={() => moveResource(i, -1)}
                                                disabled={i === 0}
                                                title="Move Up"
                                                className="p-1.5 text-gray-500 hover:bg-white rounded-lg disabled:opacity-30"
                                            >
                                                <ChevronUp className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => moveResource(i, 1)}
                                                disabled={i === resources.length - 1}
                                                title="Move Down"
                                                className="p-1.5 text-gray-500 hover:bg-white rounded-lg disabled:opacity-30"
                                            >
                                                <ChevronDown className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => delResource(i)}
                                                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 rounded-lg transition-colors font-semibold ml-1"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" /> Remove
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-3">
                                            <Field label="Card Title" value={item.title} onChange={v => upResource(i, 'title', v)} placeholder="e.g. Complete Guide on AI Implementation" />
                                            <Field label="Card Description" value={item.description} onChange={v => upResource(i, 'description', v)} multiline placeholder="Short description..." />
                                            <div className="grid grid-cols-2 gap-2">
                                                <Field label="Badge Tag" value={item.tag} onChange={v => upResource(i, 'tag', v)} placeholder="e.g. GUIDE, HANDBOOK" />
                                                <Field label="Link (href)" value={item.href} onChange={v => upResource(i, 'href', v)} placeholder="/ai-guide" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="block text-xs font-semibold text-gray-600">Tag & Read Accent Color</label>
                                                <div className="flex gap-2 items-center">
                                                    <input type="color" className="h-8 w-12 border border-gray-200 rounded p-0.5 cursor-pointer bg-white" value={item.color || '#0ea5e9'} onChange={e => upResource(i, 'color', e.target.value)} />
                                                    <input type="text" className="border border-gray-200 rounded-lg px-2 py-1 text-xs w-28 focus:outline-none" value={item.color || '#0ea5e9'} onChange={e => upResource(i, 'color', e.target.value)} />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <MediaImageField label="Card Image" value={item.image} onChange={v => upResource(i, 'image', v)} previewClassName="h-44 rounded-xl" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <button onClick={addResource} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
                        <Plus className="w-4 h-4" /> Add Resource Card
                    </button>
                </div>
            </Section>

            {/* ── 8. Partnership Enquiry Section ── */}
            <Section
                title="🤝 Partnership Enquiry Section (Form & Sidebar)"
                isLive={!pageStyles.hidePartnershipForm}
                onToggleLive={() => upStyle('hidePartnershipForm', !pageStyles.hidePartnershipForm)}
            >
                <div className="space-y-5">
                    <div className="p-4 bg-gray-50 rounded-xl space-y-4 border border-gray-200">
                        <h3 className="text-sm font-bold text-gray-800">Form Column</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field
                                label="Form Heading"
                                value={partnership.formTitle || ''}
                                onChange={v => upPartnership('formTitle', v)}
                                placeholder="Partnership Enquiry Form"
                            />
                            <Field
                                label="Form Subtitle"
                                value={partnership.formSubtitle || ''}
                                onChange={v => upPartnership('formSubtitle', v)}
                                placeholder="Please fill out the form and we'll get back to you as soon as possible."
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-xl space-y-4 border border-gray-200">
                        <h3 className="text-sm font-bold text-gray-800">"Ready to talk?" Sidebar Column</h3>
                        <Field
                            label="Sidebar Heading"
                            value={partnership.readyTitle || ''}
                            onChange={v => upPartnership('readyTitle', v)}
                            placeholder="Ready to talk?"
                        />
                        <Field
                            label="Sidebar Description"
                            value={partnership.readyText || ''}
                            onChange={v => upPartnership('readyText', v)}
                            multiline
                            placeholder="At Campus Mart, we have the expertise..."
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field
                                label="WhatsApp Button Text"
                                value={partnership.whatsappText || ''}
                                onChange={v => upPartnership('whatsappText', v)}
                                placeholder="Connect On WhatsApp"
                            />
                            <Field
                                label="WhatsApp Number"
                                value={partnership.whatsappNumber || ''}
                                onChange={v => upPartnership('whatsappNumber', v)}
                                placeholder="919966109191"
                                hint="Country code + 10 digits"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <Field
                                label="Phone Button Text"
                                value={partnership.phoneText || ''}
                                onChange={v => upPartnership('phoneText', v)}
                                placeholder="Call Us 9966109191"
                            />
                            <Field
                                label="Phone Number"
                                value={partnership.phoneNumber || ''}
                                onChange={v => upPartnership('phoneNumber', v)}
                                placeholder="+919966109191"
                            />
                        </div>
                    </div>
                </div>
            </Section>

            {/* ── 9. Collaborations Ticker ── */}
            <Section
                title="🤝 Institutions / Collaborations"
                isLive={!pageStyles.hideCollaborations}
                onToggleLive={() => upStyle('hideCollaborations', !pageStyles.hideCollaborations)}
            >
                <div className="space-y-4">
                    <Field
                        label="Section Banner Headline"
                        value={collaborationsTitle}
                        onChange={setCollaborationsTitle}
                        placeholder="Trusted By Leading Institutions Worldwide"
                    />
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Institutions List</label>
                        <p className="text-xs text-gray-400 mb-3">The scrolling logo/name bar for trusted institutions.</p>
                        <div className="space-y-2">
                            {collaborations.map((collab: any, i) => {
                                const isLive = collab.active !== false;
                                return (
                                    <div key={i} className={`flex gap-2 items-center border rounded-lg p-2 transition-all ${isLive ? 'border-gray-200 bg-white' : 'border-gray-200 bg-slate-100/60 opacity-70'}`}>
                                        <input placeholder="Institution Name" className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20" value={collab.name} onChange={e => {
                                            const a = [...collaborations]; a[i] = { ...a[i], name: e.target.value }; setCollaborations(a);
                                        }} />
                                        <ItemLivePill isLive={isLive} onToggle={() => {
                                            const a = [...collaborations]; a[i] = { ...a[i], active: !isLive }; setCollaborations(a);
                                        }} />
                                        <button onClick={() => setCollaborations(collaborations.filter((_, idx) => idx !== i))} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                );
                            })}
                            <button onClick={() => setCollaborations([...collaborations, { name: 'New Institution', active: true }])} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                                <Plus className="w-3.5 h-3.5" /> Add Institution
                            </button>
                        </div>
                    </div>
                </div>
            </Section>

            {/* ── Right Sidebar Blocks ── */}
            <Section title="📐 Right Sidebar Blocks (Classifieds, Resources, Projects, Contacts)">
                <div className="space-y-6">
                    {/* Classifieds */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-sm text-gray-800">Classifieds Block</span>
                            <button onClick={() => addListItem('classifieds', { tag: 'SALE', title: 'New Listing', subtitle: 'Location • ₹ Price', href: '/classifieds' })} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-semibold hover:bg-blue-100 flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
                        </div>
                        <div className="space-y-2">
                            {(sidebar.classifieds || []).map((c: any, i: number) => (
                                <div key={i} className="flex gap-2 items-center border border-gray-100 p-2 rounded-lg bg-gray-50/50">
                                    <input className="w-20 border border-gray-200 rounded px-2 py-1 text-xs" placeholder="TAG" value={c.tag || ''} onChange={e => upListItem('classifieds', i, 'tag', e.target.value)} />
                                    <input className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs" placeholder="Title" value={c.title || ''} onChange={e => upListItem('classifieds', i, 'title', e.target.value)} />
                                    <input className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs" placeholder="Subtitle" value={c.subtitle || ''} onChange={e => upListItem('classifieds', i, 'subtitle', e.target.value)} />
                                    <input className="w-28 border border-gray-200 rounded px-2 py-1 text-xs" placeholder="href (/...)" value={c.href || ''} onChange={e => upListItem('classifieds', i, 'href', e.target.value)} />
                                    <button onClick={() => delListItem('classifieds', i)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Resources */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-sm text-gray-800">Resources Block</span>
                            <button onClick={() => addListItem('resources', { tag: 'GUIDE', title: 'New Resource', href: '/catalogues' })} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-semibold hover:bg-blue-100 flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
                        </div>
                        <div className="space-y-2">
                            {(sidebar.resources || []).map((c: any, i: number) => (
                                <div key={i} className="flex gap-2 items-center border border-gray-100 p-2 rounded-lg bg-gray-50/50">
                                    <input className="w-20 border border-gray-200 rounded px-2 py-1 text-xs" placeholder="TAG" value={c.tag || ''} onChange={e => upListItem('resources', i, 'tag', e.target.value)} />
                                    <input className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs" placeholder="Title" value={c.title || ''} onChange={e => upListItem('resources', i, 'title', e.target.value)} />
                                    <input className="w-36 border border-gray-200 rounded px-2 py-1 text-xs" placeholder="href (/...)" value={c.href || ''} onChange={e => upListItem('resources', i, 'href', e.target.value)} />
                                    <button onClick={() => delListItem('resources', i)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Completed Projects */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-sm text-gray-800">Completed Projects Block</span>
                            <button onClick={() => addListItem('completedProjects', { title: 'New Project', category: 'Tech Infra', image: '' })} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-semibold hover:bg-blue-100 flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
                        </div>
                        <div className="space-y-2">
                            {(sidebar.completedProjects || []).map((c: any, i: number) => (
                                <div key={i} className="border border-gray-100 p-3 rounded-lg bg-gray-50/50 space-y-2">
                                    <div className="flex gap-2 items-center">
                                        <input className="flex-1 border border-gray-200 rounded px-2 py-1 text-xs" placeholder="Project Name" value={c.title || ''} onChange={e => upListItem('completedProjects', i, 'title', e.target.value)} />
                                        <input className="w-36 border border-gray-200 rounded px-2 py-1 text-xs" placeholder="Category" value={c.category || ''} onChange={e => upListItem('completedProjects', i, 'category', e.target.value)} />
                                        <button onClick={() => delListItem('completedProjects', i)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                    <MediaImageField label="Project Image" value={c.image || ''} onChange={v => upListItem('completedProjects', i, 'image', v)} previewClassName="h-20 rounded" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contacts Block */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-bold text-sm text-gray-800">Direct Contact Cards (Sidebar Bottom)</span>
                            <button onClick={() => addListItem('contacts', { title: 'Direct Contact', desc: 'Call us directly', action: 'Call Now', href: 'tel:+919966109191', bg: '#3B82F6' })} className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded-lg font-semibold hover:bg-blue-100 flex items-center gap-1"><Plus className="w-3 h-3" /> Add</button>
                        </div>
                        <div className="space-y-3">
                            {(sidebar.contacts || []).map((c: any, i: number) => (
                                <div key={i} className="border border-gray-200 rounded-xl p-3 bg-gray-50/50 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-bold text-gray-400">Contact Card {i + 1}</span>
                                        <button onClick={() => delListItem('contacts', i)} className="p-1 text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Field label="Card Title" value={c.title || ''} onChange={v => upListItem('contacts', i, 'title', v)} />
                                        <Field label="Description" value={c.desc || ''} onChange={v => upListItem('contacts', i, 'desc', v)} />
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <Field label="Button Label" value={c.action || ''} onChange={v => upListItem('contacts', i, 'action', v)} />
                                        <Field label="Link (tel: / mailto:)" value={c.href || ''} onChange={v => upListItem('contacts', i, 'href', v)} />
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
