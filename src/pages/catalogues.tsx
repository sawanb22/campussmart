import { useState, useEffect, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Eye, Lock, Send, X, CheckCircle } from 'lucide-react';
import api from '@/api/client';
import { usePageData } from '@/hooks/usePageData';
import LoginPromptModal from '@/components/login-prompt-modal';
import { resolveMediaUrl } from '@/lib/media-url';
import { MediaImage } from '@/components/ui/media-image';
import { getCardCover } from '@/lib/card-covers';
import { getUserSession, getUserToken } from '@/lib/auth-session';

const hasValidPdf = (url?: string): boolean => {
  if (!url) return false;
  const trimmed = url.trim();
  if (
    !trimmed ||
    trimmed === '#' ||
    trimmed === '/' ||
    trimmed.toLowerCase() === 'null' ||
    trimmed.toLowerCase() === 'undefined' ||
    trimmed.toLowerCase() === 'n/a' ||
    trimmed.toLowerCase() === 'none' ||
    trimmed.toLowerCase().startsWith('javascript:')
  ) {
    return false;
  }
  if (
    trimmed.includes('furniture-2025.pdf') ||
    trimmed.includes('lab-equipment.pdf') ||
    trimmed.includes('technology.pdf')
  ) {
    return false;
  }
  return true;
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'case-study';

const PAGE_SIZE = 6;

const formatDate = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-IN', { month: 'short', day: '2-digit', year: 'numeric' });
};

const DEFAULTS = {
  heroTitle: 'Catalogues & Downloads',
  heroSubtitle:
    'Every CampusMart product range, brief and design guide in one library — download the PDFs your team needs to plan and spec a campus.',
  heroImage: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80',
  cards: [
    {
      title: 'NEP READY CLASSROOM FURNITURE',
      description:
        'Furniture solutions specifically designed to align with New Education Policy guidelines for modern classrooms.',
      image:
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      downloadLink: '/uploads/catalogues/1788258517755-838164996.pdf',
      size: '411 KB',
    },
    {
      title: 'CAMPUSMART BRIEF PROFILE [PDF]',
      description:
        "An overview of CampusMart's mission, services, and extensive experience in educational infrastructure.",
      image:
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      downloadLink: '/uploads/catalogues/1788784785158-777852239.pdf',
      size: '96 MB',
    },
    {
      title: 'SCHOOL DESIGN [PDF]',
      description:
        'Comprehensive guide on architectural and ergonomic principles for modern school environments.',
      image:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      downloadLink: '/uploads/catalogues/1788259430344-947630598.pdf',
      size: '411 KB',
    },
    {
      title: 'CLASSROOM CONFIGURATION IDEAS [PDF]',
      description:
        'Creative and functional layout samples for various classroom sizes and learning objectives.',
      image:
        'https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      downloadLink: '/uploads/catalogues/1788258554866-942654994.pdf',
      size: '170 KB',
    },
    {
      title: 'MASTER CATALOGUE',
      description:
        'Our full range of products including Labs, Libraries, Sports, and AI Stations.',
      image:
        'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      downloadLink: '/uploads/catalogues/1790872959601-232430012.pdf',
      size: '23 MB',
    },
  ],
  caseStudies: [
    {
      title: 'Campus Master Planning',
      description:
        'Complete campus transformation for a leading university in Bangalore.',
      image:
        'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      slug: 'campus-master-planning',
    },
    {
      title: '20 Stunning College Buildings',
      description:
        'Showcase of our most innovative campus architecture projects.',
      image:
        'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      slug: '20-stunning-college-buildings',
    },
    {
      title: 'STEM Lab Implementation',
      description:
        'State-of-the-art STEM lab setup for a prestigious school chain.',
      image:
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      slug: 'stem-lab-implementation',
    },
  ],
  ctaTitle: 'Need a Custom Solution?',
  ctaSubtitle:
    'Our team can create customized catalogues based on your specific requirements.',
  ctaButtonLabel: 'Request Custom Catalogue',
  ctaHref: '/request-quote',
};

