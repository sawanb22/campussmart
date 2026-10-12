import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Save, Plus, Trash2, Link as LinkIcon, X, ArrowLeft, FileText, Eye, EyeOff, Sparkles, Type, Palette, Layout, Sliders } from 'lucide-react';
import api from '../api/client';
import { pageDefaults } from '../pageDefaults';
import MediaImageField from './MediaImageField';
import JobOpeningsEditorSection from './JobOpeningsEditorSection';
import CaseStudiesEditorSection from './CaseStudiesEditorSection';
import BlogEditorSection from './BlogEditorSection';
import FaqEditorSection from './FaqEditorSection';
import ArticleEditorSection from './ArticleEditorSection';
import { clearPageDataCache, broadcastCmsInvalidation } from '@/hooks/usePageData';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface CardItem {
    title: string;
    description: string;
    image?: string;
    href?: string;
    category?: string;
    readTime?: string;
    categories?: string[];
    downloadLink?: string;
    size?: string;
    location?: string;
    region?: string;
    rating?: string;
    sales?: string;
    margin?: string;
    askingPrice?: string;
}

export interface MoreCardItem {
    title: string;
    category: string;
    description?: string;
    image?: string;
    href?: string;
}

export interface SectionItem {
    heading: string;
    body: string;
    bullets?: string[];
}

export interface PageData {
    pageTitle?: string;
    heroLabel?: string;
    heroEyebrow?: string;
    heroTitle?: string;
    heroSubtitle?: string;
    heroImage?: string;
    heroButtonLabel?: string;
    heroButtonHref?: string;
    styles?: any;
    filterLabel?: string;
    sectionLabel?: string;
    sectionTitle?: string;
    sectionDescription?: string;
    section1Title?: string;
    section2Title?: string;
    section2Description?: string;
    latestTitle?: string;
    viewAllLabel?: string;
    readMoreLabel?: string;
    newsletterLabel?: string;
    newsletterTitle?: string;
    newsletterDescription?: string;
    newsletterPlaceholder?: string;
    newsletterButtonLabel?: string;
    featured?: {
        category?: string;
        eyebrow?: string;
        title?: string;
        description?: string;
        image?: string;
        href?: string;
        readMoreLabel?: string;
        exploreLabel?: string;
        postButtonLabel?: string;
        [key: string]: any;
    };
    brandName?: string;
    headerActionLabel?: string;
    headerActionHref?: string;
    navLinks?: string[];
    moreTitle?: string;
    moreCards?: MoreCardItem[];
    footerDescription?: string;
    footerColumns?: { title: string; links: string[] }[];
    copyright?: string;
    greenFeature?: { category?: string; title?: string; description?: string };
    smallFeature?: { category?: string; title?: string; image?: string; href?: string };
    greenTopics?: string[];
    categoriesTitle?: string;
    categoriesButtonLabel?: string;
    categories?: string[];
    ctaButtonLabel?: string;
    ctaHref?: string;
    filters?: string[];
    ctaTitle?: string;
    ctaSubtitle?: string;
    cards?: CardItem[];
    section2Cards?: CardItem[];
    features?: string[];
    sections?: SectionItem[];
    caseStudies?: { title: string; description?: string; image?: string; slug?: string }[];
    ndaUrl?: string;
    mandateUrl?: string;
    [key: string]: any;
}

export interface Page {
    id: number;
    title: string;
    slug: string;
    template: string | null;
    published: boolean;
    pageData: string | null;
    updatedAt?: string;
}

export function parsePageData(raw: string | null): PageData {
    if (!raw) return {};
    try {
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

// ─── Small Helpers ────────────────────────────────────────────────────────────
function DocumentUploadField({
    label,
    value,
    onChange,
}: {
    label: string;
    value: string;
    onChange: (url: string) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFile = async (file: File) => {
        setUploading(true);
        setError('');
        try {
            const fd = new FormData();
            fd.append('file', file);
            const { data } = await api.post('/pages/upload-document', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            onChange(data.url);
        } catch {
            setError('Upload failed. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-700">{label}</label>
            <div className="flex gap-2">
                <input
                    type="text"
                    className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm bg-white font-mono text-xs"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="https://... or upload file"
                />
                <button
                    type="button"
                    disabled={uploading}
                    onClick={() => inputRef.current?.click()}
                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors whitespace-nowrap disabled:opacity-50"
                >
                    {uploading ? 'Uploading...' : 'Upload PDF'}
                </button>
                <input
                    ref={inputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFile(file);
                    }}
                />
            </div>
            {value && (
                <div className="flex items-center gap-2 pt-1 text-xs text-blue-600">
                    <span className="font-semibold">Current file:</span>
                    <a href={value} target="_blank" rel="noopener noreferrer" className="underline truncate max-w-xs">
                        {value.split('/').pop()}
                    </a>
                </div>
            )}
            {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
        </div>
    );
}

function Field({
    label,
    value,
    onChange,
    multiline = false,
    placeholder = '',
    hint = '',
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    multiline?: boolean;
    placeholder?: string;
    hint?: string;
}) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-700 flex items-center justify-between">
                {label}
                {hint && (
                    <span className="text-gray-400 font-normal text-[10px] uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded">
                        {hint}
                    </span>
                )}
            </label>
            {multiline ? (
                <textarea
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none shadow-sm bg-white"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                />
            ) : (
                <input
                    type="text"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm bg-white"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                />
            )}
        </div>
    );
}

function CardCategoriesField({
    categories = [],
    availableCategories = [],
    onChange,
    onAddGlobalCategory,
}: {
    categories?: string[];
    availableCategories: string[];
    onChange: (cats: string[]) => void;
    onAddGlobalCategory?: (cat: string) => void;
}) {
    const [inputValue, setInputValue] = useState('');

    const currentCats = Array.isArray(categories) ? categories : [];

    // Filter available options to those not currently selected on this card
    const quickAddOptions = availableCategories.filter(
        (cat) => !currentCats.some((c) => c.toLowerCase() === cat.toLowerCase())
    );

    const handleAdd = () => {
        const parts = inputValue
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        if (parts.length === 0) return;

        const next = [...currentCats];
        for (const part of parts) {
            if (!next.some((c) => c.toLowerCase() === part.toLowerCase())) {
                next.push(part);
            }
            if (onAddGlobalCategory) {
                onAddGlobalCategory(part);
            }
        }
        onChange(next);
        setInputValue('');
    };

    const handleRemove = (catToRemove: string) => {
        onChange(currentCats.filter((c) => c !== catToRemove));
    };

    const handleQuickAdd = (catToAdd: string) => {
        if (!currentCats.some((c) => c.toLowerCase() === catToAdd.toLowerCase())) {
            onChange([...currentCats, catToAdd]);
        }
    };

    return (
        <div className="space-y-2 md:col-span-2 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
            <div className="flex items-center justify-between">
                <label className="block text-xs font-black uppercase tracking-wider text-slate-800">
                    Categories (Side Menu Filters)
                </label>
                <span className="text-[10px] text-blue-700 bg-blue-100 font-bold px-2 py-0.5 rounded-full">
                    {currentCats.length} assigned
                </span>
            </div>

            {/* Currently Assigned Badges */}
            <div className="flex flex-wrap gap-2 items-center min-h-[32px]">
                {currentCats.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">
                        No categories assigned to this card yet. Click a suggestion below or type a category name.
                    </span>
                ) : (
                    currentCats.map((cat) => (
                        <span
                            key={cat}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-xs group"
                        >
                            <span>{cat}</span>
                            <button
                                type="button"
                                onClick={() => handleRemove(cat)}
                                className="w-4 h-4 rounded-full hover:bg-blue-700 flex items-center justify-center transition-colors text-blue-200 hover:text-white"
                                title={`Remove ${cat}`}
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </span>
                    ))
                )}
            </div>

            {/* Quick Add Suggestions from other cards / page categories */}
            {quickAddOptions.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Quick Add:
                    </span>
                    {quickAddOptions.map((opt) => (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => handleQuickAdd(opt)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 text-xs font-semibold border border-slate-200 hover:border-blue-300 transition-all shadow-xs"
                        >
                            <Plus className="w-3 h-3 text-blue-500" />
                            {opt}
                        </button>
                    ))}
                </div>
            )}

            {/* Create new category or type custom tag */}
            <div className="flex gap-2 pt-1">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAdd();
                        }
                    }}
                    placeholder="Type new category (or comma-separated) and click Add..."
                    className="flex-1 border border-gray-300 rounded-xl px-3.5 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
                />
                <button
                    type="button"
                    onClick={handleAdd}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs shrink-0"
                >
                    <Plus className="w-3.5 h-3.5" /> Add
                </button>
            </div>
        </div>
    );
}

