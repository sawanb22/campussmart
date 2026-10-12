import { useEffect, useState } from 'react';
import {
    Plus,
    Pencil,
    Trash2,
    Eye,
    EyeOff,
    FileText,
    X,
    Check,
    Search,
    ExternalLink,
    FolderPlus,
    Sparkles,
} from 'lucide-react';
import api from '../api/client';
import MediaImageField from './MediaImageField';
import { resolveMediaUrl } from '../../lib/media-url';

interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string;
    body: string;
    imageUrl?: string;
    published: boolean;
    publishedAt?: string;
    createdAt: string;
    categoryId?: number;
    category?: Category;
    blogcategory?: Category;
}

interface BlogEditorSectionProps {
    data: Record<string, any>;
    set: (key: string, val: any) => void;
}

const EMPTY_POST: Partial<Post> = {
    title: '',
    excerpt: '',
    body: '',
    imageUrl: '',
    published: true,
    categoryId: undefined,
};

export default function BlogEditorSection({ data, set }: BlogEditorSectionProps) {
    const [posts, setPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingPost, setSavingPost] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [showPostModal, setShowPostModal] = useState(false);
    const [editingPost, setEditingPost] = useState<Partial<Post>>(EMPTY_POST);
    const [postError, setPostError] = useState('');

    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
    const [editingCategoryName, setEditingCategoryName] = useState('');
    const [savingCategory, setSavingCategory] = useState(false);

    const fetchAll = async () => {
        try {
            const [postsRes, catRes] = await Promise.all([
                api.get('/blog?all=true&limit=100'),
                api.get('/blog/categories'),
            ]);
            const rawPosts: Post[] = postsRes.data?.posts || [];
            setPosts(
                rawPosts.map((p) => ({
                    ...p,
                    category: p.category ?? p.blogcategory,
                }))
            );
            setCategories(Array.isArray(catRes.data) ? catRes.data : []);
        } catch (err) {
            console.error('Failed to load blog posts/categories:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const openAddPost = () => {
        setEditingPost({
            ...EMPTY_POST,
            categoryId: categories[0]?.id,
            published: true,
        });
        setPostError('');
        setShowPostModal(true);
    };

    const openEditPost = (post: Post) => {
        setEditingPost({
            ...post,
            categoryId: post.categoryId ?? post.category?.id,
        });
        setPostError('');
        setShowPostModal(true);
    };

    const handleSavePost = async () => {
        if (!editingPost.title?.trim()) {
            setPostError('Article Title is required.');
            return;
        }
        if (!editingPost.excerpt?.trim()) {
            setPostError('Short Excerpt / Summary is required.');
            return;
        }

        setSavingPost(true);
        setPostError('');
        try {
            const fd = new FormData();
            fd.append('title', editingPost.title.trim());
            fd.append('excerpt', (editingPost.excerpt || '').trim());
            fd.append('body', (editingPost.body || '').trim());
            fd.append('imageUrl', (editingPost.imageUrl || '').trim());
            fd.append('published', String(editingPost.published !== false));
            if (editingPost.categoryId) {
                fd.append('categoryId', String(editingPost.categoryId));
            }

            if (editingPost.id) {
                await api.put(`/blog/${editingPost.id}`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await api.post('/blog', fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            await fetchAll();
            setShowPostModal(false);
        } catch (err: any) {
            setPostError(err?.response?.data?.error || 'Failed to save article.');
        } finally {
            setSavingPost(false);
        }
    };

    const handleTogglePublished = async (post: Post) => {
        try {
            const fd = new FormData();
            fd.append('title', post.title);
            fd.append('excerpt', post.excerpt || '');
            fd.append('body', post.body || '');
            fd.append('imageUrl', post.imageUrl || '');
            fd.append('published', String(!post.published));
            if (post.categoryId ?? post.category?.id) {
                fd.append('categoryId', String(post.categoryId ?? post.category?.id));
            }
            await api.put(`/blog/${post.id}`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            await fetchAll();
        } catch (err) {
            console.error('Failed to toggle post status:', err);
        }
    };

    const handleDeletePost = async (post: Post) => {
        if (!window.confirm(`Delete article "${post.title}"?`)) return;
        try {
            await api.delete(`/blog/${post.id}`);
            await fetchAll();
        } catch (err) {
            console.error('Failed to delete post:', err);
        }
    };

    const handleCreateCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        setSavingCategory(true);
        try {
            await api.post('/blog/categories', { name: newCategoryName.trim() });
            setNewCategoryName('');
            await fetchAll();
        } finally {
            setSavingCategory(false);
        }
    };

    const handleSaveEditedCategory = async () => {
        if (!editingCategoryId || !editingCategoryName.trim()) return;
        setSavingCategory(true);
        try {
            await api.put(`/blog/categories/${editingCategoryId}`, {
                name: editingCategoryName.trim(),
            });
            setEditingCategoryId(null);
            setEditingCategoryName('');
            await fetchAll();
        } finally {
            setSavingCategory(false);
        }
    };

    const handleDeleteCategory = async (id: number) => {
        if (!window.confirm('Delete this category? Articles inside will become uncategorized.')) return;
        await api.delete(`/blog/categories/${id}`);
        await fetchAll();
    };

    // Determine which published post is #1 (Featured Hero)
    const firstPublishedId = posts.find((p) => p.published)?.id;
    const publishedCount = posts.filter((p) => p.published).length;

    const filteredPosts = posts.filter((p) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
            (p.title || '').toLowerCase().includes(q) ||
            (p.excerpt || '').toLowerCase().includes(q) ||
            (p.category?.name || '').toLowerCase().includes(q)
        );
    });

    return (
        <div className="space-y-10">
            {/* 1. Header Banner Content */}
            <section className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div>
                        <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">
                            Header Banner &amp; Search Bar
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Top editorial heading and search placeholder on <strong>/blog</strong>
                        </p>
                    </div>
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
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Eyebrow Tag</label>
                        <input
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                            value={data.heroEyebrow ?? ''}
                            onChange={(e) => set('heroEyebrow', e.target.value)}
                            placeholder="Campus Mart Articles"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Search Input Placeholder</label>
                        <input
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                            value={data.searchPlaceholder ?? ''}
                            onChange={(e) => set('searchPlaceholder', e.target.value)}
                            placeholder="Search articles..."
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Hero Heading *</label>
                        <input
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                            value={data.heroTitle ?? ''}
                            onChange={(e) => set('heroTitle', e.target.value)}
                            placeholder="Campus Insights & Ideas"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Hero Sub-heading</label>
                        <textarea
                            rows={2}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                            value={data.heroSubtitle ?? ''}
                            onChange={(e) => set('heroSubtitle', e.target.value)}
                            placeholder="Practical guidance on campus design, technology, and infrastructure..."
                        />
                    </div>
                </div>
            </section>

            {/* 2. Blog Articles & Categories Inventory (Product-Style Table + Modal) */}
            <section className="space-y-5">
                <div className="rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
                    {/* Top Bar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-50/70 border-b border-slate-200">
                        <div>
                            <div className="flex items-center gap-2.5">
                                <FileText className="w-4 h-4 text-blue-600" />
                                <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.18em]">
                                    Blog Articles &amp; Categories Inventory
                                </h4>
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800">
                                    {publishedCount} Published / {posts.length} Total
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">
                                The first published article automatically serves as the split <strong>Featured Hero Card</strong> on <strong>/blog</strong>; remaining published articles appear in the 3-column grid.
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                            <button
                                type="button"
                                onClick={() => setShowCategoryModal(true)}
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all shadow-2xs"
                            >
                                <FolderPlus className="w-4 h-4 text-blue-600" /> Categories ({categories.length})
                            </button>
                            <button
                                type="button"
                                onClick={openAddPost}
                                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                            >
                                <Plus className="w-4 h-4" /> New Article
                            </button>
                        </div>
                    </div>

                    {/* Category Filter Pills Preview + Search */}
                    <div className="px-5 py-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                                Categories:
                            </span>
                            {categories.map((cat) => (
                                <span
                                    key={cat.id}
                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200"
                                >
                                    {cat.name}
                                </span>
                            ))}
                        </div>
                        <div className="relative w-full sm:w-64">
                            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Filter articles..."
                                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="p-10 text-center text-xs text-slate-400">Loading articles from database…</div>
                    ) : filteredPosts.length === 0 ? (
                        <div className="p-10 text-center">
                            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm font-bold text-slate-700">No articles found</p>
                            <p className="text-xs text-slate-500 mt-1 mb-4">
                                Click &ldquo;New Article&rdquo; above to publish a blog post.
                            </p>
                            <button
                                type="button"
                                onClick={openAddPost}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                            >
                                <Plus className="w-4 h-4" /> New Article
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50/80 border-b border-slate-100">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-bold text-slate-500 text-[11px] uppercase tracking-wider">
                                            Article
                                        </th>
                                        <th className="px-4 py-3 text-left font-bold text-slate-500 text-[11px] uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th className="px-4 py-3 text-left font-bold text-slate-500 text-[11px] uppercase tracking-wider">
                                            Excerpt &amp; Body
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
                                    {filteredPosts.map((post) => {
                                        const isFeaturedHero = post.id === firstPublishedId && post.published;
                                        return (
                                            <tr
                                                key={post.id}
                                                className={`hover:bg-slate-50/80 transition-colors ${
                                                    !post.published ? 'opacity-65 bg-slate-50/40' : ''
                                                }`}
                                            >
                                                <td className="px-4 py-3.5">
                                                    <div className="flex items-center gap-3">
                                                        {post.imageUrl ? (
                                                            <img
                                                                src={resolveMediaUrl(post.imageUrl)}
                                                                alt={post.title}
                                                                className="w-12 h-12 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-100"
                                                            />
                                                        ) : (
                                                            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                                                                <FileText className="w-5 h-5" />
                                                            </div>
                                                        )}
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="font-bold text-slate-900 line-clamp-1">
                                                                    {post.title}
                                                                </span>
                                                                {isFeaturedHero && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                                                                        <Sparkles className="w-2.5 h-2.5" /> Featured Hero
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <a
                                                                href={`/blog/${post.slug}`}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:underline mt-0.5"
                                                            >
                                                                /blog/{post.slug} <ExternalLink className="w-2.5 h-2.5" />
                                                            </a>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                                        {post.category?.name || 'Uncategorized'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5 max-w-xs">
                                                    <p className="text-xs text-slate-600 line-clamp-2">{post.excerpt}</p>
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 mt-1">
                                                        <FileText className="w-3 h-3" />
                                                        {post.body && post.body.trim().length > 0
                                                            ? `${post.body.trim().split(/\s+/).length} words`
                                                            : 'No body text'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleTogglePublished(post)}
                                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
                                                            post.published
                                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                                                : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                                                        }`}
                                                    >
                                                        {post.published ? (
                                                            <>
                                                                <Eye className="w-3 h-3" /> Published
                                                            </>
                                                        ) : (
                                                            <>
                                                                <EyeOff className="w-3 h-3" /> Draft
                                                            </>
                                                        )}
                                                    </button>
                                                </td>
                                                <td className="px-4 py-3.5 text-right">
                                                    <div className="inline-flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => openEditPost(post)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" /> Edit
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeletePost(post)}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Delete Article"
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
            </section>

            {/* 3. Featured Story & Articles Grid Section Controls */}
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-5 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200/80">
                        <div>
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.16em]">
                                Featured Story Hero Card
                            </h4>
                            <p className="text-[11px] text-gray-500 mt-0.5">Top split card on /blog</p>
                        </div>
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
                            {data.hideFeatured ? 'Hidden' : 'Live'}
                        </button>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Featured Action Link Label
                        </label>
                        <input
                            className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                            value={data.featuredReadMoreLabel ?? ''}
                            onChange={(e) => set('featuredReadMoreLabel', e.target.value)}
                            placeholder="Read article"
                        />
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50/50 p-5 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-gray-200/80">
                        <div>
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.16em]">
                                Articles Grid Section
                            </h4>
                            <p className="text-[11px] text-gray-500 mt-0.5">3-column editorial grid on /blog</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => set('hideArticles', !data.hideArticles)}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                data.hideArticles
                                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                            }`}
                        >
                            {data.hideArticles ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            {data.hideArticles ? 'Hidden' : 'Live'}
                        </button>
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Grid Section Heading
                        </label>
                        <input
                            className="w-full border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                            value={data.latestArticlesHeading ?? ''}
                            onChange={(e) => set('latestArticlesHeading', e.target.value)}
                            placeholder="Latest Articles"
                        />
                    </div>
                </div>
            </section>

            {/* 4. Newsletter Subscription Banner */}
            <section className="space-y-6">
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-[0.2em]">
                        Newsletter Subscription Banner
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
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Eyebrow Tag</label>
                        <input
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                            value={data.newsletterLabel ?? ''}
                            onChange={(e) => set('newsletterLabel', e.target.value)}
                            placeholder="Stay curious"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Section Heading</label>
                        <input
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                            value={data.newsletterTitle ?? ''}
                            onChange={(e) => set('newsletterTitle', e.target.value)}
                            placeholder="Good ideas, occasionally."
                        />
                    </div>
                    <div className="md:col-span-2 space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Section Description</label>
                        <textarea
                            rows={2}
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                            value={data.newsletterDescription ?? ''}
                            onChange={(e) => set('newsletterDescription', e.target.value)}
                            placeholder="Get useful campus infrastructure perspectives..."
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Email Input Placeholder</label>
                        <input
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                            value={data.newsletterPlaceholder ?? ''}
                            onChange={(e) => set('newsletterPlaceholder', e.target.value)}
                            placeholder="Your email address"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="block text-sm font-bold text-gray-700">Subscribe Button Label</label>
                        <input
                            className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                            value={data.newsletterButtonLabel ?? ''}
                            onChange={(e) => set('newsletterButtonLabel', e.target.value)}
                            placeholder="Subscribe"
                        />
                    </div>
                </div>
            </section>

            {/* Add / Edit Article Modal */}
            {showPostModal && (
                <div
                    className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs overflow-y-auto"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-slate-900">
                                        {editingPost.id ? 'Edit Blog Article' : 'Add New Blog Article'}
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                        Saved directly to PostgreSQL and published on /blog
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowPostModal(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
                            {postError && (
                                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-600">
                                    {postError}
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Article Title *
                                    </label>
                                    <input
                                        type="text"
                                        value={editingPost.title || ''}
                                        onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                                        placeholder="e.g. Designing Modern Learning Environments for Next-Gen Campuses"
                                        className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                        Category
                                    </label>
                                    <select
                                        value={editingPost.categoryId || ''}
                                        onChange={(e) =>
                                            setEditingPost({
                                                ...editingPost,
                                                categoryId: e.target.value ? Number(e.target.value) : undefined,
                                            })
                                        }
                                        className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                    >
                                        <option value="">— Select Category —</option>
                                        {categories.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <MediaImageField
                                    label="Cover Image"
                                    value={editingPost.imageUrl || ''}
                                    onChange={(val) => setEditingPost({ ...editingPost, imageUrl: val })}
                                    previewClassName="h-36 rounded-xl"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Short Excerpt / Summary *
                                </label>
                                <textarea
                                    rows={2}
                                    value={editingPost.excerpt || ''}
                                    onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                                    placeholder="Brief summary shown on the /blog card and article lead..."
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                                    Full Article Body
                                </label>
                                <textarea
                                    rows={7}
                                    value={editingPost.body || ''}
                                    onChange={(e) => setEditingPost({ ...editingPost, body: e.target.value })}
                                    placeholder="Write the full article content here..."
                                    className="w-full border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                                />
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                                <div>
                                    <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                                        Publication Status
                                    </span>
                                    <span className="text-xs text-slate-500">
                                        Published articles appear immediately on /blog
                                    </span>
                                </div>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setEditingPost({
                                            ...editingPost,
                                            published: editingPost.published === false ? true : false,
                                        })
                                    }
                                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                                        editingPost.published !== false
                                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                                    }`}
                                >
                                    {editingPost.published !== false ? (
                                        <Eye className="w-3.5 h-3.5" />
                                    ) : (
                                        <EyeOff className="w-3.5 h-3.5" />
                                    )}
                                    {editingPost.published !== false ? 'Published on Website' : 'Draft / Hidden'}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={() => setShowPostModal(false)}
                                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSavePost}
                                disabled={savingPost}
                                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-sm disabled:opacity-60"
                            >
                                <Check className="w-4 h-4" />
                                {savingPost
                                    ? 'Saving…'
                                    : editingPost.id
                                      ? 'Update Article'
                                      : 'Publish Article'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Manage Categories Modal */}
            {showCategoryModal && (
                <div
                    className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-150">
                        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-100">
                            <h3 className="text-base font-bold text-slate-900">Manage Blog Categories</h3>
                            <button
                                type="button"
                                onClick={() => setShowCategoryModal(false)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-5">
                            <form onSubmit={handleCreateCategory} className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="New category name..."
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    className="flex-1 border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:border-blue-500"
                                />
                                <button
                                    type="submit"
                                    disabled={savingCategory || !newCategoryName.trim()}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl disabled:opacity-50"
                                >
                                    Add
                                </button>
                            </form>

                            <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl">
                                {categories.length === 0 ? (
                                    <p className="p-4 text-center text-xs text-slate-400">No categories yet.</p>
                                ) : (
                                    categories.map((c) => (
                                        <div key={c.id} className="flex items-center justify-between px-3.5 py-2.5 text-sm">
                                            {editingCategoryId === c.id ? (
                                                <div className="flex items-center gap-2 flex-1 mr-2">
                                                    <input
                                                        type="text"
                                                        value={editingCategoryName}
                                                        onChange={(e) => setEditingCategoryName(e.target.value)}
                                                        className="flex-1 border border-slate-300 rounded-lg px-2.5 py-1 text-xs"
                                                        autoFocus
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={handleSaveEditedCategory}
                                                        className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setEditingCategoryId(null)}
                                                        className="p-1 text-slate-400 hover:bg-slate-100 rounded"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span className="font-semibold text-slate-700 text-xs">{c.name}</span>
                                                    <div className="flex items-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setEditingCategoryId(c.id);
                                                                setEditingCategoryName(c.name);
                                                            }}
                                                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                                        >
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteCategory(c.id)}
                                                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
