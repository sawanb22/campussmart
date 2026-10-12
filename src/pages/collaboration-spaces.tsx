import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { getCardCover } from '@/lib/card-covers';
import MediaImage from '@/components/ui/media-image';
import { PageCardGridSkeleton } from '@/components/ui/page-skeleton';

export interface CollaborationSpaceCard {
  title: string;
  description?: string;
  image?: string;
  categories?: string[];
  href?: string;
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

const PAGE_SIZE = 12;

const CollaborationSpaces = () => {
  const { data, loading } = usePageData(COLLABORATION_SPACES_PAGE_SLUG);
  const [activeCategory, setActiveCategory] = useState('All');
  const [page, setPage] = useState(1);

  const section1Title = data.section1Title || '';
  const cards: CollaborationSpaceCard[] = Array.isArray(data.cards) ? data.cards : [];
  const ctaTitle = data.ctaTitle || '';
  const ctaSubtitle = data.ctaSubtitle || '';

  const categoryOptions = useMemo(
    () => Array.from(new Set(cards.flatMap((card) => card.categories ?? []).filter(Boolean))),
    [cards],
  );
  const filteredCards = useMemo(
    () => (activeCategory === 'All' ? cards : cards.filter((card) => (card.categories ?? []).includes(activeCategory))),
    [cards, activeCategory],
  );

  const totalPages = Math.ceil(filteredCards.length / PAGE_SIZE);
  const paginatedCards = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredCards.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredCards, page]);

  useEffect(() => {
    setPage(1);
  }, [activeCategory]);

  const cardLink = (card: CollaborationSpaceCard) => card.href?.trim() || `/${COLLABORATION_SPACES_PAGE_SLUG}/${slugifyCollaborationSpaceTitle(card.title)}`;

  if (loading) {
    return <PageCardGridSkeleton cardCount={6} />;
  }

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
              {paginatedCards.map((card, index) => {
                const cover = getCardCover(index);
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

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`h-8 w-8 rounded-lg text-sm font-semibold transition ${
                    p === page
                      ? 'bg-cm-blue text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
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
