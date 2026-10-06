import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import MediaImage from '@/components/ui/media-image';
import { PageCardGridSkeleton } from '@/components/ui/page-skeleton';
import { COLLAB_PAGE_SLUG, COLLAB_DEFAULTS, slugifyCollabTitle } from './collaboration.data';

gsap.registerPlugin(ScrollTrigger);

const Collaboration = () => {
  const cardsRef = useRef<HTMLDivElement>(null);
  const { data, loading } = usePageData(COLLAB_PAGE_SLUG);

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

  const cards = Array.isArray(data.cards) ? data.cards : COLLAB_DEFAULTS.cards;
  const cardLink = (card: any) => card.href?.trim() || `/${COLLAB_PAGE_SLUG}/${slugifyCollabTitle(card.title)}`;

  if (loading && !data.cards) {
    return <PageCardGridSkeleton cardCount={4} />;
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Grid */}
      <section className="px-4 pt-8 pb-16 sm:px-6 lg:px-8">
        <div ref={cardsRef} className="mx-auto grid max-w-6xl grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card: any) => {
            return (
              <Link key={card.title} to={cardLink(card)} className="group block min-w-0">
                <div className="aspect-[1.42/1] w-full overflow-hidden rounded-xl bg-gray-100">
                  {card.image && (
                    <MediaImage
                      src={card.image}
                      alt={card.title}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    />
                  )}
                </div>
                <div className="pt-3">
                  <h3 className="text-base font-bold leading-tight tracking-tight text-cm-blue-dark sm:text-lg">{card.title}</h3>
                  {card.description && <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{card.description}</p>}
                  <span className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-semibold text-cm-blue transition-all group-hover:gap-2">
                    Learn more
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-cm-blue text-white">
                      <ArrowRight className="h-2.5 w-2.5" />
                    </span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 px-4 py-16 text-center sm:px-6 sm:py-20">
        <h2 className="mx-auto max-w-lg text-3xl font-bold tracking-tight text-cm-blue-dark sm:text-4xl">
          Ready to build spaces people actually use?
        </h2>
        <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-gray-500 sm:text-base">
          Tell us about your campus and we'll help you plan collaboration spaces that fit how your students actually work.
        </p>
        <Link to="/contact-us" className="btn-primary mt-7 inline-flex items-center gap-2">
          Connect With Us <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
};

export default Collaboration;
