import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, ChevronLeft, ChevronRight, Send, Sparkles } from 'lucide-react';
import api from '@/api/client';
import { usePageData } from '@/hooks/usePageData';
import { MediaImage } from '@/components/ui/media-image';
import { PageCardGridSkeleton } from '@/components/ui/page-skeleton';

interface CardItem {
  title: string;
  description: string;
  image?: string;
  href?: string;
}

const PAGE_SIZE = 12;

const SmartClassrooms = () => {
  const { data, loading } = usePageData('smart-classrooms');
  const [page, setPage] = useState(1);

  const heroTitle = data.heroTitle || 'Smart Classrooms';
  const heroSubtitle = data.heroSubtitle || '';
  const heroImage = data.heroImage || '';
  const heroButtonLabel = data.heroButtonLabel !== undefined ? data.heroButtonLabel : 'Get Quote';
  const heroButtonHref = data.heroButtonHref || '/request-quote';

  const features: string[] = Array.isArray(data.features) ? data.features : [];
  const section1Title = data.section1Title || "What's included";
  const cards: CardItem[] = Array.isArray(data.cards) ? data.cards : [];

  const highlightEyebrow = data.highlightEyebrow || 'Built for every classroom';
  const highlightTitle = data.highlightTitle || 'Technology that fades into the background, so teaching stays in front';
  const highlightBullets: string[] = Array.isArray(data.highlightBullets)
    ? data.highlightBullets
    : [
        'Faster classroom setup with plug-and-play hardware',
        'Higher student engagement through interactive tools',
        'Lower total cost of ownership with remote management',
      ];
  const highlightImage = data.highlightImage || heroImage;

  const ctaTitle = data.ctaTitle || 'Ready to upgrade your classrooms?';
  const ctaSubtitle = data.ctaSubtitle || 'Talk to our team about a smart classroom rollout tailored to your campus and budget.';
  const ctaButtonLabel = data.ctaButtonLabel !== undefined ? data.ctaButtonLabel : 'Contact Us';
  const ctaHref = data.ctaHref || '/contact-us';

  const formTitle = data.formTitle || 'Request More Information';
  const formSubtitle = data.formSubtitle || 'Tell us what your institution needs and our team will contact you.';

  const styles = data.styles || {};
  const headingFontClass =
    styles.headingFont === 'playfair' ? 'font-playfair' :
    styles.headingFont === 'grotesk' ? 'font-grotesk' :
    styles.headingFont === 'opensans' ? 'font-opensans' :
    styles.headingFont === 'system' ? 'font-sans' : 'font-poppins';

  const bodyFontClass =
    styles.bodyFont === 'playfair' ? 'font-playfair' :
    styles.bodyFont === 'grotesk' ? 'font-grotesk' :
    styles.bodyFont === 'system' ? 'font-sans' :
    styles.bodyFont === 'poppins' ? 'font-poppins' : 'font-opensans';

  const primaryColor = styles.primaryColor || '#0047ab';
  const heroBg = styles.heroBg || 'blue';
  const heroLayout = styles.heroLayout || 'split-right';

  const heroBgClass =
    heroBg === 'paper' ? 'bg-[#fbfaf8] text-slate-900 border border-stone-200' :
    heroBg === 'amber' ? 'bg-[#451a03] text-white' :
    heroBg === 'slate' ? 'bg-slate-900 text-white' :
    heroBg === 'stone' ? 'bg-stone-900 text-white' :
    heroBg === 'white' ? 'bg-white text-slate-900 border border-slate-200 shadow-sm' : 'bg-cm-blue text-white shadow-inner';

  const heroTextColor = heroBg === 'paper' || heroBg === 'white' ? 'text-slate-900' : 'text-white';
  const heroSubtextColor = heroBg === 'paper' || heroBg === 'white' ? 'text-slate-600' : 'text-white/85';

  const activeCards = useMemo(() => cards.filter((c: any) => c.active !== false), [cards]);
  const totalPages = Math.ceil(activeCards.length / PAGE_SIZE);
  const paginatedCards = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return activeCards.slice(startIndex, startIndex + PAGE_SIZE);
  }, [activeCards, page]);

  const cardGridCols =
    styles.cardColumns === '2' ? 'sm:grid-cols-2 lg:grid-cols-2' :
    styles.cardColumns === '3' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4';

  const [formData, setFormData] = useState({ name: '', email: '', phone: '', institution: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/contact', { ...formData, subject: heroTitle, message: `Service: ${heroTitle}\n${formData.message}` });
      setSubmitted(true);
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Failed to submit your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageCardGridSkeleton cardCount={4} />;
  }

  return (
    <main
      className={`min-h-screen bg-white ${bodyFontClass} ${headingFontClass}`}
      style={{ '--primary-color': primaryColor } as React.CSSProperties}
    >
      {/* Hero Section */}
      {!styles.hideHero && !data.hideHero && (
        <section className={`mx-3 sm:mx-6 lg:mx-8 rounded-[2rem] py-6 md:py-8 overflow-hidden relative mt-4 mb-2 ${heroBgClass}`}>
          <div className={`max-w-6xl mx-auto flex flex-col gap-8 relative z-10 px-4 ${
            heroLayout === 'minimal' ? 'items-center text-center' :
            heroLayout === 'split-left' ? 'lg:flex-row-reverse items-center' :
            heroLayout === 'centered' ? 'items-center text-center' : 'lg:flex-row items-center'
          }`}>
            <div className={`${heroLayout === 'minimal' || heroLayout === 'centered' ? 'max-w-2xl text-center' : 'lg:w-1/2 text-left'} ${heroTextColor}`}>
              <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-black mb-3 tracking-tight leading-tight ${heroTextColor}`}>
                {heroTitle}
              </h1>
              <p className={`text-sm md:text-base leading-relaxed ${heroLayout === 'minimal' || heroLayout === 'centered' ? 'mx-auto' : 'max-w-xl'} ${heroSubtextColor}`}>
                {heroSubtitle}
              </p>
              {heroButtonLabel && (
                <div className={`mt-5 flex flex-wrap gap-4 ${heroLayout === 'minimal' || heroLayout === 'centered' ? 'justify-center' : ''}`}>
                  <Link to={heroButtonHref} className="btn-secondary px-6 py-2.5 text-sm font-bold shadow-md">
                    {heroButtonLabel}
                  </Link>
                </div>
              )}
            </div>
            {heroImage && heroLayout !== 'minimal' && (
              <div className={`${heroLayout === 'centered' ? 'w-full max-w-xl' : 'lg:w-1/2'} relative w-full`}>
                <MediaImage
                  src={heroImage}
                  alt={heroTitle}
                  className="rounded-2xl shadow-xl w-full h-[240px] sm:h-[260px] object-cover border-2 border-cm-blue-dark relative z-10"
                />
              </div>
            )}
          </div>
        </section>
      )}

      {/* Capability highlights */}
      {!styles.hideFeatures && !data.hideFeatures && features.length > 0 && (
        <section className="px-4 pt-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center gap-2 overflow-x-auto rounded-full bg-cm-blue-dark p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex items-center gap-1.5 shrink-0 pl-3 pr-4 text-[11px] font-bold uppercase tracking-wider text-cm-yellow border-r border-white/15">
                <Sparkles className="h-3.5 w-3.5 text-cm-yellow shrink-0" />
                <span>Capabilities</span>
              </div>
              {features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 text-[11px] sm:text-xs font-semibold text-white/90 select-none cursor-default"
                >
                  <CheckCircle className="h-3.5 w-3.5 text-cm-yellow shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Capability cards */}
      {!styles.hideCards && !data.hideCards && activeCards.length > 0 && (
        <section id="capabilities" className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-5 text-2xl font-bold tracking-tight text-cm-blue-dark sm:text-3xl">
              {section1Title}
            </h2>
            <div className={`grid grid-cols-1 gap-5 ${cardGridCols}`}>
              {paginatedCards.map((card, i) => (
                <div
                  key={`${card.title}-${i}`}
                  className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div>
                    {card.image ? (
                      <div className="mb-3 h-36 w-full overflow-hidden rounded-xl bg-slate-100 relative group">
                        <MediaImage
                          src={card.image}
                          alt={card.title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                          fallbackNode={
                            <div className="flex h-full w-full items-center justify-center bg-blue-50/60 text-cm-blue">
                              <CheckCircle className="h-8 w-8 text-cm-blue/70" />
                            </div>
                          }
                        />
                      </div>
                    ) : (
                      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-cm-blue">
                        <CheckCircle className="h-5 w-5 text-cm-blue" />
                      </div>
                    )}
                    <h3 className="mb-1.5 font-bold text-cm-blue-dark text-base">{card.title}</h3>
                    <p className="text-xs sm:text-sm leading-relaxed text-gray-500">{card.description}</p>
                  </div>
                  {card.href && (
                    <Link to={card.href} className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-cm-blue hover:underline">
                      Learn more &rarr;
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`h-9 w-9 rounded-lg text-sm font-semibold transition-colors ${
                      page === pageNum
                        ? 'bg-cm-blue text-white shadow-sm'
                        : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  disabled={page === totalPages}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Highlight band */}
      {!styles.hideHighlight && !data.hideHighlight && (
        <section className="px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-cm-blue-dark">
            <div className="relative grid grid-cols-1 lg:grid-cols-2">
              <div className="relative px-8 py-8 sm:px-12 sm:py-10">
                <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full border border-white/10" />
                <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-cm-yellow">
                  <Sparkles className="h-3 w-3" /> {highlightEyebrow}
                </span>
                <h2 className="max-w-md text-2xl font-bold leading-tight text-white sm:text-3xl">
                  {highlightTitle}
                </h2>
                {highlightBullets.length > 0 && (
                  <ul className="mt-6 space-y-3">
                    {highlightBullets.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-sm text-white/80">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-cm-yellow" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="relative min-h-[220px]">
                <MediaImage src={highlightImage} alt={highlightTitle} className="absolute inset-0 h-full w-full object-cover opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-l from-transparent to-cm-blue-dark lg:bg-gradient-to-r" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA banner */}
      {!styles.hideCta && !data.hideCta && (
        <section className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-cm-gray p-6 text-center sm:flex-row sm:p-8 sm:text-left">
            <div>
              <p className="text-lg font-bold text-cm-blue-dark">{ctaTitle}</p>
              <p className="mt-1 text-sm text-gray-500">{ctaSubtitle}</p>
            </div>
            {ctaButtonLabel && (
              <Link to={ctaHref} className="btn-secondary inline-flex flex-shrink-0 items-center gap-2">
                {ctaButtonLabel} <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </section>
      )}

      {/* Request info form */}
      {!styles.hideForm && !data.hideForm && (
        <section id="request-form" className="px-4 pb-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm sm:p-10">
            <h2 className="mb-2 text-2xl font-bold text-cm-blue-dark">{formTitle}</h2>
            <p className="mb-6 text-gray-600">{formSubtitle}</p>
            {submitted ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
                Thank you. Your request has been submitted successfully.
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-600">{error}</div>}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="form-label">Full Name *</label>
                    <input className="form-input" required value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-input" required value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="form-label">Phone *</label>
                    <input type="tel" className="form-input" required value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} />
                  </div>
                  <div>
                    <label className="form-label">Institution *</label>
                    <input className="form-input" required value={formData.institution} onChange={(event) => setFormData({ ...formData, institution: event.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="form-label">Message *</label>
                  <textarea className="form-input min-h-[120px]" required value={formData.message} onChange={(event) => setFormData({ ...formData, message: event.target.value })} />
                </div>
                <button type="submit" disabled={submitting} className="btn-primary flex w-full items-center justify-center gap-2 disabled:opacity-60">
                  <Send className="h-5 w-5" />
                  {submitting ? 'Submitting...' : 'Request Information'}
                </button>
              </form>
            )}
          </div>
        </section>
      )}
    </main>
  );
};

export default SmartClassrooms;
