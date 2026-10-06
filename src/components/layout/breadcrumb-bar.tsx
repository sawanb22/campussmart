import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbTrailItem {
  label: string;
  href?: string;
}

interface RouteMeta {
  title: string;
  parent?: { label: string; href: string };
}

/**
 * Route metadata hierarchy mapping for CampusMart inner pages.
 * Follows Open/Closed Principle: extensible by simply adding new key-value pairs.
 */
const ROUTE_METADATA: Record<string, RouteMeta> = {
  // Solutions
  '/solutions': { title: 'Solutions Overview' },
  '/libraries': { title: 'Library Solutions', parent: { label: 'Solutions', href: '/solutions' } },
  '/labs': { title: 'Laboratory Solutions', parent: { label: 'Solutions', href: '/solutions' } },
  '/tech-infra': { title: 'Technology Infrastructure', parent: { label: 'Solutions', href: '/solutions' } },
  '/sports-infra': { title: 'Sports Infrastructure', parent: { label: 'Solutions', href: '/solutions' } },
  '/furniture': { title: 'Campus Furniture', parent: { label: 'Solutions', href: '/solutions' } },
  '/innovation-centres': { title: 'Innovation Centres', parent: { label: 'Solutions', href: '/solutions' } },
  '/new-environments': { title: 'Learning Environments', parent: { label: 'Solutions', href: '/solutions' } },
  '/ai-stations': { title: 'AI Stations', parent: { label: 'Solutions', href: '/solutions' } },
  '/smart-classrooms': { title: 'Smart Classrooms', parent: { label: 'Solutions', href: '/solutions' } },
  '/science-tech-labs': { title: 'Science & Tech Labs', parent: { label: 'Solutions', href: '/solutions' } },
  '/ai-ml': { title: 'AI & Machine Learning Labs', parent: { label: 'Solutions', href: '/solutions' } },
  '/assessment-system': { title: 'Assessment System', parent: { label: 'Solutions', href: '/solutions' } },
  '/lms': { title: 'Learning Management System (LMS)', parent: { label: 'Solutions', href: '/solutions' } },

  // Services
  '/services': { title: 'Services Overview' },
  '/campus-design-execution': { title: 'Campus Design & Execution', parent: { label: 'Services', href: '/services' } },
  '/campus-design': { title: 'Campus Design', parent: { label: 'Services', href: '/services' } },
  '/furniture-design-supply': { title: 'Furniture Design & Supply', parent: { label: 'Services', href: '/services' } },
  '/sports-design-execution': { title: 'Sports Design & Execution', parent: { label: 'Services', href: '/services' } },
  '/ai-digital-design-supply': { title: 'AI & Digital Solutions', parent: { label: 'Services', href: '/services' } },
  '/campus-master-planning': { title: 'Campus Master Planning', parent: { label: 'Services', href: '/services' } },
  '/campus-automation': { title: 'Campus Automation', parent: { label: 'Services', href: '/services' } },
  '/digital-transformation': { title: 'Digital Transformation', parent: { label: 'Services', href: '/services' } },
  '/ar-vr-experiences': { title: 'AR/VR Learning Experiences', parent: { label: 'Services', href: '/services' } },
  '/collaboration-spaces': { title: 'Collaboration Spaces', parent: { label: 'Services', href: '/services' } },
  '/campus-furniture-design': { title: 'Campus Furniture Design', parent: { label: 'Services', href: '/services' } },

  // Corporate & Partnerships
  '/about-us': { title: 'About Us', parent: { label: 'Corporate', href: '/about-us' } },
  '/corporate': { title: 'Corporate Overview' },
  '/partnership': { title: 'Partnership Program', parent: { label: 'Corporate', href: '/about-us' } },
  '/partner-with-colleges': { title: 'Partner with Running Colleges', parent: { label: 'Corporate', href: '/about-us' } },
  '/colleges-universities-for-sale': { title: 'Colleges & Universities for Sale', parent: { label: 'Corporate', href: '/about-us' } },
  '/collaboration': { title: 'Institutional Collaborations', parent: { label: 'Corporate', href: '/about-us' } },

  // Resources, Catalogues & Articles
  '/catalogues': { title: 'Catalogues & Lookbooks' },
  '/product-catalog': { title: 'Product Catalog', parent: { label: 'Catalogues', href: '/catalogues' } },
  '/lookbook': { title: 'Play Furniture Lookbook', parent: { label: 'Catalogues', href: '/catalogues' } },
  '/blog': { title: 'Insights & Blog' },
  '/classifieds': { title: 'Classifieds & Opportunities' },
  '/ai-guide': { title: 'Complete AI Implementation Guide' },
  '/setup-college': { title: 'Setting Up a College in India' },
  '/ugc-guidelines': { title: 'UGC Guidelines for Digital Campus' },

  // E-Commerce, Careers & Contact
  '/shop': { title: 'Shop & Equipment' },
  '/job-openings': { title: 'Careers & Job Openings' },
  '/contact-us': { title: 'Contact Us' },
  '/request-quote': { title: 'Request a Quote' },
  '/my-account': { title: 'My Account' },

  // Policy & Legal
  '/terms-of-use': { title: 'Terms of Use' },
  '/privacy-policy': { title: 'Privacy Policy' },
  '/payment-policy': { title: 'Payment Policy' },
  '/order-rejection': { title: 'Order Rejection Policy' },
  '/replacement-return': { title: 'Replacement & Return Policy' },
};

