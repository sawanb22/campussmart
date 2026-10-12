import { useState } from 'react';
import {
    Plus,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    BookOpen,
    X,
    Check,
    Search,
    ExternalLink,
    FileText,
} from 'lucide-react';
import MediaImageField from './MediaImageField';
import { resolveMediaUrl } from '../../lib/media-url';

export interface CaseStudyItem {
    id?: string;
    title: string;
    slug?: string;
    category?: string;
    description: string;
    body?: string;
    image?: string;
    active?: boolean;
}

interface CaseStudiesEditorSectionProps {
    data: Record<string, any>;
    set: (key: string, val: any) => void;
    onSyncCaseStudies?: (nextCaseStudies: CaseStudyItem[]) => Promise<void> | void;
}

const slugify = (text: string) =>
    text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'case-study';

const EMPTY_STUDY: CaseStudyItem = {
    title: '',
    slug: '',
    category: 'Case Study',
    description: '',
    body: '',
    image: '',
    active: true,
};

export default function CaseStudiesEditorSection({
    data,
    set,
    onSyncCaseStudies,
}: CaseStudiesEditorSectionProps) {
    const caseStudies: CaseStudyItem[] = Array.isArray(data.caseStudies) ? data.caseStudies : [];

    const [searchQuery, setSearchQuery] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [form, setForm] = useState<CaseStudyItem>(EMPTY_STUDY);
    const [formError, setFormError] = useState('');
    const [syncing, setSyncing] = useState(false);

    const persistCaseStudies = async (nextList: CaseStudyItem[]) => {
        set('caseStudies', nextList);
        if (onSyncCaseStudies) {
            setSyncing(true);
            try {
                await onSyncCaseStudies(nextList);
            } finally {
                setSyncing(false);
            }
        }
    };

    const openAddModal = () => {
        setEditingIndex(null);
        setForm({
            ...EMPTY_STUDY,
            id: `cs-${Date.now()}`,
        });
        setFormError('');
        setModalOpen(true);
    };

    const openEditModal = (index: number) => {
        const item = caseStudies[index];
        if (!item) return;
        setEditingIndex(index);
        setForm({
            id: item.id || `cs-${index + 1}`,
            title: item.title || '',
            slug: item.slug || slugify(item.title || ''),
            category: item.category || 'Case Study',
            description: item.description || '',
            body: item.body || '',
            image: item.image || '',
            active: item.active !== false,
        });
        setFormError('');
        setModalOpen(true);
    };

    const handleSaveStudy = async () => {
        if (!form.title.trim()) {
            setFormError('Project Title is required.');
            return;
        }
        if (!form.description.trim()) {
            setFormError('Short Summary Description is required.');
            return;
        }

        const cleanItem: CaseStudyItem = {
            id: form.id || `cs-${Date.now()}`,
            title: form.title.trim(),
            slug: (form.slug || '').trim() ? slugify(form.slug!) : slugify(form.title.trim()),
            category: (form.category || 'Case Study').trim(),
            description: form.description.trim(),
            body: (form.body || '').trim(),
            image: (form.image || '').trim(),
            active: form.active !== false,
        };

        const nextList = [...caseStudies];
        if (editingIndex !== null && editingIndex >= 0 && editingIndex < nextList.length) {
            nextList[editingIndex] = cleanItem;
        } else {
            nextList.push(cleanItem);
        }

        setModalOpen(false);
        await persistCaseStudies(nextList);
    };

    const handleToggleActive = async (index: number) => {
        const nextList = caseStudies.map((item, idx) =>
            idx === index ? { ...item, active: item.active === false ? true : false } : item
        );
        await persistCaseStudies(nextList);
    };

    const handleDeleteStudy = async (index: number) => {
        const target = caseStudies[index];
        if (!target) return;
        if (!window.confirm(`Delete case study "${target.title}"?`)) return;
        const nextList = caseStudies.filter((_, idx) => idx !== index);
        await persistCaseStudies(nextList);
    };

    const filteredStudies = caseStudies
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => {
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return (
                (item.title || '').toLowerCase().includes(q) ||
                (item.category || '').toLowerCase().includes(q) ||
                (item.description || '').toLowerCase().includes(q)
            );
        });

    const activeCount = caseStudies.filter((c) => c.active !== false).length;

    return (
        <section className="space-y-6 pt-4 border-t border-gray-100">
            {/* Section Header & Visibility Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-gray-100">
                <div>
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">
                        Case Studies / Projects Showcase{' '}
                        <span className="text-purple-600 ml-1">({caseStudies.length})</span>
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Showcased on <strong>/catalogues</strong> and opened as full articles at <strong>/case-studies/:slug</strong>
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => set('hideCaseStudies', !data.hideCaseStudies)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all self-start sm:self-auto ${
                        data.hideCaseStudies
                            ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                >
                    {data.hideCaseStudies ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    {data.hideCaseStudies ? 'Hidden / Draft' : 'Live on Page'}
                </button>
            </div>

            {/* Section Headings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80">
                <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Section Eyebrow
                    </label>
                    <input
                        className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                        value={data.caseStudiesEyebrow ?? ''}
                        onChange={(e) => set('caseStudiesEyebrow', e.target.value)}
                        placeholder="Proven Transformations"
                    />
                </div>
                <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Section Heading
                    </label>
                    <input
                        className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                        value={data.caseStudiesTitle ?? ''}
                        onChange={(e) => set('caseStudiesTitle', e.target.value)}
                        placeholder="Campus Case Studies"
                    />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Section Subtitle
                    </label>
                    <input
                        className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                        value={data.caseStudiesSubtitle ?? ''}
                        onChange={(e) => set('caseStudiesSubtitle', e.target.value)}
                        placeholder="Explore real-world implementations delivered across leading institutions."
                    />
                </div>
            </div>

            {/* Case Studies Inventory Table Card */}
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50/70 border-b border-slate-200">
                    <div>
                        <div className="flex items-center gap-2.5">
                            <BookOpen className="w-4 h-4 text-purple-600" />
                            <h5 className="text-xs font-black text-slate-800 uppercase tracking-[0.18em]">
                                Case Studies Inventory
                            </h5>
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
                                {activeCount} Live / {caseStudies.length} Total
                            </span>
                            {syncing && (
                                <span className="text-[11px] font-semibold text-purple-600 animate-pulse">
                                    Saving to database…
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                            Add, edit, or toggle case studies. Each item automatically generates its detail article page.
                        </p>
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={openAddModal}
                            className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0"
                        >
                            <Plus className="w-4 h-4" /> Add Case Study
                        </button>
                    </div>
                </div>

                {/* Search Toolbar */}
                {caseStudies.length > 0 && (
                    <div className="px-5 py-3 border-b border-slate-100 bg-white flex items-center justify-between gap-4">
                        <div className="relative flex-1 max-w-sm">
                            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search case studies by title or category..."
                                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-purple-500"
                            />
                        </div>
                        <span className="text-[11px] text-slate-400 font-medium">
                            Showing {filteredStudies.length} of {caseStudies.length} projects
                        </span>
                    </div>
                )}

                {/* Table */}
                {filteredStudies.length === 0 ? (
                    <div className="p-10 text-center">
                        <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm font-bold text-slate-700">
                            {caseStudies.length === 0 ? 'No case studies in database yet' : 'No matching case studies'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1 mb-4">
                            {caseStudies.length === 0
                                ? 'Click "Add Case Study" above to publish your first project showcase.'
                                : 'Try clearing your search filter.'}
                        </p>
                        {caseStudies.length === 0 && (
                            <button
                                type="button"
                                onClick={openAddModal}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                            >
                                <Plus className="w-4 h-4" /> Add First Case Study
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50/80 border-b border-slate-100">
                                <tr>
                                    <th className="px-4 py-3 text-left font-bold text-slate-500 text-[11px] uppercase tracking-wider">
                                        Project
                                    </th>
                                    <th className="px-4 py-3 text-left font-bold text-slate-500 text-[11px] uppercase tracking-wider">
                                        Category
                                    </th>
                                    <th className="px-4 py-3 text-left font-bold text-slate-500 text-[11px] uppercase tracking-wider">
                                        Summary &amp; Article
                                    </th>
                                    <th className="px-4 py-3 text-left font-bold text-slate-500 text-[11px] uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-4 py-3 text-right font-bold text-slate-500 text-[11px] uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredStudies.map(({ item, index }) => {
                                    const isActive = item.active !== false;
                                    const itemSlug = item.slug || slugify(item.title);
                                    return (
                                        <tr
                                            key={item.id || index}
                                            className={`hover:bg-slate-50/80 transition-colors ${
                                                !isActive ? 'opacity-60 bg-slate-50/40' : ''
                                            }`}
                                        >
                                            <td className="px-4 py-3.5">
                                                <div className="flex items-center gap-3">
                                                    {item.image ? (
                                                        <img
                                                            src={resolveMediaUrl(item.image)}
                                                            alt={item.title}
                                                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                                                        />
                                                    ) : (
                                                        <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
                                                            <BookOpen className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                    <div className="min-w-0">
                                                        <div className="font-bold text-slate-900 line-clamp-1">
                                                            {item.title}
                                                        </div>
                                                        <a
                                                            href={`/case-studies/${itemSlug}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center gap-1 text-[11px] text-purple-600 hover:underline mt-0.5"
                                                        >
                                                            /case-studies/{itemSlug} <ExternalLink className="w-2.5 h-2.5" />
                                                        </a>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                                    {item.category || 'Case Study'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5 max-w-xs">
                                                <p className="text-xs text-slate-600 line-clamp-2">{item.description}</p>
                                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 mt-1">
                                                    <FileText className="w-3 h-3" />
                                                    {item.body && item.body.trim().length > 0
                                                        ? `Full article (${item.body.trim().split(/\s+/).length} words)`
                                                        : 'Summary only'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3.5">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleActive(index)}
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                                                        isActive
                                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                                            : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                                                    }`}
                                                >
                                                    {isActive ? (
                                                        <>
                                                            <Eye className="w-3 h-3" /> Live
                                                        </>
                                                    ) : (
                                                        <>
                                                            <EyeOff className="w-3 h-3" /> Hidden
                                                        </>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3.5 text-right">
                                                <div className="inline-flex items-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditModal(index)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                                                    >
                                                        <Pencil className="w-3.5 h-3.5" /> Edit
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDeleteStudy(index)}
                                                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Delete Case Study"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Add / Edit Case Study Modal */}
            {modalOpen && (
                <div
                    className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-purple-600 text-white flex items-center justify-center">
                                    <BookOpen className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">
                                        {editingIndex !== null ? 'Edit Case Study' : 'Add New Case Study'}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Configure card details and full article content for /case-studies/:slug
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                            {formError && (
                                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
                                    {formError}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Project Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(e) =>
                                            setForm({
                                                ...form,
                                                title: e.target.value,
                                                slug:
                                                    editingIndex === null
                                                        ? slugify(e.target.value)
                                                        : form.slug || slugify(e.target.value),
                                            })
                                        }
                                        placeholder="e.g. Campus Master Planning"
                                        className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Category / Badge Tag
                                    </label>
                                    <input
                                        type="text"
                                        value={form.category ?? ''}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        placeholder="e.g. Master Planning"
                                        className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        URL Slug
                                    </label>
                                    <input
                                        type="text"
                                        value={form.slug ?? ''}
                                        onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                        placeholder="campus-master-planning"
                                        className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <MediaImageField
                                    label="Cover Image or Video"
                                    value={form.image ?? ''}
                                    onChange={(val) => setForm({ ...form, image: val })}
                                    previewClassName="h-36 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Short Summary Description *
                                </label>
                                <textarea
                                    rows={2}
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Brief summary displayed on the card and at the top of the case study page..."
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Full Case Study Article / Body
                                </label>
                                <textarea
                                    rows={6}
                                    value={form.body ?? ''}
                                    onChange={(e) => setForm({ ...form, body: e.target.value })}
                                    placeholder="Write the full project story, scope of work, challenges solved, and outcomes achieved..."
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
                                />
                                <p className="text-[11px] text-slate-400 mt-1">
                                    Displayed on the dedicated <strong>/case-studies/{form.slug || slugify(form.title || 'project')}</strong> page when a visitor clicks &ldquo;Read Case Study&rdquo;.
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <div>
                                    <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Visibility Status
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        Control whether this case study is immediately visible on /catalogues
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, active: !form.active })}
                                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                                        form.active
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                    }`}
                                >
                                    {form.active ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                                    {form.active ? 'Live on Website' : 'Hidden / Draft'}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSaveStudy}
                                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors shadow-sm"
                            >
                                <Check className="w-4 h-4" />
                                {editingIndex !== null ? 'Update Case Study' : 'Add Case Study'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
