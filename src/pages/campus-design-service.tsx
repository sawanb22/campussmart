import { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle, Send } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import api from '@/api/client';
import { usePageData } from '@/hooks/usePageData';

interface ServiceCard { title: string; description?: string; image?: string; href?: string; }

const fallbackCards: ServiceCard[] = [
  { title: 'Master Planning', description: 'Comprehensive campus master planning for new and existing institutions.', image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { title: 'Architectural Design', description: 'Innovative architectural solutions for educational buildings.', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { title: 'Interior Design', description: 'Functional and aesthetic interior spaces for learning.', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  { title: 'Landscape Design', description: 'Outdoor spaces that enhance the campus environment.', image: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
];

const toSlug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const CampusDesignService = () => {
  const { serviceSlug } = useParams();
  const { data } = usePageData('campus-design');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', institution: '', pincode: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const cards: ServiceCard[] = Array.isArray(data.cards) ? data.cards : fallbackCards;
  const service = cards.find((card) => toSlug(card.title) === serviceSlug) ?? cards[0];

  useEffect(() => {
    if (service && !serviceSlug) window.history.replaceState(null, '', `/campus-design/${toSlug(service.title)}`);
  }, [service, serviceSlug]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.post('/contact/quote', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        institution: formData.institution.trim(),
        pincode: formData.pincode.trim(),
        items: service.title,
        message: `Service: ${service.title}\n${formData.message.trim()}`,
      });
      setSubmitted(true);
    } catch (requestError: any) {
      const serverMsg = requestError.response?.data?.error;
      setError(serverMsg || 'Failed to submit your quotation request. Please check your phone number and details.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-cm-gray flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-cm-blue-dark mb-3">Quotation Request Sent</h1>
          <p className="text-gray-600 mb-6">We received your request for {service.title}. Our team will contact you soon.</p>
          <Link to="/campus-design" className="btn-primary inline-flex">Back to Campus Design</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cm-gray py-8 sm:py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Link to="/campus-design" className="inline-flex items-center gap-2 text-cm-blue font-semibold mb-6"><ArrowLeft className="w-4 h-4" /> Back to Campus Design</Link>
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-2">
          <div className="min-h-[280px] lg:min-h-full">
            <img src={service.image || fallbackCards[0].image} alt={service.title} className="w-full h-full min-h-[280px] object-cover" />
          </div>
          <div className="p-6 sm:p-10">
            <h1 className="text-3xl sm:text-4xl font-bold text-cm-blue-dark mb-3">{service.title}</h1>
            <p className="text-gray-600 leading-relaxed mb-8">{service.description}</p>
            <h2 className="text-xl font-bold text-cm-blue-dark mb-5">Request a Quotation</h2>
            {error && <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="form-label">Full Name *</label><input className="form-input" required value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} /></div>
                <div><label className="form-label">Email *</label><input type="email" className="form-input" required value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} /></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="form-label">Phone *</label><input type="tel" pattern="(?:\+91[ -]?)?[6-9][0-9]{9}" minLength={10} maxLength={14} className="form-input" required value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} /></div>
                <div><label className="form-label">Pincode *</label><input inputMode="numeric" pattern="[1-9][0-9]{5}" maxLength={6} className="form-input" required value={formData.pincode} onChange={(event) => setFormData({ ...formData, pincode: event.target.value.replace(/\D/g, '').slice(0, 6) })} /></div>
              </div>
              <div><label className="form-label">Institution *</label><input className="form-input" required value={formData.institution} onChange={(event) => setFormData({ ...formData, institution: event.target.value })} /></div>
              <div><label className="form-label">Requirements *</label><textarea className="form-input min-h-[120px]" required placeholder={`Tell us about your ${service.title.toLowerCase()} requirements...`} value={formData.message} onChange={(event) => setFormData({ ...formData, message: event.target.value })} /></div>
              <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"><Send className="w-5 h-5" />{submitting ? 'Submitting...' : 'Request Quotation'}</button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CampusDesignService;
