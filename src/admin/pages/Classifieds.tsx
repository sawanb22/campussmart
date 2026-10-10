import { useEffect, useState } from 'react';
import { Check, X, Trash2 } from 'lucide-react';
import api from '../api/client';

interface Classified { id: number; title: string; description: string; price?: number; imageUrl?: string; status: string; createdAt: string; user: { name: string; email: string }; }

const statusColor = (s: string) => s === 'approved' ? 'badge-green' : s === 'rejected' ? 'badge-red' : 'badge-yellow';

export default function Classifieds() {
    const [classifieds, setClassifieds] = useState<Classified[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const fetch = async () => {
        const { data } = await api.get('/classifieds/all');
        setClassifieds(data);
        setLoading(false);
    };

    useEffect(() => { fetch(); }, []);

    const updateStatus = async (id: number, status: string) => {
        await api.put(`/classifieds/${id}/status`, { status });
        setClassifieds((prev) => prev.map((c) => (c.id === id ? { ...c, status } : c)));
    };

    const deleteClassified = async (id: number) => {
        if (!confirm('Delete this classified?')) return;
        await api.delete(`/classifieds/${id}`);
        setClassifieds((prev) => prev.filter((c) => c.id !== id));
    };

    const filtered = filter === 'all' ? classifieds : classifieds.filter((c) => c.status === filter);

    return (
        <div className="p-8">
            <div className="mb-6"><h1 className="text-2xl font-bold text-gray-900">Classifieds</h1></div>
            <div className="flex gap-2 mb-6">
                {['all', 'pending', 'approved', 'rejected'].map((f) => (
                    <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-sm capitalize transition-colors ${filter === f ? 'bg-cm-blue text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'}`}>{f}</button>
                ))}
            </div>

            <div className="space-y-4">
                {loading ? <div className="card text-center text-gray-400">Loading...</div>
                    : filtered.map((c) => (
                        <div key={c.id} className="card flex gap-4">
                            {c.imageUrl && <img src={c.imageUrl} alt={c.title} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />}
                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="font-semibold text-gray-900">{c.title}</div>
                                        <div className="text-sm text-gray-500">{c.user.name} · {c.user.email}</div>
                                        <div className="text-sm text-gray-600 mt-1">{c.description}</div>
                                        {c.price && <div className="text-cm-blue font-bold mt-1">₹{c.price.toLocaleString('en-IN')}</div>}
                                        <div className="mt-2"><span className={statusColor(c.status)}>{c.status.charAt(0).toUpperCase() + c.status.slice(1)}</span></div>
                                    </div>
                                    <div className="flex items-center gap-2 ml-4">
                                        {c.status !== 'approved' && <button onClick={() => updateStatus(c.id, 'approved')} className="flex items-center gap-1 text-xs text-green-600 border border-green-200 px-2 py-1 rounded-lg hover:bg-green-50"><Check className="w-3 h-3" /> Approve</button>}
                                        {c.status !== 'rejected' && <button onClick={() => updateStatus(c.id, 'rejected')} className="flex items-center gap-1 text-xs text-red-600 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50"><X className="w-3 h-3" /> Reject</button>}
                                        <button onClick={() => deleteClassified(c.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                {!loading && filtered.length === 0 && <div className="card text-center text-gray-400 py-8">No classifieds for this filter.</div>}
            </div>
        </div>
    );
}
