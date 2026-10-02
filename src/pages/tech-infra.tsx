import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { Shield, Star, Heart, Check, Trash2 } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { useDesignWishlist } from '@/hooks/useDesignWishlist';
import LoginPromptModal from '@/components/login-prompt-modal';
import { resolveMediaUrl } from '@/lib/media-url';

interface CardItem { title: string; description: string; image?: string; categories?: string[]; }

export const TECH_INFRA_PAGE_SLUG = 'tech-infra';

export function slugifyTechInfraTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'solution'
  );
}

export const TECH_INFRA_DEFAULTS = {
  heroTitle: 'Technology Infrastructure',
  heroSubtitle: 'Complete technology infrastructure solutions for modern campuses. From networking to security, we build the foundation for digital learning.',
  heroImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  section1Title: 'Campus Technology Solutions',
  cards: [
    { title: 'Interactive Displays', description: '4K interactive flat panels with zero-lag optical bonding, multi-touch stylus support, and unified digital whiteboard suites.', categories: ['Classroom Tech', 'Displays'], image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Network Solutions', description: 'High-density 802.11ax Wi-Fi 6 APs and structured optical fiber backbones engineered for seamless campus connectivity.', categories: ['Networking', 'Wi-Fi & Fiber'], image: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Server Infrastructure', description: 'Hybrid on-premise blade servers and scalable academic cloud setups delivering low latency and enterprise uptime.', categories: ['Networking', 'Servers & Cloud'], image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Cybersecurity', description: 'Next-generation firewalls, encrypted endpoint threat protection, and automated student data access control.', categories: ['Security', 'Firewall & Safety'], image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
  ] as CardItem[],
};

const TechInfra = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData('tech-infra');
  const { isSaved, isPending, add, remove, showLoginPrompt, setShowLoginPrompt } = useDesignWishlist('tech-infra');
  const [selectedCategory, setSelectedCategory] = useState('');

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

  const heroTitle = data.heroTitle ?? TECH_INFRA_DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? TECH_INFRA_DEFAULTS.heroSubtitle;
  const heroImage = data.heroImage ?? TECH_INFRA_DEFAULTS.heroImage;
  const section1Title = data.section1Title ?? TECH_INFRA_DEFAULTS.section1Title;
  const allCards: CardItem[] = Array.isArray(data.cards) ? data.cards : TECH_INFRA_DEFAULTS.cards;
  const cards = allCards.map((card, i) => {
    const defaultCard = TECH_INFRA_DEFAULTS.cards.find((c) => c.title === card.title) || TECH_INFRA_DEFAULTS.cards[i % TECH_INFRA_DEFAULTS.cards.length];
    const rawCats = card.categories?.filter(Boolean) || [];
    const categories = rawCats.length > 0 ? rawCats : (defaultCard.categories || ['Classroom Tech']);
    return {
      ...card,
      categories,
      image: card.image || defaultCard.image,
    };
  });

  const categoryOptions: string[] = Array.from(
    new Set<string>(cards.flatMap((card) => card.categories ?? []))
  ).filter((option) => Boolean(option) && option !== 'All');

  const activeCategory = selectedCategory && categoryOptions.includes(selectedCategory)
    ? selectedCategory
    : (categoryOptions[0] || '');

  const filteredCards = activeCategory
    ? cards.filter((card) => card.categories?.includes(activeCategory))
    : cards;

  return (
    <main className="min-h-screen bg-white">
      <LoginPromptModal open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
      {/* Standard Corporate Hero */}
      <section ref={heroRef} className="bg-cm-blue mx-3 sm:mx-6 lg:mx-8 rounded-[2rem] py-6 md:py-8 overflow-hidden relative shadow-inner">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 relative z-10 px-4">
          <div className="lg:w-1/2 text-left text-white">
            <h1 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">
              {heroTitle}
            </h1>
            <p className="text-sm md:text-base text-white/85 leading-snug max-w-xl">
              {heroSubtitle}
            </p>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link to="/request-quote" className="btn-secondary px-6 py-2.5 text-sm font-bold">
                Get Quote
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <img src={resolveMediaUrl(heroImage)} alt={heroTitle} className="rounded-2xl shadow-xl w-full h-[260px] object-cover border-2 border-cm-blue-dark relative z-10" />
          </div>
        </div>
      </section>

      {/* Structured Nodes Layout */}
      <section className="py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-8">
            <h2 className="text-2xl md:text-3xl font-bold text-cm-blue-dark tracking-tighter">
              {section1Title}
            </h2>
            <div className="hidden md:block h-1 w-32 bg-cm-yellow rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-8">
            <aside className="hidden lg:block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-cm-blue-dark mb-5">Categories</h3>
              <div className="space-y-3">
                {categoryOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelectedCategory(option)}
                    className={`w-full text-left rounded-2xl px-4 py-3 transition-all duration-200 ${
                      activeCategory === option ? 'bg-cm-blue text-white shadow-lg' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="mt-8 rounded-3xl bg-cm-blue-dark/5 p-4">
                <p className="text-sm font-semibold text-cm-blue-dark mb-3">Showing</p>
                <p className="text-4xl font-black text-cm-blue-dark">{filteredCards.length}</p>
                <p className="text-sm text-slate-500 mt-2">{activeCategory ? `${activeCategory} highlights` : 'Infrastructure highlights'}</p>
              </div>
            </aside>

            <div className="min-w-0">
              <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCards.map((card, i) => {
                const defaultCard = TECH_INFRA_DEFAULTS.cards.find((c) => c.title === card.title) || TECH_INFRA_DEFAULTS.cards[i % TECH_INFRA_DEFAULTS.cards.length];
                const fallback = defaultCard.image;
                return (
                  <div key={card.title} className="group flex flex-col overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_-20px_rgba(15,23,42,0.28)]">
                    <Link to={`/${TECH_INFRA_PAGE_SLUG}/${slugifyTechInfraTitle(card.title)}`} className="flex flex-1 flex-col">
                      <div className="relative overflow-hidden h-[220px] sm:h-[230px]">
                        <img
                          src={resolveMediaUrl(card.image) || fallback}
                          alt={card.title}
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (fallback && target.src !== fallback) {
                              target.src = fallback;
                            }
                          }}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/30 to-transparent" />
                        <span className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-800 shadow-sm backdrop-blur-sm">
                          <Star className="h-3.5 w-3.5 text-cm-yellow" />
                          {card.categories?.[0] ?? 'Tech'}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col px-5 pb-2 pt-4">
                        <h3 className="text-lg font-semibold text-slate-900 tracking-tight mb-2">{card.title}</h3>
                        <p className="text-sm text-slate-600 leading-relaxed mb-3">{card.description}</p>
                        <div className="mt-auto flex flex-wrap gap-2">
                          {card.categories?.map((category) => <span key={category} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-600">{category}</span>)}
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center justify-between px-5 pb-4 pt-3 text-slate-700">
                      {isSaved(card) ? (
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center gap-1.5 rounded-lg bg-green-600 px-2.5 py-1.5 text-[10px] font-bold text-white">
                            <Check className="h-3.5 w-3.5" /> Added to wishlist
                          </span>
                          <button type="button" onClick={() => remove(card)} disabled={isPending(card)} aria-label={`Remove ${card.title} from wishlist`} className="flex items-center justify-center rounded-lg bg-red-50 p-1.5 text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => add(card)} disabled={isPending(card)} className="flex items-center gap-1.5 rounded-lg bg-cm-blue px-2.5 py-1.5 text-[10px] font-bold text-white shadow-sm transition-all hover:bg-cm-blue-dark disabled:opacity-50">
                          <Heart className="h-3.5 w-3.5" /> Add to wishlist
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Standard Call to Action */}
      <section className="py-12 bg-cm-blue-dark text-white rounded-[2rem] mx-4 mb-10 overflow-hidden shadow-xl">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <Shield className="w-12 h-12 text-cm-yellow mx-auto mb-6 opacity-50" />
          <h2 className="text-2xl md:text-4xl font-bold mb-6">Foundation for Digital Excellence.</h2>
          <p className="text-lg text-white/70 mb-8 max-w-xl mx-auto leading-relaxed">
            Join 4000+ campuses trusted by our engineering expertise. We build the architecture that sustains the future of Indian education.
          </p>
          <Link to="/request-quote" className="btn-secondary inline-block px-10 py-3 text-base">
            Get Technical Audit
          </Link>
        </div>
      </section>
    </main>
  );
};

export default TechInfra;
