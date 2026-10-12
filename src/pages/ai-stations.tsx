import { useEffect, useRef, useState, useMemo } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Brain, ChevronLeft, ChevronRight, Radio, Zap } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import MediaImage from '@/components/ui/media-image';
import { PageCardGridSkeleton } from '@/components/ui/page-skeleton';
import { AI_STATIONS_PAGE_SLUG, slugifyAIStationTitle, type AIStationCard } from './ai-stations.data';

const ICONS = [Brain, Zap, BarChart3, Radio];
const PAGE_SIZE = 12;

const AIStations = () => {
  const cardsRef = useRef<HTMLDivElement>(null);
  const { data, loading } = usePageData(AI_STATIONS_PAGE_SLUG);
  const [page, setPage] = useState(1);

  const heroTitle = data.heroTitle || '';
  const heroSubtitle = data.heroSubtitle || '';
  const heroImage = data.heroImage || '';
  const section1Title = data.section1Title || '';
  const cards: AIStationCard[] = Array.isArray(data.cards) ? data.cards : [];
  const ctaTitle = data.ctaTitle || '';
  const ctaSubtitle = data.ctaSubtitle || '';

  const totalPages = Math.ceil(cards.length / PAGE_SIZE);
  const paginatedCards = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return cards.slice(startIndex, startIndex + PAGE_SIZE);
  }, [cards, page]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cardEls = cardsRef.current?.children;
      if (cardEls && cardEls.length > 0) {
        gsap.fromTo(cardEls,
          { opacity: 0, y: 30 },
          {
            opacity: 1, y: 0,
            duration: 0.6,
            stagger: 0.1,
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 85%',
            }
          }
        );
      }
    });
    return () => ctx.revert();
  }, [paginatedCards]);

  const cardLink = (card: AIStationCard) => card.href?.trim() || `/${AI_STATIONS_PAGE_SLUG}/${slugifyAIStationTitle(card.title)}`;

  if (loading) {
    return <PageCardGridSkeleton cardCount={4} />;
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Standard Corporate Hero */}
      <section className="bg-cm-blue mx-3 sm:mx-6 lg:mx-8 rounded-[2rem] py-6 md:py-8 overflow-hidden relative shadow-inner mt-4 mb-4">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 relative z-10 px-4">
          <div className="lg:w-1/2 text-left text-white">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-3 tracking-tight text-white leading-tight">
              {heroTitle}
            </h1>
            <p className="text-sm md:text-base text-white/85 leading-relaxed max-w-xl">
              {heroSubtitle}
            </p>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link to="/contact-us" className="btn-secondary px-6 py-2.5 text-sm font-bold shadow-md">
                Get Started
              </Link>
            </div>
          </div>
          {heroImage && (
            <div className="lg:w-1/2 relative w-full">
              <MediaImage
                src={heroImage}
                alt={heroTitle}
                className="rounded-2xl shadow-xl w-full h-[240px] sm:h-[260px] object-cover border-2 border-cm-blue-dark relative z-10"
              />
            </div>
          )}
        </div>
      </section>

      {/* Learning stations grid */}
      <section id="stations" className="bg-cm-gray py-6 md:py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tighter text-cm-blue-dark md:text-3xl">{section1Title}</h2>
            <div className="hidden h-1 w-24 rounded-full bg-cm-yellow md:block" />
          </div>

          <div ref={cardsRef} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {paginatedCards.map((station, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <Link
                  key={station.title}
                  to={cardLink(station)}
                  className="group flex min-h-[360px] flex-col overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_-20px_rgba(15,23,42,0.28)]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <MediaImage src={station.image} alt={station.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/30 to-transparent" />
                    <div className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-md transition-all duration-500 group-hover:scale-110 group-hover:bg-cm-blue">
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-grow flex-col px-6 pb-6 pt-5">
                    <h3 className="mb-3 text-xl font-semibold tracking-tight text-slate-900 group-hover:text-cm-blue">{station.title}</h3>
                    <p className="mb-4 flex-grow text-sm leading-relaxed text-slate-600">{station.description || 'Advanced AI-powered learning solutions.'}</p>
                    <span className="text-xs uppercase tracking-[0.28em] text-slate-400">AI Module</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  cardsRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
                disabled={page === 1}
                className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPage(p);
                    cardsRef.current?.scrollIntoView({ behavior: 'smooth' });
                  }}
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
                onClick={() => {
                  setPage((p) => Math.min(totalPages, p + 1));
                  cardsRef.current?.scrollIntoView({ behavior: 'smooth' });
                }}
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
      <section id="contact" className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-gradient-to-br from-cm-blue-dark to-cm-blue px-8 py-8 sm:px-12 sm:py-10">
          <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
            <div>
              <h2 className="max-w-lg text-2xl font-bold text-white sm:text-3xl">{ctaTitle}</h2>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/75 sm:text-base">{ctaSubtitle}</p>
            </div>
            <Link to="/contact-us" className="inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-cm-yellow px-7 py-3 text-sm font-bold text-cm-blue-dark shadow-lg">
              Contact Us <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AIStations;
