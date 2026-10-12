import { useEffect, useState } from 'react';
import {
    Users, Package, ShoppingBag, MessageSquare, TrendingUp, AlertCircle,
    Tag, FileText, Globe, CheckCircle, Database, Zap, Star, BookMarked,
    BookOpen, ArrowRight, Activity, Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';

interface Stats {
    users: number;
    products: number;
    orders: number;
    unreadEnquiries: number;
    unreadQuotes: number;
    pendingClassifieds: number;
    totalRevenue: number;
}

const sectionGroups = [
    {
        heading: '🌐 Website Content',
        color: 'blue',
        items: [
            { to: '/admin/homepage-editor', icon: Star, label: 'Homepage & Cards', desc: 'Edit cards, images, text & hero', bg: 'bg-blue-50', txt: 'text-blue-700', ibg: 'bg-blue-100' },
            { to: '/admin/pages', icon: Globe, label: 'All Pages', desc: 'Edit every page on the website', bg: 'bg-sky-50', txt: 'text-sky-700', ibg: 'bg-sky-100' },
            { to: '/admin/blog', icon: BookOpen, label: "Blog (What's Trending)", desc: 'Manage articles, categories & layout', bg: 'bg-indigo-50', txt: 'text-indigo-700', ibg: 'bg-indigo-100' },
        ]
    },
    {
        heading: '📦 Products & Catalogue',
        color: 'emerald',
        items: [
            { to: '/admin/products', icon: Package, label: 'Products', desc: 'Add, edit, or remove product listings', bg: 'bg-emerald-50', txt: 'text-emerald-700', ibg: 'bg-emerald-100' },
            { to: '/admin/catalogues', icon: BookMarked, label: 'Catalogues & Case Studies', desc: 'Manage PDF brochures & case studies', bg: 'bg-teal-50', txt: 'text-teal-700', ibg: 'bg-teal-100' },
            { to: '/admin/classifieds', icon: Tag, label: 'Classifieds', desc: 'Manage opportunities & listings', bg: 'bg-green-50', txt: 'text-green-700', ibg: 'bg-green-100' },
        ]
    },
    {
        heading: '📬 Orders & Enquiries',
        color: 'orange',
        items: [
            { to: '/admin/orders', icon: ShoppingBag, label: 'Orders', desc: 'Track and update all orders', bg: 'bg-orange-50', txt: 'text-orange-700', ibg: 'bg-orange-100' },
            { to: '/admin/enquiries', icon: MessageSquare, label: 'Enquiries & Leads', desc: 'View quote requests & messages', bg: 'bg-amber-50', txt: 'text-amber-700', ibg: 'bg-amber-100' },
            { to: '/admin/wishlist-report', icon: Heart, label: 'Wishlist Reports', desc: 'Leads for quotations', bg: 'bg-rose-50', txt: 'text-rose-700', ibg: 'bg-rose-100' },
        ]
    },
    {
        heading: '👥 People & Settings',
        color: 'violet',
        items: [
            { to: '/admin/users', icon: Users, label: 'Users', desc: 'Manage registered accounts', bg: 'bg-violet-50', txt: 'text-violet-700', ibg: 'bg-violet-100' },
            { to: '/admin/site-content', icon: FileText, label: 'Site Settings', desc: 'Update global site configuration', bg: 'bg-purple-50', txt: 'text-purple-700', ibg: 'bg-purple-100' },
        ]
    },
];

export default function Dashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/admin/stats').then(({ data }) => setStats(data)).finally(() => setLoading(false));
    }, []);

    const statCards = [
        { label: 'Registered Users', value: stats?.users ?? '–', icon: Users, color: 'bg-blue-500', light: 'bg-blue-50 text-blue-700' },
        { label: 'Active Products', value: stats?.products ?? '–', icon: Package, color: 'bg-emerald-500', light: 'bg-emerald-50 text-emerald-700' },
        { label: 'Total Orders', value: stats?.orders ?? '–', icon: ShoppingBag, color: 'bg-violet-500', light: 'bg-violet-50 text-violet-700' },
        { label: 'Revenue', value: `₹${(((stats?.totalRevenue || 0)) / 1000).toFixed(0)}K`, icon: TrendingUp, color: 'bg-orange-500', light: 'bg-orange-50 text-orange-700' },
        { label: 'Unread Enquiries', value: (stats?.unreadEnquiries || 0) + (stats?.unreadQuotes || 0), icon: MessageSquare, color: 'bg-red-500', light: 'bg-red-50 text-red-700' },
        { label: 'Pending Listings', value: stats?.pendingClassifieds ?? '–', icon: AlertCircle, color: 'bg-yellow-500', light: 'bg-yellow-50 text-yellow-700' },
    ];

    return (
        <div className="max-w-7xl mx-auto space-y-8">

            {/* Welcome */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-gray-900">Welcome back, Admin 👋</h1>
                    <p className="text-gray-500 text-sm mt-1">Here's your CampusMart control center. Jump to any section below.</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-2 rounded-xl">
                    <Activity className="w-3.5 h-3.5" />
                    System Live
                </div>
            </div>

            {/* Stats Strip */}
            {!loading && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                    {statCards.map((s) => (
                        <div key={s.label} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col gap-2">
                            <div className={`w-8 h-8 ${s.color} rounded-lg flex items-center justify-center`}>
                                <s.icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="text-2xl font-bold text-gray-900">{loading ? '…' : s.value}</div>
                            <div className="text-xs text-gray-500 font-medium leading-tight">{s.label}</div>
                        </div>
                    ))}
                </div>
            )}

            {/* Quick Navigation Sections */}
            <div className="space-y-6">
                {sectionGroups.map((group) => (
                    <div key={group.heading}>
                        <h2 className="text-sm font-black text-gray-700 mb-3 uppercase tracking-widest">{group.heading}</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {group.items.map(({ to, icon: Icon, label, desc, bg, txt, ibg }) => (
                                <Link
                                    key={to}
                                    to={to}
                                    className={`group flex items-center gap-4 ${bg} border border-transparent hover:border-gray-200 hover:shadow-md rounded-2xl p-4 transition-all`}
                                >
                                    <div className={`w-11 h-11 ${ibg} ${txt} rounded-xl flex items-center justify-center shrink-0`}>
                                        <Icon className="w-5 h-5" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className={`font-bold text-sm ${txt}`}>{label}</div>
                                        <div className="text-xs text-gray-500 mt-0.5 truncate">{desc}</div>
                                    </div>
                                    <ArrowRight className={`w-4 h-4 ${txt} opacity-0 group-hover:opacity-100 shrink-0 transition-opacity`} />
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* System Status */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-widest">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> System Status
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                        { label: 'Database', icon: Database },
                        { label: 'Authentication', icon: CheckCircle },
                        { label: 'API Server', icon: Zap },
                    ].map(s => (
                        <div key={s.label} className="flex items-center justify-between py-2.5 px-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <s.icon className="w-4 h-4 text-gray-400" />
                                {s.label}
                            </div>
                            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                Operational
                            </span>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
