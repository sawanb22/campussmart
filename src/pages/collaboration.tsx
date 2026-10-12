import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight, Heart, Check, Trash2, Sparkles } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { useDesignWishlist } from '@/hooks/useDesignWishlist';
import LoginPromptModal from '@/components/login-prompt-modal';
import MediaImage from '@/components/ui/media-image';
import { PageCardGridSkeleton } from '@/components/ui/page-skeleton';
import { COLLAB_PAGE_SLUG, slugifyCollabTitle, type CollaborationCard } from './collaboration.data';

gsap.registerPlugin(ScrollTrigger);

export interface CollaborationStyles {
  headingFont?: 'playfair' | 'grotesk' | 'poppins' | 'opensans' | 'system';
  bodyFont?: 'opensans' | 'poppins' | 'grotesk' | 'system';
  primaryColor?: string;
  heroBg?: 'blue' | 'white' | 'amber' | 'slate' | 'stone' | string;
  ctaBg?: 'blue' | 'stone' | 'amber' | 'slate' | 'white' | string;
  heroLayout?: 'split-right' | 'split-left' | 'centered' | 'minimal';
  cardColumns?: '2' | '3' | '4';
  showFeatured?: boolean;
}

const PAGE_SIZE = 12;

const Collaboration = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const { data, loading } = usePageData(COLLAB_PAGE_SLUG);
  const { isSaved, isPending, add, remove, showLoginPrompt, setShowLoginPrompt } = useDesignWishlist('collaboration');
  const [page, setPage] = useState(1);

  const styles: CollaborationStyles = {
    headingFont: 'poppins',
    bodyFont: 'opensans',
    primaryColor: '#0047ab',
    heroBg: 'blue',
    ctaBg: 'white',
    heroLayout: 'split-right',
    cardColumns: '3',
    showFeatured: false,
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

  const ctaBgTheme = styles.ctaBg || 'white';
  const ctaBgClass =
    ctaBgTheme === 'blue'
      ? 'bg-cm-blue text-white'
      : ctaBgTheme === 'stone'
      ? 'bg-stone-900 text-white'
      : ctaBgTheme === 'amber'
      ? 'bg-amber-950 text-white'
      : ctaBgTheme === 'slate'
      ? 'bg-slate-900 text-white'
      : ctaBgTheme === 'white'
      ? 'bg-white text-slate-800 border-t border-gray-100'
      : ctaBgTheme.startsWith('#')
      ? 'text-white'
      : 'bg-white text-slate-800 border-t border-gray-100';

  const ctaInlineBg = ctaBgTheme.startsWith('#') ? { backgroundColor: ctaBgTheme } : undefined;
  const isCtaLight = ctaBgTheme === 'white';

  const heroLayout = styles.heroLayout || 'split-right';
  const cardGridColsClass =
    styles.cardColumns === '2'
      ? 'grid-cols-1 sm:grid-cols-2'
      : styles.cardColumns === '4'
      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
      : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  useEffect(() => {
    if (loading) return;
    const ctx = gsap.context(() => {
      if (heroRef.current) {
        gsap.fromTo(heroRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
      }
      const cards = cardsRef.current?.children;
      if (cards && cards.length > 0) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, scrollTrigger: { trigger: cardsRef.current, start: 'top 85%' } },
        );
      }
    });
    return () => ctx.revert();
  }, [loading]);

  const cards: CollaborationCard[] = Array.isArray(data.cards) ? data.cards : [];
  const totalPages = Math.ceil(cards.length / PAGE_SIZE);
  const safePage = totalPages > 0 ? Math.min(page, totalPages) : 1;
  const paginatedCards = cards.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const isFeaturedActive = Boolean(styles.showFeatured && safePage === 1 && paginatedCards.length > 0);
  const featuredCard = isFeaturedActive ? paginatedCards[0] : null;
  const displayCards = isFeaturedActive ? paginatedCards.slice(1) : paginatedCards;

  const cardLink = (card: CollaborationCard) =>
    card.href?.trim() || `/${COLLAB_PAGE_SLUG}/${card.slug?.trim() || slugifyCollabTitle(card.title)}`;

  if (loading) {
    return <PageCardGridSkeleton cardCount={4} />;
  }

  return (
    <main className={`min-h-screen bg-white ${bodyFontClass}`}>
      <LoginPromptModal open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />

      {/* Hero Section - 100% Database Driven */}
      {!data.hideHero && (
        <section
          ref={heroRef}
          style={heroInlineBg}
          className={`${heroBgClass} mx-3 sm:mx-6 lg:mx-8 rounded-[2rem] py-8 md:py-12 overflow-hidden relative shadow-inner transition-colors mt-4`}
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
                    to={data.heroButtonHref || '/contact-us'}
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
                    to={data.heroButtonHref || '/contact-us'}
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
                      to={data.heroButtonHref || '/contact-us'}
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
                  <div className="overflow-hidden rounded-2xl shadow-xl border-2 border-white/20">
                    <MediaImage
                      src={data.heroImage}
                      alt={data.heroTitle || ''}
                      className="w-full h-[260px] sm:h-[320px] object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* Grid - 100% Database Driven */}
      {!data.hideCards && paginatedCards.length > 0 && (
        <section className="px-4 pt-10 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            {/* Section 1 Header */}
            {data.section1Title && (
              <div className="flex flex-col md:flex-row items-center justify-between mb-8 pb-4 border-b border-gray-100 gap-4">
                <div>
                  <h2 className={`${headingFontClass} text-2xl md:text-3xl font-bold text-cm-blue-dark tracking-tight`}>
                    {data.section1Title}
                  </h2>
                  {data.stepCountLabel && (
                    <span className="text-xs font-semibold text-gray-500 mt-1 inline-block">
                      {cards.length} {data.stepCountLabel}
                    </span>
                  )}
                </div>
                <div
                  className="hidden md:block h-1 w-24 rounded-full transition-colors"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>
            )}

            {/* Featured Hero Card (if enabled via Page Controls) */}
            {featuredCard && (
              <div className="mb-10 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition hover:shadow-md">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                  <div className="lg:col-span-7 h-64 sm:h-80 overflow-hidden bg-gray-100 relative">
                    {featuredCard.image && (
                      <MediaImage
                        src={featuredCard.image}
                        alt={featuredCard.title}
                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                    )}
                    <span className="absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-800 shadow-sm backdrop-blur-sm">
                      <Sparkles className="h-3.5 w-3.5" style={{ color: primaryColor }} /> Featured Space
                    </span>
                  </div>
                  <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between">
                    <div>
                      <h3 className={`${headingFontClass} text-2xl font-bold text-cm-blue-dark leading-tight mb-3`}>
                        {featuredCard.title}
                      </h3>
                      {featuredCard.description && (
                        <p className="text-sm sm:text-base leading-relaxed text-gray-600 mb-6">
                          {featuredCard.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <Link
                        to={cardLink(featuredCard)}
                        style={{ color: primaryColor }}
                        className="inline-flex items-center gap-2 text-sm font-bold group"
                      >
                        {data.readMoreLabel || 'Learn more'}
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </Link>
                      {isSaved({ title: featuredCard.title, image: featuredCard.image }) ? (
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center gap-1 rounded-lg bg-green-600 px-2.5 py-1 text-[11px] font-bold text-white">
                            <Check className="h-3 w-3" /> Saved
                          </span>
                          <button
                            type="button"
                            onClick={() => remove({ title: featuredCard.title, image: featuredCard.image })}
                            disabled={isPending({ title: featuredCard.title, image: featuredCard.image })}
                            className="p-1 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => add({ title: featuredCard.title, image: featuredCard.image })}
                          disabled={isPending({ title: featuredCard.title, image: featuredCard.image })}
                          style={{ borderColor: primaryColor, color: primaryColor }}
                          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-bold hover:bg-slate-50 transition-colors"
                        >
                          <Heart className="h-3.5 w-3.5" /> Wishlist
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Standard Cards Grid */}
            <div ref={cardsRef} className={`grid ${cardGridColsClass} gap-x-5 gap-y-10`}>
              {displayCards.map((card) => {
                const wishlistCard = { title: card.title, image: card.image };
                return (
                  <div key={card.title} className="group flex flex-col justify-between min-w-0">
                    <Link to={cardLink(card)} className="block min-w-0">
                      <div className="aspect-[1.42/1] w-full overflow-hidden rounded-xl bg-gray-100 relative">
                        {card.image && (
                          <MediaImage
                            src={card.image}
                            alt={card.title}
                            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                          />
                        )}
                      </div>
                      <div className="pt-3">
                        <h3 className={`${headingFontClass} text-base font-bold leading-tight tracking-tight text-cm-blue-dark sm:text-lg group-hover:text-cm-blue transition-colors`}>
                          {card.title}
                        </h3>
                        {card.description && (
                          <p className="mt-1.5 text-sm leading-relaxed text-gray-500 line-clamp-3">
                            {card.description}
                          </p>
                        )}
                      </div>
                    </Link>

                    <div className="mt-3 flex items-center justify-between pt-2">
                      <Link
                        to={cardLink(card)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold transition-all group-hover:gap-2"
                        style={{ color: primaryColor }}
                      >
                        {data.readMoreLabel || 'Learn more'}
                        <span
                          className="flex h-4 w-4 items-center justify-center rounded-full text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <ArrowRight className="h-2.5 w-2.5" />
                        </span>
                      </Link>

                      {isSaved(wishlistCard) ? (
                        <div className="flex items-center gap-1">
                          <span className="flex items-center gap-1 rounded-md bg-green-600 px-2 py-0.5 text-[10px] font-bold text-white">
                            <Check className="h-2.5 w-2.5" /> Saved
                          </span>
                          <button
                            type="button"
                            onClick={() => remove(wishlistCard)}
                            disabled={isPending(wishlistCard)}
                            className="p-1 rounded text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => add(wishlistCard)}
                          disabled={isPending(wishlistCard)}
                          className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Heart className="h-3.5 w-3.5" /> Wishlist
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls (Max 12 items per page) */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center border-t border-slate-100 pt-6 px-2">
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
          </div>
        </section>
      )}

      {/* CTA - 100% Database Driven */}
      {!data.hideCta && data.ctaTitle && (
        <section
          style={ctaInlineBg}
          className={`${ctaBgClass} px-4 py-16 text-center sm:px-6 sm:py-20 transition-colors`}
        >
          <h2
            className={`${headingFontClass} mx-auto max-w-lg text-3xl font-bold tracking-tight sm:text-4xl ${
              isCtaLight ? 'text-cm-blue-dark' : 'text-white'
            }`}
          >
            {data.ctaTitle}
          </h2>
          {data.ctaSubtitle && (
            <p
              className={`mx-auto mt-4 max-w-md text-sm leading-relaxed sm:text-base ${
                isCtaLight ? 'text-gray-500' : 'text-white/80'
              }`}
            >
              {data.ctaSubtitle}
            </p>
          )}
          {data.ctaButtonLabel && (
            <Link
              to={data.ctaHref || '/contact-us'}
              style={isCtaLight ? { backgroundColor: primaryColor, borderColor: primaryColor } : undefined}
              className={`mt-7 inline-flex items-center gap-2 ${
                isCtaLight ? 'btn-primary text-white shadow-md' : 'btn-secondary text-cm-blue-dark bg-white hover:bg-slate-100'
              }`}
            >
              {data.ctaButtonLabel} <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </section>
      )}
    </main>
  );
};

export default Collaboration;
