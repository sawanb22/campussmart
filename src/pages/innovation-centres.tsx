import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Lightbulb, Zap, Users, Target } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';

interface Card { title: string; description: string; image?: string; }

const DEFAULTS = {
  heroTitle: 'Innovation Centres',
  heroSubtitle: 'Create spaces that foster creativity and innovation. From maker spaces to research labs, we build environments for breakthrough thinking.',
  heroImage: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  section1Title: 'Innovation Solutions',
  cards: [
    { title: 'Maker Spaces', description: 'Collaborative spaces for hands-on creation and experimentation', image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Research Labs', description: 'Advanced facilities for student research and discovery', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Innovation Hubs', description: 'Dynamic ecosystems for ideation and prototyping', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Startup Incubators', description: 'Business development spaces for student entrepreneurs', image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
  ] as Card[],
};

const ICONS = [Lightbulb, Zap, Users, Target];

const InnovationCentres = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData('innovation-centres');

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

  const heroTitle = data.heroTitle ?? DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? DEFAULTS.heroSubtitle;
  const heroImage = data.heroImage ?? DEFAULTS.heroImage;
  const section1Title = data.section1Title ?? DEFAULTS.section1Title;
  const cards: Card[] = (data.cards && data.cards.length > 0) ? data.cards : DEFAULTS.cards;

  return (
    <main className="min-h-screen bg-white">
      {/* Standard Corporate Hero - Side by Side */}
      <section ref={heroRef} className="bg-cm-blue mx-3 sm:mx-6 lg:mx-8 rounded-[2rem] py-6 md:py-8 overflow-hidden relative shadow-inner">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 relative z-10 px-4">
          <div className="lg:w-1/2 text-left text-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
              {heroTitle}
            </h1>
            <p className="text-sm md:text-base text-white/85 leading-snug max-w-xl">
              {heroSubtitle}
            </p>
          </div>
          <div className="lg:w-1/2">
            <img src={resolveMediaUrl(heroImage)} alt={heroTitle} className="rounded-2xl shadow-xl w-full h-[260px] object-cover border-2 border-cm-blue-dark" />
          </div>
        </div>
      </section>

      {/* Innovation Modules Grid Layout */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-cm-blue-dark tracking-tighter">
              {section1Title}
            </h2>
            <div className="hidden md:block h-1 w-24 bg-cm-yellow rounded-full" />
          </div>

          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((item, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <div key={item.title} className="group bg-white border border-slate-200/70 rounded-[2rem] hover:shadow-[0_30px_80px_-20px_rgba(15,23,42,0.28)] transition duration-300 hover:-translate-y-1 flex flex-col shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] min-h-[360px] overflow-hidden">
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
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Quote */}
      <section className="py-16 bg-cm-blue-dark text-white text-center rounded-t-[4rem] border-t-4 border-cm-yellow/50">
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="text-xl md:text-3xl font-bold mb-8 leading-relaxed max-w-2xl mx-auto">
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
