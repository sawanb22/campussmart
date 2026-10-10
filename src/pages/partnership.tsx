import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Send, CheckCircle } from 'lucide-react';
import api from '@/api/client';
import { usePageData } from '@/hooks/usePageData';

const DEFAULTS = {
  heroTitle: 'Partnership Enquiry',
  heroSubtitle: 'Partner with us to transform educational infrastructure.',
};

const Partnership = () => {
  const [searchParams] = useSearchParams();
  const modelParam = searchParams.get('model') || '';
  const { data } = usePageData('partnership');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    institution: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (modelParam) {
      setFormData((prev) => ({
        ...prev,
        message: prev.message || `I am interested in learning more about the "${modelParam}" partnership model.`,
      }));
    }
  }, [modelParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');

    try {
      await api.post('/contact', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        institution: formData.institution.trim() || undefined,
        subject: modelParam ? `Partnership Enquiry - ${modelParam}` : 'Partnership Enquiry',
        message: formData.message.trim(),
      });
      setSubmitted(true);
      setFormData({ name: '', email: '', phone: '', institution: '', message: '' });
    } catch (err: any) {
      setSubmitError(err.response?.data?.error || 'Failed to submit your enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const heroTitle = data.heroTitle ?? DEFAULTS.heroTitle;
  const heroSubtitle = data.heroSubtitle ?? DEFAULTS.heroSubtitle;

  if (submitted) {
    return (
      <main className="min-h-screen bg-cm-gray flex items-center justify-center py-8 px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-cm-blue-dark mb-3">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your partnership enquiry has been submitted successfully. Our team will contact you shortly to explore collaboration opportunities.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => setSubmitted(false)}
              className="text-sm text-cm-blue font-semibold hover:underline px-4 py-2"
            >
              Submit another enquiry
            </button>
            <Link to="/" className="btn-primary inline-flex justify-center items-center text-sm">
              Return to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cm-gray py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm">
          <h1 className="text-3xl font-bold text-cm-blue-dark mb-2 text-center">{heroTitle}</h1>
          <p className="text-gray-600 text-center mb-8">{heroSubtitle}</p>

          {modelParam && (
            <div className="mb-6 rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-cm-blue flex items-center gap-2">
              <span className="font-semibold">Model Selected:</span> {modelParam}
            </div>
          )}

          {submitError && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="partner-name" className="form-label">
                  Full Name <span className="text-cm-red">*</span>
                </label>
                <input
                  id="partner-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label htmlFor="partner-email" className="form-label">
                  Email Address <span className="text-cm-red">*</span>
                </label>
                <input
                  id="partner-email"
                  type="email"
                  pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="partner-phone" className="form-label">
                  Phone Number <span className="text-cm-red">*</span>
                </label>
                <input
                  id="partner-phone"
                  type="tel"
                  pattern="(?:\+91[ -]?)?[6-9][0-9]{9}"
                  minLength={10}
                  maxLength={14}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="form-input"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
              <div>
                <label htmlFor="partner-institution" className="form-label">
                  Institution / Organisation
                </label>
                <input
                  id="partner-institution"
                  type="text"
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  className="form-input"
                  placeholder="Institution or company"
                />
              </div>
            </div>

            <div>
              <label htmlFor="partner-message" className="form-label">
                Message / Partnership Goals <span className="text-cm-red">*</span>
              </label>
              <textarea
                id="partner-message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="form-input min-h-[140px]"
                placeholder="Tell us about your institution and what kind of partnership you are interested in..."
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 disabled:opacity-60"
            >
              <Send className="w-5 h-5" />
              {submitting ? 'Submitting...' : 'Submit Partnership Enquiry'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default Partnership;
