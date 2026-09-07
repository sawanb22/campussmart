import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';
import { getWarmCardCover } from '@/lib/card-covers';
import { CDE_PAGE_SLUG, CDE_DEFAULTS, slugifyStepTitle, type CampusDesignExecutionCard } from './campus-design-execution.data';

const DOT_COLORS = ['bg-orange-500', 'bg-emerald-600', 'bg-sky-600', 'bg-rose-500', 'bg-amber-500', 'bg-violet-500'];

const CampusDesignExecution = () => {
  const { data } = usePageData(CDE_PAGE_SLUG);
  const [activeCategory, setActiveCategory] = useState('All');

  const cards: CampusDesignExecutionCard[] = data.cards?.length ? data.cards : CDE_DEFAULTS.cards;

  const categoryOptions = useMemo(
    () => Array.from(new Set(cards.flatMap((card) => card.categories ?? []).filter(Boolean))),
    [cards],
  );
  const categoryColor = useMemo(() => {
    const map: Record<string, string> = {};
    categoryOptions.forEach((cat, i) => {
      map[cat] = DOT_COLORS[i % DOT_COLORS.length];
    });
    return map;
  }, [categoryOptions]);

  const filteredCards = useMemo(() => {
    return cards.filter((card) => activeCategory === 'All' || (card.categories ?? []).includes(activeCategory));
  }, [cards, activeCategory]);

  const featured = filteredCards.slice(0, 2);
  const rest = filteredCards.slice(2);

  return (
    <main className="min-h-screen bg-white">
      <section className="mx-auto max-w-6xl px-4 py-3 sm:px-6 sm:py-4 lg:px-8">
        {/* Toolbar */}
        <div className="mb-3 flex flex-col gap-2.5 sm:flex-row sm:items-center">
          <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categoryOptions.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`shrink-0 whitespace-nowrap rounded-md border px-3 py-2 text-xs font-semibold transition-colors ${
                  activeCategory === category ? 'border-gray-200 bg-gray-100 text-cm-blue-dark' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${categoryColor[category]}`} />
                {category}
              </button>
            ))}
          </div>
        </div>

        {filteredCards.length === 0 ? (
          <div className="rounded-2xl border border-gray-100 bg-gray-50 py-20 text-center text-gray-500">
            No process steps in this category.
          </div>
        ) : (
          <>
            {featured.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {featured.map((card, index) => {
                  const cover = getWarmCardCover(index);
                  const image = resolveMediaUrl(card.image);
                  return (
                    <Link
                      key={card.title}
                      to={`/${CDE_PAGE_SLUG}/${slugifyStepTitle(card.title)}`}
                      className="group block overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-lg"
                    >
                      <div className="relative m-2 h-40 overflow-hidden rounded-lg sm:h-48" style={{ background: cover.background }}>
                        {image && <img src={image} alt={card.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                      </div>
                      <div className="p-4 pb-5">
                        <div className="mb-1.5 flex items-center gap-2 text-xs text-gray-400">
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${categoryColor[card.categories?.[0] ?? ''] ?? 'bg-gray-400'}`} />
                          <span className="font-semibold text-orange-600">{card.categories?.[0] ?? 'Process'}</span>
                          <span>Step 0{index + 1}</span>
                        </div>
                        <h3 className="text-base font-extrabold leading-snug tracking-tight text-cm-blue-dark group-hover:text-cm-blue sm:text-lg">{card.title}</h3>
                        {card.description && <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-500">{card.description}</p>}
                        <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-cm-blue transition-all group-hover:gap-2.5">
                          Learn More <ArrowRight className="h-4 w-4" />
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {rest.length > 0 && (
              <div className="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((card, index) => {
                  const cover = getWarmCardCover(index + 2);
                  const image = resolveMediaUrl(card.image);
                  return (
                    <Link
                      key={card.title}
                      to={`/${CDE_PAGE_SLUG}/${slugifyStepTitle(card.title)}`}
                      className="group block overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-shadow hover:shadow-lg"
                    >
                      <div className="relative m-2 h-36 overflow-hidden rounded-lg" style={{ background: cover.background }}>
                        {image && <img src={image} alt={card.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                      </div>
                      <div className="p-4 pb-5">
                        <div className="mb-1.5 flex items-center gap-2 text-xs text-gray-400">
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${categoryColor[card.categories?.[0] ?? ''] ?? 'bg-gray-400'}`} />
                          <span className="font-semibold text-orange-600">{card.categories?.[0] ?? 'Process'}</span>
                          <span>Step 0{index + 3}</span>
                        </div>
                        <h3 className="text-base font-extrabold leading-snug tracking-tight text-cm-blue-dark group-hover:text-cm-blue">{card.title}</h3>
                        {card.description && <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-500">{card.description}</p>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </>
        )}

        <div className="mt-4 text-center">
          <Link to="/request-quote" className="btn-primary inline-flex items-center gap-2">
            Get a Project Quote <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default CampusDesignExecution;
