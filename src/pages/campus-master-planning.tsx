import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronLeft, ChevronRight, Heart, Trash2 } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { useDesignWishlist } from '@/hooks/useDesignWishlist';
import LoginPromptModal from '@/components/login-prompt-modal';
import MediaImage from '@/components/ui/media-image';
import { PageCardGridSkeleton } from '@/components/ui/page-skeleton';
import {
  MASTER_PLANNING_PAGE_SLUG,
  slugifyMasterPlanningTitle,
  type MasterPlanningCard,
} from './campus-master-planning.data';

export interface CampusMasterPlanningStyles {
  headingFont?: 'playfair' | 'poppins' | 'grotesk' | 'opensans' | 'system';
  bodyFont?: 'playfair' | 'poppins' | 'grotesk' | 'opensans' | 'system';
  primaryColor?: string;
  heroBg?: 'white' | 'paper' | 'amber' | 'slate' | 'blue' | 'stone' | string;
  ctaBg?: 'blue' | 'stone' | 'amber' | 'slate' | 'white' | string;
  heroLayout?: 'minimal' | 'split-right' | 'split-left' | 'centered';
  cardColumns?: '2' | '3' | '4';
  showFeatured?: boolean;
  showFilters?: boolean;
}

const PAGE_SIZE = 12;

