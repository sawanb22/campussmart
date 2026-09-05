import { useEffect, useRef, useState } from 'react';
import { Eye, EyeOff, Pencil, X, Save, Plus, Trash2, Link as LinkIcon } from 'lucide-react';
import api from '../api/client';
import { pageDefaults } from '../pageDefaults';
import MediaImageField from '../components/MediaImageField';

// ─── Types ───────────────────────────────────────────────────────────────────
interface CardItem { title: string; description: string; image?: string; href?: string; categories?: string[]; }
interface SectionItem { heading: string; body: string; bullets?: string[]; }
interface PageData {
    heroTitle?: string;
    heroSubtitle?: string;
    heroImage?: string;
    filterLabel?: string;
    section1Title?: string;
    section2Title?: string;
    ctaTitle?: string;
    ctaSubtitle?: string;
    cards?: CardItem[];
    features?: string[];
    sections?: SectionItem[];
    lastUpdated?: string;
}
interface Page {
    id: number;
    title: string;
    slug: string;
    template: string | null;
    published: boolean;
    pageData: string | null;
    updatedAt: string;
}

function parsePageData(raw: string | null): PageData {
    if (!raw) return {};
    try { return JSON.parse(raw); } catch { return {}; }
}

// ─── Small helpers ────────────────────────────────────────────────────────────
function DocumentUploadField({ label, value, onChange }: {
    label: string; value: string; onChange: (url: string) => void;
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
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="px-4 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-60 whitespace-nowrap"
                >
                    {uploading ? 'Uploading...' : value ? 'Replace PDF' : 'Upload PDF'}
                </button>
                <span className="truncate text-xs text-gray-500">
                    {value ? value.split('/').pop() : 'No file uploaded yet'}
                </span>
            </div>
            {error && <p className="text-xs text-red-600">{error}</p>}
            <input
                ref={inputRef}
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                    e.target.value = '';
                }}
            />
        </div>
    );
}

function Field({ label, value, onChange, multiline = false, placeholder = '', hint = '' }: {
    label: string; value: string; onChange: (v: string) => void;
    multiline?: boolean; placeholder?: string; hint?: string;
}) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-bold text-gray-700 flex items-center justify-between">
                {label}
                {hint && <span className="text-gray-400 font-normal text-[10px] uppercase tracking-wider bg-gray-100 px-1.5 py-0.5 rounded">{hint}</span>}
            </label>
            {multiline ? (
                <textarea rows={3}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none shadow-sm bg-white"
                    value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
            ) : (
                <input type="text"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm bg-white"
                    value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
            )}
        </div>
    );
}

