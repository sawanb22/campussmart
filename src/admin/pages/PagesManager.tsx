import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, EyeOff, Pencil, X, Plus, Trash2, ExternalLink } from 'lucide-react';
import api from '../api/client';
import UnifiedPageEditor, { type Page } from '../components/UnifiedPageEditor';

// ─── Page hierarchy classification ───────────────────────────────────────────
// Main top-level pages that appear in primary navigation
const MAIN_SLUGS = new Set([
    'home', 'about-us', 'contact-us', 'blog', 'shop', 'services',
    'solutions', 'corporate', 'catalogues', 'classifieds', 'login',
    'registration', 'my-account', 'request-quote', 'not-found',
    'privacy-policy', 'terms-of-use', 'payment-policy', 'replacement-return',
    'order-rejection', 'partnership', 'job-openings', 'partner-with-colleges', 'lookbook', 'ugc-guidelines',
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
        <div className={`bg-white rounded-2xl border transition-all shadow-sm hover:shadow-md overflow-hidden flex flex-col justify-between ${
            isEditing ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200 hover:border-gray-300'
        }`}>
            <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                    {/* Header: Status, Template, and Dedicated Hub Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                            <button
                                onClick={onTogglePublish}
                                title="Toggle publish status"
                                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-colors cursor-pointer ${
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
                            {page.slug === 'home' && (
                                <Link
                                    to="/admin/homepage-editor"
                                    className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 text-purple-700 hover:bg-purple-100 px-2 py-0.5 rounded-md transition-colors"
                                    title="Open Dedicated Homepage Visual Editor"
                                >
                                    Visual Editor ↗
                                </Link>
                            )}
                            {page.slug === 'catalogues' && (
                                <Link
                                    to="/admin/catalogues"
                                    className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2 py-0.5 rounded-md transition-colors"
                                    title="Open PDF Catalogues Manager"
                                >
                                    PDF Manager ↗
                                </Link>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            <a
                                href={`/${page.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View live page in new tab"
                            >
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                            <button
                                onClick={onDelete}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete page"
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Page Details */}
                    <h3 className="font-bold text-gray-900 text-sm mb-1 leading-snug line-clamp-1" title={page.title}>
                        {page.title}
                    </h3>
                    <p className="text-xs text-gray-400 font-mono truncate" title={`/${page.slug}`}>
                        /{page.slug}
                    </p>
                </div>
            </div>

            {/* Primary Action Buttons: Dual Split Row */}
            <div className="border-t border-gray-100 bg-gray-50/70 p-3 grid grid-cols-2 gap-2">
                <Link
                    to={`/admin/pages/${page.id}/edit`}
                    className="inline-flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-semibold rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all shadow-xs"
                    title="Open full standalone page editor"
                >
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">Full Editor</span>
                </Link>
                <button
                    onClick={onToggleEdit}
                    className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-2 text-xs font-bold rounded-xl transition-all shadow-xs ${
                        isEditing
                            ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
                    }`}
                >
                    {isEditing ? (
                        <>
                            <X className="w-3.5 h-3.5 shrink-0" />
                            <span>Close</span>
                        </>
                    ) : (
                        <>
                            <Pencil className="w-3.5 h-3.5 shrink-0" />
                            <span>Quick Edit</span>
                        </>
                    )}
                </button>
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
        <div className="max-w-7xl mx-auto space-y-8">
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

            {/* Inline / Quick Editor panel */}
            <div ref={editorAnchorRef} className="scroll-mt-24">
                {editingPage && (
                    <UnifiedPageEditor
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
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
