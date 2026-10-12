import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Handshake, X, CheckCircle2, Send } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import api from '@/api/client';
import { resolveMediaUrl } from '@/lib/media-url';
import MediaImage from '@/components/ui/media-image';
import { PARTNER_PAGE_SLUG, PARTNER_DEFAULTS, slugifyModelTitle } from './partner-with-colleges.data';

const PartnershipModelDetail = () => {
  const { modelSlug } = useParams();
  const { data, loading } = usePageData(PARTNER_PAGE_SLUG);
  const cards: any[] = Array.isArray(data.cards) ? data.cards : PARTNER_DEFAULTS.cards;
  const card = cards.find((item) => slugifyModelTitle(item.title) === modelSlug);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    message: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cm-blue border-t-transparent" />
      </main>
    );
  }

  if (!card) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
        <p className="text-gray-600">That partnership model couldn't be found.</p>
        <Link to={`/${PARTNER_PAGE_SLUG}`} className="btn-primary">Back to Partnerships</Link>
      </main>
    );
  }

  const image = resolveMediaUrl(card.image);

  const openModal = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      institution: '',
      message: `We are interested in discussing the "${card.title}" partnership model for our institution.`,
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
        subject: `Partnership Enquiry: ${card.title}`,
        message: `Partnership Model: ${card.title}\nInstitution: ${formData.institution}\n\nRequirements & Details:\n${formData.message}`,
      });
      setSubmitted(true);
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to submit enquiry. Please check your inputs and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50/50 py-8 sm:py-12">
      <article className="mx-auto max-w-3xl px-4 sm:px-6">
        <Link to={`/${PARTNER_PAGE_SLUG}`} className="mb-8 inline-flex items-center gap-2 font-semibold text-cm-blue hover:text-cm-blue-dark transition">
          <ArrowLeft className="h-4 w-4" /> Back to Partnerships
        </Link>
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          {image && (
            <div className="h-56 w-full overflow-hidden bg-slate-100 sm:h-72">
              <MediaImage src={image} alt={card.title} className="h-full w-full object-cover" />
            </div>
          )}
          <div className="p-6 sm:p-10">
            <div className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cm-blue">
              <Handshake className="h-3 w-3" /> Partnership Model
            </div>
            <h1 className="mb-6 text-2xl sm:text-4xl font-bold leading-tight text-cm-blue-dark">{card.title}</h1>
            <p className="whitespace-pre-wrap text-base sm:text-lg leading-relaxed text-gray-700">{card.description}</p>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-br from-cm-blue-dark to-cm-blue p-6 text-center sm:flex-row sm:p-8 sm:text-left shadow-lg">
          <div>
            <p className="text-base sm:text-lg font-bold text-white">Interested in the {card.title} model?</p>
            <p className="mt-1 text-xs sm:text-sm text-white/80">Connect with our team for institutional consultation.</p>
          </div>
          <button
            type="button"
            onClick={openModal}
            className="btn-secondary inline-flex flex-shrink-0 items-center gap-2 px-6 py-3 text-sm font-bold shadow-md transform transition hover:-translate-y-0.5"
          >
            Partner Now <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </article>

      {/* Alert Modal Dialog */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm overflow-y-auto"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl overflow-hidden my-8 border border-slate-100 flex flex-col max-h-[90vh]">
            <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6 bg-slate-50/80">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="h-2 w-2 rounded-full bg-cm-blue" />
                  <span className="text-xs font-bold uppercase tracking-wider text-cm-blue">
                    Model Consultation
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
                  Partner via {card.title}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  Submit your institution's details to discuss collaboration.
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

            <div className="p-5 sm:p-6 overflow-y-auto flex-1">
              {submitted ? (
                <div className="space-y-4 py-4 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                    <CheckCircle2 className="h-7 w-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">
                    Enquiry Submitted Successfully!
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    Thank you! Our partnership team will contact you shortly regarding the {card.title} model.
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
                        pattern="(?:\+?91[\s\-]?)?0?[0-9\s\-]{10,14}"
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
                      Message / Collaboration Goals *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please describe your institution's collaboration objectives..."
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

export default PartnershipModelDetail;
