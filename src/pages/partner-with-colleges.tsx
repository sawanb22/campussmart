import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Building2,
  Handshake,
  TrendingUp,
  HardHat,
  GraduationCap,
  Users,
  ArrowRight,
  Sparkles,
  X,
  CheckCircle2,
  Send,
  type LucideIcon,
} from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import api from '@/api/client';
import { resolveMediaUrl } from '@/lib/media-url';
import MediaImage from '@/components/ui/media-image';
import { PARTNER_PAGE_SLUG, PARTNER_DEFAULTS, slugifyModelTitle } from './partner-with-colleges.data';

gsap.registerPlugin(ScrollTrigger);

const CARD_ICONS: LucideIcon[] = [Building2, Handshake, TrendingUp, HardHat, GraduationCap, Users];

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  institution: '',
  model: 'General Partnership',
  message: '',
};

const PartnerWithColleges = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData(PARTNER_PAGE_SLUG);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.9, ease: 'power3.out' });

      const cards = cardsRef.current?.children;
      if (cards) {
        gsap.fromTo(
          cards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            stagger: 0.1,
            scrollTrigger: { trigger: cardsRef.current, start: 'top 85%' },
          },
        );
      }
    });
    return () => ctx.revert();
  }, []);

  const heroTitle = data.heroTitle ?? PARTNER_DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? PARTNER_DEFAULTS.heroSubtitle;
  const heroImage = resolveMediaUrl(data.heroImage) || PARTNER_DEFAULTS.heroImage;
  const section2Title = data.section2Title ?? PARTNER_DEFAULTS.section2Title;
  const cards: any[] = Array.isArray(data.cards) ? data.cards : PARTNER_DEFAULTS.cards;
  const ctaTitle = data.ctaTitle ?? PARTNER_DEFAULTS.ctaTitle;
  const ctaSubtitle = data.ctaSubtitle ?? PARTNER_DEFAULTS.ctaSubtitle;

  const openModal = (modelTitle?: string) => {
    const chosenModel = modelTitle || 'General Partnership';
    setSelectedModel(chosenModel);
    setFormData({
      ...EMPTY_FORM,
      model: chosenModel,
      message: modelTitle
        ? `We are interested in discussing the "${modelTitle}" model for our institution.`
        : '',
    });
    setSubmitted(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      await api.post('/contact', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        institution: formData.institution,
        subject: `Partnership Enquiry: Partner with Running Colleges (${formData.model})`,
        message: `Partnership Model: ${formData.model}\nInstitution: ${formData.institution}\n\nRequirements & Details:\n${formData.message}`,
      });
      setSubmitted(true);
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to submit enquiry. Please check your inputs and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="partner-with-colleges-page min-h-screen bg-white">
      {/* Hero Section */}
      <section className="px-4 pb-4 pt-4 sm:px-6 sm:pb-6 sm:pt-6 lg:px-8">
        <div
          ref={heroRef}
          className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-br from-cm-blue-dark via-cm-blue to-[#0f6fd6] px-6 py-8 sm:px-10 sm:py-12 lg:px-14 lg:py-16 shadow-xl"
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full border border-white/10" />
          <div className="relative z-10 grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-12">
            {/* Text on Left */}
            <div className="lg:col-span-7 flex flex-col justify-center text-left">
              <span className="mb-3 sm:mb-4 inline-flex items-center gap-2 self-start rounded-full bg-white/10 px-3.5 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-cm-yellow backdrop-blur-xs">
                <Sparkles className="h-3.5 w-3.5" /> Classifieds · Partnerships
              </span>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white tracking-normal">
                {heroTitle}
              </h1>
              <p className="mt-3 sm:mt-5 max-w-xl text-sm sm:text-base lg:text-lg leading-relaxed text-white/90">
                {heroSubtitle}
              </p>
              <div className="mt-6 sm:mt-8 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => openModal()}
                  className="btn-secondary px-7 py-3 text-sm font-bold shadow-lg transform transition hover:-translate-y-0.5"
                >
                  Partner Now
                </button>
                <a
                  href="#partnership-models"
                  className="inline-flex items-center gap-2 rounded-full border border-white/40 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10"
                >
                  Explore Models <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Image on Right */}
            <div className="lg:col-span-5 w-full block">
              <div className="relative mx-auto aspect-[16/10] sm:aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl shadow-2xl border border-white/15">
                <MediaImage src={heroImage} alt={heroTitle} className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-cm-blue-dark/60 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/95 px-4 py-3 shadow-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2 text-cm-blue-dark">
                    <Handshake className="h-4 w-4 text-cm-blue" />
                    <span className="text-xs font-bold">4,000+ Partner Campuses Nationwide</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partnership Models Section */}
      <section id="partnership-models" className="px-4 pb-12 pt-6 sm:px-6 sm:pb-16 sm:pt-8 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-8 max-w-2xl text-center">
            <h2 className="text-2xl sm:text-4xl font-bold text-cm-blue-dark leading-tight">
              {section2Title}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-500">
              Flexible ways to collaborate, structured around what your institution needs most.
            </p>
          </div>
          <div ref={cardsRef} className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, index) => {
              const Icon = CARD_ICONS[index % CARD_ICONS.length];
              const image = resolveMediaUrl(card.image);
              const detailHref = card.href || `/${PARTNER_PAGE_SLUG}/${slugifyModelTitle(card.title)}`;
              return (
                <div
                  key={card.title}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                >
                  {image && (
                    <div className="h-44 w-full overflow-hidden bg-slate-100">
                      <MediaImage
                        src={image}
                        alt={card.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cm-blue/10">
                      <Icon className="h-6 w-6 text-cm-blue" />
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-cm-blue-dark group-hover:text-cm-blue transition">
                      {card.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-600 line-clamp-3 flex-1">
                      {card.description}
                    </p>
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                      <Link
                        to={detailHref}
                        className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-cm-blue transition-all group-hover:gap-2.5"
                      >
                        Learn More <ArrowRight className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => openModal(card.title)}
                        className="rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-cm-blue hover:text-white transition"
                      >
                        Partner Now
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 rounded-[2rem] bg-gradient-to-br from-cm-blue-dark to-cm-blue px-8 py-8 text-center sm:flex-row sm:px-14 sm:text-left shadow-xl">
          <div>
            <h2 className="text-2xl font-bold text-white sm:text-3xl leading-tight">
              {ctaTitle}
            </h2>
            <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base leading-relaxed">
              {ctaSubtitle}
            </p>
          </div>
          <button
            type="button"
            onClick={() => openModal()}
            className="btn-secondary inline-flex flex-shrink-0 items-center gap-2 px-8 py-3.5 text-sm font-bold shadow-lg transform transition hover:-translate-y-0.5"
          >
            Partner Now <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </section>

      {/* Alert Modal Dialog */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden my-8 border border-slate-100 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6 bg-slate-50/80">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full bg-cm-blue" />
                  <span className="text-xs font-bold uppercase tracking-wider text-cm-blue">
                    CampusMart Institutional Partnership
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
                  Partner with CampusMart
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  {selectedModel && selectedModel !== 'General Partnership'
                    ? `Express interest in the "${selectedModel}" model.`
                    : 'Connect with our leadership team to structure a customized campus partnership.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                aria-label="Close"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-200/80 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1">
              {submitted ? (
                <div className="space-y-4 py-4 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Partnership Enquiry Submitted!
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Thank you for reaching out. Our partnership director will review your institution's profile and contact you within 24-48 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="mt-4 inline-flex items-center justify-center rounded-lg bg-cm-blue px-6 py-2.5 text-sm font-semibold text-white hover:bg-cm-blue-dark transition"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {formError && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                      {formError}
                    </div>
                  )}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Dr. Rajesh Sharma"
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-cm-blue focus:ring-1 focus:ring-cm-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Official Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="director@institution.edu"
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-cm-blue focus:ring-1 focus:ring-cm-blue"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        required
                        pattern="(?:\+91[ -]?)?[6-9][0-9]{9}"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 98765 43210"
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-cm-blue focus:ring-1 focus:ring-cm-blue"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        College / Institution Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.institution}
                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                        placeholder="e.g. Apex Institute of Technology"
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-cm-blue focus:ring-1 focus:ring-cm-blue"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Partnership Model Interest
                    </label>
                    <select
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-cm-blue focus:ring-1 focus:ring-cm-blue bg-white"
                    >
                      <option value="General Partnership">General / All Models</option>
                      {cards.map((c: any) => (
                        <option key={c.title} value={c.title}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Message / Collaboration Goals *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please describe your institution, student strength, infrastructure needs, or collaboration objectives..."
                      className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-cm-blue focus:ring-1 focus:ring-cm-blue"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center justify-center gap-2 rounded-lg bg-cm-blue px-6 py-2.5 text-sm font-bold text-white hover:bg-cm-blue-dark transition shadow-sm disabled:opacity-60"
                    >
                      <Send className="h-4 w-4" />
                      {submitting ? 'Submitting...' : 'Submit Partnership Enquiry'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default PartnerWithColleges;
