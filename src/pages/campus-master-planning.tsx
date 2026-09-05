import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  MapPinned,
  Layers,
  LandPlot,
  CalendarClock,
  Cable,
  ClipboardCheck,
  ArrowRight,
  Building2,
  type LucideIcon,
} from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';
import { MASTER_PLANNING_PAGE_SLUG, MASTER_PLANNING_DEFAULTS, slugifyMasterPlanningTitle } from './campus-master-planning.data';

gsap.registerPlugin(ScrollTrigger);

const CARD_ICONS: LucideIcon[] = [MapPinned, Layers, LandPlot, CalendarClock, Cable, ClipboardCheck];

const CampusMasterPlanning = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData(MASTER_PLANNING_PAGE_SLUG);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
      const cards = cardsRef.current?.children;
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 24 },
          { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, scrollTrigger: { trigger: cardsRef.current, start: 'top 85%' } },
        );
      }
    });
    return () => ctx.revert();
  }, []);

  const heroTitle = data.heroTitle ?? MASTER_PLANNING_DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? MASTER_PLANNING_DEFAULTS.heroSubtitle;
  const heroImage = resolveMediaUrl(data.heroImage) || MASTER_PLANNING_DEFAULTS.heroImage;
  const section2Title = data.section2Title ?? MASTER_PLANNING_DEFAULTS.section2Title;
  const cards: any[] = data.cards?.length ? data.cards : MASTER_PLANNING_DEFAULTS.cards;
  const ctaTitle = data.ctaTitle ?? MASTER_PLANNING_DEFAULTS.ctaTitle;
  const ctaSubtitle = data.ctaSubtitle ?? MASTER_PLANNING_DEFAULTS.ctaSubtitle;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="px-4 py-4 sm:px-6 sm:py-5 lg:px-8">
        <div
          ref={heroRef}
          className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-cm-blue-dark via-cm-blue to-[#0f6fd6] px-6 py-6 sm:px-10 sm:py-7 lg:px-14"
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full border border-white/10" />
          <div className="relative z-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-cm-yellow">
                <Building2 className="h-3.5 w-3.5" /> Campus Planning
              </span>
              <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">{heroTitle}</h1>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">{heroSubtitle}</p>
              <div className="mt-5 flex flex-wrap gap-4">
                <a href="#planning-services" className="btn-secondary px-6 py-3 text-sm font-bold">
                  Explore Our Services
                </a>
                <Link
                  to="/request-quote"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
                >
                  Get a Quote <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="relative mx-auto hidden aspect-[16/9] w-full max-w-md overflow-hidden rounded-2xl shadow-2xl lg:block">
              <img src={heroImage} alt={heroTitle} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-cm-blue-dark/60 via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/95 px-4 py-2.5 shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-2 text-cm-blue-dark">
                  <MapPinned className="h-4 w-4" />
                  <span className="text-xs font-bold">300+ Master Plans Delivered</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Planning services */}
      <section id="planning-services" className="px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-cm-blue-dark sm:text-4xl">{section2Title}</h2>
            <p className="mt-3 text-sm text-gray-500">Every stage of a campus master plan, handled by one accountable team.</p>
          </div>
          <div ref={cardsRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, index) => {
              const Icon = CARD_ICONS[index % CARD_ICONS.length];
              const image = resolveMediaUrl(card.image);
              const detailHref = card.href || `/${MASTER_PLANNING_PAGE_SLUG}/${slugifyMasterPlanningTitle(card.title)}`;
              return (
                <Link
                  key={card.title}
                  to={detailHref}
                  className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  {image && (
                    <div className="h-40 w-full overflow-hidden">
                      <img src={image} alt={card.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cm-blue/10">
                      <Icon className="h-6 w-6 text-cm-blue" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-cm-blue-dark">{card.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-600">{card.description}</p>
                    <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-cm-blue transition-all group-hover:gap-3">
                      Learn More <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 rounded-[2rem] bg-gradient-to-br from-cm-blue-dark to-cm-blue px-8 py-10 text-center sm:flex-row sm:px-12 sm:text-left">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">{ctaTitle}</h2>
            <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base">{ctaSubtitle}</p>
          </div>
          <Link to="/request-quote" className="btn-secondary inline-flex flex-shrink-0 items-center gap-2 px-8 py-3.5 text-sm font-bold">
            Get a Project Quote <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default CampusMasterPlanning;