const Catalogues = () => {
  const { data, loading } = usePageData('catalogues');

  const heroTitle = data.heroTitle ?? DEFAULTS.heroTitle;
  const rawSubtitle = data.heroSubtitle ?? DEFAULTS.heroSubtitle;
  const heroSubtitle = rawSubtitle.replace(/SchoolMart/g, 'CampusMart');
  const heroImage = data.heroImage?.trim() ? data.heroImage : DEFAULTS.heroImage;
  const ctaTitle = data.ctaTitle ?? DEFAULTS.ctaTitle;
  const ctaSubtitle = data.ctaSubtitle ?? DEFAULTS.ctaSubtitle;
  const ctaButtonLabel = data.ctaButtonLabel ?? DEFAULTS.ctaButtonLabel;

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const token = getUserToken();
  const isLoggedIn = Boolean(token);

  // Request Catalogue Modal state
  const [requestTarget, setRequestTarget] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const openRequestModal = (catalogue: any) => {
    const user = getUserSession();
    setRequestTarget(catalogue);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      institution: user?.institution || '',
      message: `Please share the catalogue for "${catalogue.title}".`,
    });
    setSubmitted(false);
    setFormError('');
  };

  const closeRequestModal = () => {
    setRequestTarget(null);
    setSubmitted(false);
    setFormError('');
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestTarget) return;
    setSubmitting(true);
    setFormError('');
    try {
      await api.post('/contact', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        institution: formData.institution,
        subject: `Catalogue Request: ${requestTarget.title}`,
        message: formData.message,
      });
      setSubmitted(true);
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to submit your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadClick = async (e: MouseEvent, catalogue: any) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    const downloadUrl = catalogue.downloadLink;
    if (!hasValidPdf(downloadUrl)) {
      openRequestModal(catalogue);
      return;
    }

    const resolvedUrl = resolveMediaUrl(downloadUrl);
    const targetUrl = token
      ? `${resolvedUrl}${resolvedUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`
      : resolvedUrl;

    try {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    } catch {
      openRequestModal(catalogue);
    }
  };

  const [dbCatalogues, setDbCatalogues] = useState<any[]>([]);
  const [dbCaseStudies, setDbCaseStudies] = useState<any[]>([]);

  useEffect(() => {
    api.get('/catalogues')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setDbCatalogues(res.data.map((item: any) => ({
            title: item.title,
            description: item.description || '',
            image: item.thumbnailUrl || 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
            downloadLink: item.fileUrl,
            size: 'PDF',
          })));
        }
      })
      .catch(() => {});

    api.get('/case-studies')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setDbCaseStudies(res.data.map((item: any) => ({
            title: item.title,
            description: item.description || '',
            image: item.imageUrl || 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
            slug: item.slug || slugify(item.title),
          })));
        }
      })
      .catch(() => {});
  }, []);

  // Multi-source sync: 1. DB Catalogues (from /admin/catalogues), 2. CMS pageData, 3. DEFAULTS
  const catalogues = dbCatalogues.length > 0
    ? dbCatalogues
    : (Array.isArray(data.cards) && data.cards.length > 0)
      ? data.cards.map((c: any) => ({
          ...c,
          title: (c.title || '').replace(/SCHOOLMART/g, 'CAMPUSMART'),
          description: (c.description || '').replace(/SchoolMart/g, 'CampusMart'),
          image: c.image || '',
          downloadLink: c.downloadLink ?? c.fileUrl ?? '',
        }))
      : (loading ? [] : DEFAULTS.cards);

  const caseStudies = dbCaseStudies.length > 0
    ? dbCaseStudies
    : (Array.isArray(data.caseStudies) && data.caseStudies.length > 0)
      ? data.caseStudies.map((cs: any) => ({
          ...cs,
          slug: cs.slug || slugify(cs.title),
        }))
      : (loading ? [] : DEFAULTS.caseStudies);

  const visibleCatalogues = catalogues.slice(0, visibleCount);
  const hasMore = visibleCount < catalogues.length;

  return (
    <main className="min-h-screen bg-white">
      <LoginPromptModal
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        icon={Lock}
        eyebrow="Registered users only"
        title="Register to view catalogues"
        description="Create a free account to view our product catalogues and case study PDFs."
      />

      {/* Hero Section */}
      <section className="bg-cm-blue mx-3 sm:mx-6 lg:mx-8 rounded-[2rem] py-6 md:py-8 overflow-hidden relative shadow-inner mt-4 mb-2">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 relative z-10 px-4">
          <div className="lg:w-1/2 text-left text-white">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 tracking-tight text-white leading-tight">
              {heroTitle}
            </h1>
            <p className="text-sm md:text-base text-white/85 leading-relaxed max-w-xl">
              {heroSubtitle}
            </p>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link to="/request-quote" className="btn-secondary px-6 py-2.5 text-sm font-bold shadow-md">
                Request Custom Catalogue
              </Link>
            </div>
          </div>
          {heroImage && (
            <div className="lg:w-1/2 relative w-full">
              <MediaImage
                src={heroImage}
                alt={heroTitle}
                className="rounded-2xl shadow-xl w-full h-[240px] sm:h-[260px] object-cover border-2 border-cm-blue-dark relative z-10"
              />
            </div>
          )}
        </div>
      </section>

      {/* Catalogues Grid */}
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {loading ? (
            <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, idx) => (
                <div key={idx} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="h-48 rounded-xl bg-gray-200" />
                  <div className="mt-4 h-4 w-1/3 rounded bg-gray-200" />
                  <div className="mt-2 h-5 w-3/4 rounded bg-gray-200" />
                  <div className="mt-2 h-4 w-full rounded bg-gray-100" />
                  <div className="mt-4 h-10 w-36 rounded-lg bg-gray-200" />
                </div>
              ))}
            </div>
          ) : visibleCatalogues.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 py-20 text-center text-gray-500">
              No catalogues found.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {visibleCatalogues.map((catalogue: any, index: number) => {
                  const cover = getCardCover(index);
                  const hasPdf = hasValidPdf(catalogue.downloadLink);

                  return (
                    <div key={catalogue.title || index} className="group min-w-0 flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md">
                      <div>
                        <div className="relative h-48 overflow-hidden rounded-xl" style={{ background: cover.background }}>
                          <MediaImage
                            src={catalogue.image}
                            alt={catalogue.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <span className="absolute bottom-0 left-0 h-7 w-7 rounded-tr-xl rounded-bl-xl" style={{ background: cover.accent }} />
                        </div>
                        <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-400">
                          <FileText className="h-3 w-3 text-cm-blue" />
                          <span className="font-bold text-cm-blue">{catalogue.size || 'PDF'}</span>
                          {catalogue.date && <span>{formatDate(catalogue.date)}</span>}
                        </div>
                        <h3 className="mt-1.5 text-base font-extrabold leading-snug tracking-tight text-cm-blue-dark line-clamp-2 sm:text-lg">
                          {catalogue.title}
                        </h3>
                        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-500">{catalogue.description}</p>
                      </div>

                      <div className="pt-4">
                        {hasPdf ? (
                          <a
                            href={
                              token
                                ? `${resolveMediaUrl(catalogue.downloadLink)}${catalogue.downloadLink.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}`
                                : resolveMediaUrl(catalogue.downloadLink)
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => handleDownloadClick(e, catalogue)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cm-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cm-blue-dark"
                          >
                            {isLoggedIn ? <Eye className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                            View PDF
                          </a>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openRequestModal(catalogue)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cm-yellow px-4 py-2.5 text-sm font-bold text-cm-blue-dark transition-colors hover:bg-yellow-400 shadow-sm"
                          >
                            <Send className="h-4 w-4" />
                            Request Catalogue
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {hasMore && (
                <div className="mt-10 text-center">
                  <button
                    type="button"
                    onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                    className="rounded-full border border-gray-200 bg-white px-6 py-2.5 text-xs font-semibold text-gray-600 transition-colors hover:border-cm-blue hover:text-cm-blue"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Case Studies Showcase - Omitted entirely when caseStudies.length === 0 */}
      {!loading && caseStudies.length > 0 && (
        <section className="border-t border-gray-100 bg-slate-50/70 px-4 py-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cm-blue">Proven Transformations</span>
                <h2 className="text-2xl font-bold tracking-tight text-cm-blue-dark sm:text-3xl">Campus Case Studies</h2>
                <p className="mt-1 text-sm text-gray-500">Explore real-world implementations delivered across leading institutions.</p>
              </div>
              <Link to="/contact-us" className="text-xs font-semibold text-cm-blue hover:underline">
                Partner on a Case Study &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {caseStudies.map((study: any, index: number) => {
                const cover = getCardCover(index);
                return (
                  <Link
                    key={study.title || index}
                    to={`/case-studies/${study.slug || slugify(study.title)}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="relative h-48 overflow-hidden" style={{ background: cover.background }}>
                      <MediaImage
                        src={study.image}
                        alt={study.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute bottom-0 left-0 h-6 w-6 rounded-tr-lg rounded-bl-lg" style={{ background: cover.accent }} />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-cm-blue">Case Study</div>
                      <h3 className="text-base font-bold text-gray-900 group-hover:text-cm-blue line-clamp-1">{study.title}</h3>
                      {study.description && (
                        <p className="mt-2 text-xs leading-relaxed text-gray-500 line-clamp-2">{study.description}</p>
                      )}
                      <span className="mt-auto pt-4 text-xs font-semibold text-cm-blue group-hover:underline">
                        Read Case Study &rarr;
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="bg-cm-yellow px-4 py-8 sm:px-6 md:py-10 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-2xl font-bold text-cm-blue-dark md:text-3xl">{ctaTitle}</h2>

          <p className="mx-auto mb-6 max-w-2xl text-base text-gray-700 md:text-lg">
            {ctaSubtitle}
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <button
              type="button"
              onClick={() => openRequestModal({ title: 'Custom Institutional Catalogue', slug: 'custom-catalogue' })}
              className="btn-primary cursor-pointer shadow-sm hover:shadow-md transition text-center"
            >
              {ctaButtonLabel || 'Request Custom Catalogue'}
            </button>

            <Link to="/contact-us" className="rounded-full bg-white px-6 py-3 font-semibold text-cm-blue-dark transition-colors hover:bg-gray-100">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Request Catalogue Modal */}
      {requestTarget && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-cm-blue">Request Custom Solution</span>
                <h2 className="text-lg font-bold text-slate-950">Request Catalogue</h2>
                <p className="mt-1 text-sm text-slate-500 font-medium">{requestTarget.title}</p>
              </div>
              <button
                type="button"
                onClick={closeRequestModal}
                aria-label="Close"
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {submitted ? (
                <div className="rounded-xl border border-green-200 bg-green-50 p-5 text-center">
                  <CheckCircle className="mx-auto h-8 w-8 text-green-600 mb-2" />
                  <h3 className="text-sm font-bold text-green-900">Thank you for your request!</h3>
                  <p className="text-xs text-green-700 mt-1">
                    Our team has received your enquiry for <strong>{requestTarget.title}</strong> and will email the catalogue to you shortly.
                  </p>
                  <button
                    type="button"
                    onClick={closeRequestModal}
                    className="mt-4 inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-xs font-semibold text-white hover:bg-green-700"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  {formError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                      {formError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                      <input
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-cm-blue focus:outline-none focus:ring-1 focus:ring-cm-blue"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter your name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Email *</label>
                      <input
                        type="email"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-cm-blue focus:outline-none focus:ring-1 focus:ring-cm-blue"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="your.email@example.com"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Phone *</label>
                      <input
                        type="tel"
                        pattern="(?:\+91[ -]?)?[6-9][0-9]{9}"
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-cm-blue focus:outline-none focus:ring-1 focus:ring-cm-blue"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Institution / Organisation</label>
                      <input
                        className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-cm-blue focus:outline-none focus:ring-1 focus:ring-cm-blue"
                        value={formData.institution}
                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                        placeholder="School / College / Organization"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Requirements / Message *</label>
                    <textarea
                      className="w-full min-h-[90px] rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-cm-blue focus:outline-none focus:ring-1 focus:ring-cm-blue resize-none"
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-cm-blue px-4 py-3 font-semibold text-white hover:bg-cm-blue-dark disabled:opacity-60 transition shadow-sm text-sm"
                  >
                    <Send className="h-4 w-4" />
                    {submitting ? 'Submitting Request...' : 'Send Catalogue Request'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Catalogues;
