import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Brain, Radio, Zap } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';
import { AI_STATIONS_DEFAULTS, AI_STATIONS_PAGE_SLUG, slugifyAIStationTitle, type AIStationCard } from './ai-stations.data';

const ICONS = [Brain, Zap, BarChart3, Radio];

const AIStations = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData(AI_STATIONS_PAGE_SLUG);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });

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

  const heroTitle = data.heroTitle ?? AI_STATIONS_DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? AI_STATIONS_DEFAULTS.heroSubtitle;
  const section1Title = data.section1Title ?? AI_STATIONS_DEFAULTS.section1Title;
  const cards: AIStationCard[] = (data.cards && data.cards.length > 0) ? data.cards : AI_STATIONS_DEFAULTS.cards;
  const ctaTitle = data.ctaTitle ?? AI_STATIONS_DEFAULTS.ctaTitle;
  const ctaSubtitle = data.ctaSubtitle ?? AI_STATIONS_DEFAULTS.ctaSubtitle;

  const cardLink = (card: AIStationCard) => `/${AI_STATIONS_PAGE_SLUG}/${slugifyAIStationTitle(card.title)}`;

  return (
    <main className="min-h-screen bg-white">
      {/* AI Hero — dark, orbit graphic (compact) */}
      <section
        ref={heroRef}
        className="relative mx-3 overflow-hidden rounded-[2rem] bg-gradient-to-br from-cm-blue-dark via-[#0b2850] to-cm-blue-dark py-8 sm:mx-6 sm:py-10 lg:mx-8"
      >
        <div className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full border border-cm-blue/25" aria-hidden="true" />
        <div className="pointer-events-none absolute right-6 -top-10 h-40 w-40 rounded-full border border-cm-blue/20" aria-hidden="true" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-cm-blue/10 blur-3xl" aria-hidden="true" />

        <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <span className="mb-3 inline-block text-[11px] font-bold uppercase tracking-[0.25em] text-cm-yellow">
              Artificial Intelligence, Classroom-Ready
            </span>
            <h1 className="max-w-lg text-2xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-4xl">
              {heroTitle}
            </h1>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">{heroSubtitle}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <a href="#stations" className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-cm-blue to-cm-yellow px-5 py-2.5 text-sm font-bold text-cm-blue-dark shadow-lg shadow-cm-blue/20">
                Explore Stations <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#contact" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-5 py-2.5 text-sm font-bold text-white">
                Talk to an Expert
              </a>
            </div>
          </div>

          {/* Orbit graphic */}
          <div className="relative mx-auto hidden h-[220px] w-[220px] place-items-center sm:grid">
            <div className="absolute h-[210px] w-[210px] rounded-full border border-cm-blue/40" />
            <div className="absolute h-[150px] w-[150px] rounded-full border border-cm-blue/30" />
            <div className="absolute h-[95px] w-[95px] rounded-full border border-cm-blue/25" />
            <div className="relative grid h-[72px] w-[72px] place-items-center rounded-2xl bg-gradient-to-br from-cm-blue to-cm-yellow text-lg font-black text-cm-blue-dark shadow-[0_0_40px_rgba(18,103,216,0.45)]">
              AI
            </div>
            {ICONS.map((Icon, i) => {
              const positions = ['top-1 right-7', 'bottom-4 right-0', 'bottom-4 left-0', 'top-4 left-1'];
              return (
                <div key={i} className={`absolute ${positions[i]} grid h-9 w-9 place-items-center rounded-full border border-cm-blue/40 bg-[#0d3c76] text-cm-yellow`}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Learning stations grid */}
      <section id="stations" className="bg-cm-gray py-12 md:py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-8 flex items-center justify-between">
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
      <section id="contact" className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-gradient-to-br from-cm-blue-dark to-cm-blue px-8 py-12 sm:px-12 sm:py-16">
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
