import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import MediaImage from '@/components/ui/media-image';
import { PageCardGridSkeleton } from '@/components/ui/page-skeleton';
import {
  AR_VR_PAGE_SLUG,
  slugifyArVrTitle,
  type ArVrCard,
  type ArVrStyles,
} from './ar-vr-experiences.data';

const PAGE_SIZE = 12;

const ArVrExperiences = () => {
  const { data, loading } = usePageData(AR_VR_PAGE_SLUG);
  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(1);

  const heroEyebrow = data.heroEyebrow || '';
  const heroTitle = data.heroTitle || '';
  const heroSubtitle = data.heroSubtitle || '';
  const heroImage = data.heroImage || '';
  const heroButtonLabel = data.heroButtonLabel || '';
  const heroButtonHref = data.heroButtonHref || '/request-quote';
  const sectionHeading = data.section1Title || data.section2Title || '';
  const stepCountLabel = data.stepCountLabel || '';
  const readMoreLabel = data.readMoreLabel || '';
  const allCards: ArVrCard[] =
    Array.isArray(data.cards) ? data.cards : [];
  const ctaTitle = data.ctaTitle || '';
  const ctaSubtitle = data.ctaSubtitle || '';
  const ctaButtonLabel = data.ctaButtonLabel || '';
  const ctaHref = data.ctaHref || '/request-quote';

  const styles: ArVrStyles = {
    headingFont: 'poppins',
    bodyFont: 'opensans',
    primaryColor: '#0047ab',
    heroBg: 'white',
    ctaBg: 'blue',
    heroLayout: 'minimal',
    cardColumns: '3',
    showFeatured: false,
    showFilters: false,
    ...(data.styles || {}),
  };

  // Typography font classes
  const headingFontClass =
    styles.headingFont === 'playfair'
      ? 'font-playfair'
      : styles.headingFont === 'grotesk'
      ? 'font-grotesk'
      : styles.headingFont === 'opensans'
      ? 'font-opensans'
      : styles.headingFont === 'system'
      ? 'font-sans'
      : 'font-poppins';

  const bodyFontClass =
    styles.bodyFont === 'poppins'
      ? 'font-poppins'
      : styles.bodyFont === 'grotesk'
      ? 'font-grotesk'
      : styles.bodyFont === 'system'
      ? 'font-sans'
      : 'font-opensans';

  // Primary accent color
  const primaryColor = styles.primaryColor || '#0047ab';

  // Hero background theme
  const heroBgTheme = styles.heroBg || 'white';
  const heroBgClass =
    heroBgTheme === 'amber'
      ? 'bg-amber-50/60 border-b border-amber-100'
      : heroBgTheme === 'slate'
      ? 'bg-slate-100/80 border-b border-slate-200/60'
      : heroBgTheme === 'blue'
      ? 'bg-blue-50/70 border-b border-blue-100'
      : heroBgTheme === 'stone'
      ? 'bg-stone-900 text-white'
      : heroBgTheme.startsWith('#')
      ? ''
      : 'bg-white';

  const isHeroDark = heroBgTheme === 'stone';
  const heroInlineBg = heroBgTheme.startsWith('#') ? { backgroundColor: heroBgTheme } : undefined;

  // CTA background theme
  const ctaBgTheme = styles.ctaBg || 'blue';
  const ctaBgClass =
    ctaBgTheme === 'stone'
      ? 'bg-stone-900'
      : ctaBgTheme === 'amber'
      ? 'bg-amber-950'
      : ctaBgTheme === 'slate'
      ? 'bg-slate-900'
      : ctaBgTheme.startsWith('#')
      ? ''
      : 'bg-gradient-to-br from-cm-blue-dark to-cm-blue';

  const ctaInlineBg = ctaBgTheme.startsWith('#') ? { backgroundColor: ctaBgTheme } : undefined;

  // Grid columns class
  const cardGridColsClass =
    styles.cardColumns === '2'
      ? 'sm:grid-cols-2'
      : styles.cardColumns === '4'
      ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      : 'sm:grid-cols-2 lg:grid-cols-3';

  // Layout & visibility toggles
  const heroLayout = styles.heroLayout || 'minimal';
  const showFeatured = Boolean(styles.showFeatured);
  const showFilters = Boolean(styles.showFilters) && !data.hideFilters;

  const categoryOptions = useMemo(
    () => ['All', ...Array.from(new Set(allCards.flatMap((card) => card.categories ?? []).filter(Boolean)))],
    [allCards],
  );

  const filteredCards = useMemo(
    () =>
      activeCategory === 'All'
        ? allCards
        : allCards.filter((card) => (card.categories ?? []).includes(activeCategory)),
    [allCards, activeCategory],
  );

  const totalPages = Math.ceil(filteredCards.length / PAGE_SIZE);
  const paginatedCards = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredCards.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredCards, page]);

  const featured = showFeatured ? paginatedCards[0] : null;
  const gridCards = showFeatured ? paginatedCards.slice(1) : paginatedCards;

  const cardLink = (card: ArVrCard) =>
    card.href?.trim() || `/${AR_VR_PAGE_SLUG}/${card.slug?.trim() || slugifyArVrTitle(card.title)}`;

  if (loading) {
    return <PageCardGridSkeleton cardCount={6} />;
  }

  return (
    <main className={`min-h-screen bg-white ${bodyFontClass}`}>
      {/* Hero / Section Header */}
      {!data.hideHero && (
        <section
          style={heroInlineBg}
          className={`${heroBgClass} px-4 pt-8 pb-5 sm:px-6 lg:px-8 transition-colors`}
        >
          {heroLayout === 'centered' ? (
            /* Centered Hero Layout */
            <div className="mx-auto max-w-4xl text-center">
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: primaryColor }}
              >
                {heroEyebrow}
              </span>
              <h1
                className={`${headingFontClass} mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl ${
                  isHeroDark ? 'text-white' : 'text-cm-blue-dark'
                }`}
              >
                {heroTitle}
              </h1>
              <p
                className={`mt-3 max-w-2xl mx-auto text-base leading-relaxed ${
                  isHeroDark ? 'text-white/75' : 'text-gray-600'
                }`}
              >
                {heroSubtitle}
              </p>
              {heroButtonLabel && (
                <div className="mt-5 flex justify-center">
                  <Link
                    to={heroButtonHref || '/request-quote'}
                    style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                    className="btn-primary inline-flex items-center gap-2 text-white shadow-md hover:brightness-110"
                  >
                    {heroButtonLabel} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
              {heroImage && (
                <div className="mt-7 overflow-hidden rounded-2xl shadow-xl max-w-2xl mx-auto h-60 sm:h-80">
                  <MediaImage
                    src={heroImage}
                    alt={heroTitle}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}
            </div>
          ) : heroLayout === 'split-right' || heroLayout === 'split-left' ? (
            /* Split Hero Layout */
            <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-7 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
              <div className={heroLayout === 'split-left' ? 'order-1 lg:order-2' : ''}>
                <span
                  className="text-xs font-bold uppercase tracking-widest"
                  style={{ color: primaryColor }}
                >
                  {heroEyebrow}
                </span>
                <h1
                  className={`${headingFontClass} mt-2 text-3xl font-extrabold tracking-tight sm:text-5xl ${
                    isHeroDark ? 'text-white' : 'text-cm-blue-dark'
                  }`}
                >
                  {heroTitle}
                </h1>
                <p
                  className={`mt-3 max-w-2xl text-base leading-relaxed ${
                    isHeroDark ? 'text-white/75' : 'text-gray-600'
                  }`}
                >
                  {heroSubtitle}
                </p>
                {heroButtonLabel && (
                  <div className="mt-5 flex flex-wrap gap-3">
                    <Link
                      to={heroButtonHref || '/request-quote'}
                      style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                      className="btn-primary inline-flex items-center gap-2 text-white shadow-md hover:brightness-110"
                    >
                      {heroButtonLabel} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
              <div
                className={`relative mx-auto w-full max-w-md overflow-hidden rounded-2xl shadow-xl h-64 sm:h-72 ${
                  heroLayout === 'split-left' ? 'order-2 lg:order-1' : ''
                }`}
              >
                <MediaImage
                  src={heroImage}
                  alt={heroTitle}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          ) : (
            /* Minimal Header Layout (Default) */
            <div className="mx-auto max-w-6xl">
              <span
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: primaryColor }}
              >
                {heroEyebrow}
              </span>
              <h1
                className={`${headingFontClass} mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl ${
                  isHeroDark ? 'text-white' : 'text-cm-blue-dark'
                }`}
              >
                {heroTitle}
              </h1>
              <p
                className={`mt-3 max-w-3xl text-base leading-relaxed ${
                  isHeroDark ? 'text-white/75' : 'text-gray-600'
                }`}
              >
                {heroSubtitle}
              </p>
              {heroButtonLabel && (
                <div className="mt-5">
                  <Link
                    to={heroButtonHref || '/request-quote'}
                    style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                    className="btn-primary inline-flex items-center gap-2 text-white shadow-md hover:brightness-110"
                  >
                    {heroButtonLabel} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Experiences Grid */}
      {!data.hideCards && allCards.length > 0 && (
        <section className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <h2 className={`${headingFontClass} text-xl font-bold text-cm-blue-dark sm:text-2xl`}>
                {sectionHeading}
              </h2>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {filteredCards.length} {stepCountLabel}
              </span>
            </div>

            {/* Category filter chips (when enabled) */}
            {showFilters && categoryOptions.length > 1 && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                {categoryOptions.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setActiveCategory(category);
                      setPage(1);
                    }}
                    style={
                      activeCategory === category
                        ? { backgroundColor: primaryColor, borderColor: primaryColor, color: '#fff' }
                        : undefined
                    }
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                      activeCategory === category
                        ? 'border-transparent text-white'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}

            {/* Featured Card Banner (when enabled) */}
            {featured && (
              <Link
                to={cardLink(featured)}
                className="group mb-6 grid grid-cols-1 overflow-hidden rounded-2xl border border-gray-100 bg-slate-50/70 shadow-sm transition-all hover:shadow-lg sm:grid-cols-[1.2fr_0.8fr]"
              >
                <div className="min-h-[220px] overflow-hidden bg-slate-100 sm:min-h-full">
                  {featured.image && (
                    <MediaImage
                      src={featured.image}
                      alt={featured.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <span
                    className="mb-2.5 inline-block w-fit rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: primaryColor }}
                  >
                    Featured
                  </span>
                  <h3 className={`${headingFontClass} text-2xl font-bold leading-tight text-cm-blue-dark sm:text-3xl`}>
                    {featured.title}
                  </h3>
                  {featured.description && (
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">{featured.description}</p>
                  )}
                  <div className="mt-5">
                    <span
                      className="inline-flex items-center gap-1.5 text-sm font-bold transition-all group-hover:gap-2.5"
                      style={{ color: primaryColor }}
                    >
                      {readMoreLabel} <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            )}

            <div className={`grid grid-cols-1 gap-6 ${cardGridColsClass}`}>
              {gridCards.map((card) => (
                <Link
                  key={card.title}
                  to={cardLink(card)}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    {card.image && (
                      <MediaImage
                        src={card.image}
                        alt={card.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h3 className={`${headingFontClass} text-lg font-bold text-cm-blue-dark transition-colors group-hover:text-cm-blue`}>
                      {card.title}
                    </h3>
                    {card.description && (
                      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">
                        {card.description}
                      </p>
                    )}
                    <div className="mt-5 border-t border-gray-50 pt-3">
                      <span
                        className="inline-flex items-center gap-1.5 text-sm font-bold transition-all group-hover:gap-2.5"
                        style={{ color: primaryColor }}
                      >
                        {readMoreLabel} <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`h-9 w-9 rounded-lg text-sm font-semibold transition-colors ${
                      page === pageNum
                        ? 'bg-cm-blue text-white shadow-sm'
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Bottom CTA Banner */}
      {!data.hideCta && (
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div
            style={ctaInlineBg}
            className={`mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 rounded-[2rem] ${ctaBgClass} px-8 py-8 text-center sm:flex-row sm:px-12 sm:text-left shadow-lg transition-colors`}
          >
            <div>
              <h2 className={`${headingFontClass} text-2xl font-bold text-white sm:text-3xl`}>{ctaTitle}</h2>
              <p className="mt-2 max-w-xl text-sm text-white/85 sm:text-base">{ctaSubtitle}</p>
            </div>
            <Link
              to={ctaHref}
              className="btn-secondary inline-flex flex-shrink-0 items-center gap-2 px-8 py-3.5 text-sm font-bold shadow-md hover:scale-105 transition-all"
            >
              {ctaButtonLabel} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}
    </main>
  );
};

export default ArVrExperiences;
