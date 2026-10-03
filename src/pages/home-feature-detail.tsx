import { useMemo } from 'react';
import { ArrowLeft, CheckCircle, Send } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useSiteContent } from '@/contexts/SiteContentContext';
import api from '@/api/client';
import MediaImage from '@/components/ui/media-image';
import { useState } from 'react';

interface DetailCard { title: string; description: string; }

const DETAILS: Record<string, { title: string; description: string; image: string; cards: DetailCard[] }> = {
  'ar-vr-learning': {
    title: 'AR / VR Learning',
    description: 'Bring difficult concepts to life with immersive learning experiences designed for deeper understanding and practical discovery.',
    image: 'https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=1200&q=90',
    cards: [
      { title: 'Immersive Lessons', description: 'Explore places, processes, and concepts that are difficult to experience in a traditional classroom.' },
      { title: 'Virtual Labs', description: 'Give learners a safe, repeatable way to practise experiments and technical procedures.' },
      { title: 'Curriculum Alignment', description: 'Map immersive modules to learning outcomes across engineering, science, and life sciences.' },
      { title: 'Learning Analytics', description: 'Track participation and progress to help educators support every learner.' },
    ],
  },
};

const HomeFeatureDetail = () => {
  const location = useLocation();
  const featureSlug = location.pathname.slice(1);
  const { content } = useSiteContent();
  const detail = useMemo(() => DETAILS[featureSlug || ''] || DETAILS['ar-vr-learning'], [featureSlug]);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', institution: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const feature = Array.isArray(content.home_features) ? content.home_features.find((item: any) => item.title === detail.title || item.title === 'AR/VR Learning') : undefined;
  const image = feature?.image || detail.image;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/contact', { ...formData, subject: detail.title, message: `Service: ${detail.title}\n${formData.message}` });
      setSubmitted(true);
    } catch (requestError: any) {
      setError(requestError.response?.data?.error || 'Failed to submit your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-cm-gray py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2 text-cm-blue font-semibold mb-6"><ArrowLeft className="w-4 h-4" /> Back to Home</Link>
        <section className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <MediaImage src={image} alt={detail.title} className="w-full h-64 sm:h-80 object-cover" />
          <div className="p-6 sm:p-10">
            <h1 className="text-3xl sm:text-5xl font-bold text-cm-blue-dark mb-4">{detail.title}</h1>
            <p className="text-lg text-gray-600 max-w-3xl leading-relaxed">{detail.description}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
              {detail.cards.map((card) => <div key={card.title} className="border border-slate-200 rounded-xl p-5"><CheckCircle className="w-6 h-6 text-cm-blue mb-4" /><h2 className="font-bold text-cm-blue-dark mb-2">{card.title}</h2><p className="text-sm text-gray-600 leading-relaxed">{card.description}</p></div>)}
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm mt-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-cm-blue-dark mb-2">Request More Information</h2>
          <p className="text-gray-600 mb-6">Tell us what your institution needs and our team will contact you.</p>
          {submitted ? <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">Thank you. Your request has been submitted successfully.</div> : <form onSubmit={handleSubmit} className="space-y-5">
            {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-600">{error}</div>}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="form-label">Full Name *</label><input className="form-input" required value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} /></div><div><label className="form-label">Email *</label><input type="email" className="form-input" required value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} /></div></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="form-label">Phone *</label><input type="tel" className="form-input" required value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} /></div><div><label className="form-label">Institution *</label><input className="form-input" required value={formData.institution} onChange={(event) => setFormData({ ...formData, institution: event.target.value })} /></div></div>
            <div><label className="form-label">Message *</label><textarea className="form-input min-h-[120px]" required value={formData.message} onChange={(event) => setFormData({ ...formData, message: event.target.value })} /></div>
            <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"><Send className="w-5 h-5" />{submitting ? 'Submitting...' : 'Request Information'}</button>
          </form>}
        </section>
      </div>
    </main>
  );
};

export default HomeFeatureDetail;
