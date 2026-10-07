import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, CheckCircle, Send, X, BookOpen, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import api from '@/api/client';
import { usePageData } from '@/hooks/usePageData';
import { resolveMediaUrl } from '@/lib/media-url';

interface ServiceCard {
  title: string;
  description?: string;
  image?: string;
  href?: string;
}

const fallbackCards: ServiceCard[] = [
  { title: 'Master Planning', description: 'Comprehensive campus master planning for new and existing institutions.', image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80' },
  { title: 'Architectural Design', description: 'Innovative architectural solutions for educational buildings.', image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80' },
  { title: 'Interior Design', description: 'Functional and aesthetic interior spaces for learning.', image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80' },
  { title: 'Landscape Design', description: 'Outdoor spaces that enhance the campus environment.', image: 'https://images.unsplash.com/photo-1562774053-701939374585?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80' },
];

const SERVICE_DETAILS: Record<string, {
  tag: string;
  deliverables: { title: string; desc: string }[];
  methodology: string;
}> = {
  'master-planning': {
    tag: 'Strategic Architecture',
    deliverables: [
      { title: 'Zoning & Space Allocation', desc: 'Holistic land-use zoning balancing academic, residential, sports, and green corridors.' },
      { title: 'Traffic & Pedestrian Circulation', desc: 'Safe, accessible pedestrian flow segregated from vehicle service routes.' },
      { title: 'Scalable Growth Roadmap', desc: '10-year scalable master blueprint designed to accommodate future campus expansion.' },
      { title: 'Regulatory Compliance & Codes', desc: 'Fully compliant with national building codes, environmental norms, and municipal bylaws.' },
    ],
    methodology: 'Our master planning process blends institutional pedagogy with physical infrastructure, crafting campuses that inspire curiosity while optimizing everyday operational efficiency.',
  },
  'architectural-design': {
    tag: 'Structural Engineering & Aesthetics',
    deliverables: [
      { title: 'Academic Complex Design', desc: 'Modular classroom blocks, high-ceiling scientific labs, and tech-enabled lecture halls.' },
      { title: 'Bioclimatic Architecture', desc: 'Passive solar design, natural cross-ventilation, and green building envelope specs (GRIHA / LEED).' },
      { title: 'Acoustic & Lighting Engineering', desc: 'Optimized sound attenuation and daylight integration for peak student focus.' },
      { title: '3D BIM Walkthroughs', desc: 'Building Information Modeling (BIM) for precise cost estimation and contractor handoff.' },
    ],
    methodology: 'We design modern academic structures that harmoniously balance form, structural durability, and energy efficiency, turning every building into an inspiring learning environment.',
  },
  'interior-design': {
    tag: 'Experiential Learning Spaces',
    deliverables: [
      { title: 'Active Learning Classrooms', desc: 'Flexible, reconfigurable learning environments tailored to collaborative and digital teaching.' },
      { title: 'Smart Library & Study Hubs', desc: 'Ergonomic study pods, silent research zones, and collaborative digital media suites.' },
      { title: 'Ergonomic Campus Furniture', desc: 'Heavy-duty institutional seating and desks engineered specifically for student posture.' },
      { title: 'Wayfinding & Visual Identity', desc: 'Vibrant institutional signage, architectural graphics, and intuitive wayfinding systems.' },
    ],
    methodology: 'Every interior space is crafted around how modern students interact, study, and collaborate, maximizing comfort and long-term utility.',
  },
  'landscape-design': {
    tag: 'Outdoor Learning & Greenery',
    deliverables: [
      { title: 'Pedestrian Plazas & Amphitheatres', desc: 'Open-air gathering spaces, convocation lawns, and student performance amphitheatres.' },
      { title: 'Micro-Forests & Native Flora', desc: 'Low-maintenance, drought-tolerant flora and shade trees promoting local biodiversity.' },
      { title: 'Rainwater Harvesting & Swales', desc: 'Ecological drainage basins, bioswales, and groundwater recharge infrastructure.' },
      { title: 'Sports & Wellness Zones', desc: 'Integrated fitness trails, outdoor seating pods, and recreational jogging tracks.' },
    ],
    methodology: 'Campus landscapes should be living educational environments. We integrate natural ecosystems with functional campus life.',
  },
};

const toSlug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const CampusDesignService = () => {
  const { serviceSlug } = useParams();
  const { data } = usePageData('campus-design');
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', institution: '', pincode: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const cards: ServiceCard[] = Array.isArray(data.cards) ? data.cards : fallbackCards;
  const currentSlug = serviceSlug || toSlug(cards[0].title);
  const service = cards.find((card) => toSlug(card.title) === currentSlug) ?? cards[0];
  const serviceKey = toSlug(service.title);
  const details = SERVICE_DETAILS[serviceKey] ?? SERVICE_DETAILS['master-planning'];

  useEffect(() => {
    if (service && !serviceSlug) {
      window.history.replaceState(null, '', `/campus-design/${toSlug(service.title)}`);
    }
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

  const heroImage = resolveMediaUrl(service.image) || fallbackCards[0].image || '';

  return (
    <main className="min-h-screen bg-slate-50/60 py-8 sm:py-12 text-slate-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Link to="/campus-design" className="inline-flex items-center gap-2 text-cm-blue font-bold text-sm hover:underline">
            <ArrowLeft className="w-4 h-4" /> Back to Campus Design Overview
          </Link>
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Design & Architecture
          </span>
        </div>

        {/* Article Container */}
        <article className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          {/* Hero Banner */}
          <div className="relative aspect-[21/9] min-h-[260px] sm:min-h-[380px] w-full overflow-hidden bg-slate-900">
            <img
              src={heroImage}
              alt={service.title}
              onError={(e) => {
                const fallback = fallbackCards[0].image || '';
                const target = e.currentTarget;
                if (target.src !== fallback) target.src = fallback;
              }}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cm-yellow text-slate-950 text-xs font-black uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" /> {details.tag}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">{service.title}</h1>
              <p className="mt-2 text-sm sm:text-base text-white/80 max-w-2xl leading-relaxed">{service.description}</p>
            </div>
          </div>

          {/* Article Body */}
          <div className="p-6 sm:p-10 space-y-10">
            {/* Overview & Methodology */}
            <div>
              <h2 className="text-2xl font-bold text-cm-blue-dark tracking-tight mb-4">Pedagogical Philosophy & Approach</h2>
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                {details.methodology}
              </p>
            </div>

            {/* Core Deliverables Grid */}
            <div>
              <div className="flex items-center gap-2.5 mb-6">
                <Layers className="w-5 h-5 text-cm-blue" />
                <h3 className="text-xl font-bold text-slate-950">Architectural Deliverables & Scope</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {details.deliverables.map((item, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-100 transition">
                    <span className="text-xs font-black text-cm-blue uppercase tracking-wider block mb-1">0{idx + 1}. Phase</span>
                    <h4 className="text-base font-bold text-slate-900 mb-1.5">{item.title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Standards & Compliance */}
            <div className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-8 h-8 text-cm-blue shrink-0" />
                <div>
                  <h4 className="font-bold text-slate-900 text-base">Standardized Regulatory & Safety Compliance</h4>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">Every blueprint aligns with AICTE, UGC, CBSE campus space norms and National Building Code standards.</p>
                </div>
              </div>
            </div>

            {/* Read Related Blog Insights Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-cm-blue-dark text-white flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6 text-cm-yellow" />
                </div>
                <div>
                  <h4 className="text-lg font-bold">Explore Campus Design Case Studies & Articles</h4>
                  <p className="text-xs sm:text-sm text-white/70 mt-1">Read our deep-dives on modern classroom acoustics, master plan zoning, and turnkey infrastructure execution.</p>
                </div>
              </div>
              <Link
                to="/blog"
                className="shrink-0 px-5 py-2.5 rounded-full bg-white text-slate-950 font-bold text-sm hover:bg-slate-100 transition flex items-center gap-1.5"
              >
                Read Blog Insights <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Action Bar */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link to="/campus-design" className="text-sm font-bold text-slate-500 hover:text-slate-800 transition">
                &larr; View all campus design disciplines
              </Link>
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Link
                  to="/contact-us"
                  className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm text-center hover:bg-slate-50 transition"
                >
                  Contact Design Team
                </Link>
                <button
                  type="button"
                  onClick={() => setShowQuoteModal(true)}
                  className="w-full sm:w-auto btn-primary flex items-center justify-center gap-2 cursor-pointer shadow-sm text-sm"
                >
                  Request a Project Quote <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </article>
      </div>

      {/* On-Demand Quotation Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between border-b border-slate-100 p-6 bg-slate-50">
              <div>
                <span className="text-xs font-bold text-cm-blue uppercase tracking-wider">Quotation Request</span>
                <h3 className="text-xl font-bold text-slate-950 mt-1">{service.title}</h3>
                <p className="text-xs text-slate-500">Provide your campus details for a tailored architectural proposal.</p>
              </div>
              <button
                type="button"
                onClick={() => { setShowQuoteModal(false); setSubmitted(false); }}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 transition"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6">
              {submitted ? (
                <div className="text-center py-6">
                  <CheckCircle className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
                  <h4 className="text-xl font-bold text-slate-950 mb-1">Request Received</h4>
                  <p className="text-sm text-slate-600 mb-6">Our chief campus architect will contact you within 24 hours with feasibility guidelines for {service.title}.</p>
                  <button
                    type="button"
                    onClick={() => { setShowQuoteModal(false); setSubmitted(false); }}
                    className="btn-primary w-full"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{error}</div>}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label text-xs">Full Name *</label>
                      <input className="form-input text-sm" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    </div>
                    <div>
                      <label className="form-label text-xs">Email *</label>
                      <input type="email" className="form-input text-sm" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label text-xs">Phone *</label>
                      <input type="tel" pattern="(?:\+91[ -]?)?[6-9][0-9]{9}" className="form-input text-sm" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 98765 43210" />
                    </div>
                    <div>
                      <label className="form-label text-xs">Pincode *</label>
                      <input inputMode="numeric" pattern="[1-9][0-9]{5}" maxLength={6} className="form-input text-sm" required value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label text-xs">Institution / Organization *</label>
                    <input className="form-input text-sm" required value={formData.institution} onChange={(e) => setFormData({ ...formData, institution: e.target.value })} placeholder="University / College / School name" />
                  </div>
                  <div>
                    <label className="form-label text-xs">Requirements *</label>
                    <textarea className="form-input text-sm min-h-[90px]" required placeholder={`Tell us about your campus acreage, student capacity, or ${service.title.toLowerCase()} goals...`} value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} />
                  </div>
                  <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2 text-sm shadow-sm disabled:opacity-60">
                    <Send className="w-4 h-4" />
                    {submitting ? 'Submitting...' : 'Send Quotation Request'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default CampusDesignService;
