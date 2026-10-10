import { useEffect, useMemo, useState } from 'react';
import { Download, Mail, Phone, Building2, Search, Heart } from 'lucide-react';
import api from '../api/client';
import { resolveMediaUrl } from '../../lib/media-url';

interface WishlistItem {
    id: number;
    createdAt: string;
    designTitle?: string | null;
    designImage?: string | null;
    pageSlug?: string | null;
    user: { id: number; name: string; email: string; phone?: string | null; institution?: string | null };
    product?: { name: string; imageUrl?: string | null; category?: { name: string } | null } | null;
}

interface UserGroup {
    user: WishlistItem['user'];
    items: { id: number; title: string; category: string; image?: string | null; createdAt: string }[];
}

export default function WishlistReports() {
    const [items, setItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [search, setSearch] = useState('');
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        api.get('/admin/wishlist-report')
            .then(({ data }) => setItems(data))
            .catch((err) => setLoadError(err.response?.data?.error || 'Failed to load wishlist report. Please try again.'))
            .finally(() => setLoading(false));
    }, []);

    const groups: UserGroup[] = useMemo(() => {
        const byUser = new Map<number, UserGroup>();
        for (const item of items) {
            const title = item.product?.name ?? item.designTitle ?? 'Untitled item';
            const category = item.product?.category?.name ?? item.pageSlug ?? '—';
            const image = resolveMediaUrl(item.product?.imageUrl ?? item.designImage ?? '') || null;
            if (!byUser.has(item.user.id)) {
                byUser.set(item.user.id, { user: item.user, items: [] });
            }
            byUser.get(item.user.id)!.items.push({ id: item.id, title, category, image, createdAt: item.createdAt });
        }
        return Array.from(byUser.values());
    }, [items]);

    const filteredGroups = useMemo(() => {
        const query = search.trim().toLowerCase();
        if (!query) return groups;
        return groups.filter((g) =>
            `${g.user.name} ${g.user.email} ${g.user.institution ?? ''}`.toLowerCase().includes(query),
        );
    }, [groups, search]);

    const downloadReport = async () => {
        setExporting(true);
        try {
            const { data } = await api.get('/admin/wishlist-report/export', { responseType: 'blob' });
            const blobUrl = URL.createObjectURL(new Blob([data], { type: 'text/csv' }));
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `wishlist-report-${new Date().toISOString().slice(0, 10)}.csv`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            URL.revokeObjectURL(blobUrl);
        } catch {
            /* noop */
        }
        setExporting(false);
    };

    return (
        <div className="p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Wishlist Reports</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Who wishlisted what — use this to follow up with leads and prepare quotations.
                    </p>
                </div>
                <button
                    onClick={downloadReport}
                    disabled={exporting || items.length === 0}
                    className="flex items-center gap-2 bg-cm-blue text-white px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-cm-blue-dark transition-all disabled:opacity-50"
                >
                    <Download className="w-4 h-4" />
                    {exporting ? 'Preparing…' : 'Download Report (CSV)'}
                </button>
            </div>

            <div className="relative mb-6 max-w-sm">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    placeholder="Search by name, email or institution…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cm-blue/20 bg-white shadow-sm"
                />
            </div>

            {loading ? (
                <div className="text-gray-400">Loading...</div>
            ) : loadError ? (
                <div className="card border-red-200 bg-red-50 text-center text-red-700 py-8">{loadError}</div>
            ) : (
                <div className="space-y-4">
                    {filteredGroups.map((group) => (
                        <div key={group.user.id} className="card">
                            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <div className="font-semibold text-gray-900">{group.user.name}</div>
                                        <span className="badge-blue flex items-center gap-1">
                                            <Heart className="w-3 h-3" /> {group.items.length} item{group.items.length === 1 ? '' : 's'}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mt-1.5">
                                        <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{group.user.email}</span>
                                        {group.user.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{group.user.phone}</span>}
                                        {group.user.institution && <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{group.user.institution}</span>}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {group.items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-2.5">
                                        {item.image ? (
                                            <img src={item.image} alt={item.title} className="w-10 h-10 rounded-md object-cover flex-shrink-0" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-md bg-gray-200 flex-shrink-0" />
                                        )}
                                        <div className="min-w-0">
                                            <div className="text-sm font-medium text-gray-800 truncate">{item.title}</div>
                                            <div className="text-xs text-gray-400 truncate">{item.category} · {new Date(item.createdAt).toLocaleDateString('en-IN')}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {filteredGroups.length === 0 && (
                        <div className="card text-center text-gray-400 py-8">No wishlist activity yet.</div>
                    )}
                </div>
            )}
        </div>
    );
}
