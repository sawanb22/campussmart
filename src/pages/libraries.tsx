import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { BookOpen, Star, Heart, Check, Trash2, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { useDesignWishlist } from '@/hooks/useDesignWishlist';
import LoginPromptModal from '@/components/login-prompt-modal';
import { MediaImage } from '@/components/ui/media-image';
import { SportsInfraSkeleton } from '@/components/ui/page-skeleton';

export interface CardItem {
  title: string;
  description: string;
  image?: string;
  categories?: string[];
  category?: string;
  href?: string;
  slug?: string;
}

export interface LibrariesStyles {
  headingFont?: 'playfair' | 'grotesk' | 'poppins' | 'opensans' | 'system';
  bodyFont?: 'opensans' | 'poppins' | 'grotesk' | 'system';
  primaryColor?: string;
  heroBg?: 'blue' | 'white' | 'amber' | 'slate' | 'stone' | string;
  ctaBg?: 'blue' | 'stone' | 'amber' | 'slate' | 'white' | string;
  heroLayout?: 'split-right' | 'split-left' | 'centered' | 'minimal';
  cardColumns?: '2' | '3' | '4';
  showFilters?: boolean;
}

export const LIBRARIES_PAGE_SLUG = 'libraries';

export function slugifyLibraryTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'feature'
  );
}

const PAGE_SIZE = 12;

