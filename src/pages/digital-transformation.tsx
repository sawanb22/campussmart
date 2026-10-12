import { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import MediaImage from '@/components/ui/media-image';
import { PageCardGridSkeleton } from '@/components/ui/page-skeleton';

export interface CardItem { title: string; description: string; image?: string; href?: string; }
interface Step { heading: string; body: string; }

export const DIGITAL_TRANSFORMATION_PAGE_SLUG = 'digital-transformation';

const PAGE_SIZE = 12;

export function slugifyDigitalTransformationCard(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'card'
  );
}

const DigitalTransformation = () => {
  const cardsRef = useRef<HTMLDivElement>(null);
  const { data, loading } = usePageData(DIGITAL_TRANSFORMATION_PAGE_SLUG);
  const [page, setPage] = useState(1);

  const heroBadge = data.heroBadge || '';
  const heroTitle = data.heroTitle || '';
  const heroSubtitle = data.heroSubtitle || '';
  const heroImage = data.heroImage || '';
  const heroButtonLabel = data.heroButtonLabel || '';
  const heroButtonHref = data.heroButtonHref || '/contact-us';

  const section2Eyebrow = data.section2Eyebrow || '';
  const section2Title = data.section2Title || '';
  const section2Cards: CardItem[] = Array.isArray(data.section2Cards) ? data.section2Cards : [];
  const section2Description = data.section2Description || '';

  const section1Eyebrow = data.section1Eyebrow || '';
  const section1Title = data.section1Title || '';
  const cards: CardItem[] = Array.isArray(data.cards) ? data.cards : [];

  const totalPages = Math.ceil(cards.length / PAGE_SIZE);
  const paginatedCards = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return cards.slice(startIndex, startIndex + PAGE_SIZE);
  }, [cards, page]);

  const processEyebrow = data.processEyebrow || '';
  const processTitle = data.processTitle || '';
  const steps: Step[] = Array.isArray(data.sections) ? data.sections : [];

  const ctaTitle = data.ctaTitle || '';
  const ctaSubtitle = data.ctaSubtitle || '';
  const ctaButtonLabel = data.ctaButtonLabel || '';
  const ctaHref = data.ctaHref || '/contact-us';

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cardEls = cardsRef.current?.children;
      if (cardEls && cardEls.length > 0) {
        gsap.fromTo(cardEls,
          { opacity: 0, y: 24 },
          {
            opacity: 1, y: 0,
            duration: 0.6,
            stagger: 0.08,
            scrollTrigger: { trigger: cardsRef.current, start: 'top 85%' },
          }
        );
      }
    });
    return () => ctx.revert();
  }, [paginatedCards]);

  const cardLink = (card: CardItem) => card.href?.trim() || `/${DIGITAL_TRANSFORMATION_PAGE_SLUG}/${slugifyDigitalTransformationCard(card.title)}`;

  if (loading) {
    return <PageCardGridSkeleton cardCount={6} />;
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Standard Hero Section */}
      {!data.hideHero && (
        <section className="bg-cm-blue mx-3 sm:mx-6 lg:mx-8 rounded-[2rem] py-6 md:py-8 overflow-hidden relative shadow-inner mt-4 mb-4">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 relative z-10 px-4">
            <div className="lg:w-1/2 text-left text-white">
              {heroBadge && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-bold uppercase tracking-wider mb-3">
                  <span>{heroBadge}</span>
                </div>
              )}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 tracking-tight text-white leading-tight">
                {heroTitle}
              </h1>
              <p className="text-sm md:text-base text-white/85 leading-relaxed max-w-xl">
                {heroSubtitle}
              </p>
              {heroButtonLabel && (
                <div className="mt-5 flex flex-wrap gap-4">
                  <Link to={heroButtonHref || '/contact-us'} className="btn-secondary px-6 py-2.5 text-sm font-bold shadow-md">
                    {heroButtonLabel}
                  </Link>
                </div>
              )}
            </div>
            <div className="lg:w-1/2 relative w-full">
              <MediaImage
                src={heroImage}
                alt={heroTitle}
                className="rounded-2xl shadow-xl w-full h-[240px] sm:h-[260px] object-cover border-2 border-cm-blue-dark relative z-10"
              />
            </div>
          </div>
        </section>
      )}

      {/* Why go digital — image cards */}
      {!data.hideSection2 && !data.hideWhyDigital && (
        <section id="why-digital" className="bg-cm-gray px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto mb-5 max-w-xl text-center">
              {section2Eyebrow && (
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-cm-blue">{section2Eyebrow}</span>
              )}
              {section2Title && (
                <h2 className="mt-3 text-2xl font-bold text-cm-blue-dark sm:text-3xl">{section2Title}</h2>
              )}
            </div>
            {section2Cards.length > 0 && (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {section2Cards.map((card) => (
                  <Link
                    key={card.title}
                    to={cardLink(card)}
                    className="group block overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    {card.image && (
                      <div className="h-36 w-full overflow-hidden">
                        <MediaImage src={card.image} alt={card.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="mb-2 text-base font-bold text-cm-blue-dark group-hover:text-cm-blue">{card.title}</h3>
                      <p className="text-sm leading-relaxed text-gray-500">{card.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {section2Description && (
              <p className="mx-auto mt-6 max-w-3xl text-center text-sm leading-relaxed text-gray-500 sm:text-base">
                {section2Description}
              </p>
            )}
          </div>
        </section>
      )}

      {/* Services grid — numbered */}
      {!data.hideCards && !data.hideServices && (
        <section id="services" className="bg-white px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto mb-5 max-w-xl text-center">
              {section1Eyebrow && (
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-cm-blue">{section1Eyebrow}</span>
              )}
              {section1Title && (
                <h2 className="mt-3 text-2xl font-bold text-cm-blue-dark sm:text-3xl">{section1Title}</h2>
              )}
            </div>
            <div ref={cardsRef} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedCards.map((card, i) => (
                <div key={card.title} className="rounded-xl border border-gray-100 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <span className="text-xs font-extrabold text-cm-blue">{String((page - 1) * PAGE_SIZE + i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-3 mb-2 text-lg font-bold text-cm-blue-dark">{card.title}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{card.description}</p>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`h-9 w-9 rounded-lg text-sm font-semibold transition-colors ${
                      page === pageNum
                        ? 'bg-cm-blue text-white shadow-sm'
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Process */}
      {!data.hideSections && !data.hideProcess && (
        <section id="process" className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto mb-5 max-w-xl text-center">
              {processEyebrow && (
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-cm-blue">{processEyebrow}</span>
              )}
              {processTitle && (
                <h2 className="mt-3 text-2xl font-bold text-cm-blue-dark sm:text-3xl">{processTitle}</h2>
              )}
            </div>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((step, i) => (
                <div key={step.heading} className="border-t-2 border-cm-blue pt-5">
                  <span className="text-4xl font-black text-blue-100">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="mt-1 mb-2 text-base font-bold text-cm-blue-dark">{step.heading}</h3>
                  <p className="text-sm leading-relaxed text-gray-500">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      {!data.hideCta && (
        <section className="bg-cm-blue px-4 py-6 text-center sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-2xl font-bold text-white sm:text-4xl">{ctaTitle}</h2>
            <p className="mt-3 text-sm leading-relaxed text-white/80 sm:text-base">{ctaSubtitle}</p>
            <Link to={ctaHref || '/contact-us'} className="btn-secondary mt-6 inline-flex items-center gap-2">
              {ctaButtonLabel || 'Start The Conversation'} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}
    </main>
  );
};

export default DigitalTransformation;