const CampusMasterPlanning = () => {
  const { data, loading } = usePageData(MASTER_PLANNING_PAGE_SLUG);
  const { isSaved, isPending, add, remove, showLoginPrompt, setShowLoginPrompt } =
    useDesignWishlist('campus-master-planning');

  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState('All');

  // Content field resolutions
  const heroEyebrow = data.heroEyebrow || 'Master Planning Services';
  const heroTitle = data.heroTitle || 'Campus Master Planning';
  const heroSubtitle =
    data.heroSubtitle ||
    'Visionary campus planning from concept to construction — a single master plan that sequences land, buildings and budget into a campus built to inspire generations.';
  const heroImage =
    data.heroImage ||
    'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=900&q=85';
  const heroButtonLabel = data.heroButtonLabel || 'Request Master Plan';
  const heroButtonHref = data.heroButtonHref || '/request-quote';
  const sectionTitle = data.section1Title || data.section2Title || 'Our Planning Services';
  const stepCountLabel = data.stepCountLabel || 'Core Services';
  const readMoreLabel = data.readMoreLabel || 'Learn More';
  const cards: MasterPlanningCard[] = Array.isArray(data.cards) ? data.cards : [];
  const ctaTitle = data.ctaTitle || 'Ready to Plan Your Campus?';
  const ctaSubtitle =
    data.ctaSubtitle ||
    'Tell us about your site and growth goals — our planning team will get back to you within 2 business days.';
  const ctaButtonLabel = data.ctaButtonLabel || 'Get a Project Quote';
  const ctaHref = data.ctaHref || '/request-quote';

  // Page Controls styling resolution
  const styles: CampusMasterPlanningStyles = {
    headingFont: 'poppins',
    bodyFont: 'opensans',
    primaryColor: '#0047ab',
    heroBg: 'white',
    ctaBg: 'blue',
    heroLayout: 'minimal',
    cardColumns: '3',
    showFeatured: false,
    showFilters: true,
    ...(data.styles || {}),
  };

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

  const primaryColor = styles.primaryColor || '#0047ab';

  // Hero theme resolution
  const heroBgTheme = styles.heroBg || 'white';
  const heroBgClass =
    heroBgTheme === 'amber'
      ? 'bg-amber-50/60 border-b border-amber-100'
      : heroBgTheme === 'slate'
      ? 'bg-slate-100/80 border-b border-slate-200/60'
      : heroBgTheme === 'blue'
      ? 'bg-blue-50/70 border-b border-blue-100'
      : heroBgTheme === 'paper'
      ? 'bg-[#fcfaf7] border-b border-[#f0eae1]'
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
      : ctaBgTheme === 'white'
      ? 'bg-slate-50 border border-slate-200 text-slate-900'
      : ctaBgTheme.startsWith('#')
      ? ''
      : 'bg-gradient-to-br from-cm-blue-dark to-cm-blue';

  const ctaInlineBg = ctaBgTheme.startsWith('#') ? { backgroundColor: ctaBgTheme } : undefined;
  const isCtaWhite = ctaBgTheme === 'white';

  // Card grid columns
  const cardGridColsClass =
    styles.cardColumns === '2'
      ? 'sm:grid-cols-2'
      : styles.cardColumns === '4'
      ? 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      : 'sm:grid-cols-2 lg:grid-cols-3';

  // Layout & section flags
  const heroLayout = styles.heroLayout || 'minimal';
  const showFeatured = Boolean(styles.showFeatured);
  const showFilters = Boolean(styles.showFilters);

  // Filters & cards resolution
  const filterOptions = useMemo(
    () => ['All', ...Array.from(new Set(cards.flatMap((card) => card.categories ?? []).filter(Boolean)))],
    [cards]
  );

  const filteredCards = useMemo(
    () =>
      activeFilter === 'All'
        ? cards
        : cards.filter((card) => (card.categories ?? []).includes(activeFilter)),
    [cards, activeFilter]
  );

  const featured = showFeatured && filteredCards.length > 0 ? filteredCards[0] : null;
  const gridCards = showFeatured && filteredCards.length > 0 ? filteredCards.slice(1) : filteredCards;

  const totalPages = Math.ceil(gridCards.length / PAGE_SIZE);
  const paginatedCards = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return gridCards.slice(startIndex, startIndex + PAGE_SIZE);
  }, [gridCards, page]);

  const cardLink = (card: MasterPlanningCard) =>
    card.href?.trim() || `/${MASTER_PLANNING_PAGE_SLUG}/${slugifyMasterPlanningTitle(card.title)}`;

  if (loading && !data.cards) {
    return <PageCardGridSkeleton cardCount={6} />;
  }

  return (
    <main className={`min-h-screen bg-white ${bodyFontClass}`}>
      {/* ─── HERO SECTION ─── */}
      {!data.hideHero && (
        <section
          style={heroInlineBg}
          className={`${heroBgClass} px-4 pt-8 pb-6 sm:px-6 lg:px-8 transition-colors`}
        >
          {heroLayout === 'centered' ? (
            /* Centered Hero Layout */
            <div className="mx-auto max-w-4xl text-center">
              {heroEyebrow && (
                <span
                  className="text-xs font-bold uppercase tracking-widest inline-block mb-2"
                  style={{ color: primaryColor }}
                >
                  {heroEyebrow}
                </span>
              )}
              <h1
                className={`${headingFontClass} text-3xl font-extrabold tracking-tight sm:text-5xl ${
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
                  <MediaImage src={heroImage} alt={heroTitle} className="h-full w-full object-cover" />
                </div>
              )}
            </div>
          ) : heroLayout === 'split-right' || heroLayout === 'split-left' ? (
            /* Split Hero Layout */
            <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-7 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
              <div className={heroLayout === 'split-left' ? 'order-1 lg:order-2' : ''}>
                {heroEyebrow && (
                  <span
                    className="text-xs font-bold uppercase tracking-widest inline-block mb-2"
                    style={{ color: primaryColor }}
                  >
                    {heroEyebrow}
                  </span>
                )}
                <h1
                  className={`${headingFontClass} text-3xl font-extrabold tracking-tight sm:text-5xl ${
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
                <MediaImage src={heroImage} alt={heroTitle} className="h-full w-full object-cover" />
              </div>
            </div>
          ) : (
            /* Minimal Header Layout (Default) */
            <div className="mx-auto max-w-6xl">
              {heroEyebrow && (
                <span
                  className="text-xs font-bold uppercase tracking-widest inline-block mb-2"
                  style={{ color: primaryColor }}
                >
                  {heroEyebrow}
                </span>
              )}
              <h1
                className={`${headingFontClass} text-3xl font-extrabold tracking-tight sm:text-4xl ${
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

      {/* ─── SERVICES GRID SECTION ─── */}
      {!data.hideCards && cards.length > 0 && (
        <section id="planning-services" className="px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {/* Header & Counter */}
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <h2 className={`${headingFontClass} text-xl font-bold text-cm-blue-dark sm:text-2xl`}>
                {sectionTitle}
              </h2>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {filteredCards.length} {stepCountLabel}
              </span>
            </div>

            {/* Filter Pills */}
            {showFilters && !data.hideFilters && filterOptions.length > 1 && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                {filterOptions.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => {
                      setActiveFilter(category);
                      setPage(1);
                    }}
                    style={
                      activeFilter === category
                        ? { backgroundColor: primaryColor, borderColor: primaryColor, color: '#fff' }
                        : undefined
                    }
                    className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                      activeFilter === category
                        ? 'border-transparent text-white'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}

            {/* Featured Service Card Banner */}
            {featured && (
              <article className="group mb-8 grid grid-cols-1 overflow-hidden rounded-2xl border border-gray-100 bg-slate-50/70 shadow-sm transition-all hover:shadow-lg lg:grid-cols-[1.2fr_1fr]">
                <div className="h-60 overflow-hidden lg:h-auto bg-slate-100">
                  {featured.image && (
                    <MediaImage
                      src={featured.image}
                      alt={featured.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span
                      className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider"
                      style={{ color: primaryColor }}
                    >
                      Featured · {featured.categories?.[0] ?? 'Planning'}
                    </span>
                    <div className="flex items-center gap-1">
                      {isSaved({ title: featured.title, image: featured.image }) ? (
                        <span className="inline-flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-[10px] font-bold text-green-700">
                          <Check className="h-3 w-3" /> Saved
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => add({ title: featured.title, image: featured.image })}
                          disabled={isPending({ title: featured.title, image: featured.image })}
                          className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-2 py-1 text-[10px] font-bold text-gray-600 transition-colors hover:text-red-600 disabled:opacity-50"
                          title="Add to wishlist"
                        >
                          <Heart className="h-3 w-3" /> Wishlist
                        </button>
                      )}
                    </div>
                  </div>
                  <h3 className={`${headingFontClass} mb-3 text-2xl font-bold leading-tight text-cm-blue-dark sm:text-3xl`}>
                    {featured.title}
                  </h3>
                  {featured.description && (
                    <p className="mb-4 text-sm leading-relaxed text-gray-600">{featured.description}</p>
                  )}
                  <div className="mt-2">
                    <Link
                      to={cardLink(featured)}
                      style={{ color: primaryColor }}
                      className="inline-flex w-fit items-center gap-2 border-b-2 pb-1 text-sm font-bold transition-all hover:gap-3"
                    >
                      {readMoreLabel} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            )}

            {/* Grid Services */}
            <div className={`grid grid-cols-1 gap-6 ${cardGridColsClass}`}>
              {paginatedCards.map((card) => {
                const category = card.categories?.[0] ?? 'Planning';
                const wishlistCard = { title: card.title, image: card.image };
                return (
                  <div
                    key={card.title}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <Link to={cardLink(card)} className="block">
                      <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                        {card.image && (
                          <MediaImage
                            src={card.image}
                            alt={card.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                        <span
                          className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-xs"
                          style={{ color: primaryColor }}
                        >
                          {category}
                        </span>
                      </div>
                    </Link>

                    <div className="flex flex-1 flex-col p-6">
                      <Link to={cardLink(card)} className="block flex-1">
                        <h3 className={`${headingFontClass} text-lg font-bold text-cm-blue-dark transition-colors group-hover:text-cm-blue`}>
                          {card.title}
                        </h3>
                        {card.description && (
                          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-gray-600">
                            {card.description}
                          </p>
                        )}
                      </Link>

                      <div className="mt-5 flex items-center justify-between border-t border-gray-50 pt-3">
                        <Link
                          to={cardLink(card)}
                          style={{ color: primaryColor }}
                          className="inline-flex items-center gap-1.5 text-sm font-bold transition-all group-hover:gap-2.5"
                        >
                          {readMoreLabel} <ArrowRight className="h-4 w-4" />
                        </Link>

                        {/* Wishlist toggle */}
                        {isSaved(wishlistCard) ? (
                          <div className="flex items-center gap-1">
                            <span className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-[10px] font-bold text-green-700">
                              <Check className="h-3 w-3" /> Saved
                            </span>
                            <button
                              type="button"
                              onClick={() => remove(wishlistCard)}
                              disabled={isPending(wishlistCard)}
                              className="rounded-md bg-red-50 p-1 text-red-600 hover:bg-red-100 disabled:opacity-50"
                              title="Remove"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => add(wishlistCard)}
                            disabled={isPending(wishlistCard)}
                            style={{ color: primaryColor }}
                            className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold hover:bg-gray-100 disabled:opacity-50"
                            title="Add to Wishlist"
                          >
                            <Heart className="h-3 w-3" /> Save
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPage((p) => Math.max(p - 1, 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => {
                      setPage(pageNum);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={page === pageNum ? { backgroundColor: primaryColor, color: '#fff' } : undefined}
                    className={`h-9 w-9 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                      page === pageNum
                        ? 'text-white shadow-xs'
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setPage((p) => Math.min(p + 1, totalPages));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
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

      {/* ─── BOTTOM CTA BANNER ─── */}
      {!data.hideCta && (
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div
            style={ctaInlineBg}
            className={`mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 rounded-[2rem] ${ctaBgClass} px-8 py-8 text-center sm:flex-row sm:px-12 sm:text-left shadow-lg transition-colors`}
          >
            <div>
              <h2 className={`${headingFontClass} text-2xl font-bold sm:text-3xl ${isCtaWhite ? 'text-slate-900' : 'text-white'}`}>
                {ctaTitle}
              </h2>
              <p className={`mt-2 max-w-xl text-sm sm:text-base ${isCtaWhite ? 'text-slate-600' : 'text-white/85'}`}>
                {ctaSubtitle}
              </p>
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

      {/* Login Prompt Modal for Wishlist */}
      <LoginPromptModal open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
    </main>
  );
};

export default CampusMasterPlanning;
