import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import MediaImage from '@/components/ui/media-image';
import { PageCardGridSkeleton } from '@/components/ui/page-skeleton';
import {
  CDE_PAGE_SLUG,
  CDE_DEFAULTS,
  slugifyStepTitle,
  type CampusDesignExecutionCard,
} from './campus-design-execution.data';

const CampusDesignExecution = () => {
  const { data, loading } = usePageData(CDE_PAGE_SLUG);

  const heroTitle = data.heroTitle ?? CDE_DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? CDE_DEFAULTS.heroSubtitle;
  const cards: CampusDesignExecutionCard[] = Array.isArray(data.cards)
    ? data.cards
    : (data.cards === undefined ? CDE_DEFAULTS.cards : []);

  const cardLink = (card: CampusDesignExecutionCard) =>
    card.href?.trim() || `/${CDE_PAGE_SLUG}/${slugifyStepTitle(card.title)}`;

  if (loading && !data.cards) {
    return <PageCardGridSkeleton cardCount={6} />;
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Section Header */}
      <section className="px-4 pt-8 pb-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <span className="text-xs font-bold uppercase tracking-widest text-cm-blue">
            Turnkey Services
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-cm-blue-dark sm:text-4xl">
            {heroTitle}
          </h1>
          <p className="mt-3 max-w-3xl text-base text-gray-600 leading-relaxed">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Execution Process Steps Grid */}
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-cm-blue-dark sm:text-2xl">
              Turnkey Execution Phases
            </h2>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {cards.length} Sequential Steps
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, index) => {
              const category = card.categories?.[0] ?? 'Process';
              const stepNumber = String(index + 1).padStart(2, '0');
              return (
                <Link
                  key={card.title}
                  to={cardLink(card)}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    {card.image && (
                      <MediaImage
                        src={card.image}
                        alt={card.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-2.5 flex items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cm-blue">
                        {category}
                      </span>
                      <span className="text-xs font-bold text-gray-400">
                        Step {stepNumber}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-cm-blue-dark transition-colors group-hover:text-cm-blue">
                      {card.title}
                    </h3>
                    {card.description && (
                      <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">
                        {card.description}
                      </p>
                    )}
                    <div className="mt-5 border-t border-gray-50 pt-3">
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-cm-blue transition-all group-hover:gap-2.5">
                        Learn More <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 rounded-[2rem] bg-gradient-to-br from-cm-blue-dark to-cm-blue px-8 py-8 text-center sm:flex-row sm:px-12 sm:text-left shadow-lg">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Ready to Execute Your Campus Project?
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/85 sm:text-base">
              Share your project scope, area, and timelines with our architectural and engineering team.
            </p>
          </div>
          <Link
            to="/request-quote"
            className="btn-secondary inline-flex flex-shrink-0 items-center gap-2 px-8 py-3.5 text-sm font-bold shadow-md hover:scale-105 transition-all"
          >
            Get a Project Quote <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default CampusDesignExecution;
