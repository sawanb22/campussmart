import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { resolveMediaUrl } from '@/lib/media-url';

gsap.registerPlugin(ScrollTrigger);

export interface GenericCardItem {
  title: string;
  description: string;
  image?: string;
  href?: string;
  category?: string;
  readTime?: string;
}

export interface GenericSectionItem {
  heading: string;
  body: string;
  bullets?: string[];
}

export interface GenericPageData {
  pageTitle?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
  section1Title?: string;
  sectionDescription?: string;
  section2Title?: string;
  section2Description?: string;
  cards?: GenericCardItem[];
  section2Cards?: GenericCardItem[];
  sections?: GenericSectionItem[];
  features?: string[];
  ctaTitle?: string;
  ctaSubtitle?: string;
  ctaButtonLabel?: string;
  ctaHref?: string;
  body?: string;
}

export interface GenericPageProps {
  page?: {
    id?: number;
    title: string;
    slug: string;
    template?: string | null;
  };
  pageData?: GenericPageData;
}

/**
 * GenericPageRenderer
 * Adheres to SOLID Single Responsibility Principle:
 * Renders any dynamic CMS page using structured pageData (Hero, Cards, Sections, CTA).
 */
export default function GenericPageRenderer({ page, pageData = {} }: GenericPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  const title = pageData.heroTitle || pageData.pageTitle || page?.title || 'Campus Innovation';
  const subtitle = pageData.heroSubtitle || pageData.sectionDescription || 'Discover our specialized institutional solutions engineered for modern universities and colleges.';
  const heroImage = pageData.heroImage ? resolveMediaUrl(pageData.heroImage) : 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
  const cards = (Array.isArray(pageData.cards) && pageData.cards.length > 0) ? pageData.cards : [];
  const section2Cards = (Array.isArray(pageData.section2Cards) && pageData.section2Cards.length > 0) ? pageData.section2Cards : [];
  const sections = (Array.isArray(pageData.sections) && pageData.sections.length > 0) ? pageData.sections : [];
  const features = (Array.isArray(pageData.features) && pageData.features.length > 0) ? pageData.features : [];

  const ctaTitle = pageData.ctaTitle || 'Ready to transform your campus?';
  const ctaSubtitle = pageData.ctaSubtitle || 'Connect with our education consultants and architects to begin your planning.';
  const ctaHref = pageData.ctaHref || '/contact-us';
  const ctaButtonLabel = pageData.ctaButtonLabel || 'Schedule Consultation';

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (heroRef.current) {
        gsap.fromTo(
          heroRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
        );
      }

      if (cardsRef.current?.children) {
        gsap.fromTo(
          cardsRef.current.children,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, [title]);

  return (
    <div ref={containerRef} className="min-h-screen bg-slate-50/50 pb-16">
      {/* ─── Hero Section ─── */}
      <section className="px-4 sm:px-6 lg:px-8 pt-6">
        <div
          ref={heroRef}
          className="max-w-6xl mx-auto rounded-3xl overflow-hidden shadow-lg border border-slate-100 relative bg-cm-blue text-white"
        >
          <div className="flex flex-col lg:flex-row items-center gap-8 p-8 sm:p-12 lg:p-16 relative z-10">
            <div className="lg:w-7/12 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-bold uppercase tracking-wider">
                <span>CampusMart Solutions</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className="text-white">{page?.slug || 'overview'}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white">
                {title}
              </h1>
              <p className="text-sm sm:text-base lg:text-lg text-blue-100/90 leading-relaxed max-w-2xl">
                {subtitle}
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link
                  to={ctaHref}
                  className="btn-secondary inline-flex items-center gap-2 px-6 py-3 text-sm font-bold shadow-md hover:scale-105 transition-transform"
                >
                  {ctaButtonLabel} <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/catalogues"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/30 text-white font-semibold text-sm hover:bg-white/10 transition-colors"
                >
                  Download Catalogues
                </Link>
              </div>
            </div>

            {heroImage && (
              <div className="lg:w-5/12 w-full">
                <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 aspect-video lg:aspect-square">
                  <img
                    src={heroImage}
                    alt={title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ─── Highlights / Features Pill Row (if available) ─── */}
      {features.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Key Capabilities</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {features.map((feat, i) => (
                <div key={i} className="flex items-center gap-2.5 text-slate-700 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Primary Cards Grid ─── */}
      {cards.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="mb-8">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">Explore Offerings</span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
              {pageData.section1Title || 'Key Solutions & Spaces'}
            </h2>
          </div>

          <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((card, i) => {
              const cardImage = card.image ? resolveMediaUrl(card.image) : null;
              return (
                <div
                  key={i}
                  className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col group"
                >
                  {cardImage && (
                    <div className="h-44 w-full overflow-hidden bg-slate-100 relative">
                      <img
                        src={cardImage}
                        alt={card.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {card.category && (
                        <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-blue-700 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                          {card.category}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors mb-2">
                        {card.title}
                      </h3>
                      <p className="text-slate-600 text-sm leading-relaxed mb-4">
                        {card.description}
                      </p>
                    </div>

                    {card.href ? (
                      <Link
                        to={card.href}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider pt-2 border-t border-slate-100"
                      >
                        Learn More <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <Link
                        to="/contact-us"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wider pt-2 border-t border-slate-100"
                      >
                        Enquire Now <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ─── Structured Process / Sections ─── */}
      {sections.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-14">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-sm">
            <div className="max-w-xl mb-8">
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-blue-600">Methodology & Framework</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {pageData.section2Title || 'Implementation Framework'}
              </h2>
              {pageData.section2Description && (
                <p className="text-slate-600 text-sm sm:text-base mt-2">{pageData.section2Description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {sections.map((sec, i) => (
                <div key={i} className="border-t-2 border-blue-600 pt-5 space-y-2">
                  <span className="text-3xl font-black text-blue-200">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="font-bold text-slate-900 text-base">{sec.heading}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{sec.body}</p>
                  {sec.bullets && sec.bullets.length > 0 && (
                    <ul className="pt-2 space-y-1">
                      {sec.bullets.map((b, bi) => (
                        <li key={bi} className="text-xs text-slate-500 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Section 2 Cards (if available) ─── */}
      {section2Cards.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="mb-6">
            <h2 className="text-2xl font-black text-slate-900">
              {pageData.section2Title || 'Additional Insights & Highlights'}
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {section2Cards.map((card, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base mb-2">{card.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{card.description}</p>
                </div>
                {card.href && (
                  <Link to={card.href} className="text-blue-600 font-bold text-xs uppercase tracking-wider inline-flex items-center gap-1 mt-4">
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ─── Call to Action Section ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 p-8 sm:p-12 text-center text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="text-2xl sm:text-3xl font-black">{ctaTitle}</h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">{ctaSubtitle}</p>
            <div className="pt-2">
              <Link
                to={ctaHref}
                className="btn-secondary inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold shadow-lg"
              >
                {ctaButtonLabel} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
