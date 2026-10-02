import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Brain, Radio, Zap } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';
import { AI_STATIONS_DEFAULTS, AI_STATIONS_PAGE_SLUG, slugifyAIStationTitle, type AIStationCard } from './ai-stations.data';

const ICONS = [Brain, Zap, BarChart3, Radio];

const AIStations = () => {
  const cardsRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData(AI_STATIONS_PAGE_SLUG);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = cardsRef.current?.children;
      if (cards) {
        gsap.fromTo(cards,
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
  }, []);

  const section1Title = data.section1Title ?? AI_STATIONS_DEFAULTS.section1Title;
  const cards: AIStationCard[] = Array.isArray(data.cards) ? data.cards : AI_STATIONS_DEFAULTS.cards;
  const ctaTitle = data.ctaTitle ?? AI_STATIONS_DEFAULTS.ctaTitle;
  const ctaSubtitle = data.ctaSubtitle ?? AI_STATIONS_DEFAULTS.ctaSubtitle;

  const cardLink = (card: AIStationCard) => `/${AI_STATIONS_PAGE_SLUG}/${slugifyAIStationTitle(card.title)}`;

  return (
    <main className="min-h-screen bg-white">
      {/* Learning stations grid */}
      <section id="stations" className="bg-cm-gray py-6 md:py-8">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tighter text-cm-blue-dark md:text-3xl">{section1Title}</h2>
            <div className="hidden h-1 w-24 rounded-full bg-cm-yellow md:block" />
          </div>

          <div ref={cardsRef} className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {cards.map((station, i) => {
              const Icon = ICONS[i % ICONS.length];
              const image = resolveMediaUrl(station.image) || station.image;
              return (
                <Link
                  key={station.title}
                  to={cardLink(station)}
                  className="group flex min-h-[360px] flex-col overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_-20px_rgba(15,23,42,0.28)]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img src={image} alt={station.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
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
