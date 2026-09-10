import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { Lightbulb, Zap, Users, Target } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';
import {
  INNOVATION_CENTRES_PAGE_SLUG,
  INNOVATION_CENTRES_DEFAULTS,
  slugifyInnovationCentreTitle,
  type InnovationCentresCard,
} from './innovation-centres.data';

const ICONS = [Lightbulb, Zap, Users, Target];

const InnovationCentres = () => {
  const cardsRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData(INNOVATION_CENTRES_PAGE_SLUG);

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

  const section1Title = data.section1Title ?? INNOVATION_CENTRES_DEFAULTS.section1Title;
  const cards: InnovationCentresCard[] = (data.cards && data.cards.length > 0) ? data.cards : INNOVATION_CENTRES_DEFAULTS.cards;

  const cardLink = (card: InnovationCentresCard) => `/${INNOVATION_CENTRES_PAGE_SLUG}/${slugifyInnovationCentreTitle(card.title)}`;

  return (
    <main className="min-h-screen bg-white">
      {/* Innovation Modules Grid Layout */}
      <section className="py-6 md:py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl md:text-3xl font-bold text-cm-blue-dark tracking-tighter">
              {section1Title}
            </h2>
            <div className="hidden md:block h-1 w-24 bg-cm-yellow rounded-full" />
          </div>

          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((item, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <Link
                  key={item.title}
                  to={cardLink(item)}
                  className="group bg-white border border-slate-200/70 rounded-[2rem] hover:shadow-[0_30px_80px_-20px_rgba(15,23,42,0.28)] transition duration-300 hover:-translate-y-1 flex flex-col shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] min-h-[360px] overflow-hidden"
                >
                  <div className="relative overflow-hidden aspect-[4/5]">
                    <img src={resolveMediaUrl(item.image)} alt={item.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/30 to-transparent" />
                    <div className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 group-hover:bg-cm-blue group-hover:scale-110 transition-all duration-500">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-5 flex-grow flex flex-col">
                    <h3 className="text-xl font-semibold text-slate-900 tracking-tight mb-3">{item.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4 flex-grow">{item.description || 'Advanced innovation and creative solutions.'}</p>
                    <div className="flex items-center justify-between text-slate-700">
                       <span className="text-xs uppercase tracking-[0.28em] text-slate-400">Innovation</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Quote */}
      <section className="py-8 bg-cm-blue-dark text-white text-center rounded-t-[4rem] border-t-4 border-cm-yellow/50">
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="text-xl md:text-3xl font-bold mb-6 leading-relaxed max-w-2xl mx-auto">
            "Innovation isn't just about technology; it's about creating ecosystems where ideas flourish and dreams become reality."
          </h3>
          <div className="w-12 h-1 bg-cm-yellow mx-auto mb-4 rounded-full" />
          <div className="font-bold uppercase tracking-widest text-xs text-white/50">Campus Mart Innovation Philosophy</div>
        </div>
      </section>
    </main>
  );
};

export default InnovationCentres;
