import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, X, FolderPlus } from 'lucide-react';
import api from '../api/client';
import MediaImageField from '../components/MediaImageField';

interface Category { id: number; name: string; slug: string; }
interface Post { id: number; title: string; slug: string; excerpt: string; body: string; imageUrl?: string; published: boolean; publishedAt?: string; createdAt: string; categoryId?: number; category?: Category; blogcategory?: Category; }

const EMPTY: Partial<Post> = { title: '', excerpt: '', body: '', imageUrl: '', published: false, categoryId: undefined };

export default function Blog() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [editing, setEditing] = useState<Partial<Post>>(EMPTY);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetchAll = async () => {
        const [postsRes, catRes] = await Promise.all([
            api.get('/blog?all=true&limit=100'),
            api.get('/blog/categories')
        ]);
        setPosts(postsRes.data.posts.map((post: Post) => ({ ...post, category: post.category ?? post.blogcategory })));
        setCategories(catRes.data);
        setLoading(false);
    };

    useEffect(() => { fetchAll(); }, []);

    const openAdd = () => { setEditing(EMPTY); setShowModal(true); };
    const openEdit = (p: Post) => { setEditing({ ...p, categoryId: p.categoryId ?? p.category?.id }); setShowModal(true); };

    const save = async () => {
        setSaving(true);
        try {
            const fd = new FormData();
            Object.entries(editing).forEach(([k, v]) => { if (v !== undefined) fd.append(k, String(v)); });
            if (editing.id) { await api.put(`/blog/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }); }
            else { await api.post('/blog', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); }
            await fetchAll();
            setShowModal(false);
        } finally { setSaving(false); }
    };

    const deletePost = async (id: number) => {
        if (!confirm('Delete this post?')) return;
        await api.delete(`/blog/${id}`);
        await fetchAll();
    };

    const saveCategory = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCategoryName.trim()) return;
        setSaving(true);
        try {
            await api.post('/blog/categories', { name: newCategoryName });
            setNewCategoryName('');
            await fetchAll();
        } finally {
            setSaving(false);
        }
    };

    const deleteCategory = async (id: number) => {
        if (!confirm('Delete this category? Posts inside will become uncategorized.')) return;
        await api.delete(`/blog/categories/${id}`);
        await fetchAll();
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div><h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1><p className="text-gray-500 text-sm mt-1">{posts.length} posts & {categories.length} categories</p></div>
                <div className="flex items-center gap-3">
                    <button onClick={() => setShowCategoryModal(true)} className="btn-secondary flex items-center gap-2"><FolderPlus className="w-4 h-4" /> Manage Categories</button>
                    <button onClick={openAdd} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> New Post</button>
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>{['Image', 'Title', 'Category', 'Status', 'Date', 'Actions'].map((h) => <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">{h}</th>)}</tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Loading...</td></tr>
                            : posts.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3"><img src={p.imageUrl || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded-lg object-cover" /></td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-gray-900 max-w-[200px] truncate">{p.title}</div>
                                        <div className="text-gray-500 text-xs max-w-[200px] truncate">{p.excerpt}</div>
                                    </td>
                                    <td className="px-4 py-3"><span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold">{p.category?.name || 'Uncategorized'}</span></td>
                                    <td className="px-4 py-3"><span className={p.published ? 'badge-green' : 'badge-yellow'}>{p.published ? 'Published' : 'Draft'}</span></td>
                                    <td className="px-4 py-3 text-gray-500 text-xs">{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('en-IN') : '—'}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
                                            <button onClick={() => deletePost(p.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>

            {/* Post Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b shrink-0">
                            <h2 className="text-lg font-bold">{editing.id ? 'Edit Post' : 'New Blog Post'}</h2>
                            <button onClick={() => setShowModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div><label className="form-label">Title *</label><input className="form-input" value={editing.title || ''} onChange={(e) => setEditing({ ...editing, title: e.target.value })} /></div>
                            <div>
                                <label className="form-label">Category</label>
                                <div className="flex gap-2">
                                <select className="form-input bg-white flex-1" value={editing.categoryId || ''} onChange={(e) => setEditing({ ...editing, categoryId: e.target.value ? Number(e.target.value) : undefined })}>
                                    <option value="">-- Uncategorized --</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <button type="button" onClick={() => setShowCategoryModal(true)} className="btn-secondary whitespace-nowrap"><FolderPlus className="w-4 h-4" /> Add Category</button>
                                </div>
                            </div>
                            <div><label className="form-label">Excerpt *</label><textarea className="form-input" rows={2} value={editing.excerpt || ''} onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })} /></div>
                            <div><label className="form-label">Body *</label><textarea className="form-input" rows={10} value={editing.body || ''} onChange={(e) => setEditing({ ...editing, body: e.target.value })} placeholder="Write your article content here..." /></div>
                            <MediaImageField label="Featured Image" value={editing.imageUrl || ''} onChange={value => setEditing({ ...editing, imageUrl: value })} previewClassName="h-40" />
                            <div className="pb-2">
                                <label className="flex items-center gap-2 cursor-pointer inline-flex">
                                    <input type="checkbox" checked={!!editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} />
                                    <span className="text-sm font-medium">Published</span>
                                </label>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-6 border-t shrink-0">
                            <button onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                            <button onClick={save} disabled={saving} className="btn-primary">{saving ? 'Saving...' : 'Save Post'}</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Category Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b shrink-0">
                            <h2 className="text-lg font-bold">Manage Categories</h2>
                            <button onClick={() => setShowCategoryModal(false)}><X className="w-5 h-5 text-gray-500" /></button>
                        </div>
                        <div className="p-6 overflow-y-auto min-h-[300px]">
                            <ul className="space-y-3 mb-6">
                                {categories.length === 0 && <li className="text-gray-400 text-sm text-center py-4">No categories yet.</li>}
                                {categories.map(c => (
                                    <li key={c.id} className="flex flex-col sm:flex-row items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                                        <span className="font-semibold text-gray-800">{c.name} <span className="text-xs text-gray-400 font-normal block sm:inline">({c.slug})</span></span>
                                        <button onClick={() => deleteCategory(c.id)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg mt-2 sm:mt-0 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </li>
                                ))}
                            </ul>
                            <div className="border-t pt-5">
                                <form onSubmit={saveCategory} className="flex gap-2">
                                    <input required placeholder="New Category Name" className="form-input flex-1" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} />
                                    <button disabled={saving} type="submit" className="btn-primary px-4 whitespace-nowrap">Add</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
