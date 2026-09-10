import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Check, Trash2, ShoppingBag } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { usePageCategories } from '@/hooks/usePageCategories';
import { useDesignWishlist } from '@/hooks/useDesignWishlist';
import LoginPromptModal from '@/components/login-prompt-modal';
import { resolveMediaUrl } from '@/lib/media-url';
import { AI_ML_PAGE_SLUG, AI_ML_DEFAULTS, slugifyAiMlTitle, type AiMlCard } from './ai-ml.data';

gsap.registerPlugin(ScrollTrigger);

const AIML = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData(AI_ML_PAGE_SLUG);
  const { categories: shopCategories } = usePageCategories('ai-ml');
  const { isSaved, isPending, add, remove, showLoginPrompt, setShowLoginPrompt } = useDesignWishlist('ai-ml');
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
      const items = gridRef.current?.children;
      if (items) {
        gsap.fromTo(
          items,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, scrollTrigger: { trigger: gridRef.current, start: 'top 85%' } },
        );
      }
    });
    return () => ctx.revert();
  }, []);

  const heroTitle = data.heroTitle ?? AI_ML_DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? AI_ML_DEFAULTS.heroSubtitle;
  const heroImage = resolveMediaUrl(data.heroImage) || AI_ML_DEFAULTS.heroImage;
  const allCards: AiMlCard[] = data.cards?.length ? data.cards : AI_ML_DEFAULTS.cards;

  const categoryOptions = useMemo(
    () => Array.from(new Set(allCards.flatMap((card) => card.categories ?? []).filter(Boolean))),
    [allCards],
  );
  const filteredCards = useMemo(
    () => (activeCategory === 'All' ? allCards : allCards.filter((card) => (card.categories ?? []).includes(activeCategory))),
    [allCards, activeCategory],
  );

  const [featured, ...rest] = filteredCards;
  const cardLink = (card: AiMlCard) => `/${AI_ML_PAGE_SLUG}/${slugifyAiMlTitle(card.title)}`;

  return (
    <main className="min-h-screen bg-white">
      <LoginPromptModal open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />

      {/* Hero */}
      <section ref={heroRef} className="bg-amber-50/60 px-4 pb-4 pt-3 sm:px-6 sm:pb-5 sm:pt-5 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-7 lg:grid-cols-[1.15fr_0.85fr] lg:gap-10">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-orange-600">
              <span className="h-[2px] w-6 bg-orange-500" /> AI &amp; ML at CampusMart
            </span>
            <h1 className="font-playfair max-w-xl text-4xl font-semibold leading-[1.05] tracking-tight text-stone-900 sm:text-5xl">{heroTitle}</h1>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-stone-500 sm:text-base">{heroSubtitle}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link to="/request-quote" className="btn-primary inline-flex items-center gap-2">
                Deploy Solutions <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/ai-ml/products"
                className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-5 py-2.5 text-sm font-bold text-stone-700 transition-colors hover:border-stone-400"
              >
                <ShoppingBag className="h-4 w-4" /> Shop AI/ML Products
              </Link>
            </div>
          </div>
          <div className="relative mx-auto hidden aspect-square w-full max-w-sm lg:block">
            <div className="absolute right-0 top-4 h-64 w-64 rounded-full bg-orange-400/90" />
            <div className="absolute left-2 top-10 h-56 w-72 overflow-hidden rounded-2xl shadow-xl">
              <img src={heroImage} alt={heroTitle} className="h-full w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 py-3 sm:px-6 sm:py-5 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Category filter chips */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            {categoryOptions.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                  activeCategory === category ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 text-stone-600 hover:border-stone-400'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {!featured ? (
            <div className="rounded-2xl border border-stone-100 bg-stone-50 py-20 text-center text-stone-500">No modules match that filter.</div>
          ) : (
            <>
              {/* Featured */}
              <Link to={cardLink(featured)} className="group grid grid-cols-1 overflow-hidden rounded-2xl bg-amber-50 sm:grid-cols-[1.2fr_0.8fr]">
                <div className="min-h-[220px] overflow-hidden sm:min-h-full">
                  {resolveMediaUrl(featured.image) && (
                    <img
                      src={resolveMediaUrl(featured.image)}
                      alt={featured.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="flex flex-col justify-center p-6 sm:p-8">
                  <span className="mb-2.5 text-xs font-bold uppercase tracking-[0.13em] text-orange-600">
                    Featured &middot; {featured.categories?.[0] ?? 'AI/ML'}
                  </span>
                  <h2 className="font-playfair text-2xl font-semibold leading-tight text-stone-900 sm:text-3xl">{featured.title}</h2>
                  {featured.description && <p className="mt-3 text-sm leading-relaxed text-stone-500">{featured.description}</p>}
                  <span className="mt-5 inline-flex w-fit items-center gap-2 border-b border-stone-900 pb-1 text-sm font-bold text-stone-900">
                    Read more <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>

              {/* Grid */}
              {rest.length > 0 && (
                <div ref={gridRef} className="mt-4 grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((card) => {
                    const image = resolveMediaUrl(card.image);
                    return (
                      <article key={card.title} className="group min-w-0">
                        <Link to={cardLink(card)} className="block">
                          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-stone-100">
                            {image && (
                              <img src={image} alt={card.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            )}
                          </div>
                          <span className="mt-3 block text-xs font-bold uppercase tracking-wide text-orange-600">{card.categories?.[0] ?? 'AI/ML'}</span>
                          <h3 className="font-playfair mt-1 text-lg font-semibold leading-snug text-stone-900">{card.title}</h3>
                          {card.description && <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-stone-500">{card.description}</p>}
                        </Link>
                        <div className="mt-3">
                          {isSaved(card) ? (
                            <div className="flex items-center gap-1.5">
                              <span className="flex items-center gap-1.5 rounded-lg bg-green-600 px-2.5 py-1.5 text-[10px] font-bold text-white">
                                <Check className="h-3.5 w-3.5" /> Added to wishlist
                              </span>
                              <button
                                type="button"
                                onClick={() => remove(card)}
                                disabled={isPending(card)}
                                aria-label={`Remove ${card.title} from wishlist`}
                                className="flex items-center justify-center rounded-lg bg-red-50 p-1.5 text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => add(card)}
                              disabled={isPending(card)}
                              className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-2.5 py-1.5 text-[10px] font-bold text-white transition-colors hover:bg-stone-700 disabled:opacity-50"
                            >
                              <Heart className="h-3.5 w-3.5" /> Add to wishlist
                            </button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {shopCategories.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-stone-100 pt-4">
              <span className="mr-1 text-xs font-bold uppercase tracking-wide text-stone-400">Shop by category:</span>
              {shopCategories.map((category) => (
                <Link
                  key={category.id}
                  to={`/ai-ml/products?category=${category.slug}`}
                  className="rounded-full border border-stone-200 px-3.5 py-1.5 text-xs font-semibold text-stone-600 transition-colors hover:border-stone-400"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-4 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl bg-stone-900 p-6 text-center text-white sm:p-8 sm:text-left">
          <div className="pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full border border-white/10" />
          <div className="relative flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <h2 className="font-playfair text-2xl font-semibold sm:text-3xl">Ready to deploy AI/ML on your campus?</h2>
              <p className="mt-2 max-w-md text-sm text-white/60">Talk to our engineering team about the right mix of stations, labs and compute for your students.</p>
            </div>
            <Link to="/contact-us" className="shrink-0 rounded-full bg-orange-500 px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-orange-600">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AIML;
