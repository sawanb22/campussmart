import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { Building2, ArrowRight, DollarSign, Handshake, BriefcaseBusiness, Send, X, type LucideIcon } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import api from '@/api/client';

interface Listing { title: string; description?: string; desc?: string; href?: string; link: string; icon: LucideIcon; }

const EMPTY_ENQUIRY = { name: '', email: '', phone: '', message: '' };

const Classifieds = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { data } = usePageData('classifieds');
  const [enquiryListing, setEnquiryListing] = useState<Listing | null>(null);
  const [enquiryForm, setEnquiryForm] = useState(EMPTY_ENQUIRY);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
    });
    return () => ctx.revert();
  }, []);

  const defaultListings: Listing[] = [
    { title: 'Colleges for Sale', icon: Building2, desc: 'Browse educational institutions available for acquisition', link: '/colleges-universities-for-sale' },
    { title: 'Education Funding', icon: DollarSign, desc: 'Explore funding options for your institution', link: '#' },
    { title: 'Partnership Opportunities', icon: Handshake, desc: 'Find partnership opportunities with running colleges', link: '/partner-with-colleges' },
  ];
  const cmsListings = data.cards?.length ? data.cards : defaultListings;
  const listingsWithJobs = cmsListings.some((item: any) => item.title === 'Job Openings')
    ? cmsListings
    : [...cmsListings, { title: 'Job Openings', desc: 'Apply for current opportunities with our team', link: '/job-openings' }];
  const listings: Listing[] = listingsWithJobs.map((item: any, index: number) => ({
    ...item,
    icon: [Building2, DollarSign, Handshake, BriefcaseBusiness][index % 4],
    desc: item.description ?? item.desc,
    link: item.href ?? item.link ?? '#',
  }));

  const openEnquiry = (listing: Listing) => {
    setEnquiryListing(listing);
    setEnquiryForm({ ...EMPTY_ENQUIRY, message: `I'm interested in "${listing.title}". Please share more details.` });
    setSubmitted(false);
    setFormError('');
  };

  const closeEnquiry = () => setEnquiryListing(null);

  const submitEnquiry = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!enquiryListing) return;
    setSubmitting(true);
    setFormError('');
    try {
      await api.post('/contact', {
        name: enquiryForm.name,
        email: enquiryForm.email,
        phone: enquiryForm.phone,
        subject: `Classifieds enquiry: ${enquiryListing.title}`,
        message: enquiryForm.message,
      });
      setSubmitted(true);
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to send your enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-white">
      <section className="py-4 sm:py-6 md:py-8 px-4 sm:px-6 lg:px-8">
        <div ref={heroRef} className="bg-gradient-to-r from-cm-blue to-blue-700 rounded-2xl py-8 sm:py-10 md:py-12 px-6 sm:px-8 lg:px-12 max-w-5xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">{data.heroTitle ?? 'Classifieds'}</h1>
            <p className="text-lg sm:text-xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              {data.heroSubtitle ?? 'Explore opportunities in the education sector. Colleges for sale, funding options, and partnerships.'}
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {listings.map((item) => {
              const hasRealLink = Boolean(item.link) && item.link !== '#';
              const cardBody = (
                <>
                  <item.icon className="w-16 h-16 text-cm-blue mb-6" />
                  <h3 className="text-xl md:text-2xl font-bold text-cm-blue-dark mb-3">{item.title}</h3>
                  <p className="text-gray-600 text-base mb-6">{item.desc}</p>
                  <span className="inline-flex items-center gap-2 text-cm-blue font-bold text-sm hover:gap-3 transition-all">
                    Explore <ArrowRight className="w-5 h-5" />
                  </span>
                </>
              );

              return hasRealLink ? (
                <Link key={item.title} to={item.link} className="bg-white rounded-2xl p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 border border-gray-100">
                  {cardBody}
                </Link>
              ) : (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => openEnquiry(item)}
                  className="bg-white rounded-2xl p-8 md:p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 border border-gray-100 text-left"
                >
                  {cardBody}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {enquiryListing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <h2 className="text-lg font-bold text-slate-950">{enquiryListing.title}</h2>
                <p className="mt-1 text-sm text-slate-500">Tell us a bit about what you're looking for and our team will get back to you.</p>
              </div>
              <button type="button" onClick={closeEnquiry} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {submitted ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
                  Thank you. Your enquiry has been sent — our team will get back to you soon.
                </div>
              ) : (
                <form onSubmit={submitEnquiry} className="space-y-4">
                  {formError && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{formError}</div>}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="form-label">Full Name *</label>
                      <input className="form-input" required value={enquiryForm.name} onChange={(event) => setEnquiryForm({ ...enquiryForm, name: event.target.value })} />
                    </div>
                    <div>
                      <label className="form-label">Email *</label>
                      <input type="email" className="form-input" required value={enquiryForm.email} onChange={(event) => setEnquiryForm({ ...enquiryForm, email: event.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Phone *</label>
                    <input type="tel" pattern="(?:\+91[ -]?)?[6-9][0-9]{9}" className="form-input" required value={enquiryForm.phone} onChange={(event) => setEnquiryForm({ ...enquiryForm, phone: event.target.value })} placeholder="+91 98765 43210" />
                  </div>
                  <div>
                    <label className="form-label">Message *</label>
                    <textarea className="form-input min-h-[110px]" required value={enquiryForm.message} onChange={(event) => setEnquiryForm({ ...enquiryForm, message: event.target.value })} />
                  </div>
                  <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded bg-cm-blue px-4 py-3 font-semibold text-white hover:bg-cm-blue-dark disabled:opacity-60">
                    <Send className="h-4 w-4" />
                    {submitting ? 'Sending...' : 'Send Enquiry'}
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

export default Classifieds;
