import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import {
    LayoutDashboard, Package, BookOpen, ShoppingBag, Users, MessageSquare,
    Tag, BookMarked, Settings, LogOut, GraduationCap, Globe, Star,
    FileText, ChevronRight, Bell, Layers, Heart
} from 'lucide-react';
import { clearAdminSession } from '../lib/auth';

// ── Grouped Navigation ─────────────────────────────────────────────────────────
const navGroups = [
    {
        label: 'Overview',
        items: [
            { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', desc: 'Stats & quick actions' },
        ]
    },
    {
        label: 'Website Content',
        items: [
            { to: '/admin/homepage-editor', icon: Star, label: 'Hero & Homepage', desc: 'Edit banners, sections' },
            { to: '/admin/pages', icon: Globe, label: 'All Pages', desc: 'Manage all site pages' },
            { to: '/admin/blog', icon: BookOpen, label: 'Blog Posts', desc: 'Articles & news' },
        ]
    },
    {
        label: 'Products & Catalogue',
        items: [
            { to: '/admin/products', icon: Package, label: 'Products', desc: 'Add, edit, remove items' },
            { to: '/admin/categories', icon: Tag, label: 'Categories', desc: 'Manage classifications' },
            { to: '/admin/catalogues', icon: BookMarked, label: 'Catalogues', desc: 'PDF & digital catalogues' },
            { to: '/admin/case-studies', icon: Layers, label: 'Case Studies', desc: 'Projects showcased on Catalogues page' },
            { to: '/admin/classifieds', icon: Tag, label: 'Classifieds', desc: 'Review & approve listings' },
        ]
    },
    {
        label: 'Orders & Enquiries',
        items: [
            { to: '/admin/orders', icon: ShoppingBag, label: 'Orders', desc: 'Track & manage orders' },
            { to: '/admin/enquiries', icon: MessageSquare, label: 'Enquiries', desc: 'Quote requests & leads' },
            { to: '/admin/wishlist-report', icon: Heart, label: 'Wishlist Reports', desc: 'Leads for quotations' },
        ]
    },
    {
        label: 'People',
        items: [
            { to: '/admin/users', icon: Users, label: 'Users', desc: 'Registered accounts' },
        ]
    },
    {
        label: 'System',
        items: [
            { to: '/admin/site-content', icon: Settings, label: 'Site Settings', desc: 'Global content config' },
        ]
    },
];

export default function Layout() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        clearAdminSession();
        navigate('/admin/login');
    };

    const isActive = (to: string) => {
        if (to === '/admin/dashboard') return location.pathname === to;
        return location.pathname.startsWith(to);
    };

    // Find current page label for breadcrumb
    const currentItem = navGroups.flatMap(g => g.items).find(i => isActive(i.to));

    return (
        <div className="min-h-screen flex bg-[#f5f6fa] font-sans">

            {/* ── Left Sidebar ────────────────────────────────────────────── */}
            <aside className="w-72 bg-white border-r border-gray-100 flex flex-col shadow-sm fixed h-full z-30 hidden md:flex">
                {/* Brand */}
                <div className="h-[70px] px-6 flex items-center gap-3 border-b border-gray-100">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
                        <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <div className="font-extrabold text-gray-900 text-[15px] leading-tight">CampusMart</div>
                        <div className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Admin Portal</div>
                    </div>
                </div>

                {/* Navigation Groups */}
                <div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
                    {navGroups.map((group) => (
                        <div key={group.label}>
                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.18em] px-3 mb-2">
                                {group.label}
                            </p>
                            <div className="space-y-0.5">
                                {group.items.map(({ to, icon: Icon, label, desc }) => {
                                    const active = isActive(to);
                                    return (
                                        <Link
                                            key={to}
                                            to={to}
                                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                                                active
                                                    ? 'bg-blue-50 text-blue-700'
                                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                            }`}
                                        >
                                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
                                                active
                                                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-300'
                                                    : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                                            }`}>
                                                <Icon className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <div className={`text-sm font-semibold leading-tight ${active ? 'text-blue-700' : 'text-gray-800'}`}>
                                                    {label}
                                                </div>
                                                <div className="text-[10px] text-gray-400 truncate mt-0.5">{desc}</div>
                                            </div>
                                            {active && <ChevronRight className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* User / Logout */}
                <div className="p-4 border-t border-gray-100 bg-gray-50/50">
                    <div className="flex items-center gap-3 mb-3 px-2">
                        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-sm shrink-0">A</div>
                        <div className="min-w-0">
                            <div className="text-sm font-bold text-gray-800 truncate">Administrator</div>
                            <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" />
                                Active Session
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 border border-red-100 transition-all"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* ── Main Area ──────────────────────────────────────────────── */}
            <div className="flex-1 flex flex-col md:ml-72 min-h-screen">

                {/* Topbar */}
                <header className="h-[70px] bg-white border-b border-gray-100 px-6 md:px-8 flex items-center justify-between sticky top-0 z-20 shadow-sm">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Link to="/admin/dashboard" className="hover:text-blue-600 font-semibold transition-colors">Home</Link>
                        {currentItem && (
                            <>
                                <span className="text-gray-300">/</span>
                                <span className="font-bold text-gray-800">{currentItem.label}</span>
                            </>
                        )}
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-3">
                        <a
                            href="/"
                            target="_blank"
                            rel="noreferrer"
                            className="hidden sm:flex items-center gap-2 px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-100 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                        >
                            <FileText className="w-3.5 h-3.5" />
                            View Website
                        </a>
                        <button className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors relative">
                            <Bell className="w-4 h-4" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
                        </button>
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-sm">A</div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-6 md:p-8">
                    <div className="animate-in fade-in slide-in-from-bottom-3 duration-300">
                        <Outlet />
                    </div>
                </main>

                {/* Footer */}
                <footer className="px-8 py-4 border-t border-gray-100 bg-white flex items-center justify-between text-xs text-gray-400">
                    <span>CampusMart CMS © 2026</span>
                    <span className="font-mono bg-gray-50 px-2 py-0.5 rounded">v2.1.0</span>
                </footer>
            </div>
        </div>
    );
}


