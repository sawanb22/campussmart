import { Link } from 'react-router-dom';
import { Home, ShoppingBag } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-slate-50/50">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <span className="inline-block text-6xl font-black text-cm-blue mb-2">404</span>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Page Not Found</h1>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          The page you are looking for might have been moved, removed, or is temporarily unavailable.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cm-blue text-white text-xs font-bold uppercase tracking-wider hover:bg-cm-blue-dark transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link
            to="/shop"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-bold uppercase tracking-wider hover:bg-slate-50 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Explore Shop
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
