import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';
import { AR_VR_PAGE_SLUG, AR_VR_DEFAULTS, slugifyArVrTitle } from './ar-vr-experiences.data';

gsap.registerPlugin(ScrollTrigger);

const ArVrExperiences = () => {
  const cardsRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData(AR_VR_PAGE_SLUG);

  useEffect(() => {
    const ctx = gsap.context(() => {
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

  const section2Title = data.section2Title ?? AR_VR_DEFAULTS.section2Title;
  const cards: any[] = Array.isArray(data.cards) ? data.cards : AR_VR_DEFAULTS.cards;
  const ctaTitle = data.ctaTitle ?? AR_VR_DEFAULTS.ctaTitle;
  const ctaSubtitle = data.ctaSubtitle ?? AR_VR_DEFAULTS.ctaSubtitle;

  return (
    <main className="min-h-screen bg-white">
      {/* Experiences */}
      <section id="ar-vr-experiences" className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-5 max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-cm-blue-dark sm:text-4xl">{section2Title}</h2>
            <p className="mt-3 text-sm text-gray-500">A growing library of immersive modules across every major subject.</p>
          </div>
          <div ref={cardsRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => {
              const image = resolveMediaUrl(card.image);
              const detailHref = card.href || `/${AR_VR_PAGE_SLUG}/${slugifyArVrTitle(card.title)}`;
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
      <section className="px-4 pb-6 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-8 rounded-[2rem] bg-gradient-to-br from-cm-blue-dark to-cm-blue px-8 py-8 text-center sm:flex-row sm:px-12 sm:text-left">
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

export default ArVrExperiences;
