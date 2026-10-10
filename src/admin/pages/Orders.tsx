import { useEffect, useState } from 'react';
import api from '../api/client';
import AdminStateContainer from '../components/AdminStateContainer';

interface Order {
    id: number;
    total: number;
    status: string;
    notes?: string;
    createdAt: string;
    user?: { name: string; email: string };
    items?: { qty: number; unitPrice: number; product?: { name: string } }[];
    orderitem?: { qty: number; unitPrice: number; product?: { name: string } }[];
}

const STATUS_OPTIONS = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const statusColor = (s: string) => {
    if (s === 'delivered') return 'badge-green';
    if (s === 'processing' || s === 'shipped') return 'badge-blue';
    if (s === 'cancelled') return 'badge-red';
    return 'badge-yellow';
};

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetch = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data } = await api.get('/orders/all');
            setOrders(Array.isArray(data) ? data : []);
        } catch (err: any) {
            console.error('Failed to load orders:', err);
            setError(err.response?.data?.error || 'Failed to load orders. Please retry.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetch();
    }, []);

    const updateStatus = async (id: number, status: string) => {
        try {
            await api.put(`/orders/${id}/status`, { status });
            setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
        } catch (err: any) {
            alert(err.response?.data?.error || 'Failed to update order status');
        }
    };

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
                <p className="text-gray-500 text-sm mt-1">{orders.length} total orders</p>
            </div>

            <AdminStateContainer
                loading={loading}
                error={error}
                onRetry={fetch}
                cachePrefix="/orders"
                loadingMessage="Loading orders..."
            >
                <div className="card p-0 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    {['Order ID', 'Customer', 'Items', 'Total', 'Status', 'Date', 'Update Status'].map((h) => (
                                        <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                            No orders found.
                                        </td>
                                    </tr>
                                ) : (
                                    orders.map((o) => {
                                        const items = o.items || o.orderitem || [];
                                        return (
                                            <tr key={o.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-4 py-3 font-mono font-medium text-gray-700">#{String(o.id).padStart(4, '0')}</td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-900">{o.user?.name || 'Anonymous User'}</div>
                                                    <div className="text-gray-400 text-xs">{o.user?.email || 'No email'}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-xs text-gray-600">
                                                        {items.length > 0
                                                            ? items.map((i) => `${i.product?.name || 'Item'} x${i.qty}`).join(', ')
                                                            : 'No items'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-cm-blue">₹{o.total.toLocaleString('en-IN')}</td>
                                                <td className="px-4 py-3"><span className={statusColor(o.status)}>{o.status.charAt(0).toUpperCase() + o.status.slice(1)}</span></td>
                                                <td className="px-4 py-3 text-gray-500 text-xs">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                                                <td className="px-4 py-3">
                                                    <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="input w-auto py-1 text-xs">
                                                        {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                                    </select>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </AdminStateContainer>
        </div>
    );
}
