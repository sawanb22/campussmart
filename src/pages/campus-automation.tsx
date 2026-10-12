import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, ChevronLeft, ChevronRight, Heart, Trash2 } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { useDesignWishlist } from '@/hooks/useDesignWishlist';
import LoginPromptModal from '@/components/login-prompt-modal';
import MediaImage from '@/components/ui/media-image';

export interface CardItem {
  title: string;
  description: string;
  image?: string;
  categories?: string[];
  href?: string;
}

export interface CampusAutomationStyles {
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

export const CAMPUS_AUTOMATION_PAGE_SLUG = 'campus-automation';

export function slugifyCampusAutomationTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'module'
  );
}

export const CAMPUS_AUTOMATION_DEFAULTS = {
  heroEyebrow: 'Campus Operations & Workflow',
  heroTitle: 'Turn everyday operations into automated workflows.',
  heroSubtitle:
    'Admissions, attendance, finance, scheduling and reporting — automated so your staff can spend less time on paperwork and more time with students.',
  heroImage: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  heroButtonLabel: 'Schedule a Demo',
  heroButtonHref: '/contact-us',
  section1Title: 'Automation Modules',
  readMoreLabel: 'Talk to us about it',
  stepCountLabel: 'Automation Modules',
  cards: [
    {
      title: 'Automated Admissions',
      description:
        'Move applicants from enquiry to enrolment with online forms, document checks and status tracking that runs itself — no more chasing paperwork.',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=85',
      categories: ['Admissions'],
    },
    {
      title: 'Smart Attendance',
      description: 'Biometric and RFID attendance that syncs straight to parent alerts and academic records.',
      image: 'https://images.unsplash.com/photo-1596496181848-3091d4878b24?auto=format&fit=crop&w=800&q=85',
      categories: ['Attendance'],
    },
    {
      title: 'Finance & Fee Automation',
      description: 'Automated fee reminders, online payments and real-time reconciliation that keeps accounts audit-ready.',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=85',
      categories: ['Finance'],
    },
    {
      title: 'Timetable Scheduling',
      description: 'Generate conflict-free timetables in minutes and adjust instantly when a class or faculty member changes.',
      image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=85',
      categories: ['Scheduling'],
    },
    {
      title: 'Research & Compliance Tracking',
      description: 'Track grants, publications and regulatory filings in one dashboard instead of scattered spreadsheets.',
      image: 'https://images.unsplash.com/photo-1554774853-b415df9eeb92?auto=format&fit=crop&w=800&q=85',
      categories: ['Research'],
    },
    {
      title: 'Operations Dashboard',
      description: 'A single real-time view of admissions, attendance and finance for administrators and leadership.',
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=85',
      categories: ['Analytics'],
    },
  ] as CardItem[],
  ctaEyebrow: 'Stay Ahead',
  ctaTitle: 'Ready to automate your campus operations?',
  ctaSubtitle: "Tell us which processes eat up the most staff time — we'll show you what can run itself.",
  ctaButtonLabel: 'Talk to Us',
  ctaHref: '/contact-us',
};

const PAGE_SIZE = 12;

