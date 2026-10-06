import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Suspense } from 'react';
import { lazy } from '@/lib/lazy-with-retry';
import { ShieldAlert, LogOut, ArrowLeft } from 'lucide-react';
import Layout from './components/Layout';
import { isAdminLoggedIn, ensureSessionSynced, getCurrentUser, clearAdminSession } from './lib/auth';
import { clearUserSession } from '@/lib/auth-session';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Products = lazy(() => import('./pages/Products'));
const Blog = lazy(() => import('./pages/Blog'));
const Orders = lazy(() => import('./pages/Orders'));
const Users = lazy(() => import('./pages/Users'));
const Enquiries = lazy(() => import('./pages/Enquiries'));
const Classifieds = lazy(() => import('./pages/Classifieds'));
const Catalogues = lazy(() => import('./pages/Catalogues'));
const CaseStudies = lazy(() => import('./pages/CaseStudies'));
const SiteContent = lazy(() => import('./pages/SiteContent'));
const HomepageEditor = lazy(() => import('./pages/HomepageEditor'));
const PagesManager = lazy(() => import('./pages/PagesManager'));
const PageEditor = lazy(() => import('./pages/PageEditor'));
const Categories = lazy(() => import('./pages/Categories'));
const WishlistReports = lazy(() => import('./pages/WishlistReports'));

function AccessDenied({ userEmail, role }: { userEmail?: string; role?: string }) {
  const navigate = useNavigate();

  const handleSwitchAccount = () => {
    clearAdminSession();
    clearUserSession();
    navigate('/login?redirect=/admin/dashboard', { replace: true });
  };

  const handleGoToPortal = () => {
    navigate('/my-account', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 text-center border border-slate-200">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-sm text-gray-600 mb-6 leading-relaxed">
          Administrator privileges are required to view this panel. You are currently signed in as{' '}
          <strong className="text-gray-900">{userEmail || 'a standard user'}</strong>
          {role ? ` (role: ${role})` : ''}.
        </p>

        <div className="space-y-3">
          <button
            type="button"
            onClick={handleSwitchAccount}
            className="w-full flex items-center justify-center gap-2 bg-[#0a2463] text-white font-semibold py-3 px-4 rounded-xl hover:bg-[#1a3a8f] transition-colors"
          >
            <LogOut className="w-4 h-4" /> Switch to Admin Account
          </button>
          <button
            type="button"
            onClick={handleGoToPortal}
            className="w-full flex items-center justify-center gap-2 bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-xl hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Customer Portal
          </button>
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  ensureSessionSynced();
  const location = useLocation();

  if (isAdminLoggedIn()) {
    return <>{children}</>;
  }

  const currentUser = getCurrentUser();
  if (currentUser && currentUser.role !== 'admin') {
    return <AccessDenied userEmail={currentUser.email} role={currentUser.role} />;
  }

  const redirectTarget = encodeURIComponent(location.pathname + location.search);
  return <Navigate to={`/login?redirect=${redirectTarget}`} replace />;
}

function Loader() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-8 h-8 border-4 border-cm-blue border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<Navigate to="/login?redirect=/admin/dashboard" replace />} />
      <Route
        path=""
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Suspense fallback={<Loader />}><Dashboard /></Suspense>} />
        <Route path="products" element={<Suspense fallback={<Loader />}><Products /></Suspense>} />
        <Route path="categories" element={<Suspense fallback={<Loader />}><Categories /></Suspense>} />
        <Route path="blog" element={<Suspense fallback={<Loader />}><Blog /></Suspense>} />
        <Route path="orders" element={<Suspense fallback={<Loader />}><Orders /></Suspense>} />
        <Route path="users" element={<Suspense fallback={<Loader />}><Users /></Suspense>} />
        <Route path="enquiries" element={<Suspense fallback={<Loader />}><Enquiries /></Suspense>} />
        <Route path="wishlist-report" element={<Suspense fallback={<Loader />}><WishlistReports /></Suspense>} />
        <Route path="classifieds" element={<Suspense fallback={<Loader />}><Classifieds /></Suspense>} />
        <Route path="catalogues" element={<Suspense fallback={<Loader />}><Catalogues /></Suspense>} />
        <Route path="case-studies" element={<Suspense fallback={<Loader />}><CaseStudies /></Suspense>} />
        <Route path="site-content" element={<Suspense fallback={<Loader />}><SiteContent /></Suspense>} />
        <Route path="homepage-editor" element={<Suspense fallback={<Loader />}><HomepageEditor /></Suspense>} />
        <Route path="pages" element={<Suspense fallback={<Loader />}><PagesManager /></Suspense>} />
        <Route path="pages/:id/edit" element={<Suspense fallback={<Loader />}><PageEditor /></Suspense>} />
      </Route>
      <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
  );
}

export default AdminRoutes;
