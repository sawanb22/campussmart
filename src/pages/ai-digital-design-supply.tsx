import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';
import { getCardCover } from '@/lib/card-covers';

export interface AiDigitalSupplyCard {
  title: string;
  description?: string;
  image?: string;
  categories?: string[];
}

export const AI_DIGITAL_SUPPLY_PAGE_SLUG = 'ai-digital-design-supply';

export function slugifyAiDigitalSupplyTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'solution'
  );
}

export const AI_DIGITAL_SUPPLY_DEFAULTS = {
  heroTitle: 'AI/Digital Design + Supply',
  heroSubtitle:
    'Cutting-edge AI and digital tools for modern campuses — from space planning and smart procurement to predictive maintenance and digital twins.',
  heroImage: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&auto=format&fit=crop&w=1100&q=85',
  section1Title: 'Explore Our Digital Solutions',
  cards: [
    {
      title: 'AI Space Planning',
      description: 'AI-optimized campus layout and space utilization analysis that turns raw floor plans into data-backed design decisions.',
      image: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85',
      categories: ['Planning'],
    },
    {
      title: 'Smart Procurement',
      description: 'Intelligent vendor selection and cost optimization that shortlists the right suppliers for every campus build.',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85',
      categories: ['Procurement'],
    },
    {
      title: 'Predictive Maintenance',
      description: 'AI-driven maintenance scheduling and alerts that catch equipment issues before they become downtime.',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85',
      categories: ['Maintenance'],
    },
    {
      title: 'Digital Twin',
      description: 'Virtual campus simulation before construction begins, so layout and infrastructure decisions are tested before they are built.',
      image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=85',
      categories: ['Simulation'],
    },
  ] as AiDigitalSupplyCard[],
  ctaTitle: 'Ready to bring AI into your campus operations?',
  ctaSubtitle: 'Tell us about your buildings and processes — our team will map out the right AI and digital tools for your campus.',
};

const AIDigitalDesignSupply = () => {
  const { data } = usePageData(AI_DIGITAL_SUPPLY_PAGE_SLUG);
  const [activeCategory, setActiveCategory] = useState('All');

  const section1Title = data.section1Title ?? AI_DIGITAL_SUPPLY_DEFAULTS.section1Title;
  const cards: AiDigitalSupplyCard[] = data.cards?.length ? data.cards : AI_DIGITAL_SUPPLY_DEFAULTS.cards;
  const ctaTitle = data.ctaTitle ?? AI_DIGITAL_SUPPLY_DEFAULTS.ctaTitle;
  const ctaSubtitle = data.ctaSubtitle ?? AI_DIGITAL_SUPPLY_DEFAULTS.ctaSubtitle;

  const categoryOptions = useMemo(
    () => Array.from(new Set(cards.flatMap((card) => card.categories ?? []).filter(Boolean))),
    [cards],
  );
  const filteredCards = useMemo(
    () => (activeCategory === 'All' ? cards : cards.filter((card) => (card.categories ?? []).includes(activeCategory))),
    [cards, activeCategory],
  );

  return (
    <main className="min-h-screen bg-white">
      {/* Toolbar + grid */}
      <section className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Category filter chips */}
          {categoryOptions.length > 0 && (
            <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-gray-100 pb-4">
              {categoryOptions.map((category) => (
                <button
                  type="button"
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                    activeCategory === category ? 'border-cm-purple bg-cm-purple text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-cm-blue-dark sm:text-3xl">{section1Title}</h2>

          {filteredCards.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 py-20 text-center text-gray-500">No solutions match that category.</div>
          ) : (
            <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCards.map((card, index) => {
                const cover = getCardCover(index);
                const image = resolveMediaUrl(card.image);
                return (
                  <Link
                    key={card.title}
                    to={`/${AI_DIGITAL_SUPPLY_PAGE_SLUG}/${slugifyAiDigitalSupplyTitle(card.title)}`}
                    className="group block min-w-0"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-xl" style={{ background: cover.background }}>
                      {image && (
                        <img src={image} alt={card.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      )}
                    </div>
                    <span className="mt-3 block text-xs font-bold uppercase tracking-wide text-cm-purple">{card.categories?.[0] ?? 'Digital'}</span>
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
            <Link to="/request-quote" className="shrink-0 rounded-full bg-cm-purple px-7 py-3 text-sm font-bold text-white transition-colors hover:bg-purple-700">
              Get a Quote
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AIDigitalDesignSupply;
