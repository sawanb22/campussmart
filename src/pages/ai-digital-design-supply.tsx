import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import MediaImage from '@/components/ui/media-image';
import { PageCardGridSkeleton } from '@/components/ui/page-skeleton';
export interface AiDigitalSupplyCard {
  title: string;
  description?: string;
  image?: string;
  categories?: string[];
  href?: string;
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
  const { data, loading } = usePageData(AI_DIGITAL_SUPPLY_PAGE_SLUG);

  const heroTitle = data.heroTitle ?? AI_DIGITAL_SUPPLY_DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? AI_DIGITAL_SUPPLY_DEFAULTS.heroSubtitle;
  const section1Title = data.section1Title ?? AI_DIGITAL_SUPPLY_DEFAULTS.section1Title;
  const cards: AiDigitalSupplyCard[] = Array.isArray(data.cards) ? data.cards : AI_DIGITAL_SUPPLY_DEFAULTS.cards;
  const ctaTitle = data.ctaTitle ?? AI_DIGITAL_SUPPLY_DEFAULTS.ctaTitle;
  const ctaSubtitle = data.ctaSubtitle ?? AI_DIGITAL_SUPPLY_DEFAULTS.ctaSubtitle;

  const cardLink = (card: AiDigitalSupplyCard) =>
    card.href?.trim() || `/${AI_DIGITAL_SUPPLY_PAGE_SLUG}/${slugifyAiDigitalSupplyTitle(card.title)}`;

  if (loading && !data.cards) {
    return <PageCardGridSkeleton cardCount={4} />;
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Section Header */}
      <section className="px-4 pt-8 pb-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <span className="text-xs font-bold uppercase tracking-widest text-cm-blue">
            Smart Campus Technologies
          </span>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-cm-blue-dark sm:text-4xl">
            {heroTitle}
          </h1>
          <p className="mt-3 max-w-3xl text-base text-gray-600 leading-relaxed">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Digital Solutions Grid */}
      <section className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between border-b border-gray-100 pb-4">
            <h2 className="text-xl font-bold text-cm-blue-dark sm:text-2xl">
              {section1Title}
            </h2>
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              {cards.length} Digital Solutions
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
              const category = card.categories?.[0] ?? 'Digital';
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

export default AIDigitalDesignSupply;
