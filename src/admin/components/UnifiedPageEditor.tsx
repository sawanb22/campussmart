import { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Save, Plus, Trash2, Link as LinkIcon, X, ArrowLeft, FileText } from 'lucide-react';
import api from '../api/client';
import { pageDefaults } from '../pageDefaults';
import MediaImageField from './MediaImageField';
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
    heroTitle?: string;
    heroSubtitle?: string;
    heroImage?: string;
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

    const parsedData = parsePageData(page.pageData);
    const genericDefaults = pageDefaults[page.slug] || pageDefaults[page.template || ''] || {};
    const effectiveDefaults = isAboutUs ? defaultAboutUs : genericDefaults;

    const initialData = { ...effectiveDefaults };
    Object.entries(parsedData).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
            (initialData as any)[k] = v;
        }
    });

    const [data, setData] = useState<PageData>(initialData);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
 
    // Live synchronization: hydrate contact channels from /api/content when editing contact-us
    useEffect(() => {
        if (isContactUs) {
            api.get('/content')
                .then(({ data: siteContent }) => {
                    if (!siteContent || typeof siteContent !== 'object') return;
                    setData((prev) => {
                        const next = { ...prev };
                        if (siteContent.contact_phone !== undefined) next.contact_phone = siteContent.contact_phone;
                        if (siteContent.contact_phone_alt !== undefined) next.contact_phone_alt = siteContent.contact_phone_alt;
                        if (siteContent.contact_email !== undefined) next.contact_email = siteContent.contact_email;
                        if (siteContent.contact_email_alt !== undefined) next.contact_email_alt = siteContent.contact_email_alt;
                        if (siteContent.contact_whatsapp !== undefined) next.contact_whatsapp = siteContent.contact_whatsapp;
                        if (siteContent.contact_hours !== undefined) next.contact_hours = siteContent.contact_hours;
                        if (siteContent.contact_address !== undefined) next.contact_address = siteContent.contact_address;
                        return next;
                    });
                })
                .catch((err) => {
                    console.warn('[UnifiedPageEditor] Failed to hydrate contact channels from /api/content:', err);
                });
        }
    }, [isContactUs]);

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

    const addCaseStudy = () => {
        const nextIndex = (data.caseStudies ?? []).length;
        set('caseStudies', [...(data.caseStudies ?? []), { title: '', description: '', image: '' }]);
        scrollToAndFocusNewItem(`casestudy-item-${nextIndex}`);
    };

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
            // Live synchronization: also update global content channels for contact-us
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
                    <button
                        type="button"
                        onClick={() => setShowTemplateModal(true)}
                        className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold border border-blue-200 text-blue-700 bg-blue-50/90 hover:bg-blue-100 rounded-xl transition-all shadow-sm active:scale-95"
                        title="Load recommended template samples for this page"
                    >
                        <FileText className="w-3.5 h-3.5" /> Load Starter Template
                    </button>
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
                <div className="mx-6 sm:mx-8 mt-6 rounded-xl border border-amber-200 bg-amber-50/70 p-4 text-sm text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                    <div>
                        <div className="font-bold text-amber-950">🏠 Dedicated Homepage Editor Available</div>
                        <p className="text-xs text-amber-800 mt-0.5">
                            For managing hero carousels, key statistics, and homepage showcases, use the dedicated Homepage Editor.
                        </p>
                    </div>
                    <Link
                        to="/admin/homepage-editor"
                        className="px-3 py-1.5 text-xs font-bold rounded-lg bg-amber-600 text-white hover:bg-amber-700 transition shrink-0 shadow-xs"
                    >
                        Open Homepage Editor →
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

                {isAboutUs ? (
                    // ─── ABOUT US & CORPORATE ──────────────────────────────────────────
                    <>
                        <section className="space-y-6">
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Hero Banner Content</h4>
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
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Our Mission Section</h4>
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
                                <button
                                    type="button"
                                    onClick={addWhyBullet}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-emerald-700 transition-all shadow-md"
                                >
                                    <Plus className="w-4 h-4" /> Add Bullet
                                </button>
                            </div>
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
                                <button
                                    type="button"
                                    onClick={addTeamMember}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-md"
                                >
                                    <Plus className="w-4 h-4" /> Add Member
                                </button>
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
                                <button
                                    type="button"
                                    onClick={addPartner}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-amber-700 transition-all shadow-md"
                                >
                                    <Plus className="w-4 h-4" /> Add Partner
                                </button>
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
                        {page.slug !== 'ai-guide' && page.slug !== 'ugc-guidelines' && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Hero Banner Content</h4>
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
                                    {page.slug === 'colleges-universities-for-sale' && (
                                        <Field
                                            label="Search Filter Label"
                                            value={data.filterLabel ?? ''}
                                            onChange={(v) => set('filterLabel', v)}
                                            placeholder="cbse schools"
                                        />
                                    )}

                                    {('heroImage' in effectiveDefaults) && (
                                        <MediaImageField
                                            label="Hero Image Backdrop"
                                            value={data.heroImage ?? ''}
                                            onChange={(v) => set('heroImage', v)}
                                            previewClassName="h-48 rounded-2xl"
                                        />
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

                        {page.slug === 'ai-guide' && (
                            <>
                                <section className="space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Journal Layout Content</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field label="Section Eyebrow" value={data.sectionLabel ?? ''} onChange={(v) => set('sectionLabel', v)} />
                                        <Field label="Section Heading" value={data.sectionTitle ?? ''} onChange={(v) => set('sectionTitle', v)} />
                                        <Field label="Section Description" value={data.sectionDescription ?? ''} onChange={(v) => set('sectionDescription', v)} multiline />
                                        <Field label="Latest Articles Heading" value={data.latestTitle ?? ''} onChange={(v) => set('latestTitle', v)} />
                                        <Field label="View All Label" value={data.viewAllLabel ?? ''} onChange={(v) => set('viewAllLabel', v)} />
                                        <Field label="Featured Link Label" value={data.readMoreLabel ?? ''} onChange={(v) => set('readMoreLabel', v)} />
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Featured Article</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Field label="Category Label" value={data.featured?.category ?? ''} onChange={(v) => setFeatured('category', v)} />
                                        <Field label="Article Title" value={data.featured?.title ?? ''} onChange={(v) => setFeatured('title', v)} />
                                        <Field label="Article Description" value={data.featured?.description ?? ''} onChange={(v) => setFeatured('description', v)} multiline />
                                        <MediaImageField label="Featured Image" value={data.featured?.image ?? ''} onChange={(v) => setFeatured('image', v)} previewClassName="h-32" />
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Article Filters</h4>
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
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Newsletter Block</h4>
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

                        {page.slug === 'ugc-guidelines' && (
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
                                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Classifieds Journal Content</h4>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <Field label="Page Heading" value={data.heroTitle ?? ''} onChange={(v) => set('heroTitle', v)} />
                                        <Field label="Page Description" value={data.heroSubtitle ?? ''} onChange={(v) => set('heroSubtitle', v)} multiline />
                                        <Field label="CTA Heading" value={data.ctaTitle ?? ''} onChange={(v) => set('ctaTitle', v)} />
                                        <Field label="CTA Description" value={data.ctaSubtitle ?? ''} onChange={(v) => set('ctaSubtitle', v)} multiline />
                                        <Field label="CTA Button Label" value={data.ctaButtonLabel ?? ''} onChange={(v) => set('ctaButtonLabel', v)} />
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Featured Opportunity</h4>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                        <Field label="Eyebrow" value={data.featured?.eyebrow ?? ''} onChange={(v) => setFeatured('eyebrow', v)} />
                                        <Field label="Title" value={data.featured?.title ?? ''} onChange={(v) => setFeatured('title', v)} />
                                        <Field label="Description" value={data.featured?.description ?? ''} onChange={(v) => setFeatured('description', v)} multiline />
                                        <MediaImageField label="Featured Image" value={data.featured?.image ?? ''} onChange={(v) => setFeatured('image', v)} previewClassName="h-32" />
                                    </div>
                                </section>

                                <section className="space-y-6">
                                    <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
                                        <h4 className="text-xs font-black uppercase tracking-[0.2em] text-slate-800">Opportunity Categories</h4>
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
                            </>
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
                        {('section1Title' in effectiveDefaults || 'section2Title' in effectiveDefaults) && (
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

                        {/* Catalogues shortcut banner */}
                        {page.slug === 'catalogues' && (
                            <section className="space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50/60 p-6">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-emerald-900">Downloadable Catalogues &amp; Custom Solutions</h4>
                                        <p className="text-xs text-emerald-700 mt-1 max-w-xl">
                                            Edit the catalogue cards below directly or click "Load Starter Template" to load default cards. Uploaded PDFs allow visitors to download directly; cards without uploaded files automatically display "Request Catalogue".
                                        </p>
                                    </div>
                                    <Link
                                        to="/admin/catalogues"
                                        className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors"
                                    >
                                        Open PDF Manager &rarr;
                                    </Link>
                                </div>
                            </section>
                        )}

                        {('cards' in effectiveDefaults || page.slug === 'colleges-universities-for-sale' || page.slug === 'catalogues') && (() => {
                            const cardsUseCategories = (effectiveDefaults.cards ?? []).some((c: any) => Array.isArray(c?.categories));
                            const cardsUseHref = (effectiveDefaults.cards ?? []).some((c: any) => 'href' in (c || {}));
                            const cardsUseDownloadLink = (effectiveDefaults.cards ?? []).some((c: any) => 'downloadLink' in (c || {})) || page.slug === 'catalogues';
                            const cardsUseSize = (effectiveDefaults.cards ?? []).some((c: any) => 'size' in (c || {})) || page.slug === 'catalogues';
                            return (
                                <section className="space-y-6">
                                    <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">
                                            Interactive Cards <span className="text-blue-500 ml-2">({(data.cards ?? []).length})</span>
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={addCard}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-md"
                                        >
                                            <Plus className="w-4 h-4" /> New Card
                                        </button>
                                    </div>
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
                                                    {(page.slug === 'ai-guide' || page.slug === 'setup-college' || page.slug === 'ugc-guidelines' || page.slug === 'classifieds') && (
                                                        <>
                                                            <Field label="Article Category" value={card.category ?? ''} onChange={(v) => setCard(i, 'category', v)} placeholder="Strategy" />
                                                            <Field label="Read Time" value={card.readTime ?? ''} onChange={(v) => setCard(i, 'readTime', v)} placeholder="5 min read" />
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
                                                    {(Array.isArray(card.categories) || cardsUseCategories) && (
                                                        <Field
                                                            label="Categories (comma-separated)"
                                                            value={(card.categories ?? []).join(', ')}
                                                            onChange={(v) => setCard(i, 'categories', v.split(',').map((item: string) => item.trim()).filter(Boolean))}
                                                            placeholder="Indoor, Adults"
                                                        />
                                                    )}
                                                    {('href' in card || cardsUseHref) && (
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
                        {('section2Cards' in effectiveDefaults) && (
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
                        {('sections' in effectiveDefaults) && (
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

                        {('section2Description' in effectiveDefaults) && (
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
                                    <button
                                        type="button"
                                        onClick={addFeature}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-emerald-700 transition-all shadow-md"
                                    >
                                        <Plus className="w-4 h-4" /> Add Bullet
                                    </button>
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

                        {('ctaTitle' in effectiveDefaults || 'ctaSubtitle' in effectiveDefaults || 'ctaButtonLabel' in effectiveDefaults || 'ctaHref' in effectiveDefaults) && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Call-to-Action Footer</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {('ctaTitle' in effectiveDefaults) && <Field label="CTA Heading" value={data.ctaTitle ?? ''} onChange={(v) => set('ctaTitle', v)} />}
                                    {('ctaSubtitle' in effectiveDefaults) && <Field label="CTA Subtitle" value={data.ctaSubtitle ?? ''} onChange={(v) => set('ctaSubtitle', v)} multiline />}
                                    {('ctaButtonLabel' in effectiveDefaults) && <Field label="CTA Button Label" value={data.ctaButtonLabel ?? ''} onChange={(v) => set('ctaButtonLabel', v)} />}
                                    {('ctaHref' in effectiveDefaults) && <Field label="CTA Link" value={data.ctaHref ?? ''} onChange={(v) => set('ctaHref', v)} />}
                                </div>
                            </section>
                        )}

                        {/* Optional Case Studies block */}
                        {('caseStudies' in effectiveDefaults) && (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">
                                        Case Studies / Projects <span className="text-purple-500 ml-2">({(data.caseStudies ?? []).length})</span>
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={addCaseStudy}
                                        className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-purple-700 transition-all shadow-md"
                                    >
                                        <Plus className="w-4 h-4" /> Add Project
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 gap-6">
                                    {(data.caseStudies ?? []).map((study: any, i: number) => (
                                        <div key={i} id={`casestudy-item-${i}`} className="border border-gray-200 rounded-2xl p-6 bg-gray-50/30 group relative">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    const newList = [...(data.caseStudies ?? [])];
                                                    newList.splice(i, 1);
                                                    set('caseStudies', newList);
                                                }}
                                                className="absolute top-4 right-4 text-red-400 hover:text-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Field
                                                    label="Project Title"
                                                    value={study.title ?? ''}
                                                    onChange={(v) => {
                                                        const newList = [...(data.caseStudies ?? [])];
                                                        newList[i] = { ...newList[i], title: v };
                                                        set('caseStudies', newList);
                                                    }}
                                                />
                                                <MediaImageField
                                                    label="Image"
                                                    value={study.image ?? ''}
                                                    onChange={(v) => {
                                                        const newList = [...(data.caseStudies ?? [])];
                                                        newList[i] = { ...newList[i], image: v };
                                                        set('caseStudies', newList);
                                                    }}
                                                    previewClassName="h-24"
                                                />
                                                <div className="md:col-span-2">
                                                    <Field
                                                        label="Description"
                                                        value={study.description ?? ''}
                                                        onChange={(v) => {
                                                            const newList = [...(data.caseStudies ?? [])];
                                                            newList[i] = { ...newList[i], description: v };
                                                            set('caseStudies', newList);
                                                        }}
                                                        multiline
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
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
