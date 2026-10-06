import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { BookOpen, Star, Heart, Check, Trash2 } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { useDesignWishlist } from '@/hooks/useDesignWishlist';
import LoginPromptModal from '@/components/login-prompt-modal';
import { MediaImage } from '@/components/ui/media-image';
import { PageCardGridSkeleton } from '@/components/ui/page-skeleton';

interface CardItem { title: string; description: string; image?: string; categories?: string[]; href?: string; slug?: string; }

export const LIBRARIES_PAGE_SLUG = 'libraries';

export function slugifyLibraryTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'feature'
  );
}

export const LIBRARIES_DEFAULTS = {
  heroTitle: 'Library Solutions',
  heroSubtitle: 'Modern library solutions that blend traditional resources with digital innovation. Create spaces that inspire learning and research.',
  heroImage: 'https://images.unsplash.com/photo-1568667256549-094345857637?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  section1Title: 'Curated Library Environments',
  cards: [
    { title: 'Reading Tables and Chairs', description: 'Comfortable, durable seating for focused individual and group reading.', categories: ['Reading & Study', 'Seating'], image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=400&q=80' },
    { title: 'Library Furniture', description: 'Complete furniture solutions for functional and welcoming library environments.', categories: ['Reading & Study', 'Furniture Systems'], image: 'https://images.unsplash.com/photo-1568667256549-094345857637?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Early Learning Reading Zones', description: 'Low-height accessible display bays, playful soft seating, and collaborative story circles to cultivate early reading habits.', categories: ['Reading & Study', 'Early Learning'], image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=400&q=80' },
    { title: 'Bookshelves and Racks', description: 'Organized storage systems that make every collection easy to access.', categories: ['Storage & Stacks', 'Book Storage'], image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&w=400&q=80' },
    { title: 'Open Book Shelves', description: 'Accessible open shelving designed for discovery and smooth circulation.', categories: ['Storage & Stacks', 'Open Display'], image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=400&q=80' },
    { title: 'Heritage & Academic Stacks', description: 'Heavy-gauge steel and timber shelving designed for extensive reference collections, archives, and high-capacity storage.', categories: ['Storage & Stacks', 'Archives'], image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=400&q=80' },
    { title: 'Digital Research Commons', description: 'Tech-enabled computer pods, OPAC terminals, and individual study carrels with integrated acoustic and power hubs.', categories: ['Digital & Tech', 'Research'], image: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=400&q=80' },
    { title: 'Modular Collaborative Commons', description: 'Reconfigurable breakout lounge tables, acoustic mobile screens, and flexible group discussion zones.', categories: ['Collaborative', 'Breakout Spaces'], image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=400&q=80' }
  ] as CardItem[]
};

const Libraries = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const { data, loading } = usePageData('libraries');
  const { isSaved, isPending, add, remove, showLoginPrompt, setShowLoginPrompt } = useDesignWishlist('libraries');
  const [selectedCategory, setSelectedCategory] = useState('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' });
      
      const cards = cardsRef.current?.children;
      if (cards) {
        gsap.fromTo(cards, 
          { opacity: 0, y: 30 }, 
          { 
            opacity: 1, y: 0, 
            duration: 0.8, 
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

  const heroTitle = data.heroTitle ?? LIBRARIES_DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? LIBRARIES_DEFAULTS.heroSubtitle;
  const heroImage = data.heroImage ?? LIBRARIES_DEFAULTS.heroImage;
  const section1Title = data.section1Title ?? LIBRARIES_DEFAULTS.section1Title;
  const allCards: CardItem[] = Array.isArray(data.cards) ? data.cards : LIBRARIES_DEFAULTS.cards;
  const cards = allCards.map((card, i) => {
    const defaultCard = LIBRARIES_DEFAULTS.cards.find((c) => c.title === card.title) || LIBRARIES_DEFAULTS.cards[i % LIBRARIES_DEFAULTS.cards.length];
    const rawCats = card.categories?.filter(Boolean) || [];
    const categories = (rawCats.length > 0 && !(rawCats.length === 1 && (rawCats[0] === 'Libraries' || rawCats[0] === 'Library Furniture')))
      ? rawCats
      : (defaultCard.categories || ['Reading & Study']);
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

  const cardLink = (card: CardItem) =>
    card.href?.trim() || `/${LIBRARIES_PAGE_SLUG}/${card.slug?.trim() || slugifyLibraryTitle(card.title)}`;

  if (loading && !data.cards) {
    return <PageCardGridSkeleton cardCount={4} />;
  }

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
            <MediaImage src={heroImage} alt={heroTitle} className="rounded-2xl shadow-xl w-full h-[260px] object-cover border-2 border-cm-blue-dark relative z-10" />
          </div>
        </div>
      </section>

      {/* Structured Library Types Catalog */}
      <section className="py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-8">
            <h2 className="text-2xl md:text-3xl font-bold text-cm-blue-dark tracking-tighter">
              {section1Title}
            </h2>
            <div className="hidden md:block h-1 w-32 bg-cm-yellow rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[240px_minmax(0,1fr)] gap-8 text-left">
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
                <p className="text-sm text-slate-500 mt-2">{activeCategory ? `${activeCategory} highlights` : 'Library highlights'}</p>
              </div>
            </aside>

            <div className="min-w-0">
              <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCards.map((f, i) => {
                const defaultCard = LIBRARIES_DEFAULTS.cards.find((c) => c.title === f.title) || LIBRARIES_DEFAULTS.cards[i % LIBRARIES_DEFAULTS.cards.length];
                const fallback = defaultCard.image;
                return (
                  <div key={f.title} className="group flex flex-col overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_-20px_rgba(15,23,42,0.28)]">
                    <Link to={cardLink(f)} className="flex flex-1 flex-col">
                      <div className="relative overflow-hidden h-[220px] sm:h-[230px]">
                        <MediaImage
                          src={f.image}
                          alt={f.title}
                          fallbackSrc={fallback}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/30 to-transparent" />
                        <span className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-800 shadow-sm backdrop-blur-sm">
                          <Star className="h-3.5 w-3.5 text-cm-yellow" />
                          {f.categories?.[0] ?? 'Library'}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col px-5 pb-2 pt-4">
                        <h3 className="text-lg font-semibold text-slate-900 tracking-tight mb-2">{f.title}</h3>
                        {f.description && <p className="text-sm text-slate-600 leading-relaxed mb-3">{f.description}</p>}
                        <div className="mt-auto flex flex-wrap gap-2">
                          {f.categories?.map((category) => <span key={category} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-600">{category}</span>)}
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center justify-between px-5 pb-4 pt-3 text-slate-700">
                      {isSaved(f) ? (
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center gap-1.5 rounded-lg bg-green-600 px-2.5 py-1.5 text-[10px] font-bold text-white">
                            <Check className="h-3.5 w-3.5" /> Added to wishlist
                          </span>
                          <button type="button" onClick={() => remove(f)} disabled={isPending(f)} aria-label={`Remove ${f.title} from wishlist`} className="flex items-center justify-center rounded-lg bg-red-50 p-1.5 text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => add(f)} disabled={isPending(f)} className="flex items-center gap-1.5 rounded-lg bg-cm-blue px-2.5 py-1.5 text-[10px] font-bold text-white shadow-sm transition-all hover:bg-cm-blue-dark disabled:opacity-50">
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

      {/* Philosophy Section */}
      <section className="py-12 bg-cm-gray/30 rounded-[2rem] mx-4 mb-8 border border-cm-gray overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="p-8 md:p-12 bg-cm-blue-dark rounded-[2.5rem] text-white shadow-xl relative">
              <BookOpen className="absolute top-0 right-0 p-6 w-16 h-16 text-cm-yellow/20" />
              <h2 className="text-2xl md:text-3xl font-bold mb-6 leading-tight tracking-tighter">Beyond Books. Knowledge Networks.</h2>
              <p className="text-base text-white/70 leading-relaxed mb-8 font-opensans">
                The modern library is no longer a warehouse for paper. It's a high-performance intersection where data, digital resources, and human interaction meet.
              </p>
              <div className="grid grid-cols-2 gap-8 border-t border-white/10 pt-8">
                <div className="flex flex-col gap-1">
                  <span className="text-cm-yellow font-bold text-2xl">98%</span>
                  <span className="text-white/50 font-bold text-[10px] uppercase tracking-wider">User Satisfaction</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-cm-yellow font-bold text-2xl">Turnkey</span>
                  <span className="text-white/50 font-bold text-[10px] uppercase tracking-wider">Implementation</span>
                </div>
              </div>
            </div>
            
            <div className="relative group p-2 bg-white rounded-[2.5rem] shadow-xl">
               <MediaImage 
                 src={heroImage} 
                 alt="Library" 
                 fallbackSrc="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=800&q=80"
                 className="rounded-[2rem] w-full h-[350px] object-cover shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]" 
               />
            </div>
          </div>
        </div>
      </section>

      {/* Balanced Call to Action */}
      <section className="py-8 pb-12 text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-4xl font-bold text-cm-blue-dark mb-8 tracking-tighter">Ready to Build the Future?</h2>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <Link to="/contact-us" className="btn-primary px-10 py-3 text-base">
              Connect With Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Libraries;
