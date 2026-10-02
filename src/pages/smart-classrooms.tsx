import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Send, Sparkles } from 'lucide-react';
import api from '@/api/client';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';

interface CardItem { title: string; description: string; }

const DEFAULTS = {
  heroTitle: 'Smart Classrooms',
  heroSubtitle: 'Create connected, flexible classrooms that help educators teach more effectively and keep every learner engaged.',
  heroImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1200&q=90',
  features: [
    'IoT-Enabled Rooms',
    'Interactive Displays',
    'Real-Time Analytics',
    'Flexible Furniture',
    'Teacher Enablement',
  ],
  cards: [
    { title: 'Interactive Learning', description: 'Interactive displays, digital content, and collaborative tools make lessons more engaging.' },
    { title: 'Connected Classrooms', description: 'Reliable audio, video, networking, and device integration keep the classroom connected.' },
    { title: 'Flexible Furniture', description: 'Ergonomic, movable furniture supports group work, presentations, and different teaching styles.' },
    { title: 'Teacher Enablement', description: 'Simple controls and training help teachers use the technology confidently every day.' },
  ] as CardItem[],
  ctaTitle: 'Ready to upgrade your classrooms?',
  ctaSubtitle: 'Talk to our team about a smart classroom rollout tailored to your campus and budget.',
};

const SmartClassrooms = () => {
  const { data } = usePageData('smart-classrooms');

  const heroTitle = data.heroTitle ?? DEFAULTS.heroTitle;
  const heroImage = resolveMediaUrl(data.heroImage) || DEFAULTS.heroImage;
  const features: string[] = Array.isArray(data.features) ? data.features : DEFAULTS.features;
  const cards: CardItem[] = Array.isArray(data.cards) ? data.cards : DEFAULTS.cards;
  const ctaTitle = data.ctaTitle ?? DEFAULTS.ctaTitle;
  const ctaSubtitle = data.ctaSubtitle ?? DEFAULTS.ctaSubtitle;

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

  return (
    <main className="min-h-screen bg-white">
      {/* Capability pills */}
      <section className="px-4 pt-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-2 overflow-x-auto rounded-full bg-cm-blue-dark p-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {features.map((feature) => (
              <span
                key={feature}
                className="shrink-0 rounded-full px-4 py-2 text-[11px] font-semibold text-white/80 transition-colors hover:bg-white/10 hover:text-white"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Capability cards */}
      <section id="capabilities" className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-5 text-2xl font-bold tracking-tight text-cm-blue-dark sm:text-3xl">What's included</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-blue-50">
                  <CheckCircle className="h-5 w-5 text-cm-blue" />
                </div>
                <h3 className="mb-2 font-bold text-cm-blue-dark">{card.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlight band */}
      <section className="px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[28px] bg-cm-blue-dark">
          <div className="relative grid grid-cols-1 lg:grid-cols-2">
            <div className="relative px-8 py-8 sm:px-12 sm:py-10">
              <div className="pointer-events-none absolute -bottom-10 -right-10 h-40 w-40 rounded-full border border-white/10" />
              <span className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-cm-yellow">
                <Sparkles className="h-3 w-3" /> Built for every classroom
              </span>
              <h2 className="max-w-md text-2xl font-bold leading-tight text-white sm:text-3xl">
                Technology that fades into the background, so teaching stays in front
              </h2>
              <ul className="mt-6 space-y-3">
                {['Faster classroom setup with plug-and-play hardware', 'Higher student engagement through interactive tools', 'Lower total cost of ownership with remote management'].map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-white/80">
                    <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-cm-yellow" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative min-h-[220px]">
              <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-l from-transparent to-cm-blue-dark lg:bg-gradient-to-r" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-cm-gray p-6 text-center sm:flex-row sm:p-8 sm:text-left">
          <div>
            <p className="text-lg font-bold text-cm-blue-dark">{ctaTitle}</p>
            <p className="mt-1 text-sm text-gray-500">{ctaSubtitle}</p>
          </div>
          <Link to="/contact-us" className="btn-secondary inline-flex flex-shrink-0 items-center gap-2">
            Contact Us <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Request info form */}
      <section id="request-form" className="px-4 pb-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-6 shadow-sm sm:p-10">
          <h2 className="mb-2 text-2xl font-bold text-cm-blue-dark">Request More Information</h2>
          <p className="mb-6 text-gray-600">Tell us what your institution needs and our team will contact you.</p>
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
    </main>
  );
};

export default SmartClassrooms;
