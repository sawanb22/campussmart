import { useEffect, useState, useRef } from 'react';
import { Plus, Trash2, ExternalLink, X, Pencil, Upload, Loader2 } from 'lucide-react';
import api from '../api/client';
import MediaImageField from '../components/MediaImageField';
import { resolveMediaUrl } from '../../lib/media-url';

interface Catalogue {
    id: number;
    title: string;
    description?: string;
    fileUrl: string;
    thumbnailUrl?: string;
    active: boolean;
    createdAt: string;
}

const EMPTY = {
    title: '',
    description: '',
    fileUrl: '',
    thumbnailUrl: ''
};

const fileUrl = resolveMediaUrl;

export default function Catalogues() {
    const [catalogues, setCatalogues] = useState<Catalogue[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(EMPTY);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const pdfInputRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const fetch = async () => {
        try {
            const { data } = await api.get('/catalogues');
            setCatalogues(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch();
    }, []);

    const openAdd = () => {
        setEditingId(null);
        setForm(EMPTY);
        setPdfFile(null);
        setShowModal(true);
    };

    const openEdit = (catalogue: Catalogue) => {
        setEditingId(catalogue.id);
        setForm({
            title: catalogue.title,
            description: catalogue.description || '',
            fileUrl: catalogue.fileUrl,
            thumbnailUrl: catalogue.thumbnailUrl || ''
        });
        setPdfFile(null);
        setShowModal(true);
    };

    const save = async () => {
        if (!form.title.trim() || (!editingId && !pdfFile && !form.fileUrl.trim())) {
            return;
        }

        setSaving(true);

        try {
            const payload = new FormData();

            payload.append('title', form.title);
            payload.append('description', form.description);
            payload.append('thumbnailUrl', form.thumbnailUrl);

            if (form.fileUrl) {
                payload.append('fileUrl', form.fileUrl);
            }

            if (pdfFile) {
                payload.append('file', pdfFile);
            }

            if (editingId) {
                await api.put(`/catalogues/${editingId}`, payload, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                await api.post('/catalogues', payload, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            await fetch();

            setShowModal(false);
            setForm(EMPTY);
            setPdfFile(null);
        } finally {
            setSaving(false);
        }
    };

    const deleteCatalogue = async (id: number) => {
        if (!confirm('Hide this catalogue?')) return;

        await api.delete(`/catalogues/${id}`);

        setCatalogues((prev) =>
            prev.filter((c) => c.id !== id)
        );
    };

    return (
        <div className="p-8">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Catalogues
                    </h1>
                </div>

                <button
                    onClick={openAdd}
                    className="btn-primary flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Upload Catalogue
                </button>
            </div>

            {loading ? (
                <div className="text-gray-400">
                    Loading...
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {catalogues.map((c) => (
                        <div
                            key={c.id}
                            className="card flex flex-col"
                        >
                            {c.thumbnailUrl && (
                                <img
                                    src={fileUrl(c.thumbnailUrl)}
                                    alt={c.title}
                                    className="w-full h-40 object-cover rounded-lg mb-4"
                                />
                            )}

                            <div className="flex-1">
                                <div className="font-semibold text-gray-900">
                                    {c.title}
                                </div>

                                <div className="text-sm text-gray-500 mt-1">
                                    {c.description}
                                </div>

                                <div className="text-xs text-gray-400 mt-2">
                                    {new Date(c.createdAt).toLocaleDateString('en-IN')}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mt-4">
                                <a
                                    href={fileUrl(c.fileUrl)}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn-secondary flex items-center gap-1 text-xs flex-1 justify-center"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    View PDF
                                </a>

                                <button
                                    onClick={() => openEdit(c)}
                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg border border-blue-200"
                                    aria-label={`Edit ${c.title}`}
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>

                                <button
                                    onClick={() => deleteCatalogue(c.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg border border-red-200"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}

                    {catalogues.length === 0 && (
                        <div className="col-span-3 card text-center text-gray-400 py-8">
                            No catalogues yet.
                        </div>
                    )}
                </div>
            )}

            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h2 className="text-lg font-bold">
                                {editingId ? 'Edit Catalogue' : 'Add Catalogue'}
                            </h2>

                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="form-label">
                                    Title *
                                </label>

                                <input
                                    className="form-input"
                                    value={form.title}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            title: e.target.value
                                        })
                                    }
                                />
                            </div>

                            <div>
                                <label className="form-label">
                                    Description
                                </label>

                                <textarea
                                    className="form-input"
                                    rows={2}
                                    value={form.description}
                                    onChange={(e) =>
                                        setForm({
                                            ...form,
                                            description: e.target.value
                                        })
                                    }
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="form-label">
                                    PDF File {!editingId && '*'}
                                </label>

                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            pdfInputRef.current?.click()
                                        }
                                        className="btn-secondary flex items-center gap-2 text-sm"
                                    >
                                        {saving ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Upload className="h-4 w-4" />
                                        )}
                                        Choose PDF
                                    </button>

                                    <span className="truncate text-xs text-gray-500">
                                        {pdfFile?.name ||
                                            (form.fileUrl
                                                ? 'Existing PDF retained'
                                                : 'No file selected')}
                                    </span>
                                </div>

                                <input
                                    ref={pdfInputRef}
                                    type="file"
                                    accept="application/pdf,.pdf"
                                    className="hidden"
                                    onChange={(e) =>
                                        setPdfFile(
                                            e.target.files?.[0] || null
                                        )
                                    }
                                />

                                <p className="text-[11px] text-gray-400">
                                    PDF files up to 50 MB. Upload a new file to replace the existing PDF.
                                </p>
                            </div>

                            <MediaImageField
                                label="Thumbnail Image"
                                value={form.thumbnailUrl}
                                onChange={(thumbnailUrl) =>
                                    setForm({
                                        ...form,
                                        thumbnailUrl
                                    })
                                }
                                previewClassName="h-32"
                            />
                        </div>

                        <div className="flex justify-end gap-3 p-6 border-t">
                            <button
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={save}
                                disabled={saving}
                                className="btn-primary"
                            >
                                {saving
                                    ? 'Saving...'
                                    : editingId
                                        ? 'Save Catalogue'
                                        : 'Add Catalogue'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}