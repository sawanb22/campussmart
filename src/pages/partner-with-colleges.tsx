import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Building2,
  Handshake,
  TrendingUp,
  HardHat,
  GraduationCap,
  Users,
  ArrowRight,
  Sparkles,
  type LucideIcon,
} from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';
import { PARTNER_PAGE_SLUG, PARTNER_DEFAULTS, slugifyModelTitle } from './partner-with-colleges.data';

gsap.registerPlugin(ScrollTrigger);

const CARD_ICONS: LucideIcon[] = [Building2, Handshake, TrendingUp, HardHat, GraduationCap, Users];

const PartnerWithColleges = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData(PARTNER_PAGE_SLUG);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' });

      const cards = cardsRef.current?.children;
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            scrollTrigger: { trigger: cardsRef.current, start: 'top 85%' },
          },
        );
      }
    });
    return () => ctx.revert();
  }, []);

  const heroTitle = data.heroTitle ?? PARTNER_DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? PARTNER_DEFAULTS.heroSubtitle;
  const heroImage = resolveMediaUrl(data.heroImage) || PARTNER_DEFAULTS.heroImage;
  const section2Title = data.section2Title ?? PARTNER_DEFAULTS.section2Title;
  const cards: any[] = data.cards?.length ? data.cards : PARTNER_DEFAULTS.cards;
  const ctaTitle = data.ctaTitle ?? PARTNER_DEFAULTS.ctaTitle;
  const ctaSubtitle = data.ctaSubtitle ?? PARTNER_DEFAULTS.ctaSubtitle;

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div
          ref={heroRef}
          className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-cm-blue-dark via-cm-blue to-[#0f6fd6] px-6 py-14 sm:px-10 sm:py-16 lg:px-14"
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full border border-white/10" />
          <div className="relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-cm-yellow">
                <Sparkles className="h-3.5 w-3.5" /> Classifieds · Partnerships
              </span>
              <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl">{heroTitle}</h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">{heroSubtitle}</p>
              <div className="mt-8 flex flex-wrap gap-4">
                <a href="#partnership-models" className="btn-secondary px-6 py-3 text-sm font-bold">
                  Explore Partnership Models
                </a>
                <Link
                  to="/partnership"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
                >
                  Submit Enquiry <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl shadow-2xl lg:block">
              <img src={heroImage} alt={heroTitle} className="h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-cm-blue-dark/60 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 rounded-xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
                <div className="flex items-center gap-2 text-cm-blue-dark">
                  <Handshake className="h-4 w-4" />
                  <span className="text-xs font-bold">4000+ Partner Campuses Nationwide</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership models */}
      <section id="partnership-models" className="px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-cm-blue-dark sm:text-4xl">{section2Title}</h2>
            <p className="mt-3 text-sm text-gray-500">Flexible ways to collaborate, structured around what your institution needs most.</p>
          </div>
          <div ref={cardsRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, index) => {
              const Icon = CARD_ICONS[index % CARD_ICONS.length];
              const image = resolveMediaUrl(card.image);
              const detailHref = card.href || `/${PARTNER_PAGE_SLUG}/${slugifyModelTitle(card.title)}`;
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
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 rounded-[2rem] bg-gradient-to-br from-cm-blue-dark to-cm-blue px-8 py-14 text-center sm:flex-row sm:px-14 sm:text-left">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">{ctaTitle}</h2>
            <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base">{ctaSubtitle}</p>
          </div>
          <Link to="/partnership" className="btn-secondary inline-flex flex-shrink-0 items-center gap-2 px-8 py-3.5 text-sm font-bold">
            Submit Partnership Enquiry <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
};

export default PartnerWithColleges;
