import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Layout from './components/Layout';
import Login from './pages/Login';
import { isAdminLoggedIn, ensureSessionSynced } from './lib/auth';

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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  ensureSessionSynced();
  return isAdminLoggedIn() ? <>{children}</> : <Navigate to="/admin/login" replace />;
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
      <Route path="login" element={<Login />} />
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
