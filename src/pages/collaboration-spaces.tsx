import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';
import { getCardCover } from '@/lib/card-covers';

export interface CollaborationSpaceCard {
  title: string;
  description?: string;
  image?: string;
  categories?: string[];
}

export const COLLABORATION_SPACES_PAGE_SLUG = 'collaboration-spaces';

export function slugifyCollaborationSpaceTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'space'
  );
}

export const COLLABORATION_SPACES_DEFAULTS = {
  heroTitle: 'Collaboration Spaces',
  heroSubtitle:
    'Foster teamwork and creativity with purpose-built collaboration environments — modern spaces designed to bring students and faculty together.',
  heroImage: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1100&q=85',
  section1Title: 'Explore Collaboration Spaces',
  cards: [
    {
      title: 'Breakout Discussion Pods',
      description: 'Compact, semi-enclosed pods where small groups can talk, video-call or work through a problem without booking a whole room.',
      image: 'https://images.unsplash.com/photo-1517502884422-41eaead166d4?auto=format&fit=crop&w=900&q=85',
      categories: ['Pods'],
    },
    {
      title: 'Open Collaboration Lounges',
      description: 'Soft seating and flexible furniture in open zones that invite spontaneous teamwork between classes.',
      image: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=900&q=85',
      categories: ['Lounges'],
    },
    {
      title: 'Team Project Rooms',
      description: 'Bookable rooms with writable walls, large screens and movable furniture built around group project work.',
      image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=85',
      categories: ['Project Rooms'],
    },
    {
      title: 'Faculty Collaboration Hubs',
      description: 'Shared workspaces where faculty can co-plan lessons, grade together and exchange ideas outside the staff room.',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=85',
      categories: ['Faculty'],
    },
    {
      title: 'Maker & Ideation Studios',
      description: 'Flexible studio space with prototyping tools and movable walls for hands-on, cross-disciplinary sessions.',
      image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=900&q=85',
      categories: ['Studios'],
    },
    {
      title: 'Outdoor Collaboration Decks',
      description: 'Covered outdoor seating and work decks that extend group work into the campus courtyard on good-weather days.',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=85',
      categories: ['Outdoor'],
    },
  ] as CollaborationSpaceCard[],
  ctaTitle: 'Ready to design your collaboration spaces?',
  ctaSubtitle: "Tell us about your campus and we'll help you plan spaces that bring students and faculty together.",
};

const CollaborationSpaces = () => {
  const { data } = usePageData(COLLABORATION_SPACES_PAGE_SLUG);
  const [activeCategory, setActiveCategory] = useState('All');

  const section1Title = data.section1Title ?? COLLABORATION_SPACES_DEFAULTS.section1Title;
  const cards: CollaborationSpaceCard[] = Array.isArray(data.cards) ? data.cards : COLLABORATION_SPACES_DEFAULTS.cards;
  const ctaTitle = data.ctaTitle ?? COLLABORATION_SPACES_DEFAULTS.ctaTitle;
  const ctaSubtitle = data.ctaSubtitle ?? COLLABORATION_SPACES_DEFAULTS.ctaSubtitle;

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
      <section className="px-4 pt-6 pb-5 sm:px-6 sm:pb-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Category filter chips */}
          <div className="mb-4 flex flex-wrap items-center gap-2 border-b border-gray-100 pb-4">
            <button
              type="button"
              onClick={() => setActiveCategory('All')}
              className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                activeCategory === 'All' ? 'border-cm-blue bg-cm-blue text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              All
            </button>
            {categoryOptions.map((category) => (
              <button
                type="button"
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                  activeCategory === category ? 'border-cm-blue bg-cm-blue text-white' : 'border-gray-200 text-gray-600 hover:border-gray-400'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <h2 className="mb-4 text-2xl font-extrabold tracking-tight text-cm-blue-dark sm:text-3xl">{section1Title}</h2>

          {filteredCards.length === 0 ? (
            <div className="rounded-2xl border border-gray-100 bg-gray-50 py-20 text-center text-gray-500">No spaces match that category.</div>
          ) : (
            <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCards.map((card, index) => {
                const cover = getCardCover(index);
                const image = resolveMediaUrl(card.image);
                return (
                  <Link
                    key={card.title}
                    to={`/${COLLABORATION_SPACES_PAGE_SLUG}/${slugifyCollaborationSpaceTitle(card.title)}`}
                    className="group block min-w-0"
                  >
                    <div className="aspect-[4/3] w-full overflow-hidden rounded-xl" style={{ background: cover.background }}>
                      {image && (
                        <img src={image} alt={card.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      )}
                    </div>
                    <span className="mt-3 block text-xs font-bold uppercase tracking-wide text-orange-600">{card.categories?.[0] ?? 'Space'}</span>
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
            <Link to="/request-quote" className="shrink-0 rounded-full bg-cm-cyan px-7 py-3 text-sm font-bold text-cm-blue-dark transition-colors hover:brightness-95">
              Get a Quote
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default CollaborationSpaces;
