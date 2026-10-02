import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { Sparkles, Users, Palette, Music, Microscope, Zap } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';

gsap.registerPlugin(ScrollTrigger);

export const NEW_ENVIRONMENTS_PAGE_SLUG = 'new-environments';

export function slugifyNewEnvironmentCard(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'space'
  );
}

export const NEW_ENVIRONMENTS_DEFAULTS = {
  heroTitle: 'New Learning Environments',
  heroSubtitle: 'Create innovative spaces that inspire learning, foster creativity, and adapt to the evolving needs of modern education.',
  heroImage: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  section1Title: 'Specialized Learning Spaces',
  cards: [
    {
      title: 'Wondergarten Room',
      description: 'A magical space designed for early childhood development with interactive learning elements.',
      image: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      href: '/furniture',
    },
    {
      title: 'Rumpus Room',
      description: 'Active play area designed for physical development and social interaction.',
      image: 'https://images.unsplash.com/photo-1596908181055-e10301d47d03?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      href: '/furniture',
    },
    {
      title: 'Art & Craft Room',
      description: 'Creative space equipped for artistic expression and craft activities.',
      image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      href: '/furniture',
    },
    {
      title: 'Music Room',
      description: 'Acoustically designed space for musical education and practice.',
      image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      href: '/furniture',
    },
    {
      title: 'Discovery Pod',
      description: 'STEM-focused learning environment for scientific exploration.',
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      href: '/labs',
    },
    {
      title: 'Collaboration Room',
      description: 'Flexible space designed for group projects and teamwork.',
      image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
      href: '/collaboration',
    },
  ]
};

interface Card { title: string; description: string; image?: string; href?: string; }

const ICONS = [Sparkles, Users, Palette, Music, Microscope, Zap];

const NewEnvironments = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData(NEW_ENVIRONMENTS_PAGE_SLUG);

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

  const heroTitle = data.heroTitle ?? NEW_ENVIRONMENTS_DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? NEW_ENVIRONMENTS_DEFAULTS.heroSubtitle;
  const heroImage = data.heroImage ?? NEW_ENVIRONMENTS_DEFAULTS.heroImage;
  const section1Title = data.section1Title ?? NEW_ENVIRONMENTS_DEFAULTS.section1Title;

  const cards: Card[] = (data.cards && data.cards.length > 0)
    ? data.cards.map((c: any, i: number) => ({
      ...c,
      image: c.image || NEW_ENVIRONMENTS_DEFAULTS.cards[i]?.image || NEW_ENVIRONMENTS_DEFAULTS.cards[0].image,
    }))
    : NEW_ENVIRONMENTS_DEFAULTS.cards;

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
            <img src={heroImage} alt={heroTitle} className="rounded-2xl shadow-xl w-full h-[260px] object-cover border-2 border-cm-blue-dark" />
          </div>
        </div>
      </section>

      {/* Learning Environments Grid Layout */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-cm-blue-dark tracking-tighter">
              {section1Title}
            </h2>
            <div className="hidden md:block h-1 w-24 bg-cm-yellow rounded-full" />
          </div>

          <div ref={cardsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((space, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <Link key={space.title} to={`/${NEW_ENVIRONMENTS_PAGE_SLUG}/${slugifyNewEnvironmentCard(space.title)}`} className="group bg-white border border-slate-200/70 rounded-[2rem] hover:shadow-[0_30px_80px_-20px_rgba(15,23,42,0.28)] transition duration-300 hover:-translate-y-1 flex flex-col shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] min-h-[360px] overflow-hidden">
                  <div className="relative overflow-hidden aspect-[4/5]">
                    <img src={space.image} alt={space.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/30 to-transparent" />
                    <div className="absolute top-4 right-4 w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/20 group-hover:bg-cm-blue group-hover:scale-110 transition-all duration-500">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="px-6 pb-6 pt-5 flex-grow flex flex-col">
                    <h3 className="text-xl font-semibold text-slate-900 tracking-tight mb-3">{space.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4 flex-grow">{space.description}</p>
                    <div className="flex items-center justify-between text-slate-700">
                       <span className="text-xs uppercase tracking-[0.28em] text-slate-400">Learning Space</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Quote */}
      <section className="py-10 bg-slate-50 text-slate-800 text-center rounded-[2rem] mx-3 sm:mx-6 lg:mx-8 mb-10 border border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6">
          <h3 className="text-xl md:text-2xl font-bold mb-5 leading-relaxed max-w-2xl mx-auto text-slate-800">
            "Learning environments shape minds. We design spaces where students don't just acquire knowledge—they develop wisdom."
          </h3>
          <div className="w-12 h-1 bg-cm-yellow mx-auto mb-3 rounded-full" />
          <div className="font-bold uppercase tracking-widest text-xs text-cm-blue">Campus Mart Learning Environment Philosophy</div>
        </div>
      </section>
    </main>
  );
};

export default NewEnvironments;
