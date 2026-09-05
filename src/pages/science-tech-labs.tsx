import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { Search, FlaskConical } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';
import { getCardCover } from '@/lib/card-covers';
import {
  SCIENCE_TECH_LABS_PAGE_SLUG,
  SCIENCE_TECH_LABS_DEFAULTS,
  slugifyScienceLabTitle,
  type ScienceTechLabsCard,
} from './science-tech-labs.data';

gsap.registerPlugin(ScrollTrigger);

const ScienceTechLabs = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData(SCIENCE_TECH_LABS_PAGE_SLUG);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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

  const heroTitle = data.heroTitle ?? SCIENCE_TECH_LABS_DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? SCIENCE_TECH_LABS_DEFAULTS.heroSubtitle;
  const allCards: ScienceTechLabsCard[] = data.cards?.length ? data.cards : SCIENCE_TECH_LABS_DEFAULTS.cards;

  const categoryOptions = useMemo(
    () => Array.from(new Set(allCards.flatMap((card) => card.categories ?? []).filter(Boolean))),
    [allCards],
  );

  const filteredCards = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return allCards.filter((card) => {
      const matchesCategory = activeCategory === 'All' || (card.categories ?? []).includes(activeCategory);
      const matchesQuery = !query || `${card.title} ${card.description ?? ''}`.toLowerCase().includes(query);
      return matchesCategory && matchesQuery;
    });
  }, [allCards, activeCategory, searchQuery]);

  const cardLink = (card: ScienceTechLabsCard) => `/${SCIENCE_TECH_LABS_PAGE_SLUG}/${slugifyScienceLabTitle(card.title)}`;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section ref={heroRef} className="px-4 pb-6 pt-6 sm:px-6 sm:pb-8 sm:pt-8 lg:px-8">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div>
            <span className="mb-3 inline-block text-[11px] font-bold uppercase tracking-[0.16em] text-teal-600">Science &amp; Tech Labs</span>
            <h1 className="max-w-xl text-4xl font-extrabold leading-[1.05] tracking-tight text-cm-blue-dark sm:text-5xl">{heroTitle}</h1>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-gray-500 sm:text-base">{heroSubtitle}</p>
          </div>
          <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-sm overflow-hidden rounded-2xl shadow-xl lg:block">
            <img
              src="https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?auto=format&fit=crop&w=800&q=85"
              alt={heroTitle}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-cm-blue-dark/50 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center gap-2 rounded-xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
              <FlaskConical className="h-4 w-4 text-teal-600" />
              <span className="text-xs font-bold text-cm-blue-dark">Hands-on, every session</span>
            </div>
          </div>
        </div>
      </section>

      {/* Toolbar */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button
              type="button"
              onClick={() => setActiveCategory('All')}
              className={`shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                activeCategory === 'All' ? 'border-teal-200 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              All
            </button>
            {categoryOptions.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                  activeCategory === category ? 'border-teal-200 bg-teal-50 text-teal-700' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          <label className="flex shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs text-gray-500 sm:w-56">
            <Search className="h-3.5 w-3.5" />
            <input
              type="text"
              placeholder="Search labs..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full bg-transparent outline-none placeholder:text-gray-400"
            />
          </label>
        </div>
      </section>

      {/* Grid */}
      <section className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {filteredCards.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 py-20 text-center text-gray-500">No labs found matching your criteria.</div>
          ) : (
            <div ref={gridRef} className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCards.map((card, index) => {
                const cover = getCardCover(index);
                const image = resolveMediaUrl(card.image);
                return (
                  <Link key={card.title} to={cardLink(card)} className="group block min-w-0">
                    <div className="relative h-48 overflow-hidden rounded-xl" style={{ background: cover.background }}>
                      {image && <img src={image} alt={card.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                      <span className="absolute bottom-0 left-0 h-7 w-7 rounded-tr-xl rounded-bl-xl" style={{ background: cover.accent }} />
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-[11px] text-gray-400">
                      <span className="font-bold text-teal-600">{card.categories?.[0] ?? 'Labs'}</span>
                    </div>
                    <h3 className="mt-1.5 text-base font-extrabold leading-snug tracking-tight text-cm-blue-dark line-clamp-2 group-hover:text-cm-blue sm:text-lg">
                      {card.title}
                    </h3>
                    <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-500">{card.description}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 rounded-2xl bg-cm-blue-dark p-8 text-center text-white sm:flex-row sm:p-10 sm:text-left">
          <div>
            <h2 className="text-2xl font-bold sm:text-3xl">Ready to equip your labs?</h2>
            <p className="mt-2 max-w-md text-sm text-white/70">Talk to our team about the right mix of equipment and layout for your science and technology programme.</p>
          </div>
          <Link to="/contact-us" className="shrink-0 rounded-full bg-teal-500 px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-teal-600">
            Contact Us
          </Link>
        </div>
      </section>
    </main>
  );
};

export default ScienceTechLabs;