const Libraries = ({ slug = 'libraries' }: { slug?: string }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const { data, loading } = usePageData(slug);
  const { isSaved, isPending, add, remove, showLoginPrompt, setShowLoginPrompt } = useDesignWishlist('libraries');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);

  const styles: LibrariesStyles = {
    headingFont: 'poppins',
    bodyFont: 'opensans',
    primaryColor: '#0047ab',
    heroBg: 'blue',
    ctaBg: 'blue',
    heroLayout: 'split-right',
    cardColumns: '3',
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

  const heroBgTheme = styles.heroBg || 'blue';
  const heroBgClass =
    heroBgTheme === 'amber'
      ? 'bg-amber-500 text-white'
      : heroBgTheme === 'slate'
      ? 'bg-slate-900 text-white'
      : heroBgTheme === 'stone'
      ? 'bg-stone-900 text-white'
      : heroBgTheme === 'white'
      ? 'bg-white text-slate-800 border border-slate-200'
      : heroBgTheme.startsWith('#')
      ? 'text-white'
      : 'bg-cm-blue text-white';

  const isHeroLight = heroBgTheme === 'white';
  const heroInlineBg = heroBgTheme.startsWith('#') ? { backgroundColor: heroBgTheme } : undefined;

  const ctaBgTheme = styles.ctaBg || 'blue';
  const ctaBgClass =
    ctaBgTheme === 'stone'
      ? 'bg-stone-900 text-white'
      : ctaBgTheme === 'amber'
      ? 'bg-amber-950 text-white'
      : ctaBgTheme === 'slate'
      ? 'bg-slate-900 text-white'
      : ctaBgTheme === 'white'
      ? 'bg-slate-50 text-slate-800 border border-slate-200'
      : ctaBgTheme.startsWith('#')
      ? 'text-white'
      : 'bg-cm-blue-dark text-white';

  const ctaInlineBg = ctaBgTheme.startsWith('#') ? { backgroundColor: ctaBgTheme } : undefined;

  const heroLayout = styles.heroLayout || 'split-right';
  const cardGridColsClass =
    styles.cardColumns === '2'
      ? 'grid-cols-1 sm:grid-cols-2'
      : styles.cardColumns === '4'
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  const showFilters = Boolean(styles.showFilters !== false && !data.hideFilters);

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      if (heroRef.current) {
        gsap.fromTo(heroRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' });
      }

      const cards = cardsRef.current?.children;
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            stagger: 0.1,
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 85%',
            },
          }
        );
      }
    });
    return () => ctx.revert();
  }, [loading]);

  const allCards: CardItem[] = Array.isArray(data.cards) ? data.cards : [];
  const cards = allCards.map((card) => {
    const rawCats = Array.isArray(card.categories)
      ? card.categories.filter(Boolean)
      : card.category
      ? [card.category]
      : [];
    return {
      ...card,
      categories: rawCats,
    };
  });

  const explicitCategories: string[] = Array.isArray(data.categories) ? data.categories.filter(Boolean) : [];
  const categoryOptions: string[] = Array.from(
    new Set<string>([...explicitCategories, ...cards.flatMap((card) => card.categories ?? [])])
  ).filter((option) => Boolean(option) && option !== 'All');

  const activeCategory =
    selectedCategory && categoryOptions.includes(selectedCategory)
      ? selectedCategory
      : (categoryOptions[0] || '');

  const filteredCards = activeCategory
    ? cards.filter((card) => card.categories?.includes(activeCategory))
    : cards;

  const totalPages = Math.ceil(filteredCards.length / PAGE_SIZE);
  const safePage = totalPages > 0 ? Math.min(page, totalPages) : 1;
  const paginatedCards = filteredCards.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const cardLink = (card: CardItem) =>
    card.href?.trim() || `/${LIBRARIES_PAGE_SLUG}/${card.slug?.trim() || slugifyLibraryTitle(card.title)}`;

  const philosophyImage = data.philosophyImage || data.heroImage || '';

  if (loading) {
    return <SportsInfraSkeleton />;
  }

  return (
    <main className={`min-h-screen bg-white ${bodyFontClass}`}>
      <LoginPromptModal open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />

      {/* Hero Section - 100% Database Driven */}
      {!data.hideHero && (
        <section
          ref={heroRef}
          style={heroInlineBg}
          className={`${heroBgClass} mx-3 sm:mx-6 lg:mx-8 rounded-[2rem] py-8 md:py-10 overflow-hidden relative shadow-inner transition-colors`}
        >
          {heroLayout === 'centered' ? (
            /* Centered Hero Layout */
            <div className="max-w-4xl mx-auto text-center relative z-10 px-4">
              {data.heroEyebrow && (
                <span
                  className="text-xs font-bold uppercase tracking-widest inline-block mb-2"
                  style={{ color: isHeroLight ? primaryColor : '#fde047' }}
                >
                  {data.heroEyebrow}
                </span>
              )}
              {data.heroTitle && (
                <h1 className={`${headingFontClass} text-3xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight`}>
                  {data.heroTitle}
                </h1>
              )}
              {data.heroSubtitle && (
                <p className={`text-base md:text-lg leading-relaxed max-w-2xl mx-auto ${isHeroLight ? 'text-slate-600' : 'text-white/85'}`}>
                  {data.heroSubtitle}
                </p>
              )}
              {data.heroButtonLabel && (
                <div className="mt-6 flex justify-center">
                  <Link
                    to={data.heroButtonHref || '/request-quote'}
                    style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                    className="btn-primary px-7 py-3 text-sm font-bold text-white shadow-md hover:brightness-110 inline-flex items-center gap-2"
                  >
                    {data.heroButtonLabel} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
              {data.heroImage && (
                <div className="mt-8 max-w-2xl mx-auto overflow-hidden rounded-2xl shadow-xl border-2 border-white/20">
                  <MediaImage
                    src={data.heroImage}
                    alt={data.heroTitle || ''}
                    className="w-full h-[280px] sm:h-[320px] object-cover"
                  />
                </div>
              )}
            </div>
          ) : heroLayout === 'minimal' ? (
            /* Minimal Hero Layout (Text Only) */
            <div className="max-w-6xl mx-auto relative z-10 px-6 sm:px-8">
              {data.heroEyebrow && (
                <span
                  className="text-xs font-bold uppercase tracking-widest inline-block mb-2"
                  style={{ color: isHeroLight ? primaryColor : '#fde047' }}
                >
                  {data.heroEyebrow}
                </span>
              )}
              {data.heroTitle && (
                <h1 className={`${headingFontClass} text-2xl md:text-4xl font-extrabold mb-3 tracking-tight`}>
                  {data.heroTitle}
                </h1>
              )}
              {data.heroSubtitle && (
                <p className={`text-sm md:text-base leading-relaxed max-w-3xl ${isHeroLight ? 'text-slate-600' : 'text-white/85'}`}>
                  {data.heroSubtitle}
                </p>
              )}
              {data.heroButtonLabel && (
                <div className="mt-5">
                  <Link
                    to={data.heroButtonHref || '/request-quote'}
                    style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                    className="btn-primary px-6 py-2.5 text-sm font-bold text-white shadow-md hover:brightness-110 inline-flex items-center gap-2"
                  >
                    {data.heroButtonLabel} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            /* Split Hero Layout (split-right or split-left) */
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 relative z-10 px-4">
              <div className={`lg:w-1/2 text-left ${heroLayout === 'split-left' ? 'order-1 lg:order-2' : ''}`}>
                {data.heroEyebrow && (
                  <span
                    className="text-xs font-bold uppercase tracking-widest inline-block mb-2"
                    style={{ color: isHeroLight ? primaryColor : '#fde047' }}
                  >
                    {data.heroEyebrow}
                  </span>
                )}
                {data.heroTitle && (
                  <h1 className={`${headingFontClass} text-2xl md:text-4xl font-extrabold mb-3 tracking-tight leading-tight`}>
                    {data.heroTitle}
                  </h1>
                )}
                {data.heroSubtitle && (
                  <p className={`text-sm md:text-base leading-relaxed max-w-xl ${isHeroLight ? 'text-slate-600' : 'text-white/85'}`}>
                    {data.heroSubtitle}
                  </p>
                )}
                {data.heroButtonLabel && (
                  <div className="mt-6 flex flex-wrap gap-4">
                    <Link
                      to={data.heroButtonHref || '/request-quote'}
                      style={{ backgroundColor: primaryColor, borderColor: primaryColor }}
                      className="btn-primary px-6 py-2.5 text-sm font-bold text-white shadow-md hover:brightness-110 inline-flex items-center gap-2"
                    >
                      {data.heroButtonLabel} <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                )}
              </div>
              {data.heroImage && (
                <div className={`lg:w-1/2 relative w-full ${heroLayout === 'split-left' ? 'order-2 lg:order-1' : ''}`}>
                  <MediaImage
                    src={data.heroImage}
                    alt={data.heroTitle || ''}
                    className="rounded-2xl shadow-xl w-full h-[260px] sm:h-[300px] object-cover border-2 border-white/20 relative z-10"
                  />
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Structured Library Types Catalog - 100% Database Driven */}
      {!data.hideCards && (
        <section className="py-10 md:py-14">
          <div className="max-w-6xl mx-auto px-4 text-center">
            {data.section1Title && (
              <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-8">
                <h2 className={`${headingFontClass} text-2xl md:text-3xl font-bold text-cm-blue-dark tracking-tight`}>
                  {data.section1Title}
                </h2>
                <div
                  className="hidden md:block h-1 w-32 rounded-full transition-colors"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>
            )}

            <div className={`grid grid-cols-1 ${showFilters && categoryOptions.length > 0 ? 'lg:grid-cols-[240px_minmax(0,1fr)]' : ''} gap-8 text-left`}>
              {showFilters && categoryOptions.length > 0 && (
                <aside className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm self-start sticky top-28">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-cm-blue-dark mb-5">Categories</h3>
                  <div className="space-y-3">
                    {categoryOptions.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(option);
                          setPage(1);
                        }}
                        style={activeCategory === option ? { backgroundColor: primaryColor } : undefined}
                        className={`w-full text-left rounded-2xl px-4 py-3 transition-all duration-200 text-sm font-semibold cursor-pointer ${
                          activeCategory === option ? 'text-white shadow-lg' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </aside>
              )}

              <div className="min-w-0">
                {paginatedCards.length === 0 ? (
                  <div className="text-center py-16 px-4 rounded-[2rem] border border-dashed border-slate-200 bg-slate-50/50">
                    <p className="text-base font-semibold text-slate-700">No library solutions found under &ldquo;{activeCategory}&rdquo;</p>
                    <p className="text-sm text-slate-500 mt-1">Assign this category to items in the admin editor to display them here.</p>
                  </div>
                ) : (
                  <>
                    <div ref={cardsRef} className={`grid ${cardGridColsClass} gap-6`}>
                      {paginatedCards.map((f) => {
                        const wishlistCard = { title: f.title, image: f.image };

                        return (
                          <div key={f.title} className="group flex flex-col overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_-20px_rgba(15,23,42,0.28)]">
                            <Link to={cardLink(f)} className="flex flex-1 flex-col">
                              <div className="relative overflow-hidden h-[220px] sm:h-[230px] bg-slate-100">
                                {f.image && (
                                  <MediaImage
                                    src={f.image}
                                    alt={f.title}
                                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                                  />
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/30 to-transparent" />
                                {f.categories?.[0] && (
                                  <span className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-800 shadow-sm backdrop-blur-sm">
                                    <Star className="h-3.5 w-3.5" style={{ color: primaryColor }} />
                                    {f.categories[0]}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-1 flex-col px-5 pb-2 pt-4">
                                <h3 className={`${headingFontClass} text-lg font-semibold text-slate-900 tracking-tight mb-2 group-hover:text-cm-blue transition-colors`}>{f.title}</h3>
                                {f.description && (
                                  <p className="text-sm text-slate-600 leading-relaxed mb-3 line-clamp-3">{f.description}</p>
                                )}
                                <div className="mt-auto flex flex-wrap gap-2">
                                  {f.categories?.map((category) => (
                                    <span key={category} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-600">{category}</span>
                                  ))}
                                </div>
                              </div>
                            </Link>
                            <div className="flex items-center justify-between px-5 pb-4 pt-3 text-slate-700 border-t border-slate-50">
                              {isSaved(wishlistCard) ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="flex items-center gap-1.5 rounded-lg bg-green-600 px-2.5 py-1.5 text-[10px] font-bold text-white">
                                    <Check className="h-3.5 w-3.5" /> Added to wishlist
                                  </span>
                                  <button type="button" onClick={() => remove(wishlistCard)} disabled={isPending(wishlistCard)} aria-label={`Remove ${f.title} from wishlist`} className="flex items-center justify-center rounded-lg bg-red-50 p-1.5 text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50">
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => add(wishlistCard)}
                                  disabled={isPending(wishlistCard)}
                                  style={{ backgroundColor: primaryColor }}
                                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[10px] font-bold text-white shadow-sm transition-all hover:brightness-110 disabled:opacity-50"
                                >
                                  <Heart className="h-3.5 w-3.5" /> Add to wishlist
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination Controls (Max 12 items per page) */}
                    {totalPages > 1 && (
                      <div className="mt-8 flex items-center justify-center border-t border-slate-100 pt-6 px-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setPage((p) => Math.max(1, p - 1));
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            disabled={safePage === 1}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" /> Prev
                          </button>

                          <div className="flex items-center gap-1 px-2">
                            {Array.from({ length: totalPages }, (_, i) => i + 1)
                              .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 2)
                              .map((p, idx, arr) => {
                                const showEllipsis = idx > 0 && p - arr[idx - 1] > 1;
                                return (
                                  <div key={p} className="flex items-center">
                                    {showEllipsis && <span className="px-1 text-slate-400 text-xs">...</span>}
                                    <button
                                      onClick={() => {
                                        setPage(p);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                      }}
                                      style={safePage === p ? { backgroundColor: primaryColor } : undefined}
                                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                                        safePage === p
                                          ? 'text-white shadow-sm'
                                          : 'text-slate-600 hover:bg-slate-100'
                                      }`}
                                    >
                                      {p}
                                    </button>
                                  </div>
                                );
                              })}
                          </div>

                          <button
                            onClick={() => {
                              setPage((p) => Math.min(totalPages, p + 1));
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            disabled={safePage === totalPages}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer disabled:cursor-not-allowed"
                          >
                            Next <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Philosophy Section - 100% Database Driven */}
      {!data.hidePhilosophy && data.philosophyTitle && (
        <section className="py-12 bg-cm-gray/30 rounded-[2rem] mx-4 mb-8 border border-cm-gray overflow-hidden">
          <div className="max-w-6xl mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="p-8 md:p-12 bg-cm-blue-dark rounded-[2.5rem] text-white shadow-xl relative">
                <BookOpen className="absolute top-0 right-0 p-6 w-16 h-16 text-cm-yellow/20" />
                <h2 className={`${headingFontClass} text-2xl md:text-3xl font-bold mb-6 leading-tight tracking-tight`}>
                  {data.philosophyTitle}
                </h2>
                {data.philosophyDescription && (
                  <p className="text-base text-white/70 leading-relaxed mb-8">
                    {data.philosophyDescription}
                  </p>
                )}
                <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                  <div className="flex flex-col gap-1">
                    <span className="text-cm-yellow font-bold text-2xl">{data.philosophyStat1Value}</span>
                    <span className="text-white/50 font-bold text-[10px] uppercase tracking-wider">{data.philosophyStat1Label}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-cm-yellow font-bold text-2xl">{data.philosophyStat2Value}</span>
                    <span className="text-white/50 font-bold text-[10px] uppercase tracking-wider">{data.philosophyStat2Label}</span>
                  </div>
                </div>
              </div>

              {philosophyImage && (
                <div className="relative group p-2 bg-white rounded-[2.5rem] shadow-xl">
                  <MediaImage
                    src={philosophyImage}
                    alt={data.philosophyTitle}
                    className="rounded-[2rem] w-full h-[350px] object-cover shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Call to Action - 100% Database Driven */}
      {!data.hideCta && data.ctaTitle && (
        <section
          style={ctaInlineBg}
          className={`py-12 ${ctaBgClass} rounded-[2rem] mx-4 mb-10 overflow-hidden shadow-xl text-center transition-colors`}
        >
          <div className="max-w-4xl mx-auto px-6">
            <h2 className={`${headingFontClass} text-2xl md:text-4xl font-bold mb-4 tracking-tight`}>
              {data.ctaTitle}
            </h2>
            {data.ctaSubtitle && (
              <p className="text-base opacity-85 mb-6 max-w-2xl mx-auto leading-relaxed">
                {data.ctaSubtitle}
              </p>
            )}
            {data.ctaButtonLabel && (
              <div className="flex flex-col sm:flex-row justify-center gap-6 mt-6">
                <Link
                  to={data.ctaHref || '/contact-us'}
                  className="btn-secondary inline-block px-10 py-3 text-base font-bold shadow-md hover:scale-105 transition-all"
                >
                  {data.ctaButtonLabel}
                </Link>
              </div>
            )}
          </div>
        </section>
      )}
    </main>
  );
};

export default Libraries;
