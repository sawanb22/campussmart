import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';
import { INNOVATION_PAGE_SLUG, INNOVATION_DEFAULTS, slugifyInnovationTitle, type InnovationCard } from './innovation.data';

gsap.registerPlugin(ScrollTrigger);

const Innovation = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData(INNOVATION_PAGE_SLUG);
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

  const heroTitle = data.heroTitle ?? INNOVATION_DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? INNOVATION_DEFAULTS.heroSubtitle;
  const ctaTitle = data.ctaTitle ?? INNOVATION_DEFAULTS.ctaTitle;
  const ctaSubtitle = data.ctaSubtitle ?? INNOVATION_DEFAULTS.ctaSubtitle;
  const allCards: InnovationCard[] = Array.isArray(data.cards) ? data.cards : INNOVATION_DEFAULTS.cards;

  const categoryOptions = useMemo(
    () => Array.from(new Set(allCards.flatMap((card) => card.categories ?? []).filter(Boolean))),
    [allCards],
  );

  const filteredCards = useMemo(
    () => (activeCategory === 'All' ? allCards : allCards.filter((card) => (card.categories ?? []).includes(activeCategory))),
    [allCards, activeCategory],
  );

  const [featured, ...remaining] = filteredCards;
  const richGrid = remaining.slice(0, 3);
  const simpleGrid = remaining.slice(3);

  const cardLink = (card: InnovationCard) => `/${INNOVATION_PAGE_SLUG}/${slugifyInnovationTitle(card.title)}`;

  return (
    <main className="min-h-screen bg-white">
      <section ref={heroRef} className="px-4 pt-5 sm:px-6 sm:pt-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold tracking-tight text-emerald-800 sm:text-5xl">{heroTitle}</h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-gray-500 sm:text-base">{heroSubtitle}</p>

          {/* Category pill bar */}
          {categoryOptions.length > 0 && (
          <div className="mt-4 inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-full bg-emerald-800 p-1.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categoryOptions.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                  activeCategory === category ? 'bg-white/15 text-white' : 'text-white/60 hover:text-white/90'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          )}
        </div>
      </section>

      <section className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {!featured ? (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 py-20 text-center text-gray-500">No programme tracks match that filter.</div>
          ) : (
            <>
              {/* Featured spotlight */}
              <Link
                to={cardLink(featured)}
                className="group grid grid-cols-1 overflow-hidden rounded-[1.75rem] bg-emerald-50 sm:grid-cols-2"
              >
                <div className="flex flex-col justify-center bg-emerald-800 p-8 text-white sm:p-10">
                  <span className="mb-3 inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-300">
                    <Sparkles className="h-3 w-3" /> Featured track
                  </span>
                  <h2 className="max-w-md text-2xl font-bold leading-tight tracking-tight sm:text-3xl">{featured.title}</h2>
                  {featured.description && <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">{featured.description}</p>}
                  <span className="mt-6 inline-flex w-fit items-center gap-2.5 text-sm font-bold text-white">
                    Read more
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 transition-transform group-hover:translate-x-0.5">
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </span>
                </div>
                <div className="min-h-[220px] overflow-hidden sm:min-h-full">
                  {resolveMediaUrl(featured.image) && (
                    <img
                      src={resolveMediaUrl(featured.image)}
                      alt={featured.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
              </Link>

              {/* Rich grid */}
              {richGrid.length > 0 && (
                  <div ref={gridRef} className="mt-6 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                    {richGrid.map((card) => {
                      const image = resolveMediaUrl(card.image);
                      return (
                        <Link key={card.title} to={cardLink(card)} className="group block min-w-0">
                          <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-gray-100">
                            {image && (
                              <img src={image} alt={card.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                            )}
                          </div>
                          <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                            <span className="font-semibold uppercase tracking-wide text-orange-600">{card.categories?.[0] ?? 'Programme'}</span>
                          </div>
                          <h3 className="mt-1 text-base font-extrabold leading-snug tracking-tight text-emerald-800 group-hover:text-emerald-700 sm:text-lg">
                            {card.title}
                          </h3>
                          {card.description && <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-500">{card.description}</p>}
                        </Link>
                      );
                    })}
                  </div>
              )}

              {/* Simple flat cards */}
              {simpleGrid.length > 0 && (
                  <div className="mt-6 border-t border-gray-100 pt-5">
                    <h2 className="mb-5 text-2xl font-bold tracking-tight text-emerald-800">More from the ecosystem</h2>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {simpleGrid.map((card) => (
                        <Link key={card.title} to={cardLink(card)} className="group block rounded-2xl bg-emerald-50 p-5 transition-colors hover:bg-emerald-100">
                          <span className="text-xs font-bold uppercase tracking-wide text-orange-600">{card.categories?.[0] ?? 'Programme'}</span>
                          <h3 className="mt-2 text-base font-bold leading-snug text-emerald-800">{card.title}</h3>
                        </Link>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 rounded-3xl bg-gradient-to-br from-cm-yellow via-amber-400 to-amber-500 p-8 text-center shadow-xl shadow-amber-500/10 sm:flex-row sm:p-10 sm:text-left">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{ctaTitle}</h3>
            <p className="mt-1.5 text-sm font-semibold text-slate-800/80">{ctaSubtitle}</p>
          </div>
          <Link to="/contact-us" className="shrink-0 rounded-xl bg-slate-900 px-8 py-3 text-sm font-bold text-white shadow-xl shadow-slate-900/10 transition-all hover:bg-slate-800">
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
};

export default Innovation;