// ─── Inline Page Editor ───────────────────────────────────────────────────────
function InlinePageEditor({ page, onClose, onSaved }: {
    page: Page; onClose: () => void; onSaved: (updated: Page) => void;
}) {
    const isAboutUs = page.slug === 'about-us' || page.slug === 'corporate';
    
    const [title, setTitle] = useState(page.title);
    const [published, setPublished] = useState(page.published);
    
    // Default values for about us to pre-fill the form if DB is empty
    const defaultAboutUs = {
        heroTitle: 'About Campus Mart',
        heroSubtitle: 'We are a consortium of architects, designers, and campus innovators who strive to bring learning outcomes through the latest infrastructure and edtech solutions.',
        missionTitle: 'Our Mission',
        missionBody1: 'To transform educational infrastructure across India by providing comprehensive campus solutions that blend physical spaces with cutting-edge digital technology. We aim to create learning environments that inspire, engage, and empower students and educators alike.',
        missionBody2: 'As the first company in Asia to bring curriculum-mapped innovations to the campus industry, we continue to lead the way in educational transformation.',
        missionImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        whyBullets: [
            "India's leading Consortium for Campus Infrastructure",
            "Bespoke Design to Delivery across 100+ categories",
            "Strategic Planning for new Campuses from scratch",
            "4000+ Partner Campuses across India",
            "Exclusive access to global educational brands",
            "NEP 2020 aligned innovation & digital tools"
        ],
        team: [
            { name: 'Rajesh Kumar', role: 'Founder & CEO', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { name: 'Priya Sharma', role: 'Chief Design Officer', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
            { name: 'Amit Patel', role: 'Head of Operations', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
        ],
        partners: [
            'European Educational Group', 'MAXHUB', 'Nike', 'ViewSonic',
            'Kidken', 'Little Tikes', 'ButterflyFields', 'ALTOP',
            'Skill O Fun', 'WriteOnWalls', 'ICTS', 'INFINITI',
        ]
    };

    const parsedData = parsePageData(page.pageData);
    
    // Fallback defaults for all other pages extracted dynamically.
    // Slug is checked first so a page can have its own defaults even if its
    // DB `template` value still points at a shared/legacy template component.
    const genericDefaults = pageDefaults[page.slug] || pageDefaults[page.template || ''] || {};
    const effectiveDefaults = isAboutUs ? defaultAboutUs : genericDefaults;
    
    const initialData = { ...effectiveDefaults };
    Object.entries(parsedData).forEach(([k, v]) => {
        // If the DB has saved a non-falsy value (and not an empty array), overwrite the default
        // Older sports records did not contain card categories, so keep the complete
        // editable defaults until that page is saved in the current content shape.
        if (['sports-infra', 'labs', 'libraries'].includes(page.slug) && k === 'cards' && Array.isArray(v) && !v.some((card: any) => card.categories?.length)) return;
        if (v !== undefined && v !== null && (!Array.isArray(v) || v.length > 0 || k === 'cards')) {
            (initialData as any)[k] = v;
        }
    });

    const [data, setData] = useState<PageData | any>(initialData);
    
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const set = (key: string, value: any) => setData((p: any) => ({ ...p, [key]: value }));

    // Generic Methods
    const setCard = (i: number, field: string, val: any) => {
        const cards = [...(data.cards ?? [])]; cards[i] = { ...cards[i], [field]: val }; set('cards', cards);
    };
    const addCard = () => set('cards', [...(data.cards ?? []), { title: 'New Card', description: '' }]);
    const removeCard = (i: number) => set('cards', (data.cards ?? []).filter((_: any, idx: number) => idx !== i));

    const setSection = (i: number, field: string, value: any) => {
        const sections = [...(data.sections ?? [])]; sections[i] = { ...sections[i], [field]: value }; set('sections', sections);
    };
    const addSection = () => set('sections', [...(data.sections ?? []), { heading: 'New Section', body: '', bullets: [] }]);
    const removeSection = (i: number) => set('sections', (data.sections ?? []).filter((_: any, idx: number) => idx !== i));

    const setFeature = (i: number, v: string) => {
        const f = [...(data.features ?? [])]; f[i] = v; set('features', f);
    };
    const addFeature = () => set('features', [...(data.features ?? []), 'New feature']);
    const removeFeature = (i: number) => set('features', (data.features ?? []).filter((_: any, idx: number) => idx !== i));

    // About Us Methods
    const setWhyBullet = (i: number, v: string) => {
        const w = [...(data.whyBullets ?? [])]; w[i] = v; set('whyBullets', w);
    };
    const addWhyBullet = () => set('whyBullets', [...(data.whyBullets ?? []), 'New bullet point']);
    const removeWhyBullet = (i: number) => set('whyBullets', (data.whyBullets ?? []).filter((_: any, idx: number) => idx !== i));

    const setTeamMember = (i: number, field: string, val: string) => {
        const t = [...(data.team ?? [])]; t[i] = { ...t[i], [field]: val }; set('team', t);
    };
    const addTeamMember = () => set('team', [...(data.team ?? []), { name: 'Name', role: 'Role', image: '' }]);
    const removeTeamMember = (i: number) => set('team', (data.team ?? []).filter((_: any, idx: number) => idx !== i));

    const setPartner = (i: number, v: string) => {
        const p = [...(data.partners ?? [])]; p[i] = v; set('partners', p);
    };
    const addPartner = () => set('partners', [...(data.partners ?? []), 'Partner Name']);
    const removePartner = (i: number) => set('partners', (data.partners ?? []).filter((_: any, idx: number) => idx !== i));


    const save = async () => {
        setSaving(true);
        try {
            const { data: updated } = await api.put(`/pages/${page.id}`, {
                title, published, pageData: JSON.stringify(data)
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
            onSaved(updated);
        } catch { /* noop */ }
        setSaving(false);
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl mt-6 overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Editor Header */}
            <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md flex flex-wrap gap-4 items-center justify-between px-8 py-5 border-b border-gray-100 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-8 bg-blue-600 rounded-full"></div>
                    <div>
                        <h3 className="font-black text-gray-900 text-xl tracking-tight">Edit Page Content</h3>
                        <p className="text-xs text-blue-600 font-bold uppercase tracking-widest">{page.slug}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <a href={`/${page.slug}`} target="_blank" rel="noreferrer"
                        className="flex items-center gap-2 px-4 py-2 text-xs font-bold border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all shadow-sm">
                        <LinkIcon className="w-3.5 h-3.5" /> View Live
                    </a>
                    <button onClick={save} disabled={saving}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black shadow-lg transition-all active:scale-95 ${saving ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving…' : saved ? '✓ Changes Saved!' : 'Save Page Changes'}
                    </button>
                    <button onClick={onClose} className="p-2 text-gray-400 border border-gray-100 hover:border-red-200 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all ml-2">
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div className="p-8 space-y-12">
                {/* Basic Info */}
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
                            <button onClick={() => setPublished(p => !p)}
                                className={`w-full px-4 py-2.5 rounded-xl text-xs font-black border-2 transition-all shadow-sm ${published
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                    : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                                {published ? '● PUBLISHED & VISIBLE' : '○ SAVED AS DRAFT'}
                            </button>
                        </div>
                    </div>
                </section>

                {isAboutUs ? (
                    // ─── ABOUT US EDITOR (Matches corporate.tsx strictly) ────────────────────────
                    <>
                        <section className="space-y-6">
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Hero Banner Content</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Field label="Hero Heading *" value={data.heroTitle ?? ''} onChange={v => set('heroTitle', v)} placeholder="About Campus Mart" />
                                <Field label="Hero Sub-heading" value={data.heroSubtitle ?? ''} onChange={v => set('heroSubtitle', v)} multiline placeholder="We are a consortium..." />
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Our Mission Section</h4>
                            </div>
                            <div className="space-y-6">
                                <Field label="Mission Heading" value={data.missionTitle ?? ''} onChange={v => set('missionTitle', v)} placeholder="Our Mission" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Field label="Mission Paragraph 1" value={data.missionBody1 ?? ''} onChange={v => set('missionBody1', v)} multiline placeholder="To transform educational..." />
                                    <Field label="Mission Paragraph 2" value={data.missionBody2 ?? ''} onChange={v => set('missionBody2', v)} multiline placeholder="As the first company..." />
                                </div>
                                <MediaImageField label="Mission Image" value={data.missionImage ?? ''} onChange={v => set('missionImage', v)} />
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Why Sign Up Bullets</h4>
                                <button onClick={addWhyBullet} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-emerald-700 transition-all shadow-md">
                                    <Plus className="w-4 h-4" /> Add Bullet
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(data.whyBullets ?? []).map((b: string, i: number) => (
                                    <div key={i} className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl">
                                        <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 ml-2" />
                                        <input className="flex-1 border-none bg-transparent focus:ring-0 text-sm font-medium" value={b} onChange={e => setWhyBullet(i, e.target.value)} placeholder="Enter bullet point..." />
                                        <button onClick={() => removeWhyBullet(i)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Leadership Team</h4>
                                <button onClick={addTeamMember} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-md">
                                    <Plus className="w-4 h-4" /> Add Member
                                </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {(data.team ?? []).map((t: any, i: number) => (
                                    <div key={i} className="border border-gray-200 rounded-2xl p-4 space-y-4 shadow-sm bg-white relative group">
                                        <button onClick={() => removeTeamMember(i)} className="absolute -top-3 -right-3 bg-red-100 text-red-600 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity drop-shadow"><Trash2 className="w-4 h-4" /></button>
                                        <Field label="Name" value={t.name ?? ''} onChange={v => setTeamMember(i, 'name', v)} />
                                        <Field label="Role" value={t.role ?? ''} onChange={v => setTeamMember(i, 'role', v)} />
                                        <MediaImageField label="Image" value={t.image ?? ''} onChange={v => setTeamMember(i, 'image', v)} previewClassName="h-16 w-16 mx-auto rounded-full" />
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Partners Matrix</h4>
                                <button onClick={addPartner} className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-amber-700 transition-all shadow-md">
                                    <Plus className="w-4 h-4" /> Add Partner
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {(data.partners ?? []).map((p: string, i: number) => (
                                    <div key={i} className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm px-3 py-1.5 rounded-lg">
                                        <input className="w-32 text-sm font-semibold border-none focus:ring-0 p-0 m-0" value={p} onChange={e => setPartner(i, e.target.value)} placeholder="Partner Name" />
                                        <button onClick={() => removePartner(i)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                ) : (
                    // ─── GENERIC TEMPLATE EDITOR ──────────────────────────────────────────────────
                    <>
                        {/* Always show Hero text as every page uses it. Image is conditional. */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Hero Banner Content</h4>
                            </div>
                            <div className="space-y-6">
                                <Field label="Hero Heading *" value={data.heroTitle ?? ''} onChange={v => set('heroTitle', v)} placeholder="Headline for the page..." />
                                <Field label="Hero Sub-heading" value={data.heroSubtitle ?? ''} onChange={v => set('heroSubtitle', v)} multiline placeholder="Supporting text displayed below the headline…" />
                                {page.slug === 'colleges-universities-for-sale' && <Field label="Search Filter Label" value={data.filterLabel ?? ''} onChange={v => set('filterLabel', v)} placeholder="cbse schools" />}
                                
                                {('heroImage' in effectiveDefaults) && (
                                    <>
                                        <MediaImageField label="Hero Image Backdrop" value={data.heroImage ?? ''} onChange={v => set('heroImage', v)} previewClassName="h-48 rounded-2xl" />
                                    </>
                                )}
                            </div>
                        </section>

                        {/* NDA & Mandate documents (colleges-universities-for-sale only) */}
                        {page.slug === 'colleges-universities-for-sale' && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Business Documents</h4>
                                </div>
                                <p className="text-xs text-gray-500">Shown at the top of the page. Registered users can download these directly; visitors who aren't logged in are prompted to register.</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <DocumentUploadField label="NDA (Non-Disclosure Agreement)" value={data.ndaUrl ?? ''} onChange={v => set('ndaUrl', v)} />
                                    <DocumentUploadField label="Mandate" value={data.mandateUrl ?? ''} onChange={v => set('mandateUrl', v)} />
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
                                    {('section1Title' in effectiveDefaults) && <Field label="Content Section Title" value={data.section1Title ?? ''} onChange={v => set('section1Title', v)} placeholder="e.g. Solutions" />}
                                    {('section2Title' in effectiveDefaults) && <Field label="Features Section Title" value={data.section2Title ?? ''} onChange={v => set('section2Title', v)} placeholder="e.g. Benefits" />}
                                </div>
                            </section>
                        )}

                        {/* Optional Cards block */}
                        {('cards' in effectiveDefaults || page.slug === 'colleges-universities-for-sale') && (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Interactive Cards <span className="text-blue-500 ml-2">({(data.cards ?? []).length})</span></h4>
                                    <button onClick={addCard} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-md">
                                        <Plus className="w-4 h-4" /> New Card
                                    </button>
                                </div>
                                {page.slug === 'catalogues' && (
                                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                                        These cards only appear on the site when no catalogues exist yet in <strong>Catalogues</strong> (the dedicated page in the sidebar). Once a catalogue is uploaded there, its real PDF cards replace these on the live page — manage the actual downloadable catalogues from that page instead.
                                    </p>
                                )}
                                <div className="grid grid-cols-1 gap-6">
                                    {(data.cards ?? []).map((card: any, i: number) => (
                                        <div key={i} className="border border-gray-200 rounded-2xl p-6 bg-gray-50/30 hover:bg-white hover:shadow-lg hover:border-blue-200 transition-all group relative">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">{i + 1}</span>
                                                    <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{card.title || 'Untitled Card'}</span>
                                                </div>
                                                <button onClick={() => removeCard(i)} className="flex items-center gap-1.5 text-red-400 hover:text-red-600 text-[10px] font-black uppercase tracking-wider"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Field label="Card Title" value={card.title ?? ''} onChange={v => setCard(i, 'title', v)} />
                                                <Field label="Card Description" value={card.description ?? ''} onChange={v => setCard(i, 'description', v)} multiline />
                                                <MediaImageField label="Image (Optional)" value={card.image ?? ''} onChange={v => setCard(i, 'image', v)} previewClassName="h-24" />
                                                {page.slug === 'colleges-universities-for-sale' && <>
                                                    <Field label="Location" value={card.location ?? ''} onChange={v => setCard(i, 'location', v)} placeholder="Bahraich" />
                                                    <div className="space-y-1.5">
                                                        <label className="block text-sm font-bold text-gray-700">Region</label>
                                                        <select
                                                            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm bg-white"
                                                            value={card.region ?? ''}
                                                            onChange={e => setCard(i, 'region', e.target.value || undefined)}
                                                        >
                                                            <option value="">-- Select Region --</option>
                                                            <option value="North">North</option>
                                                            <option value="South">South</option>
                                                            <option value="East">East</option>
                                                            <option value="West">West</option>
                                                        </select>
                                                    </div>
                                                    <Field label="Rating" value={card.rating ?? ''} onChange={v => setCard(i, 'rating', v)} placeholder="6.8" />
                                                    <Field label="Run Rate Sales" value={card.sales ?? ''} onChange={v => setCard(i, 'sales', v)} placeholder="INR 2.6 crore" />
                                                    <Field label="EBITDA Margin" value={card.margin ?? ''} onChange={v => setCard(i, 'margin', v)} placeholder="40 %" />
                                                    <Field label="Asking Price" value={card.askingPrice ?? ''} onChange={v => setCard(i, 'askingPrice', v)} placeholder="INR 20 Cr" />
                                                </>}
                                                {(Array.isArray(card.categories) || Array.isArray(effectiveDefaults.cards?.[i]?.categories)) && (
                                                    <Field
                                                        label="Categories (comma-separated)"
                                                        value={(card.categories ?? []).join(', ')}
                                                        onChange={v => setCard(i, 'categories', v.split(',').map((item: string) => item.trim()).filter(Boolean))}
                                                        placeholder="Indoor, Adults"
                                                    />
                                                )}
                                                {('href' in (effectiveDefaults.cards?.[i] || {})) && (
                                                    <Field label="Card Link" value={card.href ?? ''} onChange={v => setCard(i, 'href', v)} />
                                                )}
                                                {('downloadLink' in (effectiveDefaults.cards?.[i] || {})) && (
                                                    <Field label="Download URL" value={card.downloadLink ?? ''} onChange={v => setCard(i, 'downloadLink', v)} />
                                                )}
                                                {('size' in (effectiveDefaults.cards?.[i] || {})) && (
                                                    <Field label="File Size (e.g. 10 MB)" value={card.size ?? ''} onChange={v => setCard(i, 'size', v)} />
                                                )}
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
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Content Sections <span className="text-blue-500 ml-2">({(data.sections ?? []).length})</span></h4>
                                    <button onClick={addSection} className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-blue-700 transition-all shadow-md">
                                        <Plus className="w-4 h-4" /> New Section
                                    </button>
                                </div>
                                <div className="space-y-6">
                                    {(data.sections ?? []).map((section: SectionItem, i: number) => (
                                        <div key={i} className="border border-gray-200 rounded-2xl p-6 bg-gray-50/30 relative">
                                            <button onClick={() => removeSection(i)} className="absolute top-5 right-5 flex items-center gap-1.5 text-red-400 hover:text-red-600 text-[10px] font-black uppercase tracking-wider"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-20">
                                                <Field label="Section Heading" value={section.heading ?? ''} onChange={v => setSection(i, 'heading', v)} />
                                                <Field label="Section Text" value={section.body ?? ''} onChange={v => setSection(i, 'body', v)} multiline />
                                            </div>
                                            <div className="mt-6 space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <label className="block text-sm font-bold text-gray-700">Bullet Points</label>
                                                    <button onClick={() => setSection(i, 'bullets', [...(section.bullets ?? []), 'New bullet'])} className="text-xs font-bold text-blue-600 hover:text-blue-800">+ Add bullet</button>
                                                </div>
                                                {(section.bullets ?? []).map((bullet, bulletIndex) => (
                                                    <div key={bulletIndex} className="flex items-center gap-3">
                                                        <input className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm" value={bullet} onChange={e => {
                                                            const bullets = [...(section.bullets ?? [])]; bullets[bulletIndex] = e.target.value; setSection(i, 'bullets', bullets);
                                                        }} />
                                                        <button onClick={() => setSection(i, 'bullets', (section.bullets ?? []).filter((_, index) => index !== bulletIndex))} className="p-2 text-red-400 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
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
                                <Field label="Features Section Description" value={data.section2Description ?? ''} onChange={v => set('section2Description', v)} multiline />
                            </section>
                        )}

                        {/* Optional Features block */}
                        {('features' in effectiveDefaults) && (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Key Feature Bullets <span className="text-emerald-500 ml-2">({(data.features ?? []).length})</span></h4>
                                    <button onClick={addFeature} className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-emerald-700 transition-all shadow-md">
                                        <Plus className="w-4 h-4" /> Add Bullet
                                    </button>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {(data.features ?? []).map((f: string, i: number) => (
                                        <div key={i} className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-sm hover:border-emerald-200 transition-all">
                                        <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs flex-shrink-0">✓</div>
                                        <input className="flex-1 border-none focus:ring-0 text-sm font-medium text-slate-700 placeholder:text-slate-300" value={f} onChange={e => setFeature(i, e.target.value)} placeholder="Feature description..." />
                                        <button onClick={() => removeFeature(i)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {('ctaTitle' in effectiveDefaults || 'ctaButtonLabel' in effectiveDefaults || 'ctaHref' in effectiveDefaults) && (
                            <section className="space-y-6">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Call-to-Action Footer</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {('ctaTitle' in effectiveDefaults) && <Field label="CTA Heading" value={data.ctaTitle ?? ''} onChange={v => set('ctaTitle', v)} />}
                                    {('ctaButtonLabel' in effectiveDefaults) && <Field label="CTA Button Label" value={data.ctaButtonLabel ?? ''} onChange={v => set('ctaButtonLabel', v)} />}
                                    {('ctaHref' in effectiveDefaults) && <Field label="CTA Link" value={data.ctaHref ?? ''} onChange={v => set('ctaHref', v)} />}
                                </div>
                            </section>
                        )}

                        {/* Optional Case Studies block */}
                        {('caseStudies' in effectiveDefaults) && (
                            <section className="space-y-6">
                                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Case Studies / Projects <span className="text-purple-500 ml-2">({(data.caseStudies ?? []).length})</span></h4>
                                    <button onClick={() => {
                                        const newList = [...(data.caseStudies ?? []), { title: '', description: '', image: '' }];
                                        set('caseStudies', newList);
                                    }} className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white text-[10px] font-black uppercase tracking-wider rounded-xl hover:bg-purple-700 transition-all shadow-md">
                                        <Plus className="w-4 h-4" /> Add Project
                                    </button>
                                </div>
                                {page.slug === 'catalogues' && (
                                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
                                        These only appear on the site when no case studies exist yet in <strong>Case Studies</strong> (the dedicated page in the sidebar). Once one is added there, its "Read More" opens a real project page — manage case studies from that page instead.
                                    </p>
                                )}
                                <div className="grid grid-cols-1 gap-6">
                                    {(data.caseStudies ?? []).map((study: any, i: number) => (
                                        <div key={i} className="border border-gray-200 rounded-2xl p-6 bg-gray-50/30 group relative">
                                            <button onClick={() => {
                                                const newList = [...data.caseStudies];
                                                newList.splice(i, 1);
                                                set('caseStudies', newList);
                                            }} className="absolute top-4 right-4 text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <Field label="Project Title" value={study.title ?? ''} onChange={v => {
                                                    const newList = [...data.caseStudies];
                                                    newList[i] = { ...newList[i], title: v };
                                                    set('caseStudies', newList);
                                                }} />
                                                <MediaImageField label="Image" value={study.image ?? ''} onChange={v => {
                                                    const newList = [...data.caseStudies];
                                                    newList[i] = { ...newList[i], image: v };
                                                    set('caseStudies', newList);
                                                }} previewClassName="h-24" />
                                                <div className="md:col-span-2">
                                                    <Field label="Description" value={study.description ?? ''} onChange={v => {
                                                        const newList = [...data.caseStudies];
                                                        newList[i] = { ...newList[i], description: v };
                                                        set('caseStudies', newList);
                                                    }} multiline />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                        <section className="space-y-6">
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Conversion / CTA Footer</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Field label="Call-to-Action Text" value={data.ctaTitle ?? ''} onChange={v => set('ctaTitle', v)} placeholder="Heading for footer..." />
                                <Field label="Sub-text Description" value={data.ctaSubtitle ?? ''} onChange={v => set('ctaSubtitle', v)} multiline placeholder="Actionable subtitle text…" />
                            </div>
                        </section>
                    </>
                )}

                {/* Bottom Back Button */}
                <div className="flex justify-between items-center pt-8 mt-4 border-t border-gray-100">
                    <button onClick={onClose} className="px-6 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all flex items-center gap-2">
                        ← Close Editor
                    </button>
                    <button onClick={save} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-60 shadow-md">
                        <Save className="w-4 h-4" />
                        {saving ? 'Saving…' : saved ? '✓ All Changes Saved!' : 'Save All Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}


// ─── Page hierarchy classification ───────────────────────────────────────────
// Main top-level pages that appear in primary navigation
const MAIN_SLUGS = new Set([
    'home', 'about-us', 'contact-us', 'blog', 'shop', 'services',
    'solutions', 'corporate', 'catalogues', 'classifieds', 'login',
    'registration', 'my-account', 'request-quote', 'not-found',
    'privacy-policy', 'terms-of-use', 'payment-policy', 'replacement-return',
    'order-rejection', 'partnership', 'partner-with-colleges', 'lookbook', 'ugc-guidelines',
]);

// Primary category / solution pages
const CATEGORY_SLUGS = new Set([
    'campus-design', 'furniture', 'sports-infra', 'ai-ml', 'tech-infra',
    'libraries', 'labs', 'collaboration', 'innovation', 'lms',
    'smart-classrooms', 'ar-vr-learning',
    'digital-transformation', 'campus-automation', 'assessment-system',
    'library-management', 'new-environments', 'setup-college',
    'innovation-centres', 'innovation-centers', 'science-tech-labs', 'ai-guide',
    'campus-master-planning', 'ar-vr-experiences', 'campus-furniture-design', 'sports-infrastructure',
]);

type Group = { label: string; badge: string; badgeColor: string; pages: Page[] };

function classifyPages(pages: Page[]): Group[] {
    const main: Page[] = [];
    const category: Page[] = [];
    const inner: Page[] = [];
    pages.forEach(p => {
        if (MAIN_SLUGS.has(p.slug)) main.push(p);
        else if (CATEGORY_SLUGS.has(p.slug)) category.push(p);
        else inner.push(p);
    });
    const sort = (arr: Page[]) => arr.sort((a, b) => a.title.localeCompare(b.title));
    return [
        { label: 'Main Pages', badge: 'Primary navigation & utility pages', badgeColor: 'bg-blue-100 text-blue-700', pages: sort(main) },
        { label: 'Category / Solution Pages', badge: 'Top-level category landing pages', badgeColor: 'bg-violet-100 text-violet-700', pages: sort(category) },
        { label: 'Inner & Sub-Pages', badge: 'Detailed inner pages under categories', badgeColor: 'bg-amber-100 text-amber-700', pages: sort(inner) },
    ].filter(g => g.pages.length > 0);
}

// ─── Page Card ────────────────────────────────────────────────────────────────
function PageCard({ page, isEditing, onToggleEdit, onTogglePublish, onDelete }: {
    page: Page;
    isEditing: boolean;
    onToggleEdit: () => void;
    onTogglePublish: () => void;
    onDelete: () => void;
}) {
    return (
        <div className={`bg-white rounded-2xl border transition-all shadow-sm hover:shadow-md ${
            isEditing ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
        }`}>
            <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                    <button
                        onClick={onTogglePublish}
                        title="Toggle publish status"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                            page.published
                                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                        }`}
                    >
                        {page.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {page.published ? 'Live' : 'Draft'}
                    </button>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-md">
                        {page.template ? 'REACT' : 'HTML'}
                    </span>
                </div>
                <h3 className="font-bold text-gray-900 text-sm mb-1 leading-tight line-clamp-1">{page.title}</h3>
                <p className="text-xs text-gray-400 font-mono mb-4 truncate">/{page.slug}</p>
                <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-2">
                    <a
                        href={`/${page.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold hover:text-blue-600 transition-colors"
                    >
                        <LinkIcon className="w-3.5 h-3.5" /> View Live
                    </a>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onDelete}
                            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all"
                            title="Delete page"
                        >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                        </button>
                        <button
                            onClick={onToggleEdit}
                            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                                isEditing
                                    ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200'
                            }`}
                        >
                            {isEditing ? <><X className="w-3.5 h-3.5" /> Close</> : <><Pencil className="w-3.5 h-3.5" /> Edit</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Main Pages Manager ───────────────────────────────────────────────────────
export default function PagesManager() {
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingPage, setEditingPage] = useState<Page | null>(null);
    const [search, setSearch] = useState('');
    const [creating, setCreating] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newSlug, setNewSlug] = useState('');
    const editorAnchorRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (editingPage && editorAnchorRef.current) {
            editorAnchorRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [editingPage]);

    const fetchPages = async () => {
        try {
            const { data } = await api.get('/pages');
            setPages(data);
        } catch { /* noop */ }
        setLoading(false);
    };
    useEffect(() => { fetchPages(); }, []);

    const togglePublish = async (id: number, current: boolean) => {
        try {
            await api.put(`/pages/${id}`, { published: !current });
            setPages(pp => pp.map(p => p.id === id ? { ...p, published: !current } : p));
        } catch { /* noop */ }
    };

    const deletePage = async (id: number) => {
        const target = pages.find(p => p.id === id);
        if (!target) return;
        const ok = window.confirm(`Delete page "${target.title}"? This cannot be undone.`);
        if (!ok) return;

        try {
            await api.delete(`/pages/${id}`);
            setPages(pp => pp.filter(p => p.id !== id));
            if (editingPage?.id === id) setEditingPage(null);
        } catch { /* noop */ }
    };

    const createPage = async () => {
        const title = newTitle.trim();
        if (!title) return;

        const slug = (newSlug.trim() || title)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') || 'new-page';

        try {
            const { data } = await api.post('/pages', {
                title,
                slug,
                template: null,
                published: true,
                pageData: JSON.stringify({
                    heroTitle: title,
                    heroSubtitle: 'New CMS-managed page.',
                    section1Title: 'Overview',
                    cards: []
                })
            });
            setPages(pp => [data, ...pp]);
            setEditingPage(data);
            setNewTitle('');
            setNewSlug('');
            setCreating(false);
        } catch { /* noop */ }
    };

    const handleSaved = (updated: Page) => {
        setPages(pp => pp.map(p => p.id === updated.id ? { ...p, ...updated } : p));
        setEditingPage(prev => prev ? { ...prev, ...updated } : prev);
    };

    const normalizedSearch = (search || '').trim().replace(/^\/+/, '').toLowerCase();
    const filtered = pages.filter(p =>
        (p.title || '').toLowerCase().includes(normalizedSearch) ||
        (p.slug || '').toLowerCase().includes(normalizedSearch)
    );

    const groups = classifyPages(filtered);

    if (loading) return (
        <div className="flex items-center justify-center h-64">
            <div className="text-gray-400 text-sm">Loading pages…</div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Pages Management</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        <span className="font-semibold text-blue-600">{pages.length}</span> total pages · organised by hierarchy
                    </p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <input
                        type="text"
                        placeholder="🔍  Search pages…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 w-full sm:w-64 bg-white shadow-sm"
                    />
                    <button
                        onClick={() => setCreating(v => !v)}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm shadow-blue-200 hover:bg-blue-700 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        {creating ? 'Cancel' : 'New Page'}
                    </button>
                </div>
            </div>

            {creating && (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <h3 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">Create New Page</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input
                            value={newTitle}
                            onChange={e => setNewTitle(e.target.value)}
                            placeholder="Page title"
                            className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                        <input
                            value={newSlug}
                            onChange={e => setNewSlug(e.target.value)}
                            placeholder="slug (optional)"
                            className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={createPage}
                            className="bg-emerald-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-all"
                        >
                            Create Page
                        </button>
                    </div>
                </div>
            )}

            {/* Inline Editor panel */}
            <div ref={editorAnchorRef} className="scroll-mt-24">
                {editingPage && (
                    <InlinePageEditor
                        page={editingPage}
                        onClose={() => setEditingPage(null)}
                        onSaved={handleSaved}
                    />
                )}
            </div>

            {/* Grouped sections */}
            {groups.map((group) => (
                <div key={group.label}>
                    {/* Group header */}
                    <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-base font-extrabold text-gray-800">{group.label}</h2>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${group.badgeColor}`}>
                            {group.badge}
                        </span>
                        <span className="ml-auto text-xs text-gray-400 font-semibold">{group.pages.length} pages</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {group.pages.map(page => (
                            <PageCard
                                key={page.id}
                                page={page}
                                isEditing={editingPage?.id === page.id}
                                onToggleEdit={() => setEditingPage(editingPage?.id === page.id ? null : page)}
                                onTogglePublish={() => togglePublish(page.id, page.published)}
                                onDelete={() => deletePage(page.id)}
                            />
                        ))}
                    </div>
                </div>
            ))}

            {filtered.length === 0 && (
                <div className="text-center py-16 text-gray-400 text-sm bg-white rounded-2xl border border-dashed border-gray-200">
                    No pages match your search.
                </div>
            )}
            <p className="text-xs text-gray-400 text-right">Showing {filtered.length} of {pages.length} pages</p>
        </div>
    );
}

