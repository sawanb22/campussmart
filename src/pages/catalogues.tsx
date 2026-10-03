import { useEffect, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Download, FileText, Lock } from 'lucide-react';
import api from '@/api/client';
import { usePageData } from '@/hooks/usePageData';
import LoginPromptModal from '@/components/login-prompt-modal';
import { resolveMediaUrl } from '@/lib/media-url';
import { MediaImage } from '@/components/ui/media-image';
import { getCardCover } from '@/lib/card-covers';

const MASTER_CATALOGUE_FALLBACK = '/uploads/catalogues/1790872959601-232430012.pdf';

const normalizeCatalogDownload = (value?: string) => {
  if (!value || value === '#' || value.trim() === '') {
    return resolveMediaUrl(MASTER_CATALOGUE_FALLBACK);
  }
  return resolveMediaUrl(value);
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
  const { data } = usePageData('catalogues');
  const heroTitle = data.heroTitle ?? DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? DEFAULTS.heroSubtitle;
  const heroImage = data.heroImage || DEFAULTS.heroImage;
  const ctaTitle = data.ctaTitle ?? DEFAULTS.ctaTitle;
  const ctaSubtitle = data.ctaSubtitle ?? DEFAULTS.ctaSubtitle;
  const ctaButtonLabel = data.ctaButtonLabel ?? DEFAULTS.ctaButtonLabel;
  const ctaHref = data.ctaHref ?? DEFAULTS.ctaHref;

  const [catalogueRows, setCatalogueRows] = useState<any[]>([]);
  const [loadingCatalogues, setLoadingCatalogues] = useState(true);
  const [caseStudyRows, setCaseStudyRows] = useState<any[]>([]);
  const [loadingCaseStudies, setLoadingCaseStudies] = useState(true);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const isLoggedIn = Boolean(localStorage.getItem('cm_token'));

  const handleDownloadClick = async (e: MouseEvent, catalogue: any) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    const targetUrl = resolveMediaUrl(catalogue.downloadLink || MASTER_CATALOGUE_FALLBACK);
    const filename = `${(catalogue.title || 'catalogue').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'catalogue'}.pdf`;
    const token = localStorage.getItem('cm_token');

    try {
      const response = await fetch(targetUrl, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      const fallbackUrl = token ? `${targetUrl}${targetUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}` : targetUrl;
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
    }
  };

  useEffect(() => {
    let active = true;

    api
      .get('/catalogues')
      .then((res) => {
        if (!active) return;
        const mapped = (Array.isArray(res.data) ? res.data : []).map((catalogue: any) => ({
          title: catalogue.title,
          description: catalogue.description || 'Download the catalogue PDF.',
          image: catalogue.thumbnailUrl || '',
          downloadLink: normalizeCatalogDownload(catalogue.fileUrl),
          size: 'PDF',
          date: catalogue.createdAt,
        }));
        setCatalogueRows(mapped);
      })
      .catch(() => {
        if (active) setCatalogueRows([]);
      })
      .finally(() => {
        if (active) setLoadingCatalogues(false);
      });

    api
      .get('/case-studies')
      .then((res) => {
        if (!active) return;
        setCaseStudyRows(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (active) setCaseStudyRows([]);
      })
      .finally(() => {
        if (active) setLoadingCaseStudies(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const catalogues = loadingCatalogues
    ? []
    : catalogueRows.length > 0
      ? catalogueRows
      : Array.isArray(data.cards) && data.cards.length > 0
        ? data.cards.map((catalogue: any) => ({
            ...catalogue,
            image: catalogue.image || '',
            downloadLink: normalizeCatalogDownload(catalogue.downloadLink ?? catalogue.fileUrl),
          }))
        : DEFAULTS.cards;

  const caseStudies = loadingCaseStudies
    ? []
    : caseStudyRows.length > 0
      ? caseStudyRows.map((cs: any) => ({
          title: cs.title,
          description: cs.description || '',
          image: cs.imageUrl || '',
          slug: cs.slug || slugify(cs.title),
        }))
      : Array.isArray(data.caseStudies) && data.caseStudies.length > 0
        ? data.caseStudies.map((cs: any) => ({
            ...cs,
            slug: cs.slug || slugify(cs.title),
          }))
        : DEFAULTS.caseStudies;

  const visibleCatalogues = catalogues.slice(0, visibleCount);
  const hasMore = visibleCount < catalogues.length;

  return (
    <main className="min-h-screen bg-white">
      <LoginPromptModal
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        icon={Lock}
        eyebrow="Registered users only"
        title="Register to download catalogues"
        description="Create a free account to download our product catalogues and case study PDFs."
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

      {/* Toolbar */}
      <section className="px-4 pt-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 border-b border-gray-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold text-gray-500">
            {loadingCatalogues ? 'Loading catalogue library...' : `Showing ${catalogues.length} catalogues`}
          </p>
        </div>
      </section>

      {/* Catalogues Grid */}
      <section className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {loadingCatalogues ? (
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
                  const hasDownload = Boolean(catalogue.downloadLink);
                  return (
                    <div key={catalogue.title} className="group min-w-0 flex flex-col justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:shadow-md">
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
                        {hasDownload ? (
                          <a
                            href={catalogue.downloadLink}
                            onClick={(e) => handleDownloadClick(e, catalogue)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-cm-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cm-blue-dark"
                          >
                            {isLoggedIn ? <Download className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                            Download PDF
                          </a>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-400"
                          >
                            <Download className="h-4 w-4" />
                            PDF Unavailable
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

      {/* Case Studies Showcase */}
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

          {loadingCaseStudies ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="animate-pulse rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                  <div className="h-44 rounded-xl bg-gray-200" />
                  <div className="mt-4 h-5 w-2/3 rounded bg-gray-200" />
                  <div className="mt-2 h-4 w-full rounded bg-gray-100" />
                </div>
              ))}
            </div>
          ) : caseStudies.length === 0 ? null : (
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
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-cm-yellow px-4 py-8 sm:px-6 md:py-10 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-4 text-2xl font-bold text-cm-blue-dark md:text-3xl">{ctaTitle}</h2>

          <p className="mx-auto mb-6 max-w-2xl text-base text-gray-700 md:text-lg">
            {ctaSubtitle}
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to={ctaHref?.trim() || '/request-quote'} className="btn-primary">
              {ctaButtonLabel || 'Request Custom Catalogue'}
            </Link>

            <Link to="/contact-us" className="rounded-full bg-white px-6 py-3 font-semibold text-cm-blue-dark transition-colors hover:bg-gray-100">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Catalogues;
