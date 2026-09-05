import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';
import { LIBRARY_MGMT_PAGE_SLUG, LIBRARY_MGMT_DEFAULTS, slugifyLibraryModuleTitle, type LibraryManagementCard } from './library-management.data';

gsap.registerPlugin(ScrollTrigger);

const LibraryManagement = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData(LIBRARY_MGMT_PAGE_SLUG);
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

  const heroTitle = data.heroTitle ?? LIBRARY_MGMT_DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? LIBRARY_MGMT_DEFAULTS.heroSubtitle;
  const heroImage = resolveMediaUrl(data.heroImage) || LIBRARY_MGMT_DEFAULTS.heroImage;
  const allCards: LibraryManagementCard[] = data.cards?.length ? data.cards : LIBRARY_MGMT_DEFAULTS.cards;

  const categoryOptions = useMemo(
    () => Array.from(new Set(allCards.flatMap((card) => card.categories ?? []).filter(Boolean))),
    [allCards],
  );
  const filteredCards = useMemo(
    () => (activeCategory === 'All' ? allCards : allCards.filter((card) => (card.categories ?? []).includes(activeCategory))),
    [allCards, activeCategory],
  );

  const [featured, ...rest] = filteredCards;
  const cardLink = (card: LibraryManagementCard) => `/${LIBRARY_MGMT_PAGE_SLUG}/${slugifyLibraryModuleTitle(card.title)}`;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section ref={heroRef} className="bg-amber-50/60 px-4 pb-6 pt-6 sm:px-6 sm:pb-8 sm:pt-8 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-orange-600">
              <span className="h-[2px] w-6 bg-orange-500" /> Library Management System
            </span>
            <h1 className="font-playfair max-w-xl text-4xl font-semibold leading-[1.05] tracking-tight text-stone-900 sm:text-5xl">{heroTitle}</h1>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-stone-500 sm:text-base">{heroSubtitle}</p>
            <div className="mt-7">
              <Link to="/request-quote" className="btn-primary inline-flex items-center gap-2">
                Request a Demo <ArrowRight className="h-4 w-4" />
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

      <section className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Category filter chips */}
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveCategory('All')}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                activeCategory === 'All' ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 text-stone-600 hover:border-stone-400'
              }`}
            >
              All
            </button>
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
                    Featured &middot; {featured.categories?.[0] ?? 'Module'}
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
                <div ref={gridRef} className="mt-6 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
                  {rest.map((card) => {
                    const image = resolveMediaUrl(card.image);
                    return (
                      <Link key={card.title} to={cardLink(card)} className="group block min-w-0">
                        <div className="aspect-[4/3] w-full overflow-hidden rounded-xl bg-stone-100">
                          {image && (
                            <img src={image} alt={card.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          )}
                        </div>
                        <span className="mt-3 block text-xs font-bold uppercase tracking-wide text-orange-600">{card.categories?.[0] ?? 'Module'}</span>
                        <h3 className="font-playfair mt-1 text-lg font-semibold leading-snug text-stone-900">{card.title}</h3>
                        {card.description && <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-stone-500">{card.description}</p>}
                      </Link>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-2xl bg-stone-900 p-8 text-center text-white sm:p-10 sm:text-left">
          <div className="pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full border border-white/10" />
          <div className="relative flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <h2 className="font-playfair text-2xl font-semibold sm:text-3xl">Ready to modernise your library?</h2>
              <p className="mt-2 max-w-md text-sm text-white/60">See a live walkthrough of the system and get a rollout plan for your campus.</p>
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

export default LibraryManagement;
