import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import MediaImage from '@/components/ui/media-image';
import { PageCardGridSkeleton } from '@/components/ui/page-skeleton';
import {
  MASTER_PLANNING_PAGE_SLUG,
  MASTER_PLANNING_DEFAULTS,
  slugifyMasterPlanningTitle,
  type MasterPlanningCard,
} from './campus-master-planning.data';

const CampusMasterPlanning = () => {
  const { data, loading } = usePageData(MASTER_PLANNING_PAGE_SLUG);

  const heroLabel = data.heroLabel ?? 'Master Planning Services';
  const heroTitle = data.heroTitle ?? MASTER_PLANNING_DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? MASTER_PLANNING_DEFAULTS.heroSubtitle;
  const section2Title = data.section1Title ?? data.sectionTitle ?? data.section2Title ?? MASTER_PLANNING_DEFAULTS.section2Title;
  const cards: MasterPlanningCard[] = Array.isArray(data.cards) ? data.cards : MASTER_PLANNING_DEFAULTS.cards;
  const ctaTitle = data.ctaTitle ?? MASTER_PLANNING_DEFAULTS.ctaTitle;
  const ctaSubtitle = data.ctaSubtitle ?? MASTER_PLANNING_DEFAULTS.ctaSubtitle;

  const cardLink = (card: MasterPlanningCard) =>
    card.href?.trim() || `/${MASTER_PLANNING_PAGE_SLUG}/${slugifyMasterPlanningTitle(card.title)}`;

  if (loading && !data.cards) {
    return <PageCardGridSkeleton cardCount={6} />;
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Section Header */}
      <section className="px-4 pt-8 pb-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <span className="text-xs font-bold uppercase tracking-widest text-cm-blue">
            {heroLabel}
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-cm-blue-dark sm:text-4xl">
            {heroTitle}
          </h1>
          <p className="mt-3 max-w-3xl text-base text-gray-600 leading-relaxed">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section id="planning-services" className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-cm-blue-dark sm:text-2xl">
              {section2Title}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
              const category = card.categories?.[0] ?? 'Planning';
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
                    <span className="mb-2.5 inline-block w-fit rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cm-blue">
                      {category}
                    </span>
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
            <h2 className="text-2xl font-bold text-white sm:text-3xl">{ctaTitle}</h2>
            <p className="mt-2 max-w-xl text-sm text-white/85 sm:text-base">{ctaSubtitle}</p>
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

export default CampusMasterPlanning;
