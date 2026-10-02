import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Trophy } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';
import { SPORTS_INFRASTRUCTURE_PAGE_SLUG, SPORTS_INFRASTRUCTURE_DEFAULTS, slugifySportsInfrastructureTitle, type SportsInfrastructureCard } from './sports-infrastructure.data';

gsap.registerPlugin(ScrollTrigger);

const SportsInfrastructure = () => {
  const gridRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData(SPORTS_INFRASTRUCTURE_PAGE_SLUG);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const ctx = gsap.context(() => {
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

  const ctaTitle = data.ctaTitle ?? SPORTS_INFRASTRUCTURE_DEFAULTS.ctaTitle;
  const ctaSubtitle = data.ctaSubtitle ?? SPORTS_INFRASTRUCTURE_DEFAULTS.ctaSubtitle;
  const ctaButtonLabel = data.ctaButtonLabel ?? SPORTS_INFRASTRUCTURE_DEFAULTS.ctaButtonLabel;
  const cards: SportsInfrastructureCard[] = Array.isArray(data.cards) ? data.cards : SPORTS_INFRASTRUCTURE_DEFAULTS.cards;

  const categoryOptions = useMemo(
    () => Array.from(new Set(cards.flatMap((card) => card.categories ?? []).filter(Boolean))),
    [cards],
  );
  const filteredCards = useMemo(
    () => (activeCategory === 'All' ? cards : cards.filter((card) => (card.categories ?? []).includes(activeCategory))),
    [cards, activeCategory],
  );
  const cardLink = (card: SportsInfrastructureCard) => `/${SPORTS_INFRASTRUCTURE_PAGE_SLUG}/${slugifySportsInfrastructureTitle(card.title)}`;

  return (
    <main className="min-h-screen bg-[#f5f8e8]">
      {/* Facilities grid */}
      <section className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-grotesk text-4xl font-bold uppercase leading-[0.9] tracking-tight text-[#090909] sm:text-5xl">
              Our
              <br />
              Facilities
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setActiveCategory('All')}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                  activeCategory === 'All' ? 'border-[#090909] bg-[#090909] text-white' : 'border-black/15 bg-white text-black/70 hover:border-black/40'
                }`}
              >
                All Facilities
              </button>
              {categoryOptions.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                    activeCategory === category ? 'border-[#090909] bg-[#090909] text-white' : 'border-black/15 bg-white text-black/70 hover:border-black/40'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div ref={gridRef} className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCards.map((card) => {
              const image = resolveMediaUrl(card.image);
              return (
                <Link key={card.title} to={cardLink(card)} className="group overflow-hidden rounded-[1.375rem] bg-white transition-transform duration-300 hover:-translate-y-1">
                  <div className="h-[220px] overflow-hidden">
                    {image && <img src={image} alt={card.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                  </div>
                  <div className="p-5">
                    <p className="mb-2.5 text-[9px] font-semibold uppercase tracking-widest text-black/50">{card.categories?.[0] ?? 'Facility'}</p>
                    <h3 className="font-grotesk mb-3.5 text-xl font-bold uppercase leading-[1] tracking-tight text-[#090909]">{card.title}</h3>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold">
                      Learn more
                      <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-[#090909] text-white transition-transform group-hover:translate-x-0.5">
                        <ArrowUpRight className="h-3 w-3" />
                      </span>
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-8 rounded-[1.75rem] bg-[#d9f68b] p-8 sm:flex-row sm:items-center sm:p-12">
          <h2 className="font-grotesk max-w-lg text-4xl font-bold uppercase leading-[0.9] tracking-tight text-[#090909] sm:text-5xl">
            {ctaTitle}
          </h2>
          <div>
            <p className="mb-4 max-w-xs text-xs leading-relaxed text-black/70 sm:text-sm">{ctaSubtitle}</p>
            <Link
              to="/sports-infra"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[#090909] px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white hover:text-black"
            >
              <Trophy className="h-4 w-4" /> {ctaButtonLabel}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default SportsInfrastructure;
