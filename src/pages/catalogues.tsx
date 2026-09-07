import { useEffect, useMemo, useState, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { Download, FileText, BookOpen, ArrowRight, Lock, Search } from 'lucide-react';
import api from '@/api/client';
import { usePageData } from '@/hooks/usePageData';
import LoginPromptModal from '@/components/login-prompt-modal';
import { resolveMediaUrl } from '@/lib/media-url';
import { getCardCover } from '@/lib/card-covers';

const normalizeCatalogDownload = (value?: string) => {
  if (!value || value === '#') return '';
  return resolveMediaUrl(value);
};

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
    'Every SchoolMart product range, brief and design guide in one library — download the PDFs your team needs to plan and spec a campus.',
  heroImage: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=600&q=80',
  cards: [
    {
      title: 'NEP READY CLASSROOM FURNITURE',
      description:
        'Furniture solutions specifically designed to align with New Education Policy guidelines for modern classrooms.',
      image:
        'https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      downloadLink: '',
      size: '12 MB',
    },
    {
      title: 'SCHOOLMART BRIEF PROFILE [PDF]',
      description:
        "An overview of SchoolMart's mission, services, and extensive experience in educational infrastructure.",
      image:
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      downloadLink: '',
      size: '5 MB',
    },
    {
      title: 'SCHOOL DESIGN [PDF]',
      description:
        'Comprehensive guide on architectural and ergonomic principles for modern school environments.',
      image:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      downloadLink: '',
      size: '18 MB',
    },
    {
      title: 'CLASSROOM CONFIGURATION IDEAS [PDF]',
      description:
        'Creative and functional layout samples for various classroom sizes and learning objectives.',
      image:
        'https://images.unsplash.com/photo-1588072432836-e10032774350?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      downloadLink: '',
      size: '8 MB',
    },
    {
      title: 'MASTER CATALOGUE',
      description:
        'Our full range of products including Labs, Libraries, Sports, and AI Stations.',
      image:
        'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      downloadLink: '',
      size: '25 MB',
    },
  ],
  caseStudies: [
    {
      title: 'Campus Master Planning',
      description:
        'Complete campus transformation for a leading university in Bangalore.',
      image:
        'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    },
    {
      title: '20 Stunning College Buildings',
      description:
        'Showcase of our most innovative campus architecture projects.',
      image:
        'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    },
    {
      title: 'STEM Lab Implementation',
      description:
        'State-of-the-art STEM lab setup for a prestigious school chain.',
      image:
        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
    },
  ],
};

const Catalogues = () => {
  const { data } = usePageData('catalogues');
  const [catalogueRows, setCatalogueRows] = useState<any[]>([]);
  const [caseStudyRows, setCaseStudyRows] = useState<any[]>([]);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const isLoggedIn = Boolean(localStorage.getItem('cm_token'));

  const handleDownloadClick = async (e: MouseEvent, catalogue: any) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }

    const filename = `${(catalogue.title || 'catalogue').replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'catalogue'}.pdf`;
    const token = localStorage.getItem('cm_token');

    try {
      // Catalogue PDFs require a logged-in user server-side, so the token has
      // to travel as a header on this fetch — a plain <a>/window.open navigation
      // never carries one.
      const response = await fetch(catalogue.downloadLink, token ? { headers: { Authorization: `Bearer ${token}` } } : undefined);
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
      // Fall back to opening the file directly if it can't be fetched as a blob
      // (e.g. a cross-origin host that doesn't allow fetch reads). A direct
      // navigation can't carry the auth header, so pass the token as a query
      // param instead — the backend accepts either.
      const fallbackUrl = token ? `${catalogue.downloadLink}${catalogue.downloadLink.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}` : catalogue.downloadLink;
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
          image: resolveMediaUrl(catalogue.thumbnailUrl) || '',
          downloadLink: normalizeCatalogDownload(catalogue.fileUrl),
          size: 'PDF',
          date: catalogue.createdAt,
        }));

        setCatalogueRows(mapped);
      })
      .catch(() => {
        if (active) setCatalogueRows([]);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    api
      .get('/case-studies')
      .then((res) => {
        if (!active) return;

        const mapped = (Array.isArray(res.data) ? res.data : []).map((study: any) => ({
          title: study.title,
          description: study.description || '',
          image:
            resolveMediaUrl(study.imageUrl) ||
            'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
          slug: study.slug,
        }));

        setCaseStudyRows(mapped);
      })
      .catch(() => {
        if (active) setCaseStudyRows([]);
      });

    return () => {
      active = false;
    };
  }, []);

  const catalogues =
    catalogueRows.length > 0
      ? catalogueRows
      : data.cards && data.cards.length > 0
        ? data.cards.map((catalogue: any) => ({
            ...catalogue,
            image: resolveMediaUrl(catalogue.image) || catalogue.image,
            downloadLink: normalizeCatalogDownload(catalogue.downloadLink ?? catalogue.fileUrl),
          }))
        : DEFAULTS.cards;

  const caseStudies =
    caseStudyRows.length > 0 ? caseStudyRows : data.caseStudies && data.caseStudies.length > 0 ? data.caseStudies : DEFAULTS.caseStudies;

  const filteredCatalogues = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return catalogues;
    return catalogues.filter((item: any) => `${item.title} ${item.description}`.toLowerCase().includes(query));
  }, [catalogues, searchQuery]);

  const visibleCatalogues = filteredCatalogues.slice(0, visibleCount);
  const hasMore = visibleCount < filteredCatalogues.length;

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

      {/* Toolbar */}
      <section className="px-4 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold text-gray-400">
            Showing {filteredCatalogues.length} of {catalogues.length} catalogues
          </p>
          <label className="flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs text-gray-500 sm:w-56">
            <Search className="h-3.5 w-3.5" />
            <input
              type="text"
              placeholder="Search catalogues..."
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
              className="w-full bg-transparent outline-none placeholder:text-gray-400"
            />
          </label>
        </div>
      </section>

      {/* Catalogues Grid */}
      <section className="px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {visibleCatalogues.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 py-20 text-center text-gray-500">No catalogues found.</div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                {visibleCatalogues.map((catalogue: any, index: number) => {
                  const cover = getCardCover(index);
                  const hasDownload = Boolean(catalogue.downloadLink);
                  return (
                    <div key={catalogue.title} className="group min-w-0">
                      <div className="relative h-48 overflow-hidden rounded-xl" style={{ background: cover.background }}>
                        {catalogue.image && (
                          <img src={catalogue.image} alt={catalogue.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        )}
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

                      {hasDownload ? (
                        <a
                          href={catalogue.downloadLink}
                          onClick={(e) => handleDownloadClick(e, catalogue)}
                          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cm-blue px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cm-blue-dark"
                        >
                          {isLoggedIn ? <Download className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                          Download PDF
                        </a>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="mt-4 inline-flex cursor-not-allowed items-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-400"
                        >
                          <Download className="h-4 w-4" />
                          PDF Unavailable
                        </button>
                      )}
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

      {/* Case Studies */}
      <section className="bg-gradient-to-b from-gray-50 to-white px-4 py-6 sm:px-6 md:py-8 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-4 text-center text-3xl font-bold text-cm-blue-dark md:text-4xl">Case Studies &amp; Projects</h2>

          <p className="mx-auto mb-6 max-w-3xl text-center text-base text-gray-600 md:mb-8 md:text-lg">
            Explore our completed projects and see how we've transformed educational institutions.
          </p>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
            {caseStudies.map((study: any) => (
              <div key={study.title} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition-all duration-300 hover:border-cm-blue/20 hover:shadow-xl">
                <div className="h-56 overflow-hidden bg-gray-100">
                  <img src={study.image} alt={study.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>

                <div className="p-6 md:p-8">
                  <div className="mb-4 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-cm-blue" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-cm-blue">Case Study</span>
                  </div>

                  <h3 className="mb-3 text-lg font-bold text-cm-blue-dark">{study.title}</h3>

                  <p className="mb-6 text-sm text-gray-600">{study.description}</p>

                  <Link
                    to={study.slug ? `/case-studies/${study.slug}` : '/contact-us'}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-cm-blue transition-colors duration-200 hover:text-cm-blue-dark"
                  >
                    Read More
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-cm-yellow px-4 py-6 sm:px-6 md:py-8 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="mb-6 text-3xl font-bold text-cm-blue-dark md:text-4xl">Need a Custom Solution?</h2>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-700 md:text-xl">
            Our team can create customized catalogues based on your specific requirements.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link to="/request-quote" className="btn-primary">
              Request Custom Catalogue
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
