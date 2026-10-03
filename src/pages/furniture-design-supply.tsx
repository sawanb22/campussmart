import { useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';
import { getWarmCardCover } from '@/lib/card-covers';
import MediaImage from '@/components/ui/media-image';

export interface FurnitureSupplyCard {
  title: string;
  description?: string;
  image?: string;
  categories?: string[];
  href?: string;
}

export const FURNITURE_SUPPLY_PAGE_SLUG = 'furniture-design-supply';

export function slugifyFurnitureSupplyTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'solution'
  );
}

export const FURNITURE_SUPPLY_DEFAULTS = {
  heroTitle: 'Furniture Design + Supply',
  heroSubtitle:
    'Complete furniture solutions for educational institutions — from design and bulk manufacturing to nationwide installation, we furnish every corner of your campus.',
  heroImage: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1100&q=85',
  section1Title: 'Explore Our Furniture Solutions',
  cards: [
    {
      title: 'Classroom Furniture Packages',
      description: 'Desks, chairs and storage sized to room capacity, built to survive a full academic year of daily use.',
      image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=900&q=85',
      categories: ['Classroom'],
    },
    {
      title: 'Library & Reading Spaces',
      description: 'Modular shelving, study pods and reading tables that hold up to high footfall and reconfigure as collections grow.',
      image: 'https://images.unsplash.com/photo-1568667256549-094345857637?auto=format&fit=crop&w=900&q=85',
      categories: ['Library'],
    },
    {
      title: 'Laboratory Workstations',
      description: 'Chemical-resistant benches, stools and storage engineered for science, computer and research labs.',
      image: 'https://images.unsplash.com/photo-1532094349884-543290e34c7d?auto=format&fit=crop&w=900&q=85',
      categories: ['Laboratory'],
    },
    {
      title: 'Hostel & Dormitory Furniture',
      description: 'Space-efficient beds, wardrobes and study units manufactured for durability under daily student use.',
      image: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=900&q=85',
      categories: ['Hostel'],
    },
    {
      title: 'Staff & Administrative Furniture',
      description: 'Ergonomic desks, cabins and meeting-room furniture that keep faculty and admin spaces comfortable and productive.',
      image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=900&q=85',
      categories: ['Staff & Office'],
    },
    {
      title: 'Outdoor & Play Furniture',
      description: 'Weatherproof seating and play structures built to hold up to sun, rain and daily footfall in courtyards and grounds.',
      image: 'https://images.unsplash.com/photo-1566454544259-f4b94c3d758c?auto=format&fit=crop&w=900&q=85',
      categories: ['Outdoor'],
    },
  ] as FurnitureSupplyCard[],
  ctaTitle: 'Ready to furnish your next campus?',
  ctaSubtitle: 'Share your floor plan and student count — our design team will recommend the right furniture mix and manufacturing timeline.',
};

gsap.registerPlugin(ScrollTrigger);

