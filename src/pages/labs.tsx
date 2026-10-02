import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Atom, Microscope, CheckCircle, Star, Heart, Check, Trash2 } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { usePageCategories } from '@/hooks/usePageCategories';
import { useDesignWishlist } from '@/hooks/useDesignWishlist';
import LoginPromptModal from '@/components/login-prompt-modal';
import { resolveMediaUrl } from '@/lib/media-url';
import Shop from '@/pages/shop';

interface Card { title: string; description: string; image?: string; name?: string; categories?: string[]; }

export const LABS_PAGE_SLUG = 'labs';

export function slugifyLabTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'lab'
  );
}

export const LABS_DEFAULTS = {
  heroTitle: 'Laboratory Solutions',
  heroSubtitle: 'State-of-the-art laboratory setups for schools and colleges. From STEM labs to specialized research facilities, we deliver excellence.',
  heroImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  section1Title: 'Specialized Laboratory Environments',
  cards: [
    { title: 'Chemistry Lab', description: 'Purpose-built environments for practical chemistry education and safe experimentation.', categories: ['Lab Products'], image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Physics Lab', description: 'Hands-on spaces for experiments, measurement, and applied physics learning.', categories: ['Lab Products'], image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80' },
    { title: 'Math Lab', description: 'Interactive learning environments that make mathematical concepts practical and visual.', categories: ['Lab Products'], image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=400&q=80' },
    { title: 'Biology Lab', description: 'Well-equipped spaces for life science observation, analysis, and discovery.', categories: ['Lab Products'], image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Composite Skill Lab', description: 'Flexible multidisciplinary labs that support practical and vocational skill development.', categories: ['Lab Products'], image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80' },
    { title: 'AI/ML Lab', description: 'Future-ready computing environments for artificial intelligence and machine learning.', categories: ['Lab Products'], image: 'https://images.unsplash.com/photo-1555255707-c07966088b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Computer Lab', description: 'Connected, ergonomic spaces for digital learning, coding, and collaboration.', categories: ['Tech Labs'], image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'AI Stations', description: 'Specialized workstations for immersive technology and intelligent systems learning.', categories: ['Tech Labs'], image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80' },
    { title: 'STEM Labs', description: 'Integrated innovation spaces that bring science, technology, engineering, and math together.', categories: ['Innovation Labs'], image: 'https://images.unsplash.com/photo-1535378917042-10a22c95931a?auto=format&fit=crop&w=400&q=80' },
  ] as Card[],
};

const Labs = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData('labs');
  const { categories: shopCategories } = usePageCategories('labs');
  const { isSaved, isPending, add, remove, showLoginPrompt, setShowLoginPrompt } = useDesignWishlist('labs');
  const [activeProductCategory, setActiveProductCategory] = useState<string | null>(null);

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

  const heroTitle = data.heroTitle ?? LABS_DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? LABS_DEFAULTS.heroSubtitle;
  const heroImage = data.heroImage ?? LABS_DEFAULTS.heroImage;
  const section1Title = data.section1Title ?? LABS_DEFAULTS.section1Title;
  const allCards: Card[] = data.cards?.length > 0 ? data.cards : LABS_DEFAULTS.cards;
  const cards = allCards.map((card, i) => ({
    ...card,
    categories: card.categories?.length ? card.categories.map((category) => category === 'Labs' ? 'Lab Products' : category) : ['Lab Products'],
    image: card.image || LABS_DEFAULTS.cards[i % LABS_DEFAULTS.cards.length].image,
  }));

  return (
    <main className="min-h-screen bg-white">
      <LoginPromptModal open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
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
            <div className="mt-5 flex flex-wrap gap-4">
              <Link to="/request-quote" className="btn-secondary px-6 py-2.5 text-sm font-bold">
                Get Quote
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2">
            <img src={resolveMediaUrl(heroImage)} alt={heroTitle} className="rounded-2xl shadow-xl w-full h-[260px] object-cover border-2 border-cm-blue-dark" />
          </div>
        </div>
      </section>

      {/* Lab Types Grid Layout */}
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
                {shopCategories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setActiveProductCategory(category.slug)}
                    className={`block w-full text-left rounded-2xl px-4 py-3 transition-all duration-200 ${activeProductCategory === category.slug ? 'bg-cm-blue text-white shadow-lg' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                  >
                    {category.name}
                  </button>
                ))}
                {shopCategories.length === 0 && (
                  <p className="text-xs text-slate-400 px-1">No categories yet. Add one in Admin &rarr; Categories.</p>
                )}
              </div>

              <div className="mt-8 rounded-3xl bg-cm-blue-dark/5 p-4">
                <p className="text-sm font-semibold text-cm-blue-dark mb-3">Showing</p>
                <p className="text-4xl font-black text-cm-blue-dark">{cards.length}</p>
                <p className="text-sm text-slate-500 mt-2">Lab solution highlights</p>
              </div>
            </aside>

            <div className="min-w-0">
            {activeProductCategory && (
              <button
                type="button"
                onClick={() => setActiveProductCategory(null)}
                className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-cm-blue hover:text-cm-blue-dark"
              >
                <ArrowLeft className="h-4 w-4" /> Back to {section1Title}
              </button>
            )}
            {activeProductCategory ? (
              <Shop
                key={activeProductCategory}
                categorySlug={activeProductCategory}
                categoryPage="labs"
                hideCategorySidebar
                embedded
              />
            ) : (
            <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((lab, i) => {
                const fallback = LABS_DEFAULTS.cards[i % LABS_DEFAULTS.cards.length]?.image || '';
                return (
                  <div key={lab.title} className="group flex flex-col overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_-20px_rgba(15,23,42,0.28)]">
                    <Link to={`/${LABS_PAGE_SLUG}/${slugifyLabTitle(lab.title)}`} className="flex flex-1 flex-col">
                      <div className="relative overflow-hidden h-[220px] sm:h-[230px]">
                        <img
                          src={resolveMediaUrl(lab.image) || fallback}
                          alt={lab.title}
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
                          {lab.categories?.[0] ?? 'Lab'}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col px-5 pb-2 pt-4">
                        <h3 className="text-lg font-semibold text-slate-900 tracking-tight mb-2">{lab.title}</h3>
                        {lab.description && <p className="text-sm text-slate-600 leading-relaxed mb-3">{lab.description}</p>}
                        <div className="mt-auto flex flex-wrap gap-2">
                          {lab.categories?.map((category) => <span key={category} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-600">{category}</span>)}
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center justify-between px-5 pb-4 pt-3 text-slate-700">
                      {isSaved(lab) ? (
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center gap-1.5 rounded-lg bg-green-600 px-2.5 py-1.5 text-[10px] font-bold text-white">
                            <Check className="h-3.5 w-3.5" /> Added to wishlist
                          </span>
                          <button type="button" onClick={() => remove(lab)} disabled={isPending(lab)} aria-label={`Remove ${lab.title} from wishlist`} className="flex items-center justify-center rounded-lg bg-red-50 p-1.5 text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => add(lab)} disabled={isPending(lab)} className="flex items-center gap-1.5 rounded-lg bg-cm-blue px-2.5 py-1.5 text-[10px] font-bold text-white shadow-sm transition-all hover:bg-cm-blue-dark disabled:opacity-50">
                          <Heart className="h-3.5 w-3.5" /> Add to wishlist
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            )}
            </div>
          </div>
        </div>
      </section>

      {/* Comparison: Static to Dynamic Lab Evolution */}
      <section className="py-12 bg-cm-gray/30 rounded-[2rem] mx-4 mb-8 overflow-hidden shadow-sm border border-cm-gray">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="p-8 md:p-12 bg-cm-blue-dark rounded-[2.5rem] text-white shadow-xl relative">
              <div className="absolute top-0 right-0 p-6 opacity-20">
                <Atom className="w-12 h-12 text-cm-yellow" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 leading-tight tracking-tighter">Static Lab to Innovation Centre.</h2>
              <p className="text-lg text-white/70 leading-relaxed mb-8 font-opensans">
                Traditional labs are warehouses for equipment. Our Innovation Centres are ecosystems for discovery— curriculum-mapped and NEP-ready.
              </p>
              <ul className="space-y-4 font-opensans text-sm">
                {[
                  'Integrated Curriculum Mapping',
                  'Safety-First Modular Furniture',
                  'Turnkey Execution Strategy'
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 group">
                    <div className="w-5 h-5 bg-cm-yellow rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm">
                      <CheckCircle className="w-3 h-3 text-black" />
                    </div>
                    <span className="text-white/80 group-hover:text-white transition-opacity">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div>
              <div className="grid grid-cols-2 gap-4 font-opensans">
                {[
                  { title: 'Project Design', desc: 'BIM & 3D space planning' },
                  { title: 'Modular Build', desc: 'Custom lab workstations' },
                  { title: 'Installation', desc: 'NABL compliant setup' },
                  { title: 'Certification', desc: 'Safety & quality audits' },
                ].map((service) => (
                  <div key={service.title} className="p-6 bg-white border border-gray-100 rounded-2xl hover:shadow-md transition-all transform hover:-translate-y-1 shadow-sm font-opensans">
                    <h4 className="font-bold text-cm-blue-dark mb-1 tracking-tight text-sm">{service.title}</h4>
                    <p className="text-gray-500 text-[11px] leading-tight">{service.desc}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8 text-center lg:text-left font-opensans">
                <Link to="/contact-us" className="inline-flex items-center gap-2 text-cm-blue font-bold uppercase tracking-widest text-xs hover:gap-4 transition-all">
                  Full Service List <ArrowRight className="w-4 h-4 text-cm-yellow" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Callout */}
      <section className="py-8 pb-12 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <Microscope className="w-12 h-12 text-cm-yellow mx-auto mb-6 opacity-50" />
          <h2 className="text-2xl md:text-5xl font-bold text-cm-blue-dark leading-tight mb-6 tracking-tighter">Certified Excellence.</h2>
          <div className="h-1 w-24 bg-cm-blue mx-auto rounded-full" />
        </div>
      </section>
    </main>
  );
};

export default Labs;
