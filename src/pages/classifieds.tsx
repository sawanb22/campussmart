import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  BriefcaseBusiness,
  DollarSign,
  Handshake,
  Send,
  X,
  PlusCircle,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import api from '@/api/client';
import MediaImage from '@/components/ui/media-image';

interface Listing {
  title: string;
  description?: string;
  desc?: string;
  href?: string;
  link: string;
  image?: string;
  category?: string;
  icon: LucideIcon;
}

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  institution: '',
  category: 'Institutions',
  title: '',
  message: '',
};

export const DEFAULTS = {
  heroTitle: 'Education opportunities, thoughtfully matched.',
  heroSubtitle: 'Explore institutions, funding pathways, partnerships and roles shaping the future of education.',
  categories: ['All opportunities', 'Institutions', 'Funding', 'Partnerships', 'Careers'],
  featured: {
    eyebrow: 'Featured opportunity',
    title: 'Find the right next step for your institution',
    description: 'From acquisition and funding to strategic partnerships, discover practical ways to move an education project forward.',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=85',
  },
  ctaTitle: 'Have an opportunity to share?',
  ctaSubtitle: 'Connect with the CampusMart team and reach education leaders looking for their next move.',
  ctaButtonLabel: 'Post a Classified',
};

const Classifieds = () => {
  const { data } = usePageData<any>('classifieds');
  const [activeCategory, setActiveCategory] = useState('All opportunities');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'post' | 'enquiry'>('post');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  const categories: string[] = Array.isArray(data.categories) ? data.categories : DEFAULTS.categories;
  const featured = { ...DEFAULTS.featured, ...(data.featured ?? {}) };

  const defaults: Listing[] = [
    {
      title: 'Colleges for Sale',
      category: 'Institutions',
      desc: 'Browse educational institutions available for acquisition.',
      image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=900&q=85',
      link: '/colleges-universities-for-sale',
      icon: Building2,
    },
    {
      title: 'Education Funding',
      category: 'Funding',
      desc: 'Explore funding options for your institution.',
      image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=900&q=85',
      link: '#',
      icon: DollarSign,
    },
    {
      title: 'Partnership Opportunities',
      category: 'Partnerships',
      desc: 'Find partnership opportunities with running colleges.',
      image: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=900&q=85',
      link: '/partner-with-colleges',
      icon: Handshake,
    },
    {
      title: 'Job Openings',
      category: 'Careers',
      desc: 'Apply for current opportunities with our team.',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=85',
      link: '/job-openings',
      icon: BriefcaseBusiness,
    },
  ];

  const listings: Listing[] = (Array.isArray(data.cards) ? data.cards : defaults).map((item: any, index: number) => ({
    ...item,
    icon: [Building2, DollarSign, Handshake, BriefcaseBusiness][index % 4],
    desc: item.description ?? item.desc,
    category: item.category ?? categories[(index + 1) % categories.length],
    link: /job|career/i.test(item.title) ? '/job-openings' : item.href ?? item.link ?? '#',
  }));

  const visibleListings = useMemo(
    () => (activeCategory === categories[0] ? listings : listings.filter((item) => item.category === activeCategory)),
    [activeCategory, categories, listings],
  );

  const openPostModal = () => {
    setModalMode('post');
    setSelectedListing(null);
    setFormData(EMPTY_FORM);
    setSubmitted(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const openEnquiryModal = (listing: Listing) => {
    setModalMode('enquiry');
    setSelectedListing(listing);
    setFormData({
      ...EMPTY_FORM,
      category: listing.category || 'Institutions',
      title: listing.title,
      message: `I am interested in "${listing.title}". Please share more details and requirements with me.`,
    });
    setSubmitted(false);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError('');

    const subject =
      modalMode === 'post'
        ? `Post Classified Request: ${formData.title || formData.category}`
        : `Classifieds Enquiry: ${selectedListing?.title || formData.title}`;

    try {
      await api.post('/contact', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        institution: formData.institution,
        subject,
        message: `Category: ${formData.category}\nTitle: ${formData.title}\n\nDetails:\n${formData.message}`,
      });
      setSubmitted(true);
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to submit. Please check your inputs and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="classifieds-page min-h-screen bg-slate-50/60 py-8 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 pb-8 border-b border-slate-200">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cm-blue/10 text-cm-blue text-xs font-bold uppercase tracking-wider mb-3">
              CampusMart Opportunities
            </div>
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
              {data.heroTitle ?? DEFAULTS.heroTitle}
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-600 leading-relaxed">
              {data.heroSubtitle ?? DEFAULTS.heroSubtitle}
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={openPostModal}
              className="inline-flex items-center gap-2 rounded-xl bg-cm-blue px-5 py-3 text-sm font-bold text-white shadow-md hover:bg-cm-blue-dark transition-all transform hover:-translate-y-0.5"
            >
              <PlusCircle className="h-4 w-4" /> Post a Classified
            </button>
          </div>
        </div>

        {/* Categories Filter Bar */}
        <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${
                activeCategory === category
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Opportunity */}
        <section className="mt-8 overflow-hidden rounded-2xl bg-gradient-to-br from-[#155b51] to-[#0d3d36] text-white shadow-lg grid grid-cols-1 md:grid-cols-2">
          <div className="flex flex-col justify-center p-6 sm:p-10">
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-300 mb-2">
              {featured.eyebrow}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
              {featured.title}
            </h2>
            <p className="mt-4 text-sm sm:text-base text-emerald-100/90 leading-relaxed">
              {featured.description}
            </p>
            <div className="mt-6 flex flex-wrap gap-4 items-center">
              <a
                href="#classified-opportunities"
                className="inline-flex items-center gap-2 text-sm font-bold text-white underline underline-offset-4 hover:text-emerald-200 transition"
              >
                Explore all opportunities <ArrowRight className="h-4 w-4" />
              </a>
              <button
                type="button"
                onClick={openPostModal}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs sm:text-sm px-4 py-2 transition"
              >
                <PlusCircle className="h-4 w-4" /> Post Opportunity
              </button>
            </div>
          </div>
          <div className="h-56 sm:h-72 md:h-auto overflow-hidden">
            <MediaImage
              src={featured.image}
              alt={featured.title}
              className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        </section>

        {/* Opportunities Grid */}
        <section id="classified-opportunities" className="mt-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleListings.map((item) => {
              const isExternalOrAnchor = item.link === '#' || !item.link;
              return (
                <div
                  key={item.title}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs hover:shadow-xl transition-all duration-300"
                >
                  <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                    <MediaImage
                      src={item.image}
                      alt={item.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <span className="absolute top-3 left-3 rounded-full bg-slate-950/70 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-xs">
                      {item.category}
                    </span>
                  </div>
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-cm-blue transition">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-3 flex-1">
                      {item.desc}
                    </p>
                    <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                      {isExternalOrAnchor ? (
                        <button
                          type="button"
                          onClick={() => openEnquiryModal(item)}
                          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-cm-blue hover:text-cm-blue-dark transition"
                        >
                          Send enquiry <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      ) : (
                        <Link
                          to={item.link}
                          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-900 group-hover:text-cm-blue transition"
                        >
                          Explore details <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => openEnquiryModal(item)}
                        className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
                        title="Inquire about this opportunity"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Bottom CTA Banner */}
        <section className="mt-14 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 p-8 sm:p-12 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="max-w-xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              {data.ctaTitle ?? DEFAULTS.ctaTitle}
            </h2>
            <p className="mt-2 text-sm sm:text-base text-slate-300 leading-relaxed">
              {data.ctaSubtitle ?? DEFAULTS.ctaSubtitle}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={openPostModal}
              className="rounded-xl bg-cm-blue hover:bg-cm-blue-dark text-white font-bold text-sm px-6 py-3.5 transition-all shadow-md transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" /> {data.ctaButtonLabel ?? 'Post a Classified'}
            </button>
          </div>
        </section>
      </div>

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
                    {modalMode === 'post' ? 'CampusMart Classifieds' : 'Direct Opportunity Enquiry'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-950">
                  {modalMode === 'post' ? 'Post a Classified / Opportunity' : `Inquire About: ${selectedListing?.title}`}
                </h2>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">
                  {modalMode === 'post'
                    ? 'Submit your institutional opportunity, acquisition, or requirement to be listed.'
                    : 'Fill in your details and our institutional advisor will connect with you.'}
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
                    {modalMode === 'post' ? 'Classified Submitted Successfully!' : 'Enquiry Sent Successfully!'}
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    {modalMode === 'post'
                      ? 'Thank you! Your opportunity details have been received. Our team will review the details and publish the listing shortly.'
                      : 'Thank you! Your enquiry has been forwarded to the opportunity coordinator. We will get back to you shortly.'}
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
                        Work Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@institution.edu"
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-cm-blue focus:ring-1 focus:ring-cm-blue"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Phone Number *
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
                        Institution / Company
                      </label>
                      <input
                        type="text"
                        value={formData.institution}
                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                        placeholder="Institution name"
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-cm-blue focus:ring-1 focus:ring-cm-blue"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Category *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-cm-blue focus:ring-1 focus:ring-cm-blue bg-white"
                      >
                        <option value="Institutions">Institutions (Colleges / Schools)</option>
                        <option value="Funding">Education Funding</option>
                        <option value="Partnerships">Partnership Opportunities</option>
                        <option value="Careers">Careers & Roles</option>
                        <option value="Infrastructure">Infrastructure / Assets</option>
                        <option value="Other">Other Requirement</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        Listing / Opportunity Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="e.g. Engineering College for Acquisition"
                        className="w-full rounded-lg border border-slate-300 p-2.5 text-sm outline-none focus:border-cm-blue focus:ring-1 focus:ring-cm-blue"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      Details & Requirements *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Please provide details regarding location, capacity, financial specifics, timeline, or key expectations..."
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
                      {submitting ? 'Submitting...' : modalMode === 'post' ? 'Submit Classified' : 'Send Enquiry'}
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

export default Classifieds;