const FurnitureDesignSupply = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData(FURNITURE_SUPPLY_PAGE_SLUG);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
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
  }, [activeCategory]);

  const heroTitle = data.heroTitle ?? FURNITURE_SUPPLY_DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? FURNITURE_SUPPLY_DEFAULTS.heroSubtitle;
  const heroImage = resolveMediaUrl(data.heroImage) || FURNITURE_SUPPLY_DEFAULTS.heroImage;
  const section1Title = data.section1Title ?? FURNITURE_SUPPLY_DEFAULTS.section1Title;
  const cards: FurnitureSupplyCard[] = Array.isArray(data.cards) ? data.cards : FURNITURE_SUPPLY_DEFAULTS.cards;
  const ctaTitle = data.ctaTitle ?? FURNITURE_SUPPLY_DEFAULTS.ctaTitle;
  const ctaSubtitle = data.ctaSubtitle ?? FURNITURE_SUPPLY_DEFAULTS.ctaSubtitle;

  const categoryOptions = useMemo(
    () => Array.from(new Set(cards.flatMap((card) => card.categories ?? []).filter(Boolean))),
    [cards],
  );
  const filteredCards = useMemo(
    () => (activeCategory === 'All' ? cards : cards.filter((card) => (card.categories ?? []).includes(activeCategory))),
    [cards, activeCategory],
  );

  const cardLink = (card: FurnitureSupplyCard) => card.href?.trim() || `/${FURNITURE_SUPPLY_PAGE_SLUG}/${slugifyFurnitureSupplyTitle(card.title)}`;

  return (
    <main className="min-h-screen bg-white">
      <section ref={heroRef} className="px-4 pb-3 pt-4 sm:px-6 sm:pb-4 sm:pt-5 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Bento feature grid */}
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            {/* Large image tile */}
            <div className="group relative overflow-hidden rounded-2xl lg:col-span-2">
              <div className="h-64 w-full overflow-hidden sm:h-72">
                <MediaImage
                  src={heroImage}
                  alt={heroTitle}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute inset-x-5 bottom-5">
                <p className="max-w-sm text-sm leading-relaxed text-white/90 sm:text-base">{heroSubtitle}</p>
                <Link
                  to="/request-quote"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-xs font-bold text-cm-blue-dark transition-transform hover:-translate-y-0.5"
                >
                  Get a Furniture Quote <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Categories tile */}
            <aside className="flex flex-col rounded-2xl bg-cm-blue p-5 text-white">
              <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">Browse by category</span>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCategory('All')}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    activeCategory === 'All' ? 'bg-white text-cm-blue-dark' : 'bg-white/15 text-white hover:bg-white/25'
                  }`}
                >
                  All
                </button>
                {categoryOptions.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setActiveCategory(category)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      activeCategory === category ? 'bg-white text-cm-blue-dark' : 'bg-white/15 text-white hover:bg-white/25'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
              <Link
                to="/furniture"
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-cm-red px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-red-600"
              >
                Shop Furniture <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </aside>
          </div>
        </div>
      </section>

      {/* Solutions grid */}
      <section className="px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex items-end justify-between gap-4">
            <h2 className="text-3xl font-extrabold tracking-tight text-cm-blue-dark sm:text-4xl">{section1Title}</h2>
            {activeCategory !== 'All' && (
              <button type="button" onClick={() => setActiveCategory('All')} className="shrink-0 text-xs font-semibold text-gray-400 hover:text-cm-blue">
                Clear filter ({activeCategory}) &times;
              </button>
            )}
          </div>

          {filteredCards.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 py-20 text-center text-gray-500">No solutions match that category.</div>
          ) : (
            <div ref={gridRef} className="grid grid-cols-1 gap-x-5 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCards.map((card, index) => {
                const cover = getWarmCardCover(index);
                return (
                  <Link
                    key={card.title}
                    to={cardLink(card)}
                    className="group block min-w-0"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-xl" style={{ background: cover.background }}>
                      {card.image && (
                        <MediaImage src={card.image} alt={card.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      )}
                    </div>
                    <span className="mt-3 block text-xs font-bold uppercase tracking-wide text-cm-red">{card.categories?.[0] ?? 'Furniture'}</span>
                    <h3 className="mt-1 text-lg font-bold leading-snug text-cm-blue-dark group-hover:text-cm-blue">{card.title}</h3>
                    {card.description && <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-500">{card.description}</p>}
                    <span className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-cm-blue">
                      Learn more <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-6 sm:px-6 lg:px-8">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl bg-cm-blue-dark p-8 text-center text-white sm:p-10 sm:text-left">
          <div className="pointer-events-none absolute -right-14 -top-20 h-52 w-52 rounded-full border border-white/10" />
          <div className="relative flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <h2 className="text-2xl font-extrabold sm:text-3xl">{ctaTitle}</h2>
              <p className="mt-2 max-w-md text-sm text-white/60">{ctaSubtitle}</p>
            </div>
            <Link to="/request-quote" className="shrink-0 rounded-full bg-cm-red px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-red-600">
              Get a Quote
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default FurnitureDesignSupply;