// ─── Main Unified Page Editor ────────────────────────────────────────────────
export default function UnifiedPageEditor({
    page,
    onClose,
    onSaved,
    isStandalone = false,
}: {
    page: Page;
    onClose?: () => void;
    onSaved?: (updated: Page) => void;
    isStandalone?: boolean;
}) {
    const isAboutUs = page.slug === 'about-us' || page.slug === 'corporate';
    const isContactUs = page.slug === 'contact-us';
    const isBlog = page.slug === 'blog';
    const isFaq = page.slug === 'faq';
    const isArticlePage =
        page.slug === 'how-it-works' ||
        page.slug === 'brand-help' ||
        page.slug === 'sell-on-campusmart' ||
        page.slug === '20-stunning-college-buildings' ||
        page.slug === 'academic-buildings' ||
        page.slug === 'research-facilities' ||
        page.slug === 'student-life-centers';

    const [title, setTitle] = useState(page.title);
    const [published, setPublished] = useState(page.published);

    const defaultAboutUs = {
        heroTitle: 'About Campus Mart',
        heroSubtitle:
            'We are a consortium of architects, designers, and campus innovators who strive to bring learning outcomes through the latest infrastructure and edtech solutions.',
        missionTitle: 'Our Mission',
        missionBody1:
            'To transform educational infrastructure across India by providing comprehensive campus solutions that blend physical spaces with cutting-edge digital technology. We aim to create learning environments that inspire, engage, and empower students and educators alike.',
        missionBody2:
            'As the first company in Asia to bring curriculum-mapped innovations to the campus industry, we continue to lead the way in educational transformation.',
        missionImage: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1200&q=80',
        whyBullets: [
            "India's leading Consortium for Campus Infrastructure",
            'Bespoke Design to Delivery across 100+ categories',
            'Strategic Planning for new Campuses from scratch',
            '4000+ Partner Campuses across India',
            'Exclusive access to global educational brands',
            'NEP 2020 aligned innovation & digital tools',
        ],
        team: [
            {
                name: 'Rajesh Kumar',
                role: 'Founder & CEO',
                image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            },
            {
                name: 'Priya Sharma',
                role: 'Chief Design Officer',
                image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            },
            {
                name: 'Amit Patel',
                role: 'Head of Operations',
                image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            },
        ],
        partners: [
            'European Educational Group',
            'MAXHUB',
            'Nike',
            'ViewSonic',
            'Kidken',
            'Little Tikes',
            'ButterflyFields',
            'ALTOP',
            'Skill O Fun',
            'WriteOnWalls',
            'ICTS',
            'INFINITI',
        ],
    };

    const defaultBlog = {
        heroEyebrow: 'Campus Mart Articles',
        heroTitle: 'Campus Insights & Ideas',
        heroSubtitle:
            'Practical guidance on campus design, technology, and infrastructure — written for principals, administrators and facility teams building better institutions.',
        newsletterLabel: 'Stay curious',
        newsletterTitle: 'Good ideas, occasionally.',
        newsletterDescription:
            'Get useful campus infrastructure perspectives, new trends, and practical stories delivered to your inbox. No noise, just things worth reading.',
        hideHero: false,
        hideFeatured: false,
        hideArticles: false,
        hideNewsletter: false,
    };

    const parsedData = parsePageData(page.pageData);
    const genericDefaults = pageDefaults[page.slug] || pageDefaults[page.template || ''] || {};
    const effectiveDefaults = isAboutUs ? defaultAboutUs : isBlog ? defaultBlog : genericDefaults;

    const initialData = { ...effectiveDefaults };
    Object.entries(parsedData).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
            (initialData as any)[k] = v;
        }
    });

    // Safely backfill missing card fields from defaults without overwriting existing database values
    if (Array.isArray(parsedData.cards) && Array.isArray(effectiveDefaults.cards)) {
        const defaultCardMap = new Map(
            effectiveDefaults.cards.map((c: any) => [(c?.title || '').trim().toLowerCase(), c])
        );
        initialData.cards = parsedData.cards.map((card: any, idx: number) => {
            const key = (card?.title || '').trim().toLowerCase();
            const defCard = defaultCardMap.get(key) || effectiveDefaults.cards[idx];
            return defCard ? { ...defCard, ...card } : card;
        });
    }

    // Safely backfill styles object from defaults without overwriting customized properties
    if (effectiveDefaults.styles && typeof effectiveDefaults.styles === 'object') {
        initialData.styles = {
            ...effectiveDefaults.styles,
            ...(parsedData.styles || {}),
        };
    }

    const [data, setData] = useState<PageData>(initialData);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
 
    // Live synchronization: hydrate contact channels from /api/content when editing contact-us or faq
    useEffect(() => {
        if (isContactUs || isFaq) {
            api.get('/content')
                .then(({ data: siteContent }) => {
                    if (!siteContent || typeof siteContent !== 'object') return;
                    setData((prev) => {
                        const next = { ...prev };
                        if (isContactUs) {
                            if (siteContent.contact_phone !== undefined) next.contact_phone = siteContent.contact_phone;
                            if (siteContent.contact_phone_alt !== undefined) next.contact_phone_alt = siteContent.contact_phone_alt;
                            if (siteContent.contact_email !== undefined) next.contact_email = siteContent.contact_email;
                            if (siteContent.contact_email_alt !== undefined) next.contact_email_alt = siteContent.contact_email_alt;
                            if (siteContent.contact_whatsapp !== undefined) next.contact_whatsapp = siteContent.contact_whatsapp;
                            if (siteContent.contact_hours !== undefined) next.contact_hours = siteContent.contact_hours;
                            if (siteContent.contact_address !== undefined) next.contact_address = siteContent.contact_address;
                        }
                        if (isFaq) {
                            if (!Array.isArray(parsedData.faqs) && siteContent.home_faqs !== undefined) {
                                try {
                                    const parsedFaqs = typeof siteContent.home_faqs === 'string'
                                        ? JSON.parse(siteContent.home_faqs)
                                        : siteContent.home_faqs;
                                    if (Array.isArray(parsedFaqs) && parsedFaqs.length > 0) {
                                        next.faqs = parsedFaqs;
                                    }
                                } catch {
                                    // Keep default faqs on parse error
                                }
                            }
                            if (!parsedData.contact_phone && siteContent.contact_phone) {
                                next.contact_phone = siteContent.contact_phone;
                            }
                            if (!parsedData.contact_email && siteContent.contact_email) {
                                next.contact_email = siteContent.contact_email;
                            }
                        }
                        return next;
                    });
                })
                .catch((err) => {
                    console.warn('[UnifiedPageEditor] Failed to hydrate content channels from /api/content:', err);
                });
        }
    }, [isContactUs, isFaq]);

    const updateContactChannel = (key: string, value: string) => {
        setData((prev) => {
            const next = { ...prev, [key]: value };
            if (Array.isArray(next.cards) && next.cards.length > 0) {
                const nextCards = [...next.cards];
                const p1 = key === 'contact_phone' ? value : (next.contact_phone || '');
                const p2 = key === 'contact_phone_alt' ? value : (next.contact_phone_alt || '');
                const pDisp = p2 ? `${p1}\n${p2}` : p1;

                const e1 = key === 'contact_email' ? value : (next.contact_email || '');
                const e2 = key === 'contact_email_alt' ? value : (next.contact_email_alt || '');
                const eDisp = e2 ? `${e1}\n${e2}` : e1;

                const hDisp = key === 'contact_hours' ? value : (next.contact_hours || '');

                const pIdx = nextCards.findIndex(c => (c?.title || '').toLowerCase().includes('phone'));
                if (pIdx !== -1 && (key === 'contact_phone' || key === 'contact_phone_alt')) {
                    nextCards[pIdx] = { ...nextCards[pIdx], description: pDisp };
                }

                const eIdx = nextCards.findIndex(c => (c?.title || '').toLowerCase().includes('email'));
                if (eIdx !== -1 && (key === 'contact_email' || key === 'contact_email_alt')) {
                    nextCards[eIdx] = { ...nextCards[eIdx], description: eDisp };
                }

                const hIdx = nextCards.findIndex(c => (c?.title || '').toLowerCase().includes('hour') || (c?.title || '').toLowerCase().includes('working'));
                if (hIdx !== -1 && key === 'contact_hours') {
                    nextCards[hIdx] = { ...nextCards[hIdx], description: hDisp };
                }

                next.cards = nextCards;
            }
            return next;
        });
    };

    // Starter Template Modal state
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [templateMode, setTemplateMode] = useState<'append' | 'replace'>('append');
    const [newGlobalCategoryInput, setNewGlobalCategoryInput] = useState('');

    const handleApplyStarterTemplate = () => {
        if (!effectiveDefaults || Object.keys(effectiveDefaults).length === 0) {
            alert('No starter template defaults found for this page.');
            setShowTemplateModal(false);
            return;
        }

        if (templateMode === 'replace') {
            const cloned = JSON.parse(JSON.stringify(effectiveDefaults));
            setData(cloned);
            setShowTemplateModal(false);
            return;
        }

        // Mode: 'append' (Safe, Non-Destructive)
        // 1. Preserve user-created cards at the top and only append non-duplicate sample cards
        const currentCards = Array.isArray(data.cards) ? [...data.cards] : [];
        const sampleCards = Array.isArray(effectiveDefaults.cards) ? effectiveDefaults.cards : [];

        const existingTitles = new Set(
            currentCards
                .map((c: any) => (c?.title || '').trim().toLowerCase())
                .filter(Boolean)
        );

        const nonDuplicateSamples = sampleCards.filter((sample: any) => {
            const titleKey = (sample?.title || '').trim().toLowerCase();
            return !existingTitles.has(titleKey);
        });

        const mergedCards = [...currentCards, ...JSON.parse(JSON.stringify(nonDuplicateSamples))];

        // 2. Additional card sets deduplication
        let mergedSection2Cards = data.section2Cards;
        if (Array.isArray(effectiveDefaults.section2Cards)) {
            const current = Array.isArray(data.section2Cards) ? [...data.section2Cards] : [];
            const existingS2Titles = new Set(current.map((c: any) => (c?.title || '').trim().toLowerCase()).filter(Boolean));
            const nonDup = effectiveDefaults.section2Cards.filter((s: any) => !existingS2Titles.has((s?.title || '').trim().toLowerCase()));
            mergedSection2Cards = [...current, ...JSON.parse(JSON.stringify(nonDup))];
        }

        let mergedCaseStudies = data.caseStudies;
        if (Array.isArray(effectiveDefaults.caseStudies)) {
            const current = Array.isArray(data.caseStudies) ? [...data.caseStudies] : [];
            const existingCSTitles = new Set(current.map((c: any) => (c?.title || '').trim().toLowerCase()).filter(Boolean));
            const nonDup = effectiveDefaults.caseStudies.filter((s: any) => !existingCSTitles.has((s?.title || '').trim().toLowerCase()));
            mergedCaseStudies = [...current, ...JSON.parse(JSON.stringify(nonDup))];
        }

        let mergedMoreCards = data.moreCards;
        if (Array.isArray(effectiveDefaults.moreCards)) {
            const current = Array.isArray(data.moreCards) ? [...data.moreCards] : [];
            const existingMoreTitles = new Set(current.map((c: any) => (c?.title || '').trim().toLowerCase()).filter(Boolean));
            const nonDup = effectiveDefaults.moreCards.filter((s: any) => !existingMoreTitles.has((s?.title || '').trim().toLowerCase()));
            mergedMoreCards = [...current, ...JSON.parse(JSON.stringify(nonDup))];
        }

        // 3. Backfill empty scalar properties from effectiveDefaults without overwriting existing non-empty values
        const mergedData: PageData = { ...data };
        Object.entries(effectiveDefaults).forEach(([key, val]) => {
            if (key === 'cards' || key === 'section2Cards' || key === 'caseStudies' || key === 'moreCards') return;
            if (mergedData[key] === undefined || mergedData[key] === null || mergedData[key] === '') {
                mergedData[key] = JSON.parse(JSON.stringify(val));
            }
        });

        if (Array.isArray(effectiveDefaults.cards)) {
            mergedData.cards = mergedCards;
        }
        if (Array.isArray(effectiveDefaults.section2Cards)) {
            mergedData.section2Cards = mergedSection2Cards;
        }
        if (Array.isArray(effectiveDefaults.caseStudies)) {
            mergedData.caseStudies = mergedCaseStudies;
        }
        if (Array.isArray(effectiveDefaults.moreCards)) {
            mergedData.moreCards = mergedMoreCards;
        }

        setData(mergedData);
        setShowTemplateModal(false);
    };

    const set = (key: string, value: any) => setData((p: any) => ({ ...p, [key]: value }));
    const setStyle = (key: string, value: any) => {
        setData((p: any) => ({
            ...p,
            styles: {
                ...(p.styles || {}),
                [key]: value,
            },
        }));
    };

    /**
     * Resilient DOM scroll & focus utility adhering to SRP.
     * Smoothly navigates the viewport (window or modal container) to newly added cards
     * and focuses the primary text field for zero-friction editing.
     */
    const scrollToAndFocusNewItem = (elementId: string) => {
        requestAnimationFrame(() => {
            setTimeout(() => {
                const el = document.getElementById(elementId);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const firstInput = el.querySelector<HTMLInputElement | HTMLTextAreaElement>(
                        'input[type="text"], textarea'
                    );
                    if (firstInput) {
                        firstInput.focus();
                        firstInput.select();
                    }
                }
            }, 80);
        });
    };

    // Generic Handlers
    const setCard = (i: number, field: string, val: any) => {
        const cards = [...(data.cards ?? [])];
        cards[i] = { ...cards[i], [field]: val };
        set('cards', cards);
    };
    const addCard = () => {
        const nextIndex = (data.cards ?? []).length;
        set('cards', [...(data.cards ?? []), { title: 'New Card', description: '' }]);
        scrollToAndFocusNewItem(`card-item-${nextIndex}`);
    };
    const removeCard = (i: number) => set('cards', (data.cards ?? []).filter((_: any, idx: number) => idx !== i));

    const setFeatured = (field: string, value: string) => set('featured', { ...(data.featured ?? {}), [field]: value });
    const setGreenFeature = (field: string, value: string) => set('greenFeature', { ...(data.greenFeature ?? {}), [field]: value });
    const setSmallFeature = (field: string, value: string) => set('smallFeature', { ...(data.smallFeature ?? {}), [field]: value });

    const setGreenTopic = (i: number, value: string) => {
        const topics = [...(data.greenTopics ?? [])];
        topics[i] = value;
        set('greenTopics', topics);
    };
    const addGreenTopic = () => set('greenTopics', [...(data.greenTopics ?? []), 'NEW CAMPUS PLANNING TOPIC']);
    const removeGreenTopic = (i: number) => set('greenTopics', (data.greenTopics ?? []).filter((_: string, idx: number) => idx !== i));

    const setUgcArrayItem = (key: string, i: number, value: string) => {
        const values = [...(data[key] ?? [])];
        values[i] = value;
        set(key, values);
    };
    const addUgcArrayItem = (key: string, value: string) => set(key, [...(data[key] ?? []), value]);
    const removeUgcArrayItem = (key: string, i: number) => set(key, (data[key] ?? []).filter((_: string, idx: number) => idx !== i));

    const setMoreCard = (i: number, field: string, value: string) => {
        const cards = [...(data.moreCards ?? [])];
        cards[i] = { ...cards[i], [field]: value };
        set('moreCards', cards);
    };
    const addMoreCard = () => {
        const nextIndex = (data.moreCards ?? []).length;
        set('moreCards', [...(data.moreCards ?? []), { title: 'New resource', category: 'Topic', href: '' }]);
        scrollToAndFocusNewItem(`more-card-item-${nextIndex}`);
    };
    const removeMoreCard = (i: number) => set('moreCards', (data.moreCards ?? []).filter((_: MoreCardItem, idx: number) => idx !== i));

    const setFooterColumn = (i: number, field: string, value: any) => {
        const columns = [...(data.footerColumns ?? [])];
        columns[i] = { ...columns[i], [field]: value };
        set('footerColumns', columns);
    };
    const addFooterColumn = () => set('footerColumns', [...(data.footerColumns ?? []), { title: 'New column', links: ['New link'] }]);
    const removeFooterColumn = (i: number) => set('footerColumns', (data.footerColumns ?? []).filter((_: any, idx: number) => idx !== i));

    const setCategory = (i: number, value: string) => {
        const categories = [...(data.categories ?? [])];
        categories[i] = value;
        set('categories', categories);
    };
    const addCategory = () => set('categories', [...(data.categories ?? []), 'New Topic']);
    const removeCategory = (i: number) => set('categories', (data.categories ?? []).filter((_: string, idx: number) => idx !== i));

    const handleAddGlobalCategory = (catName: string) => {
        const trimmed = catName.trim();
        if (!trimmed) return;
        const currentCats = Array.isArray(data.categories) ? data.categories : [];
        if (!currentCats.some((c: string) => c.toLowerCase() === trimmed.toLowerCase())) {
            set('categories', [...currentCats, trimmed]);
        }
    };

    const handleRemoveGlobalCategory = (catToRemove: string) => {
        const currentCats = (Array.isArray(data.categories) ? data.categories : []).filter(
            (c: string) => c.toLowerCase() !== catToRemove.toLowerCase()
        );
        const updatedCards = (data.cards ?? []).map((card: any) => {
            if (Array.isArray(card.categories)) {
                return {
                    ...card,
                    categories: card.categories.filter((c: string) => c.toLowerCase() !== catToRemove.toLowerCase()),
                };
            }
            return card;
        });
        set('categories', currentCats);
        set('cards', updatedCards);
    };

    const setFilter = (i: number, value: string) => {
        const filters = [...(data.filters ?? [])];
        filters[i] = value;
        set('filters', filters);
    };
    const addFilter = () => set('filters', [...(data.filters ?? []), 'New filter']);
    const removeFilter = (i: number) => set('filters', (data.filters ?? []).filter((_: string, idx: number) => idx !== i));

    const setSection2Card = (i: number, field: string, val: any) => {
        const cards = [...(data.section2Cards ?? [])];
        cards[i] = { ...cards[i], [field]: val };
        set('section2Cards', cards);
    };
    const addSection2Card = () => {
        const nextIndex = (data.section2Cards ?? []).length;
        set('section2Cards', [...(data.section2Cards ?? []), { title: 'New Card', description: '' }]);
        scrollToAndFocusNewItem(`section2-card-item-${nextIndex}`);
    };
    const removeSection2Card = (i: number) => set('section2Cards', (data.section2Cards ?? []).filter((_: any, idx: number) => idx !== i));

    const setSection = (i: number, field: string, value: any) => {
        const sections = [...(data.sections ?? [])];
        sections[i] = { ...sections[i], [field]: value };
        set('sections', sections);
    };
    const addSection = () => {
        const nextIndex = (data.sections ?? []).length;
        set('sections', [...(data.sections ?? []), { heading: 'New Section', body: '', bullets: [] }]);
        scrollToAndFocusNewItem(`section-item-${nextIndex}`);
    };
    const removeSection = (i: number) => set('sections', (data.sections ?? []).filter((_: any, idx: number) => idx !== i));

    const setFeature = (i: number, v: string) => {
        const f = [...(data.features ?? [])];
        f[i] = v;
        set('features', f);
    };
    const addFeature = () => set('features', [...(data.features ?? []), 'New feature']);
    const removeFeature = (i: number) => set('features', (data.features ?? []).filter((_: any, idx: number) => idx !== i));

    const setHighlightBullet = (i: number, v: string) => {
        const bullets = [...(data.highlightBullets ?? [])];
        bullets[i] = v;
        set('highlightBullets', bullets);
    };
    const addHighlightBullet = () => set('highlightBullets', [...(data.highlightBullets ?? []), 'New highlight bullet']);
    const removeHighlightBullet = (i: number) => set('highlightBullets', (data.highlightBullets ?? []).filter((_: any, idx: number) => idx !== i));

    // About Us Methods
    const setWhyBullet = (i: number, v: string) => {
        const w = [...(data.whyBullets ?? [])];
        w[i] = v;
        set('whyBullets', w);
    };
    const addWhyBullet = () => set('whyBullets', [...(data.whyBullets ?? []), 'New bullet point']);
    const removeWhyBullet = (i: number) => set('whyBullets', (data.whyBullets ?? []).filter((_: any, idx: number) => idx !== i));

    const setTeamMember = (i: number, field: string, val: string) => {
        const t = [...(data.team ?? [])];
        t[i] = { ...t[i], [field]: val };
        set('team', t);
    };
    const addTeamMember = () => {
        const nextIndex = (data.team ?? []).length;
        set('team', [...(data.team ?? []), { name: 'Name', role: 'Role', image: '' }]);
        scrollToAndFocusNewItem(`team-item-${nextIndex}`);
    };
    const removeTeamMember = (i: number) => set('team', (data.team ?? []).filter((_: any, idx: number) => idx !== i));

    const setPartner = (i: number, v: string) => {
        const p = [...(data.partners ?? [])];
        p[i] = v;
        set('partners', p);
    };
    const addPartner = () => set('partners', [...(data.partners ?? []), 'Partner Name']);
    const removePartner = (i: number) => set('partners', (data.partners ?? []).filter((_: any, idx: number) => idx !== i));

    const save = async () => {
        setSaving(true);
        setSaveError(null);
        try {
            // Live synchronization: also update global content channels for contact-us or faq
            if (isContactUs) {
                const contentPayload: Record<string, string> = {
                    contact_phone: data.contact_phone ?? '',
                    contact_phone_alt: data.contact_phone_alt ?? '',
                    contact_email: data.contact_email ?? '',
                    contact_email_alt: data.contact_email_alt ?? '',
                    contact_whatsapp: data.contact_whatsapp ?? '',
                    contact_hours: data.contact_hours ?? '',
                    contact_address: data.contact_address ?? '',
                };
                await api.put('/content', contentPayload);
            }
            if (isFaq && Array.isArray((data as any).faqs)) {
                await api.put('/content', {
                    home_faqs: JSON.stringify((data as any).faqs),
                });
            }

            const { data: updated } = await api.put(`/pages/${page.id}`, {
                title,
                published,
                pageData: JSON.stringify(data),
            });
            clearPageDataCache(page.slug);
            clearPageDataCache();

            // Broadcast cache invalidation across all tabs
            broadcastCmsInvalidation({ type: 'INVALIDATE_PAGE', slug: page.slug });
            broadcastCmsInvalidation({ type: 'INVALIDATE_ALL' });

            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            if (onSaved) onSaved(updated);
        } catch (err: any) {
            console.error(`Failed to save page ${page.slug}:`, err);
            const msg = err?.response?.data?.error || 'Failed to save page changes. Please try again.';
            setSaveError(msg);
            alert(`Save failed: ${msg}`);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Editor Header */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md flex flex-wrap gap-4 items-center justify-between px-6 sm:px-8 py-5 border-b border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                    {isStandalone && onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="mr-2 p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                            title="Back to Pages list"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                    )}
                    <div className="w-1.5 h-8 bg-blue-600 rounded-full" />
                    <div>
                        <h3 className="font-black text-gray-900 text-xl tracking-tight">
                            {isStandalone ? `Edit Page: ${page.title}` : 'Edit Page Content'}
                        </h3>
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">/{page.slug}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {page.slug !== 'job-openings' && (
                        <button
                            type="button"
                            onClick={() => setShowTemplateModal(true)}
                            className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold border border-blue-200 text-blue-700 bg-blue-50/90 hover:bg-blue-100 rounded-xl transition-all shadow-sm active:scale-95"
                            title="Load recommended template samples for this page"
                        >
                            <FileText className="w-3.5 h-3.5" /> Load Starter Template
                        </button>
                    )}
                    <a
                        href={`/${page.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <LinkIcon className="w-3.5 h-3.5" /> View Live
                    </a>
                    <button
                        type="button"
                        onClick={save}
                        disabled={saving}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black shadow-lg transition-all active:scale-95 ${
                            saving ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving…' : saved ? '✓ Changes Saved!' : 'Save Page Changes'}
                    </button>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 text-gray-400 border border-gray-100 hover:border-red-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all ml-2"
                            title="Close editor"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    )}
                </div>
            </div>

            {/* Specialized Shortcut Banners */}

            {page.slug === 'home' && (
                <div className="mx-6 sm:mx-8 mt-6 rounded-2xl border-2 border-blue-400 bg-blue-50/90 p-5 text-sm text-blue-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
                    <div>
                        <div className="font-extrabold text-blue-950 text-base">🏠 Homepage Cards, Images &amp; Content Editor</div>
                        <p className="text-xs text-blue-800 mt-1">
                            To change the images, text, and links on the homepage feature cards, hero banner, service links, and sidebar, open the dedicated Homepage Editor.
                        </p>
                    </div>
                    <Link
                        to="/admin/homepage-editor"
                        className="px-4 py-2 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition shrink-0 shadow-md"
                    >
                        Edit Homepage Cards &amp; Images →
                    </Link>
                </div>
            )}

            {page.slug === 'blog' && (
                <div className="mx-6 sm:mx-8 mt-6 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-sm text-blue-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div>
                        <div className="font-bold text-blue-950">📝 Dedicated Blog Posts Manager Available</div>
                        <p className="text-xs text-blue-800 mt-0.5">
                            To create, edit, or publish individual blog posts and categories, use the Blog Posts Manager.
                        </p>
                    </div>
                    <Link
                        to="/admin/blog"
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition shrink-0 shadow-xs"
                    >
                        Open Blog Manager →
                    </Link>
                </div>
            )}

            {saveError && (
                <div className="mx-6 sm:mx-8 mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-semibold flex items-center justify-between">
                    <span>⚠️ {saveError}</span>
                    <button type="button" onClick={() => setSaveError(null)} className="text-red-500 hover:text-red-700 font-bold ml-4">
                        ✕
                    </button>
                </div>
            )}

            <div className="p-6 sm:p-8 space-y-12">
                {/* General Configuration */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">General Configuration</h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <Field label="Browser Title *" value={title} onChange={setTitle} hint="shown in navigation and tabs" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-bold text-gray-700">Publishing Status</label>
                            <button
                                type="button"
                                onClick={() => setPublished((p) => !p)}
                                className={`w-full px-4 py-2.5 rounded-xl text-xs font-black border-2 transition-all shadow-sm ${
                                    published
                                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                        : 'bg-slate-50 text-slate-500 border-slate-200'
                                }`}
                            >
                                {published ? '● PUBLISHED & VISIBLE' : '○ SAVED AS DRAFT'}
                            </button>
                        </div>
                    </div>
                </section>

                {(page.slug === 'ai-ml' || page.slug === 'campus-design-execution' || page.slug === 'campus-design' || page.slug === 'campus-furniture-design' || page.slug === 'sports-design-execution' || page.slug === 'ai-digital-design-supply' || page.slug === 'ar-vr-experiences' || page.slug === 'furniture' || page.slug === 'sports-infra' || page.slug === 'tech-infra' || page.slug === 'libraries' || page.slug === 'labs' || page.slug === 'collaboration' || page.slug === 'innovation' || page.slug === 'campus-automation' || page.slug === 'campus-master-planning') && (() => {
                    const isServiceGridPage =
                        page.slug === 'campus-design-execution' ||
                        page.slug === 'campus-design' ||
                        page.slug === 'campus-furniture-design' ||
                        page.slug === 'sports-design-execution' ||
                        page.slug === 'ai-digital-design-supply' ||
                        page.slug === 'ar-vr-experiences' ||
                        page.slug === 'sports-infra' ||
                        page.slug === 'tech-infra' ||
                        page.slug === 'libraries' ||
                        page.slug === 'labs' ||
                        page.slug === 'collaboration' ||
                        page.slug === 'campus-automation' ||
                        page.slug === 'campus-master-planning';
                    const isFurniturePage = page.slug === 'furniture';
                    const isSportsInfraPage = page.slug === 'sports-infra';
                    const isTechInfraPage = page.slug === 'tech-infra';
                    const isLibrariesPage = page.slug === 'libraries';
                    const isLabsPage = page.slug === 'labs';
                    const isCollabPage = page.slug === 'collaboration';
                    const isInnovationPage = page.slug === 'innovation';
                    const isCampusAutomationPage = page.slug === 'campus-automation';
                    const isCampusMasterPlanningPage = page.slug === 'campus-master-planning';
                    const defaultHeadingFont = effectiveDefaults.styles?.headingFont || (isInnovationPage ? 'poppins' : isServiceGridPage || isFurniturePage ? 'poppins' : 'playfair');
                    const defaultPrimaryColor = effectiveDefaults.styles?.primaryColor || (isInnovationPage ? '#155b51' : isServiceGridPage || isFurniturePage ? '#0047ab' : '#ea580c');
                    const defaultHeroBg = effectiveDefaults.styles?.heroBg || (isInnovationPage ? 'paper' : isCollabPage || isLabsPage || isLibrariesPage || isTechInfraPage || isSportsInfraPage || isFurniturePage ? 'blue' : isServiceGridPage ? 'white' : 'amber');
                    const defaultCtaBg = effectiveDefaults.styles?.ctaBg || (isCollabPage ? 'white' : isServiceGridPage ? 'blue' : 'stone');
                    const defaultHeroLayout = effectiveDefaults.styles?.heroLayout || (isCollabPage || isLabsPage || isLibrariesPage || isTechInfraPage || isSportsInfraPage || isFurniturePage ? 'split-right' : isServiceGridPage ? 'minimal' : 'split-right');
                    const defaultShowFeatured =
                        effectiveDefaults.styles?.showFeatured !== undefined
                            ? effectiveDefaults.styles.showFeatured
                            : isCampusAutomationPage || isInnovationPage ? true : !isServiceGridPage;
                    const defaultShowFilters =
                        effectiveDefaults.styles?.showFilters !== undefined
                            ? effectiveDefaults.styles.showFilters
                            : isCampusAutomationPage || isCampusMasterPlanningPage || isLabsPage || isLibrariesPage || isTechInfraPage || isSportsInfraPage || isInnovationPage
                            ? true
                            : !isServiceGridPage;

                    const currentShowFeatured =
                        data.styles?.showFeatured !== undefined ? data.styles.showFeatured : defaultShowFeatured;
                    const currentShowFilters =
                        data.styles?.showFilters !== undefined ? data.styles.showFilters : defaultShowFilters;

                    return (
                        <section className="space-y-6 rounded-2xl border-2 border-orange-500/20 bg-gradient-to-br from-orange-50/40 via-amber-50/20 to-white p-6 sm:p-7 shadow-xs">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-orange-200/60 gap-2">
                                <div>
                                    <h4 className="text-xs font-black text-orange-950 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                                        Page Control: Typography, Layout &amp; Theme
                                    </h4>
                                    <p className="text-xs text-orange-800/80 mt-1 font-medium">
                                        Customize fonts, layout variants, brand colors, and display options for {page.title}.
                                    </p>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-900 px-3 py-1 rounded-full border border-orange-200 self-start sm:self-auto">
                                    {page.title} Styles
                                </span>
                            </div>

                            {/* 1. Typography / Fonts */}
                            <div className="space-y-4">
                                <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                    <Type className="w-3.5 h-3.5 text-orange-600" /> Typography &amp; Fonts
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-bold text-gray-700">Heading Font</label>
                                        <select
                                            value={data.styles?.headingFont ?? defaultHeadingFont}
                                            onChange={(e) => setStyle('headingFont', e.target.value)}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all bg-white text-slate-800"
                                        >
                                            <option value="playfair">Playfair Display (Editorial Serif)</option>
                                            <option value="grotesk">Space Grotesk (Modern Tech Sans)</option>
                                            <option value="poppins">Poppins (Geometric Clean Sans)</option>
                                            <option value="opensans">Open Sans (Classic Neutral)</option>
                                            <option value="system">System Sans (Native Clean UI)</option>
                                        </select>
                                        <p className="text-[11px] text-gray-500">Applied to hero headlines, section headings, and card titles</p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-bold text-gray-700">Body Font</label>
                                        <select
                                            value={data.styles?.bodyFont ?? 'opensans'}
                                            onChange={(e) => setStyle('bodyFont', e.target.value)}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all bg-white text-slate-800"
                                        >
                                            <option value="opensans">Open Sans (Classic Clean - Default)</option>
                                            <option value="poppins">Poppins (Geometric Sans)</option>
                                            <option value="grotesk">Space Grotesk (Modern Sans)</option>
                                            <option value="system">System Sans (Native)</option>
                                        </select>
                                        <p className="text-[11px] text-gray-500">Applied to subtitles, descriptions, and article body text</p>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Color & Theme */}
                            <div className="space-y-4 pt-2 border-t border-orange-200/40">
                                <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                    <Palette className="w-3.5 h-3.5 text-orange-600" /> Brand Colors &amp; Background Themes
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-bold text-gray-700">Primary Accent Color</label>
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="color"
                                                value={data.styles?.primaryColor || defaultPrimaryColor}
                                                onChange={(e) => setStyle('primaryColor', e.target.value)}
                                                className="h-10 w-12 rounded-lg border border-gray-300 p-0.5 cursor-pointer bg-white"
                                            />
                                            <input
                                                type="text"
                                                value={data.styles?.primaryColor || defaultPrimaryColor}
                                                onChange={(e) => setStyle('primaryColor', e.target.value)}
                                                placeholder={defaultPrimaryColor}
                                                className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-xs font-mono font-semibold"
                                            />
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {[
                                                { name: 'Blue', hex: '#0047ab' },
                                                { name: 'Orange', hex: '#ea580c' },
                                                { name: 'Emerald', hex: '#059669' },
                                                { name: 'Purple', hex: '#7c3aed' },
                                                { name: 'Charcoal', hex: '#1e293b' },
                                            ].map((c) => (
                                                <button
                                                    key={c.hex}
                                                    type="button"
                                                    onClick={() => setStyle('primaryColor', c.hex)}
                                                    className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border border-gray-200 bg-white hover:bg-gray-50 transition-all"
                                                >
                                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.hex }} />
                                                    {c.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-bold text-gray-700">Hero Background</label>
                                        <select
                                            value={data.styles?.heroBg ?? defaultHeroBg}
                                            onChange={(e) => setStyle('heroBg', e.target.value)}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all bg-white text-slate-800"
                                        >
                                            <option value="paper">Warm Paper / Cream (Journal Default)</option>
                                            <option value="white">Clean White (Minimal)</option>
                                            <option value="amber">Warm Amber</option>
                                            <option value="slate">Modern Slate (Light Gray)</option>
                                            <option value="blue">Soft Sky Blue</option>
                                            <option value="stone">Dark Charcoal</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-bold text-gray-700">Bottom CTA Background</label>
                                        <select
                                            value={data.styles?.ctaBg ?? defaultCtaBg}
                                            onChange={(e) => setStyle('ctaBg', e.target.value)}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all bg-white text-slate-800"
                                        >
                                            <option value="blue">Campus Royal Blue</option>
                                            <option value="stone">Dark Stone</option>
                                            <option value="amber">Deep Amber</option>
                                            <option value="slate">Dark Slate Gray</option>
                                            <option value="white">Clean Slate / White</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* 3. Layout Variants & Section Toggles */}
                            <div className="space-y-4 pt-2 border-t border-orange-200/40">
                                <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                    <Layout className="w-3.5 h-3.5 text-orange-600" /> Layout Variants &amp; Display Controls
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-bold text-gray-700">Hero Layout</label>
                                        <select
                                            value={data.styles?.heroLayout ?? defaultHeroLayout}
                                            onChange={(e) => setStyle('heroLayout', e.target.value)}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all bg-white text-slate-800"
                                        >
                                            {isServiceGridPage && <option value="minimal">Minimal Header (Text Only - Default)</option>}
                                            <option value="split-right">Split (Text Left, Image Right)</option>
                                            <option value="split-left">Split (Image Left, Text Right)</option>
                                            <option value="centered">Centered Headline &amp; Banner</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-bold text-gray-700">Card Grid Columns</label>
                                        <select
                                            value={data.styles?.cardColumns ?? '3'}
                                            onChange={(e) => setStyle('cardColumns', e.target.value)}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all bg-white text-slate-800"
                                        >
                                            <option value="3">3 Columns (Standard Grid)</option>
                                            <option value="2">2 Columns (Larger Cards)</option>
                                            <option value="4">4 Columns (Compact Grid)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-sm font-bold text-gray-700">Featured Card Display</label>
                                        <select
                                            value={currentShowFeatured ? 'true' : 'false'}
                                            onChange={(e) => setStyle('showFeatured', e.target.value === 'true')}
                                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500/30 focus:border-orange-500 transition-all bg-white text-slate-800"
                                        >
                                            <option value="true">Show 1st Card as Large Featured Banner</option>
                                            <option value="false">Uniform Grid Only (All cards same size)</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setStyle('showFilters', !currentShowFilters)}
                                        className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                                            currentShowFilters
                                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                : 'bg-slate-50 text-slate-500 border-slate-200'
                                        }`}
                                    >
                                        <span>Filter Chips</span>
                                        <span>{currentShowFilters ? '● Visible' : '○ Hidden'}</span>
                                    </button>

                                    {page.slug !== 'innovation' && (
                                        <button
                                            type="button"
                                            onClick={() => set('hideHero', !data.hideHero)}
                                            className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                                                !data.hideHero
                                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                    : 'bg-slate-50 text-slate-500 border-slate-200'
                                            }`}
                                        >
                                            <span>Hero Section</span>
                                            <span>{!data.hideHero ? '● Visible' : '○ Hidden'}</span>
                                        </button>
                                    )}

                                    {page.slug === 'innovation' ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => set('hideNav', !data.hideNav)}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                                                    !data.hideNav
                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                        : 'bg-slate-50 text-slate-500 border-slate-200'
                                                }`}
                                            >
                                                <span>Journal Nav Bar</span>
                                                <span>{!data.hideNav ? '● Visible' : '○ Hidden'}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => set('hideCategories', !data.hideCategories)}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                                                    !data.hideCategories
                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                        : 'bg-slate-50 text-slate-500 border-slate-200'
                                                }`}
                                            >
                                                <span>Category Pills</span>
                                                <span>{!data.hideCategories ? '● Visible' : '○ Hidden'}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => set('hideFeatured', !data.hideFeatured)}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                                                    !data.hideFeatured
                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                        : 'bg-slate-50 text-slate-500 border-slate-200'
                                                }`}
                                            >
                                                <span>Featured Hub Card</span>
                                                <span>{!data.hideFeatured ? '● Visible' : '○ Hidden'}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => set('hideCards', !data.hideCards)}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                                                    !data.hideCards
                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                        : 'bg-slate-50 text-slate-500 border-slate-200'
                                                }`}
                                            >
                                                <span>Tracks Grid</span>
                                                <span>{!data.hideCards ? '● Visible' : '○ Hidden'}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => set('hideMore', !data.hideMore)}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                                                    !data.hideMore
                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                        : 'bg-slate-50 text-slate-500 border-slate-200'
                                                }`}
                                            >
                                                <span>More Resources</span>
                                                <span>{!data.hideMore ? '● Visible' : '○ Hidden'}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => set('hideFooter', !data.hideFooter)}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                                                    !data.hideFooter
                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                        : 'bg-slate-50 text-slate-500 border-slate-200'
                                                }`}
                                            >
                                                <span>Journal Footer</span>
                                                <span>{!data.hideFooter ? '● Visible' : '○ Hidden'}</span>
                                            </button>
                                        </>
                                    ) : page.slug === 'furniture' ? (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => set('hideShop', !data.hideShop)}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                                                    !data.hideShop
                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                        : 'bg-slate-50 text-slate-500 border-slate-200'
                                                }`}
                                            >
                                                <span>Shop Catalog</span>
                                                <span>{!data.hideShop ? '● Visible' : '○ Hidden'}</span>
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => set('hideQuote', !data.hideQuote)}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                                                    !data.hideQuote
                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                        : 'bg-slate-50 text-slate-500 border-slate-200'
                                                }`}
                                            >
                                                <span>Design Quote</span>
                                                <span>{!data.hideQuote ? '● Visible' : '○ Hidden'}</span>
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                type="button"
                                                onClick={() => set('hideCards', !data.hideCards)}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                                                    !data.hideCards
                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                        : 'bg-slate-50 text-slate-500 border-slate-200'
                                                }`}
                                            >
                                                <span>Cards Grid</span>
                                                <span>{!data.hideCards ? '● Visible' : '○ Hidden'}</span>
                                            </button>

                                            {page.slug === 'sports-infra' && (
                                                <button
                                                    type="button"
                                                    onClick={() => set('hideFeatures', !data.hideFeatures)}
                                                    className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                                                        !data.hideFeatures
                                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                            : 'bg-slate-50 text-slate-500 border-slate-200'
                                                    }`}
                                                >
                                                    <span>Services Bullets</span>
                                                    <span>{!data.hideFeatures ? '● Visible' : '○ Hidden'}</span>
                                                </button>
                                            )}

                                            {(page.slug === 'libraries' || page.slug === 'labs') && (
                                                <button
                                                    type="button"
                                                    onClick={() => set('hidePhilosophy', !data.hidePhilosophy)}
                                                    className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                                                        !data.hidePhilosophy
                                                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                            : 'bg-slate-50 text-slate-500 border-slate-200'
                                                    }`}
                                                >
                                                    <span>Philosophy Section</span>
                                                    <span>{!data.hidePhilosophy ? '● Visible' : '○ Hidden'}</span>
                                                </button>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => set('hideCta', !data.hideCta)}
                                                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-xs font-bold transition-all ${
                                                    !data.hideCta
                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                                        : 'bg-slate-50 text-slate-500 border-slate-200'
                                                }`}
                                            >
                                                <span>Bottom CTA</span>
                                                <span>{!data.hideCta ? '● Visible' : '○ Hidden'}</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* 4. Micro-Copy & Labels */}
                            <div className="space-y-4 pt-2 border-t border-orange-200/40">
                                <h5 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                                    <Sliders className="w-3.5 h-3.5 text-orange-600" /> Micro-Copy &amp; Labels
                                </h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Field
                                        label="Hero Eyebrow Tagline"
                                        value={data.heroEyebrow ?? ''}
                                        onChange={(v) => set('heroEyebrow', v)}
                                        placeholder={effectiveDefaults.heroEyebrow || 'Turnkey Services'}
                                        hint="Small badge text displayed directly above the main hero heading"
                                    />
                                    <Field
                                        label="Card Action Link Label"
                                        value={data.readMoreLabel ?? ''}
                                        onChange={(v) => set('readMoreLabel', v)}
                                        placeholder={effectiveDefaults.readMoreLabel || 'Learn More'}
                                        hint="Link text on each card (e.g. Learn More / Explore Range)"
                                    />
                                    {isServiceGridPage && (
                                        <>
                                            <Field
                                                label="Grid Section Heading"
                                                value={data.section1Title ?? ''}
                                                onChange={(v) => set('section1Title', v)}
                                                placeholder={effectiveDefaults.section1Title || 'Turnkey Execution Phases'}
                                                hint="Heading shown above the cards grid"
                                            />
                                            <Field
                                                label="Items Counter Label"
                                                value={data.stepCountLabel ?? ''}
                                                onChange={(v) => set('stepCountLabel', v)}
                                                placeholder={effectiveDefaults.stepCountLabel || 'Sequential Steps'}
                                                hint="Counter label next to item count (e.g. '6 Specialized Ranges')"
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </section>
                    );
                })()}

                {isAboutUs ? (
                    // ─── ABOUT US & CORPORATE ──────────────────────────────────────────
                    <>
                        <section className="space-y-6">
                            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Hero Banner Content</h4>
                                <button
                                    type="button"
                                    onClick={() => set('hideHero', !data.hideHero)}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                        data.hideHero
                                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                    }`}
                                >
                                    {data.hideHero ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    {data.hideHero ? 'Hidden / Draft' : 'Live on Page'}
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Field
                                    label="Hero Heading *"
                                    value={data.heroTitle ?? ''}
                                    onChange={(v) => set('heroTitle', v)}
                                    placeholder="About Campus Mart"
                                />
                                <Field
                                    label="Hero Sub-heading"
                                    value={data.heroSubtitle ?? ''}
                                    onChange={(v) => set('heroSubtitle', v)}
                                    multiline
                                    placeholder="We are a consortium..."
                                />
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Our Mission Section</h4>
                                <button
                                    type="button"
                                    onClick={() => set('hideMission', !data.hideMission)}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                        data.hideMission
                                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                    }`}
                                >
                                    {data.hideMission ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                    {data.hideMission ? 'Hidden / Draft' : 'Live on Page'}
                                </button>
                            </div>
                            <div className="space-y-6">
                                <Field
                                    label="Mission Heading"
                                    value={data.missionTitle ?? ''}
                                    onChange={(v) => set('missionTitle', v)}
                                    placeholder="Our Mission"
                                />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Field
                                        label="Mission Paragraph 1"
                                        value={data.missionBody1 ?? ''}
                                        onChange={(v) => set('missionBody1', v)}
                                        multiline
                                        placeholder="To transform educational..."
                                    />
                                    <Field
                                        label="Mission Paragraph 2"
                                        value={data.missionBody2 ?? ''}
                                        onChange={(v) => set('missionBody2', v)}
                                        multiline
                                        placeholder="As the first company..."
                                    />
                                </div>
                                <MediaImageField
                                    label="Mission Image"
                                    value={data.missionImage ?? ''}
                                    onChange={(v) => set('missionImage', v)}
                                />
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Why Sign Up Bullets</h4>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => set('hideWhyBullets', !data.hideWhyBullets)}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                            data.hideWhyBullets
                                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                        }`}
                                    >
                                        {data.hideWhyBullets ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        {data.hideWhyBullets ? 'Hidden / Draft' : 'Live on Page'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={addWhyBullet}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-emerald-700 transition-all shadow-md"
                                    >
                                        <Plus className="w-4 h-4" /> Add Bullet
                                    </button>
                                </div>
                            </div>
                            <Field
                                label="Section Heading"
                                value={data.whyBulletsTitle ?? ''}
                                onChange={(v) => set('whyBulletsTitle', v)}
                                placeholder="Why Sign Up Bullets"
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(data.whyBullets ?? []).map((b: string, i: number) => (
                                    <div key={i} className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl">
                                        <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 ml-2" />
                                        <input
                                            className="flex-1 border-none bg-transparent focus:ring-0 text-sm font-medium"
                                            value={b}
                                            onChange={(e) => setWhyBullet(i, e.target.value)}
                                            placeholder="Enter bullet point..."
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeWhyBullet(i)}
                                            className="p-2 text-red-400 hover:bg-red-50 rounded-lg"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Leadership Team</h4>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => set('hideTeam', !data.hideTeam)}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                            data.hideTeam
                                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                        }`}
                                    >
                                        {data.hideTeam ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        {data.hideTeam ? 'Hidden / Draft' : 'Live on Page'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={addTeamMember}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-md"
                                    >
                                        <Plus className="w-4 h-4" /> Add Member
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {(data.team ?? []).map((t: any, i: number) => (
                                    <div key={i} id={`team-item-${i}`} className="border border-gray-200 rounded-2xl p-4 space-y-4 shadow-sm bg-white relative group">
                                        <button
                                            type="button"
                                            onClick={() => removeTeamMember(i)}
                                            className="absolute -top-3 -right-3 bg-red-100 text-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity drop-shadow"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        <Field label="Name" value={t.name ?? ''} onChange={(v) => setTeamMember(i, 'name', v)} />
                                        <Field label="Role" value={t.role ?? ''} onChange={(v) => setTeamMember(i, 'role', v)} />
                                        <MediaImageField
                                            label="Image"
                                            value={t.image ?? ''}
                                            onChange={(v) => setTeamMember(i, 'image', v)}
                                            previewClassName="h-16 w-16 mx-auto rounded-full"
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Partners Matrix</h4>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => set('hideEcosystem', !data.hideEcosystem)}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                            data.hideEcosystem
                                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                        }`}
                                    >
                                        {data.hideEcosystem ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        {data.hideEcosystem ? 'Hidden / Draft' : 'Live on Page'}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={addPartner}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-amber-700 transition-all shadow-md"
                                    >
                                        <Plus className="w-4 h-4" /> Add Partner
                                    </button>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Field
                                    label="Section Heading"
                                    value={data.ecosystemTitle ?? ''}
                                    onChange={(v) => set('ecosystemTitle', v)}
                                    placeholder="Global Ecosystem"
                                />
                                <Field
                                    label="Section Sub-heading"
                                    value={data.ecosystemSubtitle ?? ''}
                                    onChange={(v) => set('ecosystemSubtitle', v)}
                                    multiline
                                    placeholder="Our strength lies in our network of global partners who bring the best of edtech and infrastructure to Indian soil."
                                />
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {(data.partners ?? []).map((p: string, i: number) => (
                                    <div key={i} className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-lg">
                                        <input
                                            className="w-32 text-sm font-semibold border-none focus:ring-0 p-0 m-0"
                                            value={p}
                                            onChange={(e) => setPartner(i, e.target.value)}
                                            placeholder="Partner Name"
                                        />
                                        <button type="button" onClick={() => removePartner(i)} className="text-gray-400 hover:text-red-500">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                ) : (
                    // ─── GENERIC TEMPLATE EDITOR ──────────────────────────────────────────
                    <>
                        {page.slug !== 'ai-guide' && page.slug !== 'ugc-guidelines' && page.slug !== 'innovation' && page.slug !== 'blog' && page.slug !== 'science-tech-labs' && page.slug !== 'classifieds' && page.slug !== 'job-openings' && page.slug !== 'faq' && !isArticlePage && (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Hero Banner Content</h4>
                                    <button
                                        type="button"
                                        onClick={() => set('hideHero', !data.hideHero)}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                            data.hideHero
                                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                        }`}
                                    >
                                        {data.hideHero ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        {data.hideHero ? 'Hidden / Draft' : 'Live on Page'}
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    <Field
                                        label="Hero Heading *"
                                        value={data.heroTitle ?? ''}
                                        onChange={(v) => set('heroTitle', v)}
                                        placeholder="Headline for the page..."
                                    />
                                    <Field
                                        label="Hero Sub-heading"
                                        value={data.heroSubtitle ?? ''}
                                        onChange={(v) => set('heroSubtitle', v)}
                                        multiline
                                        placeholder="Supporting text displayed below the headline…"
                                    />
                                    {('formIntro' in effectiveDefaults || page.slug === 'partnership' || page.slug === 'partner-with-colleges') && (
                                        <Field
                                            label="Text Above Form / Introductory Note"
                                            value={data.formIntro ?? ''}
                                            onChange={(v) => set('formIntro', v)}
                                            multiline
                                            placeholder="Explanatory paragraph displayed directly above the form fields…"
                                        />
                                    )}
                                    {('heroBadge' in effectiveDefaults || page.slug === 'digital-transformation') && (
                                        <Field
                                            label="Hero Badge / Category"
                                            value={data.heroBadge ?? ''}
                                            onChange={(v) => set('heroBadge', v)}
                                            placeholder="Campus Innovation / Digital Transformation"
                                        />
                                    )}
                                    {page.slug === 'colleges-universities-for-sale' && (
                                        <Field
                                            label="Search Filter Label"
                                            value={data.filterLabel ?? ''}
                                            onChange={(v) => set('filterLabel', v)}
                                            placeholder="cbse schools"
                                        />
                                    )}

                                    {('heroImage' in effectiveDefaults || page.slug === 'catalogues') && (
                                        <MediaImageField
                                            label="Hero Image Backdrop"
                                            value={data.heroImage ?? ''}
                                            onChange={(v) => set('heroImage', v)}
                                            previewClassName="h-48 rounded-2xl"
                                        />
                                    )}

                                    {('heroButton1Label' in effectiveDefaults || 'heroButton1Label' in data || page.slug === 'furniture') ? (
                                        <div className="space-y-4 pt-2 border-t border-gray-100">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Field
                                                    label="Primary Hero Button Label"
                                                    value={data.heroButton1Label ?? data.heroButtonLabel ?? ''}
                                                    onChange={(v) => {
                                                        set('heroButton1Label', v);
                                                        set('heroButtonLabel', v);
                                                    }}
                                                    placeholder="View Collections"
                                                />
                                                <Field
                                                    label="Primary Hero Button Link"
                                                    value={data.heroButton1Href ?? data.heroButtonHref ?? ''}
                                                    onChange={(v) => {
                                                        set('heroButton1Href', v);
                                                        set('heroButtonHref', v);
                                                    }}
                                                    placeholder="/catalogues"
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Field
                                                    label="Secondary Hero Button Label"
                                                    value={data.heroButton2Label ?? ''}
                                                    onChange={(v) => set('heroButton2Label', v)}
                                                    placeholder="Get Quote"
                                                />
                                                <Field
                                                    label="Secondary Hero Button Link"
                                                    value={data.heroButton2Href ?? ''}
                                                    onChange={(v) => set('heroButton2Href', v)}
                                                    placeholder="/request-quote"
                                                />
                                            </div>
                                        </div>
                                    ) : ('heroButtonLabel' in effectiveDefaults || 'heroButtonHref' in effectiveDefaults || page.slug === 'catalogues') && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {('heroButtonLabel' in effectiveDefaults || page.slug === 'catalogues') && (
                                                <Field
                                                    label="Hero Button Label"
                                                    value={data.heroButtonLabel ?? ''}
                                                    onChange={(v) => set('heroButtonLabel', v)}
                                                    placeholder={page.slug === 'catalogues' ? 'Request Custom Catalogue' : 'Deploy Solutions'}
                                                />
                                            )}
                                            {('heroButtonHref' in effectiveDefaults || page.slug === 'catalogues') && (
                                                <Field
                                                    label="Hero Button Link"
                                                    value={data.heroButtonHref ?? ''}
                                                    onChange={(v) => set('heroButtonHref', v)}
                                                    placeholder="/request-quote"
                                                />
                                            )}
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}

                        {isContactUs && (
                            <>
                                <section className="space-y-6 rounded-2xl border-2 border-blue-500/20 bg-blue-50/30 p-6 sm:p-7 shadow-xs">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-blue-100 gap-2">
                                        <div>
                                            <h4 className="text-xs font-black text-blue-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
                                                Global Contact Channels (Live Synchronized)
                                            </h4>
                                            <p className="text-xs text-blue-700 mt-1 font-medium">
                                                ⚡ Synced across TopBar, Footer, and Contact Us page.
                                            </p>
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-3 py-1 rounded-full border border-blue-200 self-start sm:self-auto">
                                            Live Channels
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field
                                            label="Primary Phone Number *"
                                            value={data.contact_phone ?? ''}
                                            onChange={(v) => updateContactChannel('contact_phone', v)}
                                            placeholder="+91 9966109191"
                                            hint="Required · TopBar & Contact Us"
                                        />
                                        <Field
                                            label="Alternate Phone Number"
                                            value={data.contact_phone_alt ?? ''}
                                            onChange={(v) => updateContactChannel('contact_phone_alt', v)}
                                            placeholder="+91 9866091111"
                                            hint="Optional · Contact Us page"
                                        />
                                        <Field
                                            label="WhatsApp Business Number"
                                            value={data.contact_whatsapp ?? ''}
                                            onChange={(v) => set('contact_whatsapp', v)}
                                            placeholder="919966109191"
                                            hint="WhatsApp button & quick action"
                                        />
                                        <Field
                                            label="Primary Email Address"
                                            value={data.contact_email ?? ''}
                                            onChange={(v) => updateContactChannel('contact_email', v)}
                                            placeholder="info@campusmart.in"
                                            hint="TopBar & Contact Us"
                                        />
                                        <Field
                                            label="Secondary / Support Email"
                                            value={data.contact_email_alt ?? ''}
                                            onChange={(v) => updateContactChannel('contact_email_alt', v)}
                                            placeholder="support@campusmart.in"
                                            hint="Optional · Contact Us page"
                                        />
                                        <div className="md:col-span-2">
                                            <Field
                                                label="Working Hours"
                                                value={data.contact_hours ?? ''}
                                                onChange={(v) => updateContactChannel('contact_hours', v)}
                                                multiline
                                                placeholder="Monday - Friday: 9:00 AM - 6:00 PM&#10;Saturday: 10:00 AM - 4:00 PM"
                                                hint="Hours card on Contact Us"
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Field
                                                label="Office Address"
                                                value={data.contact_address ?? ''}
                                                onChange={(v) => set('contact_address', v)}
                                                multiline
                                                placeholder="Campus Mart Head Office&#10;Hyderabad, Telangana, India"
                                                hint="Global site address"
                                            />
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">WhatsApp CTA Banner</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field
                                            label="CTA Heading"
                                            value={data.whatsappCtaTitle ?? ''}
                                            onChange={(v) => set('whatsappCtaTitle', v)}
                                            placeholder="Chat with us on WhatsApp"
                                        />
                                        <Field
                                            label="CTA Button Label"
                                            value={data.whatsappCtaButton ?? ''}
                                            onChange={(v) => set('whatsappCtaButton', v)}
                                            placeholder="Start WhatsApp Chat"
                                        />
                                        <div className="md:col-span-2">
                                            <Field
                                                label="CTA Subtitle"
                                                value={data.whatsappCtaSubtitle ?? ''}
                                                onChange={(v) => set('whatsappCtaSubtitle', v)}
                                                multiline
                                                placeholder="Get direct support and immediate quotation guidance through WhatsApp with our team."
                                            />
                                        </div>
                                    </div>
                                </section>
                            </>
                        )}

                        {(page.slug === 'ai-guide' || page.slug === 'science-tech-labs') && (
                            <>
                                <section className="space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">
                                            {page.slug === 'science-tech-labs' ? 'Editorial Layout Content' : 'Journal Layout Content'}
                                        </h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field label="Section Eyebrow" value={data.sectionLabel ?? ''} onChange={(v) => set('sectionLabel', v)} />
                                        <Field label="Section Heading" value={data.sectionTitle ?? ''} onChange={(v) => set('sectionTitle', v)} />
                                        <Field label="Section Description" value={data.sectionDescription ?? ''} onChange={(v) => set('sectionDescription', v)} multiline />
                                        <Field label={page.slug === 'science-tech-labs' ? 'Latest Labs Heading' : 'Latest Articles Heading'} value={data.latestTitle ?? ''} onChange={(v) => set('latestTitle', v)} />
                                        <Field label="View All Label" value={data.viewAllLabel ?? ''} onChange={(v) => set('viewAllLabel', v)} />
                                        <Field label="Featured Link Label" value={data.readMoreLabel ?? ''} onChange={(v) => set('readMoreLabel', v)} />
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">
                                            {page.slug === 'science-tech-labs' ? 'Featured Laboratory Showcase' : 'Featured Article'}
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={() => set('hideFeatured', !data.hideFeatured)}
                                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                                data.hideFeatured
                                                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                            }`}
                                        >
                                            {data.hideFeatured ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            {data.hideFeatured ? 'Hidden / Draft' : 'Live on Page'}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {page.slug === 'ai-guide' && (
                                            <Field label="Category Label" value={data.featured?.category ?? ''} onChange={(v) => setFeatured('category', v)} />
                                        )}
                                        <Field label={page.slug === 'science-tech-labs' ? 'Laboratory Title' : 'Article Title'} value={data.featured?.title ?? ''} onChange={(v) => setFeatured('title', v)} />
                                        <Field label="Description" value={data.featured?.description ?? ''} onChange={(v) => setFeatured('description', v)} multiline />
                                        <MediaImageField label="Featured Image" value={data.featured?.image ?? ''} onChange={(v) => setFeatured('image', v)} previewClassName="h-32" />
                                        {page.slug === 'science-tech-labs' && (
                                            <>
                                                <Field label="Action Link Label" value={data.featured?.readMoreLabel ?? ''} onChange={(v) => setFeatured('readMoreLabel', v)} placeholder="Explore Lab Programme" />
                                                <Field label="Custom Action URL (Optional)" value={data.featured?.href ?? ''} onChange={(v) => setFeatured('href', v)} placeholder="/contact-us or leave blank for detail" />
                                            </>
                                        )}
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Filter Categories</h4>
                                        <button type="button" onClick={addFilter} className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-amber-700 transition-all shadow-md">
                                            <Plus className="w-4 h-4" /> Add Filter
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {(data.filters ?? []).map((filter: string, i: number) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <input className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm" value={filter} onChange={(e) => setFilter(i, e.target.value)} />
                                                <button type="button" onClick={() => removeFilter(i)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">
                                            {page.slug === 'science-tech-labs' ? 'Inquiry & Consultation Block' : 'Newsletter Block'}
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={() => set('hideNewsletter', !data.hideNewsletter)}
                                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                                data.hideNewsletter
                                                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                            }`}
                                        >
                                            {data.hideNewsletter ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            {data.hideNewsletter ? 'Hidden / Draft' : 'Live on Page'}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field label="Eyebrow" value={data.newsletterLabel ?? ''} onChange={(v) => set('newsletterLabel', v)} />
                                        <Field label="Heading" value={data.newsletterTitle ?? ''} onChange={(v) => set('newsletterTitle', v)} />
                                        <Field label="Description" value={data.newsletterDescription ?? ''} onChange={(v) => set('newsletterDescription', v)} multiline />
                                        <Field label="Email Placeholder" value={data.newsletterPlaceholder ?? ''} onChange={(v) => set('newsletterPlaceholder', v)} />
                                        <Field label="Button Label" value={data.newsletterButtonLabel ?? ''} onChange={(v) => set('newsletterButtonLabel', v)} />
                                    </div>
                                </section>
                            </>
                        )}

                        {page.slug === 'blog' && (
                            <BlogEditorSection data={data} set={set} />
                        )}

                        {page.slug === 'setup-college' && (
                            <>
                                <section className="space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Campus Guide Layout</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field label="Page Title" value={data.pageTitle ?? ''} onChange={(v) => set('pageTitle', v)} />
                                        <Field label="Latest Guides Heading" value={data.latestTitle ?? ''} onChange={(v) => set('latestTitle', v)} multiline />
                                        <Field label="Topics Heading" value={data.categoriesTitle ?? ''} onChange={(v) => set('categoriesTitle', v)} />
                                        <Field label="Topics Button Label" value={data.categoriesButtonLabel ?? ''} onChange={(v) => set('categoriesButtonLabel', v)} />
                                        <Field label="Article Filter Label" value={data.filterLabel ?? ''} onChange={(v) => set('filterLabel', v)} />
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Large Feature</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field label="Category" value={data.featured?.category ?? ''} onChange={(v) => setFeatured('category', v)} />
                                        <Field label="Title" value={data.featured?.title ?? ''} onChange={(v) => setFeatured('title', v)} />
                                        <Field label="Link" value={data.featured?.href ?? ''} onChange={(v) => setFeatured('href', v)} />
                                        <MediaImageField label="Image" value={data.featured?.image ?? ''} onChange={(v) => setFeatured('image', v)} previewClassName="h-32" />
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Green Guide Feature</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field label="Category" value={data.greenFeature?.category ?? ''} onChange={(v) => setGreenFeature('category', v)} />
                                        <Field label="Title" value={data.greenFeature?.title ?? ''} onChange={(v) => setGreenFeature('title', v)} />
                                        <Field label="Description" value={data.greenFeature?.description ?? ''} onChange={(v) => setGreenFeature('description', v)} multiline />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-bold text-gray-700">Topic Rows</label>
                                            <button type="button" onClick={addGreenTopic} className="text-xs font-bold text-blue-600 hover:text-blue-800">+ Add topic</button>
                                        </div>
                                        {(data.greenTopics ?? []).map((topic: string, i: number) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <input className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm" value={topic} onChange={(e) => setGreenTopic(i, e.target.value)} />
                                                <button type="button" onClick={() => removeGreenTopic(i)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Small Feature</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field label="Category" value={data.smallFeature?.category ?? ''} onChange={(v) => setSmallFeature('category', v)} />
                                        <Field label="Title" value={data.smallFeature?.title ?? ''} onChange={(v) => setSmallFeature('title', v)} />
                                        <Field label="Link" value={data.smallFeature?.href ?? ''} onChange={(v) => setSmallFeature('href', v)} />
                                        <MediaImageField label="Image" value={data.smallFeature?.image ?? ''} onChange={(v) => setSmallFeature('image', v)} previewClassName="h-32" />
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Topic Rail</h4>
                                        <button type="button" onClick={addCategory} className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-amber-700 transition-all shadow-md">
                                            <Plus className="w-4 h-4" /> Add Topic
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                        {(data.categories ?? []).map((category: string, i: number) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <input className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm" value={category} onChange={(e) => setCategory(i, e.target.value)} />
                                                <button type="button" onClick={() => removeCategory(i)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Planning CTA</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <Field label="CTA Heading" value={data.ctaTitle ?? ''} onChange={(v) => set('ctaTitle', v)} multiline />
                                        <Field label="Button Label" value={data.ctaButtonLabel ?? ''} onChange={(v) => set('ctaButtonLabel', v)} />
                                        <Field label="Button Link" value={data.ctaHref ?? ''} onChange={(v) => set('ctaHref', v)} />
                                    </div>
                                </section>
                            </>
                        )}

                        {(page.slug === 'ugc-guidelines' || page.slug === 'innovation') && (
                            <>
                                <section className="space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Journal Frame & Navigation</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field label="Brand Name" value={data.brandName ?? ''} onChange={(v) => set('brandName', v)} />
                                        <Field label="Page Title" value={data.pageTitle ?? ''} onChange={(v) => set('pageTitle', v)} />
                                        <Field label="Header Action Label" value={data.headerActionLabel ?? ''} onChange={(v) => set('headerActionLabel', v)} />
                                        <Field label="Header Action Link" value={data.headerActionHref ?? ''} onChange={(v) => set('headerActionHref', v)} />
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-bold text-gray-700">Navigation Links</label>
                                            <button type="button" onClick={() => addUgcArrayItem('navLinks', 'New link')} className="text-xs font-bold text-blue-600 hover:text-blue-800">+ Add link</button>
                                        </div>
                                        {(data.navLinks ?? []).map((link: string, i: number) => (
                                            <div key={i} className="flex items-center gap-3">
                                                <input className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm" value={link} onChange={(e) => setUgcArrayItem('navLinks', i, e.target.value)} />
                                                <button type="button" onClick={() => removeUgcArrayItem('navLinks', i)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Categories</h4>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-bold text-gray-700">Category Pills</label>
                                            <button type="button" onClick={() => addUgcArrayItem('categories', 'New category')} className="text-xs font-bold text-blue-600 hover:text-blue-800">+ Add category</button>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {(data.categories ?? []).map((category: string, i: number) => (
                                                <div key={i} className="flex items-center gap-2">
                                                    <input className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm" value={category} onChange={(e) => setUgcArrayItem('categories', i, e.target.value)} />
                                                    <button type="button" onClick={() => removeUgcArrayItem('categories', i)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Featured Guidance</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field label="Eyebrow" value={data.featured?.eyebrow ?? ''} onChange={(v) => setFeatured('eyebrow', v)} />
                                        <Field label="Title" value={data.featured?.title ?? ''} onChange={(v) => setFeatured('title', v)} />
                                        <Field label="Description" value={data.featured?.description ?? ''} onChange={(v) => setFeatured('description', v)} multiline />
                                        <Field label="Link" value={data.featured?.href ?? ''} onChange={(v) => setFeatured('href', v)} />
                                        <Field label="Read Link Label" value={data.featured?.readMoreLabel ?? ''} onChange={(v) => setFeatured('readMoreLabel', v)} />
                                        <MediaImageField label="Featured Image" value={data.featured?.image ?? ''} onChange={(v) => setFeatured('image', v)} previewClassName="h-32" />
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">More Resources</h4>
                                    </div>
                                    <Field label="Section Heading" value={data.moreTitle ?? ''} onChange={(v) => set('moreTitle', v)} />
                                    <div className="flex justify-end">
                                        <button type="button" onClick={addMoreCard} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-md">
                                            <Plus className="w-4 h-4" /> Add Resource
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {(data.moreCards ?? []).map((card: MoreCardItem, i: number) => (
                                            <div key={i} id={`more-card-item-${i}`} className="relative space-y-3 rounded-2xl border border-gray-200 bg-gray-50/30 p-4">
                                                <button type="button" onClick={() => removeMoreCard(i)} className="absolute right-3 top-3 text-red-400 hover:text-red-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <Field label="Category" value={card.category ?? ''} onChange={(v) => setMoreCard(i, 'category', v)} />
                                                <Field label="Title" value={card.title ?? ''} onChange={(v) => setMoreCard(i, 'title', v)} multiline />
                                                <Field label="Description" value={card.description ?? ''} onChange={(v) => setMoreCard(i, 'description', v)} multiline />
                                                <Field label="Link" value={card.href ?? ''} onChange={(v) => setMoreCard(i, 'href', v)} />
                                                <MediaImageField label="Card Image" value={card.image ?? ''} onChange={(v) => setMoreCard(i, 'image', v)} previewClassName="h-24" />
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Journal Footer</h4>
                                    </div>
                                    <Field label="Footer Description" value={data.footerDescription ?? ''} onChange={(v) => set('footerDescription', v)} multiline />
                                    <Field label="Copyright" value={data.copyright ?? ''} onChange={(v) => set('copyright', v)} />
                                    <div className="flex justify-end">
                                        <button type="button" onClick={addFooterColumn} className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-amber-700 transition-all shadow-md">
                                            <Plus className="w-4 h-4" /> Add Footer Column
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {(data.footerColumns ?? []).map((column: { title: string; links: string[] }, i: number) => (
                                            <div key={i} className="relative space-y-3 rounded-2xl border border-gray-200 bg-gray-50/30 p-4">
                                                <button type="button" onClick={() => removeFooterColumn(i)} className="absolute right-3 top-3 text-red-400 hover:text-red-600">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                                <Field label="Column Title" value={column.title ?? ''} onChange={(v) => setFooterColumn(i, 'title', v)} />
                                                <Field
                                                    label="Links (comma-separated)"
                                                    value={(column.links ?? []).join(', ')}
                                                    onChange={(v) => setFooterColumn(i, 'links', v.split(',').map((link) => link.trim()).filter(Boolean))}
                                                    multiline
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </>
                        )}

                        {page.slug === 'classifieds' && (
                            <>
                                <section className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Page Header Content</h4>
                                        <button
                                            type="button"
                                            onClick={() => set('hideHero', !data.hideHero)}
                                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                                data.hideHero
                                                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                            }`}
                                        >
                                            {data.hideHero ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            {data.hideHero ? 'Hidden / Draft' : 'Live on Page'}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <Field label="Header Eyebrow Badge" value={data.heroEyebrow ?? 'CampusMart Opportunities'} onChange={(v) => set('heroEyebrow', v)} />
                                        <Field label="Page Heading" value={data.heroTitle ?? ''} onChange={(v) => set('heroTitle', v)} />
                                        <Field label="Page Description" value={data.heroSubtitle ?? ''} onChange={(v) => set('heroSubtitle', v)} multiline />
                                        <Field label="Header Button Label" value={data.heroButtonLabel ?? 'Post a Classified'} onChange={(v) => set('heroButtonLabel', v)} />
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Opportunity Filter Categories</h4>
                                        <button
                                            type="button"
                                            onClick={() => addUgcArrayItem('categories', 'New Category')}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-md"
                                        >
                                            <Plus className="w-4 h-4" /> Add Category
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                                        {(data.categories ?? []).map((category: string, i: number) => (
                                            <div key={i} className="flex items-center gap-2">
                                                <input className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm" value={category} onChange={(e) => setUgcArrayItem('categories', i, e.target.value)} />
                                                <button type="button" onClick={() => removeUgcArrayItem('categories', i)} className="p-2 text-red-400 hover:bg-red-50">
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Featured Opportunity Banner</h4>
                                        <button
                                            type="button"
                                            onClick={() => set('hideFeatured', !data.hideFeatured)}
                                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                                data.hideFeatured
                                                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                            }`}
                                        >
                                            {data.hideFeatured ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            {data.hideFeatured ? 'Hidden / Draft' : 'Live on Page'}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <Field label="Eyebrow" value={data.featured?.eyebrow ?? ''} onChange={(v) => setFeatured('eyebrow', v)} />
                                        <Field label="Title" value={data.featured?.title ?? ''} onChange={(v) => setFeatured('title', v)} />
                                        <Field label="Description" value={data.featured?.description ?? ''} onChange={(v) => setFeatured('description', v)} multiline />
                                        <MediaImageField label="Featured Image" value={data.featured?.image ?? ''} onChange={(v) => setFeatured('image', v)} previewClassName="h-32" />
                                        <Field label="Explore Link Label" value={data.featured?.exploreLabel ?? ''} onChange={(v) => setFeatured('exploreLabel', v)} placeholder="Explore all opportunities" />
                                        <Field label="Post Button Label" value={data.featured?.postButtonLabel ?? ''} onChange={(v) => setFeatured('postButtonLabel', v)} placeholder="Post Opportunity" />
                                    </div>
                                </section>
                            </>
                        )}

                        {page.slug === 'job-openings' && (
                            <JobOpeningsEditorSection
                                data={data}
                                set={set}
                                onSyncOpenings={async (nextOpenings) => {
                                    const nextData = { ...data, openings: nextOpenings };
                                    setData(nextData);
                                    try {
                                        const { data: updated } = await api.put(`/pages/${page.id}`, {
                                            title,
                                            published,
                                            pageData: JSON.stringify(nextData),
                                        });
                                        clearPageDataCache(page.slug);
                                        clearPageDataCache();
                                        broadcastCmsInvalidation({ type: 'INVALIDATE_PAGE', slug: page.slug });
                                        broadcastCmsInvalidation({ type: 'INVALIDATE_ALL' });
                                        setSaved(true);
                                        setTimeout(() => setSaved(false), 2000);
                                        if (onSaved) onSaved(updated);
                                    } catch (err: any) {
                                        console.error('Failed to sync job openings:', err);
                                        const msg = err?.response?.data?.error || 'Failed to save job openings.';
                                        setSaveError(msg);
                                    }
                                }}
                            />
                        )}

                        {page.slug === 'faq' && (
                            <FaqEditorSection
                                data={data}
                                set={set}
                            />
                        )}

                        {isArticlePage && (
                            <ArticleEditorSection
                                slug={page.slug}
                                data={data}
                                set={set}
                            />
                        )}

                        {/* NDA & Mandate documents (colleges-universities-for-sale only) */}
                        {page.slug === 'colleges-universities-for-sale' && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Business Documents</h4>
                                </div>
                                <p className="text-xs text-gray-500">
                                    Shown at the top of the page. Registered users can download these directly; visitors who aren't logged in are prompted to register.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <DocumentUploadField label="NDA (Non-Disclosure Agreement)" value={data.ndaUrl ?? ''} onChange={(v) => set('ndaUrl', v)} />
                                    <DocumentUploadField label="Mandate" value={data.mandateUrl ?? ''} onChange={(v) => set('mandateUrl', v)} />
                                </div>
                            </section>
                        )}

                        {/* Optional Custom Labels block */}
                        {('section1Title' in effectiveDefaults || 'section2Title' in effectiveDefaults) && page.slug !== 'digital-transformation' && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Custom Section Labels</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {('section1Title' in effectiveDefaults) && (
                                        <Field label="Content Section Title" value={data.section1Title ?? ''} onChange={(v) => set('section1Title', v)} placeholder="e.g. Solutions" />
                                    )}
                                    {('section2Title' in effectiveDefaults) && (
                                        <Field label="Features Section Title" value={data.section2Title ?? ''} onChange={(v) => set('section2Title', v)} placeholder="e.g. Benefits" />
                                    )}
                                </div>
                            </section>
                        )}

                        {/* Digital Transformation Dedicated Sections (Ordered 1:1 with Live Page) */}
                        {page.slug === 'digital-transformation' && (
                            <>
                                {/* Section 1 on Live Page: Why Go Digital */}
                                <section className="space-y-6">
                                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                        <div>
                                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">
                                                Why Go Digital Section (The Impact)
                                            </h4>
                                            <p className="text-xs text-gray-400 mt-0.5">Section 1 on live page</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => set('hideSection2', !data.hideSection2)}
                                                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                                    data.hideSection2
                                                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                                }`}
                                            >
                                                {data.hideSection2 ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                {data.hideSection2 ? 'Hidden / Draft' : 'Live on Page'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={addSection2Card}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-md"
                                            >
                                                <Plus className="w-4 h-4" /> New Impact Card
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field
                                            label="Section Eyebrow Tag"
                                            value={data.section2Eyebrow ?? ''}
                                            onChange={(v) => set('section2Eyebrow', v)}
                                            placeholder="The Impact"
                                        />
                                        <Field
                                            label="Section Title"
                                            value={data.section2Title ?? ''}
                                            onChange={(v) => set('section2Title', v)}
                                            placeholder="Why Go Digital"
                                        />
                                        <div className="md:col-span-2">
                                            <Field
                                                label="Supporting Description"
                                                value={data.section2Description ?? ''}
                                                onChange={(v) => set('section2Description', v)}
                                                placeholder="Most institutions we work with see measurable results..."
                                                multiline
                                            />
                                        </div>
                                    </div>

                                    {/* Impact Cards Grid */}
                                    <div className="space-y-4">
                                        <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                                            Impact Cards ({(data.section2Cards ?? []).length})
                                        </h5>
                                        <div className="grid grid-cols-1 gap-6">
                                            {(data.section2Cards ?? []).map((card: any, i: number) => (
                                                <div key={i} id={`section2-card-item-${i}`} className="border border-gray-200 rounded-2xl p-6 bg-gray-50/30 hover:bg-white hover:shadow-lg hover:border-blue-200 transition-all group relative">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <div className="flex items-center gap-3">
                                                            <span className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">{i + 1}</span>
                                                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{card.title || 'Untitled Card'}</span>
                                                        </div>
                                                        <button type="button" onClick={() => removeSection2Card(i)} className="flex items-center gap-1.5 text-red-400 hover:text-red-600 text-[10px] font-black uppercase tracking-wider">
                                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                                        </button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <Field label="Card Title" value={card.title ?? ''} onChange={(v) => setSection2Card(i, 'title', v)} />
                                                        <Field label="Card Link (Optional)" value={card.href ?? ''} onChange={(v) => setSection2Card(i, 'href', v)} placeholder="/digital-transformation/..." />
                                                        <div className="md:col-span-2">
                                                            <Field label="Card Description" value={card.description ?? ''} onChange={(v) => setSection2Card(i, 'description', v)} multiline />
                                                        </div>
                                                        <div className="md:col-span-2">
                                                            <MediaImageField label="Image" value={card.image ?? ''} onChange={(v) => setSection2Card(i, 'image', v)} previewClassName="h-24" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                {/* Section 2 on Live Page: Our Expertise / Digital Services */}
                                <section className="space-y-6">
                                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                        <div>
                                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">
                                                Our Expertise / Services Section
                                            </h4>
                                            <p className="text-xs text-gray-400 mt-0.5">Section 2 on live page</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => set('hideCards', !data.hideCards)}
                                                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                                    data.hideCards
                                                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                                }`}
                                            >
                                                {data.hideCards ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                {data.hideCards ? 'Hidden / Draft' : 'Live on Page'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={addCard}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-md"
                                            >
                                                <Plus className="w-4 h-4" /> New Expertise Card
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field
                                            label="Section Eyebrow Tag"
                                            value={data.section1Eyebrow ?? ''}
                                            onChange={(v) => set('section1Eyebrow', v)}
                                            placeholder="Our Expertise"
                                        />
                                        <Field
                                            label="Section Title"
                                            value={data.section1Title ?? ''}
                                            onChange={(v) => set('section1Title', v)}
                                            placeholder="Digital Services"
                                        />
                                    </div>

                                    {/* Expertise Cards Grid */}
                                    <div className="space-y-4">
                                        <h5 className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                                            Numbered Service Cards ({(data.cards ?? []).length})
                                        </h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {(data.cards ?? []).map((card: CardItem, i: number) => (
                                                <div key={i} id={`card-item-${i}`} className="border border-gray-200 rounded-2xl p-6 bg-gray-50/30 hover:bg-white hover:shadow-lg hover:border-blue-200 transition-all group relative">
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">{String(i + 1).padStart(2, '0')}</span>
                                                            <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{card.title || 'Untitled Card'}</span>
                                                        </div>
                                                        <button type="button" onClick={() => removeCard(i)} className="flex items-center gap-1.5 text-red-400 hover:text-red-600 text-[10px] font-black uppercase tracking-wider">
                                                            <Trash2 className="w-3.5 h-3.5" /> Delete
                                                        </button>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <Field label="Service Title" value={card.title ?? ''} onChange={(v) => setCard(i, 'title', v)} />
                                                        <Field label="Service Description" value={card.description ?? ''} onChange={(v) => setCard(i, 'description', v)} multiline />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>

                                {/* Section 3 on Live Page: How We Work / Process Steps */}
                                <section className="space-y-6">
                                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                        <div>
                                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">
                                                How We Work / Process Steps Section
                                            </h4>
                                            <p className="text-xs text-gray-400 mt-0.5">Section 3 on live page</p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => set('hideSections', !data.hideSections)}
                                                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                                    data.hideSections
                                                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                                }`}
                                            >
                                                {data.hideSections ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                {data.hideSections ? 'Hidden / Draft' : 'Live on Page'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={addSection}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-md"
                                            >
                                                <Plus className="w-4 h-4" /> New Step
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field
                                            label="Section Eyebrow Tag"
                                            value={data.processEyebrow ?? ''}
                                            onChange={(v) => set('processEyebrow', v)}
                                            placeholder="How We Work"
                                        />
                                        <Field
                                            label="Section Title"
                                            value={data.processTitle ?? ''}
                                            onChange={(v) => set('processTitle', v)}
                                            placeholder="From Assessment to Adoption"
                                        />
                                    </div>

                                    {/* Process Steps */}
                                    <div className="space-y-6">
                                        {(data.sections ?? []).map((section: SectionItem, i: number) => (
                                            <div key={i} id={`section-item-${i}`} className="border border-gray-200 rounded-2xl p-6 bg-gray-50/30 relative">
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">{String(i + 1).padStart(2, '0')}</span>
                                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{section.heading || 'Untitled Step'}</span>
                                                    </div>
                                                    <button type="button" onClick={() => removeSection(i)} className="flex items-center gap-1.5 text-red-400 hover:text-red-600 text-[10px] font-black uppercase tracking-wider">
                                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <Field label="Step Heading" value={section.heading ?? ''} onChange={(v) => setSection(i, 'heading', v)} placeholder="e.g. Assess" />
                                                    <Field label="Step Description" value={section.body ?? ''} onChange={(v) => setSection(i, 'body', v)} multiline placeholder="Review current systems..." />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </>
                        )}

                        {/* Catalogues unified info banner */}
                        {page.slug === 'catalogues' && (
                            <section className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-emerald-900">Downloadable Catalogues &amp; Case Studies</h4>
                                        <p className="text-xs text-emerald-700 mt-1 max-w-2xl">
                                            Manage your brochure cards and case studies directly in this page editor. Use the <strong>Upload PDF</strong> button on each card to save documents natively to server disk for 1-click visitor downloads.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-100 text-emerald-800 px-3 py-1.5 text-xs font-bold border border-emerald-200">
                                            ⚡ Live Database Driven
                                        </span>
                                    </div>
                                </div>
                            </section>
                        )}

                        {('cards' in effectiveDefaults || page.slug === 'colleges-universities-for-sale' || page.slug === 'catalogues') && page.slug !== 'digital-transformation' && (() => {
                            const cardsUseCategories = ((effectiveDefaults.cards ?? []).some((c: any) => Array.isArray(c?.categories)) || page.slug === 'sports-infra' || page.slug === 'tech-infra' || page.slug === 'libraries' || page.slug === 'labs') && page.slug !== 'science-tech-labs' && page.slug !== 'ai-guide';
                            const explicitCats: string[] = Array.isArray(data.categories) ? data.categories.filter(Boolean) : [];
                            const cardCats: string[] = (data.cards ?? []).flatMap((c: any) =>
                                Array.isArray(c?.categories) ? c.categories : c?.category ? [c.category] : []
                            ).filter(Boolean);
                            const allAvailableCategories = Array.from(new Set<string>([...explicitCats, ...cardCats]));
                            const cardsUseHref = (effectiveDefaults.cards ?? []).some((c: any) => 'href' in (c || {}));
                            const cardsUseDownloadLink = (effectiveDefaults.cards ?? []).some((c: any) => 'downloadLink' in (c || {})) || page.slug === 'catalogues';
                            const cardsUseSize = (effectiveDefaults.cards ?? []).some((c: any) => 'size' in (c || {})) || page.slug === 'catalogues';
                            return (
                                <section className="space-y-6">
                                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">
                                            Interactive Cards <span className="text-blue-500 ml-2">({(data.cards ?? []).length})</span>
                                        </h4>
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                onClick={() => set('hideCards', !data.hideCards)}
                                                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                                    data.hideCards
                                                        ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                                }`}
                                            >
                                                {data.hideCards ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                {data.hideCards ? 'Hidden / Draft' : 'Live on Page'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={addCard}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-md"
                                            >
                                                <Plus className="w-4 h-4" /> New Card
                                            </button>
                                        </div>
                                    </div>

                                    {cardsUseCategories && (
                                        <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-5 space-y-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-black uppercase tracking-wider text-blue-900">
                                                        Side Menu Categories ({allAvailableCategories.length})
                                                    </span>
                                                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full border border-blue-200">
                                                        Live Navigation Sidebar
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-blue-700 font-medium">
                                                    Categories in this list appear in the side menu on the live page and as 1-click filters
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2 items-center">
                                                {allAvailableCategories.length === 0 ? (
                                                    <p className="text-xs text-slate-500 italic">
                                                        No categories created yet. Type a category name below and click &ldquo;Add Category&rdquo; to create one.
                                                    </p>
                                                ) : (
                                                    allAvailableCategories.map((cat: string) => {
                                                        const count = (data.cards ?? []).filter((c: any) =>
                                                            (Array.isArray(c?.categories) && c.categories.includes(cat)) || c?.category === cat
                                                        ).length;
                                                        return (
                                                            <span
                                                                key={cat}
                                                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-blue-200 text-blue-900 text-xs font-bold shadow-xs group"
                                                            >
                                                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                                                {cat}
                                                                <span className="text-[10px] text-blue-600 font-semibold">
                                                                    ({count} {count === 1 ? 'card' : 'cards'})
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => handleRemoveGlobalCategory(cat)}
                                                                    className="w-4 h-4 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors ml-1"
                                                                    title={`Delete ${cat} from side menu and cards`}
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </span>
                                                        );
                                                    })
                                                )}
                                            </div>

                                            {/* Global Add Category Bar */}
                                            <div className="flex gap-2 items-center pt-2 border-t border-blue-200/60">
                                                <input
                                                    type="text"
                                                    value={newGlobalCategoryInput}
                                                    onChange={(e) => setNewGlobalCategoryInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            if (newGlobalCategoryInput.trim()) {
                                                                handleAddGlobalCategory(newGlobalCategoryInput.trim());
                                                                setNewGlobalCategoryInput('');
                                                            }
                                                        }
                                                    }}
                                                    placeholder="Create new side menu category (e.g. Aquatics, Fitness, E-Sports)..."
                                                    className="flex-1 max-w-md border border-blue-200 rounded-xl px-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 bg-white"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (newGlobalCategoryInput.trim()) {
                                                            handleAddGlobalCategory(newGlobalCategoryInput.trim());
                                                            setNewGlobalCategoryInput('');
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 shrink-0"
                                                >
                                                    <Plus className="w-4 h-4" /> Add Category
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 gap-6">
                                        {(data.cards ?? []).map((card: any, i: number) => (
                                            <div key={i} id={`card-item-${i}`} className="border border-gray-200 rounded-2xl p-6 bg-gray-50/30 hover:bg-white hover:shadow-lg hover:border-blue-200 transition-all group relative">
                                                <div className="flex items-center justify-between mb-6">
                                                    <div className="flex items-center gap-3">
                                                        <span className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">{i + 1}</span>
                                                        <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{card.title || 'Untitled Card'}</span>
                                                    </div>
                                                    <button type="button" onClick={() => removeCard(i)} className="flex items-center gap-1.5 text-red-400 hover:text-red-600 text-[10px] font-black uppercase tracking-wider">
                                                        <Trash2 className="w-3.5 h-3.5" /> Delete
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <Field label="Card Title" value={card.title ?? ''} onChange={(v) => setCard(i, 'title', v)} />
                                                    <Field label="Card Description" value={card.description ?? ''} onChange={(v) => setCard(i, 'description', v)} multiline />
                                                    {(page.slug === 'ai-guide' || page.slug === 'setup-college' || page.slug === 'ugc-guidelines' || page.slug === 'innovation' || page.slug === 'science-tech-labs' || page.slug === 'classifieds') && (
                                                        <>
                                                            <Field label={page.slug === 'science-tech-labs' ? 'Lab Category (for Filter)' : page.slug === 'classifieds' ? 'Opportunity Category' : 'Article Category'} value={card.category ?? card.categories?.[0] ?? ''} onChange={(v) => { setCard(i, 'category', v); setCard(i, 'categories', [v]); }} placeholder={page.slug === 'science-tech-labs' ? 'Physics' : page.slug === 'classifieds' ? 'Institutions' : 'Ideation'} />
                                                            {page.slug !== 'classifieds' && (
                                                                <Field label={page.slug === 'science-tech-labs' ? 'Badge / Specs Label' : 'Read Time'} value={card.readTime ?? (page.slug === 'science-tech-labs' ? 'Full Specs Available' : '5 min read')} onChange={(v) => setCard(i, 'readTime', v)} placeholder={page.slug === 'science-tech-labs' ? 'Full Specs Available' : '5 min read'} />
                                                            )}
                                                            {(page.slug === 'ugc-guidelines' || page.slug === 'innovation') && (
                                                                <>
                                                                    <Field label="Author" value={card.author ?? 'CampusMart Team'} onChange={(v) => setCard(i, 'author', v)} placeholder="CampusMart Team" />
                                                                    <MediaImageField label="Author Avatar Image (Optional)" value={card.authorImage ?? ''} onChange={(v) => setCard(i, 'authorImage', v)} previewClassName="h-16 w-16 rounded-full" />
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                    <MediaImageField label="Image (Optional)" value={card.image ?? ''} onChange={(v) => setCard(i, 'image', v)} previewClassName="h-24" />
                                                    {page.slug === 'colleges-universities-for-sale' && (
                                                        <>
                                                            <Field label="Location" value={card.location ?? ''} onChange={(v) => setCard(i, 'location', v)} placeholder="Bahraich" />
                                                            <div className="space-y-1.5">
                                                                <label className="block text-sm font-bold text-gray-700">Region</label>
                                                                <select
                                                                    className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-base font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all shadow-xs bg-white text-slate-800"
                                                                    value={card.region ?? ''}
                                                                    onChange={(e) => setCard(i, 'region', e.target.value || undefined)}
                                                                >
                                                                    <option value="">-- Select Region --</option>
                                                                    <option value="North">North</option>
                                                                    <option value="South">South</option>
                                                                    <option value="East">East</option>
                                                                    <option value="West">West</option>
                                                                </select>
                                                            </div>
                                                            <Field label="Rating" value={card.rating ?? ''} onChange={(v) => setCard(i, 'rating', v)} placeholder="6.8" />
                                                            <Field label="Run Rate Sales" value={card.sales ?? ''} onChange={(v) => setCard(i, 'sales', v)} placeholder="INR 2.6 crore" />
                                                            <Field label="EBITDA Margin" value={card.margin ?? ''} onChange={(v) => setCard(i, 'margin', v)} placeholder="40 %" />
                                                            <Field label="Asking Price" value={card.askingPrice ?? ''} onChange={(v) => setCard(i, 'askingPrice', v)} placeholder="INR 20 Cr" />
                                                        </>
                                                    )}
                                                    {cardsUseCategories && (
                                                        <CardCategoriesField
                                                            categories={card.categories ?? []}
                                                            availableCategories={allAvailableCategories}
                                                            onChange={(newCats) => setCard(i, 'categories', newCats)}
                                                            onAddGlobalCategory={handleAddGlobalCategory}
                                                        />
                                                    )}
                                                    {page.slug !== 'catalogues' && ('href' in card || cardsUseHref || page.slug === 'classifieds' || page.slug === 'ai-ml' || page.slug === 'campus-design-execution' || page.slug === 'campus-design' || page.slug === 'campus-furniture-design' || page.slug === 'sports-design-execution' || page.slug === 'ai-digital-design-supply' || page.slug === 'ar-vr-experiences' || page.slug === 'sports-infra' || page.slug === 'tech-infra' || page.slug === 'libraries' || page.slug === 'labs' || page.slug === 'collaboration' || page.slug === 'innovation' || page.slug === 'campus-automation' || page.slug === 'campus-master-planning' || page.slug === 'science-tech-labs' || page.slug === 'smart-classrooms') && (
                                                        <Field label="Card Link" value={card.href ?? ''} onChange={(v) => setCard(i, 'href', v)} />
                                                    )}
                                                    {('downloadLink' in card || cardsUseDownloadLink) && (
                                                        <DocumentUploadField
                                                            label="Download PDF Document"
                                                            value={card.downloadLink ?? ''}
                                                            onChange={(v) => setCard(i, 'downloadLink', v)}
                                                        />
                                                    )}
                                                    {('size' in card || cardsUseSize) && (
                                                        <Field label="File Size (e.g. 10 MB)" value={card.size ?? ''} onChange={(v) => setCard(i, 'size', v)} />
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            );
                        })()}

                        {/* Optional second cards block */}
                        {('section2Cards' in effectiveDefaults) && page.slug !== 'digital-transformation' && (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">
                                        Additional Cards <span className="text-blue-500 ml-2">({(data.section2Cards ?? []).length})</span>
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={addSection2Card}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-md"
                                    >
                                        <Plus className="w-4 h-4" /> New Card
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    {(data.section2Cards ?? []).map((card: any, i: number) => (
                                        <div key={i} id={`section2-card-item-${i}`} className="border border-gray-200 rounded-2xl p-6 bg-gray-50/30 hover:bg-white hover:shadow-lg hover:border-blue-200 transition-all group relative">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">{i + 1}</span>
                                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{card.title || 'Untitled Card'}</span>
                                                </div>
                                                <button type="button" onClick={() => removeSection2Card(i)} className="flex items-center gap-1.5 text-red-400 hover:text-red-600 text-[10px] font-black uppercase tracking-wider">
                                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Field label="Card Title" value={card.title ?? ''} onChange={(v) => setSection2Card(i, 'title', v)} />
                                                <Field label="Card Description" value={card.description ?? ''} onChange={(v) => setSection2Card(i, 'description', v)} multiline />
                                                <MediaImageField label="Image (Optional)" value={card.image ?? ''} onChange={(v) => setSection2Card(i, 'image', v)} previewClassName="h-24" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Optional policy/content sections block */}
                        {('sections' in effectiveDefaults) && page.slug !== 'digital-transformation' && !isArticlePage && (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">
                                        Content Sections <span className="text-blue-500 ml-2">({(data.sections ?? []).length})</span>
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={addSection}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-md"
                                    >
                                        <Plus className="w-4 h-4" /> New Section
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    {(data.sections ?? []).map((section: SectionItem, i: number) => (
                                        <div key={i} id={`section-item-${i}`} className="border border-gray-200 rounded-2xl p-6 bg-gray-50/30 relative">
                                            <button type="button" onClick={() => removeSection(i)} className="absolute top-5 right-5 flex items-center gap-1.5 text-red-400 hover:text-red-600 text-[10px] font-black uppercase tracking-wider">
                                                <Trash2 className="w-3.5 h-3.5" /> Delete
                                            </button>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-20">
                                                <Field label="Section Heading" value={section.heading ?? ''} onChange={(v) => setSection(i, 'heading', v)} />
                                                <Field label="Section Text" value={section.body ?? ''} onChange={(v) => setSection(i, 'body', v)} multiline />
                                            </div>
                                            <div className="mt-6 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="block text-sm font-bold text-gray-700">Bullet Points</label>
                                                    <button type="button" onClick={() => setSection(i, 'bullets', [...(section.bullets ?? []), 'New bullet'])} className="text-xs font-bold text-blue-600 hover:text-blue-800">
                                                        + Add bullet
                                                    </button>
                                                </div>
                                                {(section.bullets ?? []).map((bullet, bulletIndex) => (
                                                    <div key={bulletIndex} className="flex items-center gap-3">
                                                        <input
                                                            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm"
                                                            value={bullet}
                                                            onChange={(e) => {
                                                                const bullets = [...(section.bullets ?? [])];
                                                                bullets[bulletIndex] = e.target.value;
                                                                setSection(i, 'bullets', bullets);
                                                            }}
                                                        />
                                                        <button type="button" onClick={() => setSection(i, 'bullets', (section.bullets ?? []).filter((_, index) => index !== bulletIndex))} className="p-2 text-red-400 hover:bg-red-50 rounded-lg">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {('section2Description' in effectiveDefaults) && page.slug !== 'digital-transformation' && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Section Supporting Text</h4>
                                </div>
                                <Field label="Features Section Description" value={data.section2Description ?? ''} onChange={(v) => set('section2Description', v)} multiline />
                            </section>
                        )}

                        {/* Optional Features block */}
                        {('features' in effectiveDefaults) && (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">
                                        Key Feature Bullets <span className="text-emerald-500 ml-2">({(data.features ?? []).length})</span>
                                    </h4>
                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => set('hideFeatures', !data.hideFeatures)}
                                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                                data.hideFeatures
                                                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                            }`}
                                        >
                                            {data.hideFeatures ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            {data.hideFeatures ? 'Hidden / Draft' : 'Live on Page'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={addFeature}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-emerald-700 transition-all shadow-md"
                                        >
                                            <Plus className="w-4 h-4" /> Add Bullet
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {(data.features ?? []).map((f: string, i: number) => (
                                        <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:border-emerald-200 transition-all">
                                            <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs flex-shrink-0">✓</div>
                                            <input
                                                className="flex-1 border-none focus:ring-0 text-sm font-medium text-slate-700 placeholder:text-slate-300"
                                                value={f}
                                                onChange={(e) => setFeature(i, e.target.value)}
                                                placeholder="Feature description..."
                                            />
                                            <button type="button" onClick={() => removeFeature(i)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {('philosophyTitle' in effectiveDefaults || page.slug === 'libraries' || page.slug === 'labs') && (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">
                                        {page.slug === 'labs' ? 'Lab Evolution & Services Section' : 'Philosophy / Highlight Section'}
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => set('hidePhilosophy', !data.hidePhilosophy)}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                            data.hidePhilosophy
                                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                        }`}
                                    >
                                        {data.hidePhilosophy ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        {data.hidePhilosophy ? 'Hidden / Draft' : 'Live on Page'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Field
                                        label="Section Heading"
                                        value={data.philosophyTitle ?? ''}
                                        onChange={(v) => set('philosophyTitle', v)}
                                        placeholder={page.slug === 'labs' ? 'Static Lab to Innovation Centre.' : 'Beyond Books. Knowledge Networks.'}
                                    />
                                    <Field
                                        label="Section Description"
                                        value={data.philosophyDescription ?? ''}
                                        onChange={(v) => set('philosophyDescription', v)}
                                        multiline
                                    />
                                    {page.slug === 'labs' ? (
                                        <>
                                            <Field
                                                label="Service Link Label"
                                                value={data.philosophyLinkLabel ?? ''}
                                                onChange={(v) => set('philosophyLinkLabel', v)}
                                                placeholder="Full Service List"
                                            />
                                            <Field
                                                label="Service Link URL"
                                                value={data.philosophyLinkHref ?? ''}
                                                onChange={(v) => set('philosophyLinkHref', v)}
                                                placeholder="/contact-us"
                                            />
                                            <div className="md:col-span-2 space-y-3 pt-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="block text-sm font-bold text-gray-700">
                                                        Highlight Bullet Points ({(data.philosophyBullets ?? []).length})
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            set('philosophyBullets', [
                                                                ...(data.philosophyBullets ?? []),
                                                                'New highlight bullet',
                                                            ])
                                                        }
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-xs"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" /> Add Bullet
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {(data.philosophyBullets ?? []).map((bullet: string, bIdx: number) => (
                                                        <div
                                                            key={bIdx}
                                                            className="flex items-center gap-2 bg-gray-50/70 p-2.5 rounded-xl border border-gray-200"
                                                        >
                                                            <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                                                                ✓
                                                            </span>
                                                            <input
                                                                type="text"
                                                                value={bullet}
                                                                onChange={(e) => {
                                                                    const next = [...(data.philosophyBullets ?? [])];
                                                                    next[bIdx] = e.target.value;
                                                                    set('philosophyBullets', next);
                                                                }}
                                                                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium"
                                                            />
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    set(
                                                                        'philosophyBullets',
                                                                        (data.philosophyBullets ?? []).filter((_: string, idx: number) => idx !== bIdx)
                                                                    )
                                                                }
                                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="md:col-span-2 space-y-3 pt-2">
                                                <div className="flex items-center justify-between">
                                                    <label className="block text-sm font-bold text-gray-700">
                                                        Service Grid Cards ({(data.philosophyServices ?? []).length})
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            set('philosophyServices', [
                                                                ...(data.philosophyServices ?? []),
                                                                { title: 'New Service', desc: 'Service description' },
                                                            ])
                                                        }
                                                        className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-xs"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" /> Add Service Card
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {(data.philosophyServices ?? []).map((srv: any, sIdx: number) => (
                                                        <div
                                                            key={sIdx}
                                                            className="border border-gray-200 rounded-2xl p-4 bg-gray-50/40 space-y-3 relative"
                                                        >
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                                                                    Service Box #{sIdx + 1}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        set(
                                                                            'philosophyServices',
                                                                            (data.philosophyServices ?? []).filter((_: any, idx: number) => idx !== sIdx)
                                                                        )
                                                                    }
                                                                    className="text-red-400 hover:text-red-600 text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                                                                >
                                                                    <Trash2 className="w-3.5 h-3.5" /> Delete
                                                                </button>
                                                            </div>
                                                            <Field
                                                                label="Service Title"
                                                                value={srv.title ?? ''}
                                                                onChange={(v) => {
                                                                    const next = [...(data.philosophyServices ?? [])];
                                                                    next[sIdx] = { ...next[sIdx], title: v };
                                                                    set('philosophyServices', next);
                                                                }}
                                                            />
                                                            <Field
                                                                label="Service Subtitle"
                                                                value={srv.desc ?? ''}
                                                                onChange={(v) => {
                                                                    const next = [...(data.philosophyServices ?? [])];
                                                                    next[sIdx] = { ...next[sIdx], desc: v };
                                                                    set('philosophyServices', next);
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <Field
                                                label="Stat 1 Value"
                                                value={data.philosophyStat1Value ?? ''}
                                                onChange={(v) => set('philosophyStat1Value', v)}
                                                placeholder="98%"
                                            />
                                            <Field
                                                label="Stat 1 Label"
                                                value={data.philosophyStat1Label ?? ''}
                                                onChange={(v) => set('philosophyStat1Label', v)}
                                                placeholder="User Satisfaction"
                                            />
                                            <Field
                                                label="Stat 2 Value"
                                                value={data.philosophyStat2Value ?? ''}
                                                onChange={(v) => set('philosophyStat2Value', v)}
                                                placeholder="Turnkey"
                                            />
                                            <Field
                                                label="Stat 2 Label"
                                                value={data.philosophyStat2Label ?? ''}
                                                onChange={(v) => set('philosophyStat2Label', v)}
                                                placeholder="Implementation"
                                            />
                                            <div className="md:col-span-2">
                                                <MediaImageField
                                                    label="Highlight Image"
                                                    value={data.philosophyImage ?? ''}
                                                    onChange={(v) => set('philosophyImage', v)}
                                                    previewClassName="h-32"
                                                />
                                            </div>
                                        </>
                                    )}
                                </div>
                            </section>
                        )}

                        {('quoteText' in effectiveDefaults || 'quoteText' in data || page.slug === 'furniture') && (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">
                                        Design Philosophy / Quote Section
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => set('hideQuote', !data.hideQuote)}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                            data.hideQuote
                                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                        }`}
                                    >
                                        {data.hideQuote ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        {data.hideQuote ? 'Hidden / Draft' : 'Live on Page'}
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    <Field
                                        label="Quote / Philosophy Text"
                                        value={data.quoteText ?? ''}
                                        onChange={(v) => set('quoteText', v)}
                                        multiline
                                        placeholder="Infrastructure isn't just about buildings..."
                                    />
                                    <Field
                                        label="Quote Attribution / Label"
                                        value={data.quoteLabel ?? ''}
                                        onChange={(v) => set('quoteLabel', v)}
                                        placeholder="Campus Mart Design Philosophy"
                                    />
                                </div>
                            </section>
                        )}

                        {('highlightTitle' in effectiveDefaults || page.slug === 'smart-classrooms') && (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">
                                        Highlight Band Section
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => set('hideHighlight', !data.hideHighlight)}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                            data.hideHighlight
                                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                        }`}
                                    >
                                        {data.hideHighlight ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        {data.hideHighlight ? 'Hidden / Draft' : 'Live on Page'}
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field
                                            label="Badge / Eyebrow"
                                            value={data.highlightEyebrow ?? ''}
                                            onChange={(v) => set('highlightEyebrow', v)}
                                            placeholder="Built for every classroom"
                                        />
                                        <Field
                                            label="Highlight Heading"
                                            value={data.highlightTitle ?? ''}
                                            onChange={(v) => set('highlightTitle', v)}
                                            placeholder="Technology that fades into the background, so teaching stays in front"
                                        />
                                    </div>
                                    <MediaImageField
                                        label="Highlight Image Backdrop"
                                        value={data.highlightImage ?? ''}
                                        onChange={(v) => set('highlightImage', v)}
                                        previewClassName="h-32"
                                    />
                                    <div className="space-y-3 pt-2">
                                        <div className="flex items-center justify-between">
                                            <label className="block text-sm font-bold text-gray-700">
                                                Key Bullet Points ({(data.highlightBullets ?? []).length})
                                            </label>
                                            <button
                                                type="button"
                                                onClick={addHighlightBullet}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-xs"
                                            >
                                                <Plus className="w-3.5 h-3.5" /> Add Bullet
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 gap-3">
                                            {(data.highlightBullets ?? []).map((bullet: string, bIdx: number) => (
                                                <div
                                                    key={bIdx}
                                                    className="flex items-center gap-2 bg-gray-50/70 p-2.5 rounded-xl border border-gray-200"
                                                >
                                                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                                                        ✓
                                                    </span>
                                                    <input
                                                        type="text"
                                                        value={bullet}
                                                        onChange={(e) => setHighlightBullet(bIdx, e.target.value)}
                                                        className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium"
                                                        placeholder="Highlight bullet description..."
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeHighlightBullet(bIdx)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}

                        {page.slug !== 'faq' && !isArticlePage && ('ctaTitle' in effectiveDefaults || 'ctaSubtitle' in effectiveDefaults || 'ctaButtonLabel' in effectiveDefaults || 'ctaHref' in effectiveDefaults || page.slug === 'catalogues' || page.slug === 'classifieds') && (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Call-to-Action Footer</h4>
                                    <button
                                        type="button"
                                        onClick={() => set('hideCta', !data.hideCta)}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                            data.hideCta
                                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                        }`}
                                    >
                                        {data.hideCta ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        {data.hideCta ? 'Hidden / Draft' : 'Live on Page'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {('ctaTitle' in effectiveDefaults || page.slug === 'catalogues' || page.slug === 'classifieds') && <Field label="CTA Heading" value={data.ctaTitle ?? ''} onChange={(v) => set('ctaTitle', v)} />}
                                    {('ctaSubtitle' in effectiveDefaults || page.slug === 'catalogues' || page.slug === 'classifieds') && <Field label="CTA Subtitle" value={data.ctaSubtitle ?? ''} onChange={(v) => set('ctaSubtitle', v)} multiline />}
                                    {('ctaButtonLabel' in effectiveDefaults || page.slug === 'catalogues' || page.slug === 'classifieds') && <Field label="CTA Button Label" value={data.ctaButtonLabel ?? ''} onChange={(v) => set('ctaButtonLabel', v)} />}
                                    {page.slug === 'catalogues' ? (
                                        <>
                                            <Field label="Secondary CTA Button Label" value={data.ctaSecondaryLabel ?? ''} onChange={(v) => set('ctaSecondaryLabel', v)} placeholder="Contact Sales" />
                                            <Field label="Secondary CTA Button Link" value={data.ctaSecondaryHref ?? ''} onChange={(v) => set('ctaSecondaryHref', v)} placeholder="/contact-us" />
                                        </>
                                    ) : (
                                        ('ctaHref' in effectiveDefaults) && <Field label="CTA Link" value={data.ctaHref ?? ''} onChange={(v) => set('ctaHref', v)} />
                                    )}
                                </div>
                            </section>
                        )}

                        {('formTitle' in effectiveDefaults || page.slug === 'smart-classrooms') && (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">
                                        Request Information Form
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={() => set('hideForm', !data.hideForm)}
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                            data.hideForm
                                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                        }`}
                                    >
                                        {data.hideForm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                        {data.hideForm ? 'Hidden / Draft' : 'Live on Page'}
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Field
                                        label="Form Heading"
                                        value={data.formTitle ?? ''}
                                        onChange={(v) => set('formTitle', v)}
                                        placeholder="Request More Information"
                                    />
                                    <Field
                                        label="Form Subheading"
                                        value={data.formSubtitle ?? ''}
                                        onChange={(v) => set('formSubtitle', v)}
                                        multiline
                                        placeholder="Tell us what your institution needs and our team will contact you."
                                    />
                                </div>
                            </section>
                        )}

                        {/* Case Studies / Projects Showcase Section */}
                        {('caseStudies' in effectiveDefaults || page.slug === 'catalogues') && (
                            <CaseStudiesEditorSection
                                data={data}
                                set={set}
                                onSyncCaseStudies={async (nextCaseStudies) => {
                                    const nextData = { ...data, caseStudies: nextCaseStudies };
                                    setData(nextData);
                                    try {
                                        const { data: updated } = await api.put(`/pages/${page.id}`, {
                                            title,
                                            published,
                                            pageData: JSON.stringify(nextData),
                                        });
                                        clearPageDataCache(page.slug);
                                        clearPageDataCache();
                                        broadcastCmsInvalidation({ type: 'INVALIDATE_PAGE', slug: page.slug });
                                        broadcastCmsInvalidation({ type: 'INVALIDATE_ALL' });
                                        setSaved(true);
                                        setTimeout(() => setSaved(false), 2000);
                                        if (onSaved) onSaved(updated);
                                    } catch (err: any) {
                                        console.error('Failed to sync case studies:', err);
                                        const msg = err?.response?.data?.error || 'Failed to save case studies.';
                                        setSaveError(msg);
                                    }
                                }}
                            />
                        )}

                    </>
                )}

                {/* Bottom Back Button */}
                <div className="flex justify-between items-center pt-8 mt-4 border-t border-gray-100">
                    {onClose ? (
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all flex items-center gap-2"
                        >
                            ← {isStandalone ? 'Back to Pages' : 'Close Editor'}
                        </button>
                    ) : (
                        <div />
                    )}
                    <button
                        type="button"
                        onClick={save}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-md"
                    >
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving…' : saved ? '✓ All Changes Saved!' : 'Save All Changes'}
                    </button>
                </div>
            </div>

            {/* Load Starter Template Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-start justify-between border-b border-slate-100 p-6">
                            <div>
                                <h3 className="text-lg font-bold text-slate-900">Load Starter Template</h3>
                                <p className="mt-1 text-xs text-slate-500">
                                    Populate <strong>/{page.slug}</strong> with recommended starter content and sample cards.
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowTemplateModal(false)}
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <label
                                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                                    templateMode === 'append'
                                        ? 'border-blue-600 bg-blue-50/50'
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="templateMode"
                                    checked={templateMode === 'append'}
                                    onChange={() => setTemplateMode('append')}
                                    className="mt-1 text-blue-600 focus:ring-blue-500"
                                />
                                <div>
                                    <div className="font-bold text-sm text-slate-900">
                                        Append Samples (Keep my current cards) <span className="ml-1 text-[11px] font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Recommended</span>
                                    </div>
                                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                                        Preserves all your existing custom cards at the top. Only appends non-duplicate sample cards from the starter template.
                                    </p>
                                </div>
                            </label>

                            <label
                                className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition ${
                                    templateMode === 'replace'
                                        ? 'border-red-500 bg-red-50/50'
                                        : 'border-slate-200 hover:border-slate-300'
                                }`}
                            >
                                <input
                                    type="radio"
                                    name="templateMode"
                                    checked={templateMode === 'replace'}
                                    onChange={() => setTemplateMode('replace')}
                                    className="mt-1 text-red-600 focus:ring-red-500"
                                />
                                <div>
                                    <div className="font-bold text-sm text-slate-900">Replace All</div>
                                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                                        Replaces your current content and cards with the original template defaults. Existing custom edits on this page will be overwritten.
                                    </p>
                                </div>
                            </label>
                        </div>

                        <div className="flex items-center justify-end gap-3 bg-slate-50 px-6 py-4 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setShowTemplateModal(false)}
                                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200/70 rounded-xl transition"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleApplyStarterTemplate}
                                className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition ${
                                    templateMode === 'replace'
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                {templateMode === 'replace' ? 'Replace All Content' : 'Append Starter Samples'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