const CampusAutomation = () => {
  const cardsRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData(CAMPUS_AUTOMATION_PAGE_SLUG);
  const { isSaved, isPending, add, remove, showLoginPrompt, setShowLoginPrompt } =
    useDesignWishlist('campus-automation');

  const [activeFilter, setActiveFilter] = useState('All');
  const [page, setPage] = useState(1);

  // Content field resolutions
  const heroEyebrow = data.heroEyebrow ?? CAMPUS_AUTOMATION_DEFAULTS.heroEyebrow;
  const heroTitle = data.heroTitle ?? CAMPUS_AUTOMATION_DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? CAMPUS_AUTOMATION_DEFAULTS.heroSubtitle;
  const heroImage = data.heroImage ?? CAMPUS_AUTOMATION_DEFAULTS.heroImage;
  const heroButtonLabel = data.heroButtonLabel ?? CAMPUS_AUTOMATION_DEFAULTS.heroButtonLabel;
  const heroButtonHref = data.heroButtonHref ?? CAMPUS_AUTOMATION_DEFAULTS.heroButtonHref;
  const section1Title = data.section1Title ?? CAMPUS_AUTOMATION_DEFAULTS.section1Title;
  const stepCountLabel = data.stepCountLabel ?? CAMPUS_AUTOMATION_DEFAULTS.stepCountLabel;
  const readMoreLabel = data.readMoreLabel ?? CAMPUS_AUTOMATION_DEFAULTS.readMoreLabel;
  const allCards: CardItem[] = Array.isArray(data.cards) ? data.cards : CAMPUS_AUTOMATION_DEFAULTS.cards;

  const ctaEyebrow = data.ctaEyebrow ?? CAMPUS_AUTOMATION_DEFAULTS.ctaEyebrow;
  const ctaTitle = data.ctaTitle ?? CAMPUS_AUTOMATION_DEFAULTS.ctaTitle;
  const ctaSubtitle = data.ctaSubtitle ?? CAMPUS_AUTOMATION_DEFAULTS.ctaSubtitle;
  const ctaButtonLabel = data.ctaButtonLabel ?? CAMPUS_AUTOMATION_DEFAULTS.ctaButtonLabel;
  const ctaHref = data.ctaHref ?? CAMPUS_AUTOMATION_DEFAULTS.ctaHref;

  // Page Controls & styles resolution
  const styles: CampusAutomationStyles = {
    headingFont: 'poppins',
    bodyFont: 'opensans',
    primaryColor: '#0047ab',
    heroBg: 'white',
    ctaBg: 'blue',
    heroLayout: 'minimal',
    cardColumns: '3',
    showFeatured: true,
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
      : 'bg-cm-blue-dark';

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
  const showFeatured = styles.showFeatured !== undefined ? styles.showFeatured : true;
  const showFilters = styles.showFilters !== undefined ? styles.showFilters : true;

  // Filter options and active cards
  const filterOptions = useMemo(
    () => ['All', ...Array.from(new Set(allCards.flatMap((card) => card.categories ?? []).filter(Boolean)))],
    [allCards]
  );

  const filteredCards = useMemo(
    () =>
      activeFilter === 'All'
        ? allCards
        : allCards.filter((card) => card.categories?.includes(activeFilter)),
    [allCards, activeFilter]
  );

  const featured = showFeatured && filteredCards.length > 0 ? filteredCards[0] : null;
  const gridCards = showFeatured && filteredCards.length > 0 ? filteredCards.slice(1) : filteredCards;

  const totalPages = Math.ceil(gridCards.length / PAGE_SIZE);
  const paginatedCards = gridCards.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.children;
      if (cards && cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, scrollTrigger: { trigger: cardsRef.current, start: 'top 85%' } }
        );
      }
    });
    return () => ctx.revert();
  }, [paginatedCards]);

  const cardLink = (card: CardItem) =>
    card.href?.trim() || `/${CAMPUS_AUTOMATION_PAGE_SLUG}/${slugifyCampusAutomationTitle(card.title)}`;

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
                    to={heroButtonHref || '/contact-us'}
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
                      to={heroButtonHref || '/contact-us'}
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
                    to={heroButtonHref || '/contact-us'}
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

      {/* ─── MODULES & CARDS SECTION ─── */}
      {!data.hideCards && (
        <section id="modules" className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Section Heading & Counter */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-gray-100 pb-4">
            <h2 className={`${headingFontClass} text-xl font-bold text-cm-blue-dark sm:text-2xl`}>
              {section1Title}
            </h2>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {filteredCards.length} {stepCountLabel}
            </span>
          </div>

          {/* Filter Pills */}
          {showFilters && !data.hideFilters && filterOptions.length > 1 && (
            <div className="mb-6 flex flex-wrap items-center gap-2">
              {filterOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setActiveFilter(option);
                    setPage(1);
                  }}
                  style={
                    activeFilter === option
                      ? { backgroundColor: primaryColor, borderColor: primaryColor, color: '#fff' }
                      : undefined
                  }
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                    activeFilter === option
                      ? 'border-transparent text-white'
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}

          {/* Featured Module Banner */}
          {featured && (
            <article className="group mb-8 grid grid-cols-1 overflow-hidden rounded-2xl border border-gray-100 bg-cm-gray/50 shadow-sm transition-all hover:shadow-lg lg:grid-cols-[1.2fr_1fr]">
              <div className="h-60 overflow-hidden lg:h-auto bg-slate-100">
                <MediaImage
                  src={featured.image}
                  alt={featured.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-center p-6 sm:p-8">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span
                    className="text-[11px] font-bold uppercase tracking-[0.14em]"
                    style={{ color: primaryColor }}
                  >
                    Featured {featured.categories?.[0] ? `· ${featured.categories[0]}` : ''}
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
                <p className="mb-4 text-sm leading-relaxed text-gray-600">{featured.description}</p>
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

          {/* Grid Modules */}
          {gridCards.length === 0 && !featured ? (
            <div className="rounded-xl border border-gray-100 bg-gray-50 py-16 text-center text-gray-500">
              No modules found in this category.
            </div>
          ) : (
            <div ref={cardsRef} className={`grid grid-cols-1 gap-6 ${cardGridColsClass}`}>
              {paginatedCards.map((card) => {
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
                        {card.categories?.[0] && (
                          <span
                            className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wider shadow-xs"
                            style={{ color: primaryColor }}
                          >
                            {card.categories[0]}
                          </span>
                        )}
                      </div>
                    </Link>

                    <div className="flex flex-1 flex-col p-5">
                      <Link to={cardLink(card)} className="block flex-1">
                        <h3 className={`${headingFontClass} text-lg font-bold text-cm-blue-dark transition-colors group-hover:text-cm-blue`}>
                          {card.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-gray-600 line-clamp-3">
                          {card.description}
                        </p>
                      </Link>

                      <div className="mt-5 flex items-center justify-between border-t border-gray-50 pt-3">
                        <Link
                          to={cardLink(card)}
                          style={{ color: primaryColor }}
                          className="inline-flex items-center gap-1.5 text-xs font-bold transition-all group-hover:gap-2.5"
                        >
                          {readMoreLabel} <ArrowRight className="h-3.5 w-3.5" />
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
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center border-t border-slate-100 pt-6">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPage((p) => Math.max(1, p - 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={page === 1}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> Prev
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setPage(p);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={page === p ? { backgroundColor: primaryColor, color: '#fff' } : undefined}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer ${
                      page === p ? 'text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => {
                    setPage((p) => Math.min(totalPages, p + 1));
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition cursor-pointer disabled:cursor-not-allowed"
                >
                  Next <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ─── BOTTOM CTA BANNER ─── */}
      {!data.hideCta && (
        <section className="px-4 pb-8 sm:px-6 lg:px-8">
          <div
            style={ctaInlineBg}
            className={`relative mx-auto max-w-6xl overflow-hidden rounded-2xl ${ctaBgClass} px-6 py-8 sm:px-10 transition-colors shadow-lg`}
          >
            <div
              className="pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full border border-white/15"
              aria-hidden="true"
            />
            <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                {ctaEyebrow && (
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-cm-yellow">
                    {ctaEyebrow}
                  </span>
                )}
                <h2
                  className={`${headingFontClass} mt-2 max-w-lg text-2xl font-bold sm:text-3xl ${
                    isCtaWhite ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {ctaTitle}
                </h2>
                <p
                  className={`mt-2 max-w-lg text-sm leading-relaxed ${
                    isCtaWhite ? 'text-slate-600' : 'text-white/75'
                  }`}
                >
                  {ctaSubtitle}
                </p>
              </div>
              <Link
                to={ctaHref}
                className="btn-secondary inline-flex flex-shrink-0 items-center gap-2 px-6 py-3 text-sm font-bold shadow-md hover:scale-105 transition-all"
              >
                {ctaButtonLabel} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Login Prompt for Wishlist */}
      <LoginPromptModal open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
    </main>
  );
};

export default CampusAutomation;