/**
 * Converts a URL slug into clean Title Case
 * e.g. "campus-architecture" -> "Campus Architecture"
 */
function formatSlugToTitle(slug: string): string {
  if (!slug) return '';
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export const BreadcrumbBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const pathname = location.pathname;

  // Exclude pages that do not need this breadcrumb bar
  // 1. Homepage (already handled outside Layout, but safeguard here)
  // 2. Auth pages (/login, /register, /registration)
  // 3. Admin routes (/admin/*)
  // 4. Product detail (/product/*) which has its own specialized product category breadcrumb
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/registration' ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/product/')
  ) {
    return null;
  }

  // Split path into clean segments
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;

  const basePath = `/${segments[0]}`;
  const baseMeta = ROUTE_METADATA[basePath];

  // Build the breadcrumb trail adhering to SRP
  const trail: BreadcrumbTrailItem[] = [{ label: 'Home', href: '/' }];
  let fallbackParent = '/';

  if (segments.length === 1) {
    // Single segment route e.g. /libraries, /catalogues
    if (baseMeta) {
      if (baseMeta.parent) {
        trail.push({ label: baseMeta.parent.label, href: baseMeta.parent.href });
        fallbackParent = baseMeta.parent.href;
      }
      trail.push({ label: baseMeta.title });
    } else {
      trail.push({ label: formatSlugToTitle(segments[0]) });
    }
  } else {
    // Multi-segment route e.g. /labs/chemistry-lab or /campus-design-execution/step-1
    if (baseMeta) {
      if (baseMeta.parent) {
        trail.push({ label: baseMeta.parent.label, href: baseMeta.parent.href });
      }
      trail.push({ label: baseMeta.title, href: basePath });
      fallbackParent = basePath;
    } else {
      trail.push({ label: formatSlugToTitle(segments[0]), href: basePath });
      fallbackParent = basePath;
    }

    // Leaf/sub-route title
    const leafTitle = formatSlugToTitle(segments[segments.length - 1]);
    trail.push({ label: leafTitle });
  }

  /**
   * Resilient back action:
   * Uses React Router navigate(-1) if session history exists,
   * otherwise cleanly navigates to logical fallback parent.
   */
  const handleBack = () => {
    if (window.history.state && typeof window.history.state.idx === 'number' && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackParent);
    }
  };

  return (
    <nav
      aria-label="Breadcrumb"
      className="bg-white/95 border-b border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)] backdrop-blur-xs sticky top-0 z-30 transition-all"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-2.5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-500 font-medium overflow-x-auto no-scrollbar py-0.5 min-w-0">
          {/* One-Click Back Button */}
          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200/80 active:scale-95 text-slate-700 font-semibold text-xs transition-all shrink-0 cursor-pointer border border-slate-200/60"
            title="Go to previous page"
            aria-label="Go to previous page"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-slate-600" />
            <span>Back</span>
          </button>

          <div className="h-4 w-px bg-slate-200 shrink-0" aria-hidden="true" />

          {/* Breadcrumb Path List */}
          <ol className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {trail.map((item, idx) => {
              const isLast = idx === trail.length - 1;
              const isHome = idx === 0;

              return (
                <li key={idx} className="flex items-center gap-1.5 sm:gap-2">
                  {idx > 0 && (
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                  )}

                  {item.href && !isLast ? (
                    <Link
                      to={item.href}
                      className="inline-flex items-center gap-1 hover:text-cm-blue text-slate-600 transition-colors font-medium truncate max-w-[120px] sm:max-w-[200px]"
                    >
                      {isHome && <Home className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                      <span>{item.label}</span>
                    </Link>
                  ) : (
                    <span
                      className="font-bold text-slate-900 truncate max-w-[160px] sm:max-w-[320px]"
                      aria-current={isLast ? 'page' : undefined}
                    >
                      {item.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </div>
    </nav>
  );
};

export default BreadcrumbBar;
