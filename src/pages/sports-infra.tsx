import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { CheckCircle, Send, Star, Heart, Check, Trash2 } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import { useDesignWishlist } from '@/hooks/useDesignWishlist';
import LoginPromptModal from '@/components/login-prompt-modal';
import { resolveMediaUrl } from '@/lib/media-url';
import api from '@/api/client';

export const SPORTS_INFRA_PAGE_SLUG = 'sports-infra';

export function slugifySportsInfraTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'facility'
  );
}

export const SPORTS_INFRA_DEFAULTS = {
  heroTitle: 'Sports Infrastructure',
  heroSubtitle: 'World-class sports facilities designed to promote physical fitness and athletic excellence in educational institutions.',
  heroImage: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
  section1Title: 'Sports Facilities',
  section2Title: 'Our Services Include',
  section2Description: 'From concept to completion, we deliver turnkey solutions for elite athletic performance.',
  ctaTitle: 'Ready to Build Your Arena?',
  ctaButtonLabel: 'Get Project Audit',
  ctaHref: '/contact-us',
  cards: [
    { title: 'Basketball Court', description: 'FIBA-compliant wooden and acrylic cushioned surfaces engineered for shock absorption, bounce consistency, and heavy collegiate competition.', categories: ['Indoor', 'Adults'], image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Football Ground', description: 'FIFA-standard artificial turf and natural grass pitches with laser-leveled sub-base drainage and floodlighting systems.', categories: ['Outdoor', 'Adults'], image: 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Tennis Court', description: 'ITF-approved multi-layer synthetic acrylic surfaces offering true ball response, high-traction grip, and all-weather durability.', categories: ['Outdoor', 'Adults'], image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80' },
    { title: 'Swimming Pool', description: 'Semi-Olympic and recreational aquatic facilities with commercial sand filtration, anti-slip surrounds, and competitive lane markers.', categories: ['Indoor', 'Kids', 'Adults'], image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Athletics Track', description: 'IAAF-certified seamless polyurethane running tracks designed for maximum energy return, spike resistance, and athlete joint safety.', categories: ['Outdoor', 'Adults', 'Training'], image: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=800&q=80' },
    { title: 'Indoor Badminton Arena', description: 'BWF-standard shock-absorbing vinyl mats paired with anti-glare high-bay sports LED illumination and acoustic dampening.', categories: ['Indoor', 'Kids', 'Adults'], image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80' },
    { title: 'Kids Play Zone', description: 'Child-safe EPDM impact-attenuating rubber safety surfacing equipped with certified non-toxic climbing and balancing structures.', categories: ['Kids'], image: 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=400&q=80' },
    { title: 'Multi-Sport Training Area', description: 'Versatile multi-sport halls adapted for volleyball, handball, yoga, martial arts, and institutional fitness programming.', categories: ['Training', 'Adults'], image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=400&q=80' },
  ],
  features: [
    'Surface Installation',
    'Equipment Supply',
    'Maintenance'
  ],
};

const SportsInfra = ({ slug = 'sports-infra' }: { slug?: string }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData(slug);
  const { isSaved, isPending, add, remove, showLoginPrompt, setShowLoginPrompt } = useDesignWishlist('sports-infra');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    collegeName: '',
    authorisedPerson: '',
    name: '',
    email: '',
    phone: '',
    pincode: '',
    address: '',
    requirement: '',
    budget: '',
    timeline: '',
  });

  const handleQuoteScroll = () => {
    quoteRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const submitQuoteRequest = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!formData.collegeName || !formData.authorisedPerson || !formData.name || !formData.email || !formData.phone || !formData.pincode || !formData.address || !formData.requirement) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/contact/quote', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        institution: formData.collegeName,
        pincode: formData.pincode,
        items: `Authorised Person: ${formData.authorisedPerson}\nPincode: ${formData.pincode}\nBudget: ${formData.budget || 'Not specified'}\nTimeline: ${formData.timeline || 'Not specified'}`,
        message: `Address: ${formData.address}\nRequirements: ${formData.requirement}`,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to submit quote request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current, { x: -100, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: 'power4.out' });
      
      const cards = cardsRef.current?.children;
      if (cards) {
        gsap.fromTo(cards, 
          { scale: 0.8, opacity: 0 }, 
          { 
            scale: 1, opacity: 1, 
            duration: 0.6, 
            stagger: 0.1, 
            ease: 'back.out(2)',
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

  const heroTitle = data.heroTitle ?? SPORTS_INFRA_DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? SPORTS_INFRA_DEFAULTS.heroSubtitle;
  const heroImage = data.heroImage ?? SPORTS_INFRA_DEFAULTS.heroImage;
  const section1Title = data.section1Title ?? SPORTS_INFRA_DEFAULTS.section1Title;
  const section2Title = data.section2Title ?? SPORTS_INFRA_DEFAULTS.section2Title;
  const section2Description = data.section2Description ?? SPORTS_INFRA_DEFAULTS.section2Description;
  const ctaTitle = data.ctaTitle ?? SPORTS_INFRA_DEFAULTS.ctaTitle;
  const ctaButtonLabel = data.ctaButtonLabel ?? SPORTS_INFRA_DEFAULTS.ctaButtonLabel;
  const ctaHref = data.ctaHref ?? SPORTS_INFRA_DEFAULTS.ctaHref;
  const allCards = Array.isArray(data.cards) ? data.cards : SPORTS_INFRA_DEFAULTS.cards;
  const cards = allCards.map((card: any) => ({
    ...card,
    categories: card.categories?.length ? card.categories : [],
  }));
  const categoryOptions: string[] = Array.from(new Set<string>(cards.flatMap((card: { categories?: string[] }) => card.categories ?? []))).filter((option) => Boolean(option) && option !== 'All');
  const activeCategory = selectedCategory && categoryOptions.includes(selectedCategory) ? selectedCategory : (categoryOptions[0] || '');
  const filteredCards = activeCategory
    ? cards.filter((card: any) => card.categories.includes(activeCategory))
    : cards;
  const features = Array.isArray(data.features) ? data.features : SPORTS_INFRA_DEFAULTS.features;

  return (
    <main className="min-h-screen bg-white text-opensans">
      <LoginPromptModal open={showLoginPrompt} onClose={() => setShowLoginPrompt(false)} />
      {/* High-Performance Hero */}
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
              <button onClick={handleQuoteScroll} className="btn-secondary px-6 py-2.5 text-sm font-bold">
                Get Quote
              </button>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
             <img src={resolveMediaUrl(heroImage)} alt={heroTitle} className="rounded-2xl shadow-xl w-full h-[260px] object-cover border-2 border-cm-blue-dark relative z-10" />
          </div>
        </div>
      </section>

      {/* Grid of Facilities */}
      <section className="py-10 md:py-14">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-8">
            <h2 className="text-2xl md:text-3xl font-bold text-cm-blue-dark tracking-tighter">{section1Title}</h2>
            <div className="hidden md:block h-1 w-32 bg-cm-yellow rounded-full" />
          </div>

          <div className="grid grid-cols-1 items-start lg:grid-cols-[240px_minmax(0,1fr)] gap-8">
            <aside className="hidden lg:block rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-cm-blue-dark mb-5">Categories</h3>
              <div className="space-y-3">
                {categoryOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSelectedCategory(option)}
                    className={`w-full text-left rounded-2xl px-4 py-3 transition-all duration-200 ${activeCategory === option ? 'bg-cm-blue text-white shadow-lg' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              <div className="mt-8 rounded-3xl bg-cm-blue-dark/5 p-4">
                <p className="text-sm font-semibold text-cm-blue-dark mb-3">Showing</p>
                <p className="text-4xl font-black text-cm-blue-dark">{filteredCards.length}</p>
                <p className="text-sm text-slate-500 mt-2">{activeCategory ? `${activeCategory} activities` : 'Facility types'}</p>
              </div>
            </aside>

            <div ref={cardsRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCards.map((s: any, i: number) => {
                const defaultCard = SPORTS_INFRA_DEFAULTS.cards.find((c) => c.title === s.title) || SPORTS_INFRA_DEFAULTS.cards[i % SPORTS_INFRA_DEFAULTS.cards.length];
                const image = s.image || defaultCard.image;
                const description = s.description && s.description !== 'Premium sports facility designed for training, events, and wellness.'
                  ? s.description
                  : (defaultCard.description || s.description);
                const wishlistCard = { title: s.title, image };
                return (
                  <div key={s.title} className="group flex flex-col overflow-hidden rounded-[2rem] border border-slate-200/70 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_-20px_rgba(15,23,42,0.28)]">
                    <Link to={`/${SPORTS_INFRA_PAGE_SLUG}/${slugifySportsInfraTitle(s.title)}`} className="flex flex-1 flex-col">
                      <div className="relative overflow-hidden h-[220px] sm:h-[230px]">
                        <img
                          src={resolveMediaUrl(image) || defaultCard.image}
                          alt={s.title}
                          onError={(e) => {
                            const target = e.currentTarget;
                            if (target.src !== defaultCard.image) {
                              target.src = defaultCard.image;
                            }
                          }}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/30 to-transparent" />
                        <span className="absolute top-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-800 shadow-sm backdrop-blur-sm">
                          <Star className="h-3.5 w-3.5 text-cm-yellow" />
                          {s.categories?.[0] ?? 'Facility'}
                        </span>
                      </div>
                      <div className="flex flex-1 flex-col px-5 pb-2 pt-4">
                        <h3 className="text-lg font-semibold text-slate-900 tracking-tight mb-2">{s.title}</h3>
                        {description && <p className="text-sm text-slate-600 leading-relaxed mb-3">{description}</p>}
                        <div className="mt-auto flex flex-wrap gap-2">
                          {s.categories?.map((category: string) => (
                            <span key={category} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] text-slate-600">{category}</span>
                          ))}
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center justify-between px-5 pb-4 pt-3 text-slate-700">
                      {isSaved(wishlistCard) ? (
                        <div className="flex items-center gap-1.5">
                          <span className="flex items-center gap-1.5 rounded-lg bg-green-600 px-2.5 py-1.5 text-[10px] font-bold text-white">
                            <Check className="h-3.5 w-3.5" /> Added to wishlist
                          </span>
                          <button type="button" onClick={() => remove(wishlistCard)} disabled={isPending(wishlistCard)} aria-label={`Remove ${s.title} from wishlist`} className="flex items-center justify-center rounded-lg bg-red-50 p-1.5 text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button type="button" onClick={() => add(wishlistCard)} disabled={isPending(wishlistCard)} className="flex items-center gap-1.5 rounded-lg bg-cm-blue px-2.5 py-1.5 text-[10px] font-bold text-white shadow-sm transition-all hover:bg-cm-blue-dark disabled:opacity-50">
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
      </section>

      <section ref={quoteRef} className="py-6 bg-cm-gray/10 border-t border-cm-gray rounded-[1.75rem] mx-4 mb-12">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-[1.75rem] shadow-lg border border-slate-100 p-5 md:p-6">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-6">
                <p className="text-[11px] uppercase tracking-[0.28em] text-cm-yellow font-bold">Request a Quote</p>
                <h2 className="text-xl md:text-2xl font-black text-cm-blue-dark mt-3">Tell us about your requirements and we'll get back to you.</h2>
              </div>

              {submitted ? (
                <div className="rounded-3xl border border-emerald-100 bg-emerald-50 p-6 text-center">
                  <CheckCircle className="mx-auto mb-3 w-12 h-12 text-emerald-600" />
                  <h3 className="text-xl font-bold text-emerald-800 mb-2">Request Submitted</h3>
                  <p className="text-slate-600 text-sm">Thanks for sharing your project details. Our team will contact you shortly.</p>
                </div>
              ) : (
                <form onSubmit={submitQuoteRequest} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">College / University Name *</label>
                      <input type="text" value={formData.collegeName} onChange={(e) => handleFormChange('collegeName', e.target.value)} className="form-input" placeholder="Name of Institution" required />
                    </div>
                    <div>
                      <label className="form-label">Authorised Person *</label>
                      <input type="text" value={formData.authorisedPerson} onChange={(e) => handleFormChange('authorisedPerson', e.target.value)} className="form-input" placeholder="Principal / Director" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Full Name *</label>
                      <input type="text" value={formData.name} onChange={(e) => handleFormChange('name', e.target.value)} className="form-input" placeholder="Your name" required />
                    </div>
                    <div>
                      <label className="form-label">Email *</label>
                      <input type="email" pattern="[^\s@]+@[^\s@]+\.[^\s@]+" value={formData.email} onChange={(e) => handleFormChange('email', e.target.value)} className="form-input" placeholder="your@email.com" required />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Phone *</label>
                      <input type="tel" pattern="(?:\+91[ -]?)?[6-9][0-9]{9}" minLength={10} maxLength={14} value={formData.phone} onChange={(e) => handleFormChange('phone', e.target.value)} className="form-input" placeholder="+91 98765 43210" required />
                    </div>
                    <div>
                      <label className="form-label">Pincode *</label>
                      <input type="text" inputMode="numeric" pattern="[1-9][0-9]{5}" minLength={6} maxLength={6} value={formData.pincode} onChange={(e) => handleFormChange('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))} className="form-input" placeholder="560001" required />
                    </div>
                  </div>

                  <div>
                    <label className="form-label">Full Address *</label>
                    <textarea value={formData.address} onChange={(e) => handleFormChange('address', e.target.value)} className="form-input min-h-[100px]" placeholder="Full postal address" required />
                  </div>

                  <div>
                    <label className="form-label">Requirements *</label>
                    <textarea value={formData.requirement} onChange={(e) => handleFormChange('requirement', e.target.value)} className="form-input min-h-[120px]" placeholder="Describe your infrastructure needs..." required />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Budget Range</label>
                      <select value={formData.budget} onChange={(e) => handleFormChange('budget', e.target.value)} className="form-input">
                        <option value="">Select budget</option>
                        <option value="Under ₹1 Lakh">Under ₹1 Lakh</option>
                        <option value="₹1-5 Lakhs">₹1-5 Lakhs</option>
                        <option value="₹5-10 Lakhs">₹5-10 Lakhs</option>
                        <option value="₹10-50 Lakhs">₹10-50 Lakhs</option>
                        <option value="Above ₹50 Lakhs">Above ₹50 Lakhs</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Timeline</label>
                      <select value={formData.timeline} onChange={(e) => handleFormChange('timeline', e.target.value)} className="form-input">
                        <option value="">Select timeline</option>
                        <option value="Immediate">Immediate</option>
                        <option value="1-3 Months">1-3 Months</option>
                        <option value="3-6 Months">3-6 Months</option>
                        <option value="6-12 Months">6-12 Months</option>
                      </select>
                    </div>
                  </div>

                  {error && <div className="rounded-3xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}

                  <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                    <Send className="w-5 h-5" />
                    {loading ? 'Submitting...' : 'Submit Request'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Modern Features Section */}
      <section className="py-10 bg-cm-gray/30 border-y border-cm-gray rounded-[2rem] mx-4 mb-16 overflow-hidden shadow-sm">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-4">
              <h2 className="text-2xl md:text-4xl font-bold text-cm-blue-dark leading-tight mb-4 tracking-tighter">
                {section2Title}
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed mb-6">
                {section2Description}
              </p>
            </div>
            
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {features.map((feature: string) => (
                  <div key={feature} className="bg-white p-6 rounded-2xl shadow-md border border-gray-50 transform hover:-translate-y-1 transition-transform duration-300">
                    <div className="w-12 h-12 bg-cm-blue/10 mb-4 flex items-center justify-center rounded-xl border border-cm-blue/10">
                      <CheckCircle className="w-6 h-6 text-cm-blue" />
                    </div>
                    <h3 className="text-sm font-bold text-cm-blue-dark mb-1 tracking-tight">{feature}</h3>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Action Footer */}
      <section className="py-10 text-center rounded-[2rem] bg-cm-blue mx-3 sm:mx-6 lg:mx-8 mb-10 text-white shadow-xl">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 tracking-tighter">{ctaTitle}</h2>
          <Link to={ctaHref} className="btn-secondary px-8 py-3 text-base font-bold transition-all inline-block shadow-lg">
            {ctaButtonLabel}
          </Link>
        </div>
      </section>
    </main>
  );
};

export default SportsInfra;
