import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2, Pencil, X, BookMarked, Layers, ArrowRight } from 'lucide-react';
import api from '../api/client';
import MediaImageField from '../components/MediaImageField';
import AdminStateContainer from '../components/AdminStateContainer';
import { resolveMediaUrl } from '../../lib/media-url';

interface CaseStudy {
    id: number;
    title: string;
    slug: string;
    description?: string;
    body?: string;
    imageUrl?: string;
    active: boolean;
    createdAt: string;
}

const EMPTY: Partial<CaseStudy> = {
    title: '',
    description: '',
    body: '',
    imageUrl: '',
};

export default function CaseStudies() {
    const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Partial<CaseStudy>>(EMPTY);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/case-studies');
            setCaseStudies(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Failed to load case studies:', err);
            setError(err.response?.data?.error || 'Failed to load case studies. Please retry.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAll();
    }, []);

    const openAdd = () => {
        setEditing(EMPTY);
        setShowModal(true);
    };

    const openEdit = (study: CaseStudy) => {
        setEditing(study);
        setShowModal(true);
    };

    const save = async () => {
        if (!editing.title?.trim()) return;

        setSaving(true);

        try {
            const payload = new FormData();
            payload.append('title', editing.title);
            payload.append('description', editing.description || '');
            payload.append('body', editing.body || '');
            if (editing.imageUrl) payload.append('imageUrl', editing.imageUrl);

            if (editing.id) {
                await api.put(`/case-studies/${editing.id}`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await api.post('/case-studies', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            await fetchAll();
            setShowModal(false);
            setEditing(EMPTY);
        } finally {
            setSaving(false);
        }
    };

    const deleteCaseStudy = async (id: number) => {
        if (!confirm('Hide this case study?')) return;

        await api.delete(`/case-studies/${id}`);
        setCaseStudies((prev) => prev.filter((c) => c.id !== id));
    };

    return (
        <div className="p-8">
            {/* Top Ecosystem Tab Switcher */}
            <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-3 mb-6">
                <Link
                    to="/admin/catalogues"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                    <BookMarked className="w-4 h-4 text-gray-500" />
                    PDF Catalogues (Downloads)
                </Link>
                <Link
                    to="/admin/case-studies"
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white shadow-sm"
                >
                    <Layers className="w-4 h-4" />
                    Case Studies &amp; Projects (Showcase)
                </Link>
            </div>

            {/* Contextual Guidance Notice */}
            <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs text-blue-900">
                    <strong className="font-bold">Project Case Studies:</strong> These articles appear on the public <code className="bg-blue-100/80 px-1 py-0.5 rounded text-blue-950 font-mono">/catalogues</code> page under "Proven Transformations · Campus Case Studies" and at <code className="bg-blue-100/80 px-1 py-0.5 rounded text-blue-950 font-mono">/case-studies/:slug</code>.
                </div>
                <Link
                    to="/admin/catalogues"
                    className="shrink-0 inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline"
                >
                    <span>Upload PDF Catalogues</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                </Link>
            </div>

            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Case Studies &amp; Projects</h1>
                    <p className="text-gray-500 text-sm mt-1">Institutional project stories showcased on the public Catalogues page</p>
                </div>

                <button onClick={openAdd} className="btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    New Case Study
                </button>
            </div>

            <AdminStateContainer
                loading={loading}
                error={error}
                onRetry={fetchAll}
                cachePrefix="/case-studies"
                loadingMessage="Loading case studies..."
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {caseStudies.map((c) => (
                        <div key={c.id} className="card flex flex-col">
                            {c.imageUrl && (
                                <img
                                    src={resolveMediaUrl(c.imageUrl)}
                                    alt={c.title}
                                    className="w-full h-40 object-cover rounded-lg mb-4"
                                />
                            )}

                            <div className="flex-1">
                                <div className="font-semibold text-gray-900">{c.title}</div>
                                <div className="text-sm text-gray-500 mt-1 line-clamp-2">{c.description}</div>
                                <div className="text-xs text-gray-400 mt-2">
                                    {new Date(c.createdAt).toLocaleDateString('en-IN')}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-4">
                                <button
                                    onClick={() => openEdit(c)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200 flex-1 flex items-center justify-center gap-1 text-xs"
                                >
                                    <Pencil className="w-3.5 h-3.5" /> Edit
                                </button>

                                <button
                                    onClick={() => deleteCaseStudy(c.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {caseStudies.length === 0 && (
                        <div className="col-span-3 card text-center text-gray-400 py-8">
                            No case studies yet.
                        </div>
                    )}
                </div>
            </AdminStateContainer>

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="flex items-center justify-between p-6 border-b shrink-0">
                            <h2 className="text-lg font-bold">
                                {editing.id ? 'Edit Case Study' : 'New Case Study'}
                            </h2>

                            <button type="button" onClick={() => setShowModal(false)}>
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="form-label">Title *</label>
                                <input
                                    className="form-input"
                                    value={editing.title || ''}
                                    onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="form-label">Description</label>
                                <textarea
                                    className="form-input"
                                    rows={2}
                                    value={editing.description || ''}
                                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                                    placeholder="Short summary shown on the card"
                                />
                            </div>

                            <div>
                                <label className="form-label">Full Story</label>
                                <textarea
                                    className="form-input"
                                    rows={8}
                                    value={editing.body || ''}
                                    onChange={(e) => setEditing({ ...editing, body: e.target.value })}
                                    placeholder="Full write-up shown on the case study's own page"
                                />
                            </div>

                            <MediaImageField
                                label="Image"
                                value={editing.imageUrl || ''}
                                onChange={(imageUrl) => setEditing({ ...editing, imageUrl })}
                                previewClassName="h-32"
                            />
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t shrink-0">
                            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                                Cancel
                            </button>

                            <button type="button" onClick={save} disabled={saving} className="btn-primary">
                                {saving ? 'Saving...' : editing.id ? 'Save Case Study' : 'Add Case Study'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
