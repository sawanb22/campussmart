import { useMemo, useState, type MouseEvent } from 'react';
import { Grid2X2, List, Mail, MapPin, Phone, Search, Star, Send, X, FileText, Download, Lock } from 'lucide-react';
import { usePageData } from '@/hooks/usePageData';
import api from '@/api/client';
import LoginPromptModal from '@/components/login-prompt-modal';
import MediaImage from '@/components/ui/media-image';
import { resolveMediaUrl } from '@/lib/media-url';

type Region = 'North' | 'South' | 'East' | 'West';

type Listing = {
  title: string;
  description: string;
  image?: string;
  location?: string;
  region?: Region;
  rating?: string;
  sales?: string;
  margin?: string;
  askingPrice?: string;
  premium?: boolean;
  ndaUrl?: string;
  mandateUrl?: string;
};

const REGIONS: Region[] = ['North', 'South', 'East', 'West'];

const resolveImage = (value?: string) => resolveMediaUrl(value);

const DEFAULTS = {
  heroTitle: 'Businesses for Sale and Investment',
  heroSubtitle: 'Showing businesses for sale and investment. Buy or invest in a business listed by direct business owners and business brokers.',
  filterLabel: 'cbse schools',
  cards: [
  {
    title: 'School for Sale in Bahraich, India',
    description: 'CBSE school with 800+ students, day and boarding facility for sale in Bahraich. The school encompasses a total area of 87,000 square feet and includes approximately 40 rooms, fully equipped science and computer labs.',
    location: 'Bahraich', region: 'North', rating: '6.8', sales: 'INR 2.6 crore', margin: '40 %', askingPrice: 'INR 20 Cr', premium: true,
    image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Playschool Seeking Loan in Haryana, India',
    description: 'Education society in Haryana with 5 CBSE schools and 70 playschools. This is an educational society with primary and play schools seeking growth funding.',
    location: 'Haryana', region: 'North', rating: '6.8', sales: 'INR 30 crore', margin: '25 %', askingPrice: 'INR 5 Cr at 15%', premium: true,
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'School for Sale in Thiruvananthapuram, India',
    description: 'CBSE-affiliated school with 400+ students and owned facilities. Located in Thiruvananthapuram, this school offers quality education from a well-established campus.',
    location: 'Thiruvananthapuram', region: 'South', rating: '6.2', sales: 'INR 1.6 crore', margin: '10 - 20 %', askingPrice: 'INR 8 Cr',
    image: 'https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'Residential School Opportunity in Karnataka',
    description: 'Established residential school with modern classrooms, hostel facilities, and a growing student community.',
    location: 'Karnataka', region: 'South', rating: '6.5', sales: 'INR 12 crore', margin: '30 %', askingPrice: 'INR 18 Cr',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'International School Investment Opportunity',
    description: 'Premium school campus with sports facilities, digital classrooms, and strong long-term investment potential.',
    location: 'Pune', region: 'West', rating: '7.1', sales: 'INR 22 crore', margin: '35 %', askingPrice: 'INR 32 Cr',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=700&q=80',
  },
  {
    title: 'College Campus Available for Partnership',
    description: 'Fully operational higher education campus with laboratories, library infrastructure, and flexible partnership options.',
    location: 'Delhi NCR', region: 'North', rating: '6.7', sales: 'INR 40 crore', margin: '28 %', askingPrice: 'INR 55 Cr',
    image: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?auto=format&fit=crop&w=700&q=80',
  },
  ] as Listing[],
};

const EMPTY_FORM = { name: '', email: '', phone: '', institution: '', message: '' };

export default function CollegesUniversitiesForSale() {
  const { data } = usePageData('colleges-universities-for-sale');
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState<'relevance' | 'newest' | 'price'>('relevance');
  const [selectedRegion, setSelectedRegion] = useState<Region | 'All'>('All');
  const listings: Listing[] = Array.isArray(data.cards) ? data.cards : DEFAULTS.cards;
  const [contactListing, setContactListing] = useState<Listing | null>(null);
  const [dossierListing, setDossierListing] = useState<Listing | null>(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const isLoggedIn = Boolean(localStorage.getItem('cm_token'));

  const handleDownloadClick = (e: MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setShowLoginPrompt(true);
    }
  };

  const ndaUrl = resolveImage(data.ndaUrl);
  const mandateUrl = resolveImage(data.mandateUrl);

  const searchMatches = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query
      ? listings.filter((item) => `${item.title} ${item.description} ${item.location ?? ''}`.toLowerCase().includes(query))
      : listings;
  }, [listings, search]);

  const regionCounts = useMemo(() => {
    const counts: Record<Region | 'All', number> = { All: searchMatches.length, North: 0, South: 0, East: 0, West: 0 };
    searchMatches.forEach((item) => {
      if (item.region) counts[item.region] += 1;
    });
    return counts;
  }, [searchMatches]);

  const filteredListings = useMemo(() => {
    const matches = selectedRegion === 'All' ? searchMatches : searchMatches.filter((item) => item.region === selectedRegion);
    if (sort === 'relevance') return matches;
    const sorted = [...matches];
    if (sort === 'newest') {
      sorted.reverse();
    } else if (sort === 'price') {
      const parsePrice = (value?: string) => {
        const match = value?.replace(/,/g, '').match(/[\d.]+/);
        return match ? parseFloat(match[0]) : Infinity;
      };
      sorted.sort((a, b) => parsePrice(a.askingPrice) - parsePrice(b.askingPrice));
    }
    return sorted;
  }, [searchMatches, selectedRegion, sort]);

  const openContactForm = (listing: Listing) => {
    setContactListing(listing);
    setFormData({ ...EMPTY_FORM, message: `I'm interested in "${listing.title}". Please share more details.` });
    setSubmitted(false);
    setFormError('');
  };

  const closeContactForm = () => setContactListing(null);

  const submitContactForm = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!contactListing) return;
    setSubmitting(true);
    setFormError('');
    try {
      await api.post('/contact', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        institution: formData.institution,
        subject: `Business enquiry: ${contactListing.title}`,
        message: formData.message,
      });
      setSubmitted(true);
    } catch (err: any) {
      setFormError(err.response?.data?.error || 'Failed to send your enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-800">
      <LoginPromptModal
        open={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        icon={Lock}
        eyebrow="Registered users only"
        title="Register to download NDA & Mandate"
        description="Create a free account to download the Non-Disclosure Agreement and Mandate documents."
      />

      <section className="border-b border-slate-200 bg-white px-4 py-5 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-[1320px]">
          <div className="mb-7 flex items-center gap-3 text-sm">
            <a href="/" className="font-medium text-[#087ea4] hover:underline">Home</a>
            <span className="text-slate-300">/</span>
            <a href="/classifieds" className="font-medium text-[#087ea4] hover:underline">Classifieds</a>
            <span className="text-slate-300">/</span>
            <span className="text-slate-500">Colleges / Universities for Sale</span>
          </div>
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:gap-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{data.heroTitle ?? 'Businesses for Sale and Investment'}</h1>
              <p className="mt-4 max-w-4xl text-base leading-7 text-slate-500">{data.heroSubtitle ?? 'Showing businesses for sale and investment. Buy or invest in a business listed by direct business owners and business brokers.'}</p>
            </div>

            <div className="flex shrink-0 flex-col gap-2 sm:items-end">
              <div className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50/60 px-2.5 py-1.5">
                <FileText className="h-3.5 w-3.5 shrink-0 text-[#087ea4]" />
                <span className="text-xs font-semibold text-slate-700" title="Non-Disclosure Agreement">NDA</span>
                {ndaUrl ? (
                  <a
                    href={ndaUrl}
                    onClick={handleDownloadClick}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded bg-[#087ea4] px-2 py-1 text-[10px] font-semibold text-white hover:bg-[#066e8f]"
                  >
                    {isLoggedIn ? <Download className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    Download Here
                  </a>
                ) : (
                  <span className="text-[10px] font-medium text-slate-400">Coming soon</span>
                )}
              </div>

              <div className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50/60 px-2.5 py-1.5">
                <FileText className="h-3.5 w-3.5 shrink-0 text-[#087ea4]" />
                <span className="text-xs font-semibold text-slate-700">Mandate</span>
                {mandateUrl ? (
                  <a
                    href={mandateUrl}
                    onClick={handleDownloadClick}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded bg-[#087ea4] px-2 py-1 text-[10px] font-semibold text-white hover:bg-[#066e8f]"
                  >
                    {isLoggedIn ? <Download className="h-3 w-3" /> : <Lock className="h-3 w-3" />}
                    Download Here
                  </a>
                ) : (
                  <span className="text-[10px] font-medium text-slate-400">Coming soon</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1320px] px-4 py-5 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
          <aside className="shrink-0 lg:w-60">
            <div className="rounded border border-slate-200 bg-white p-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-700">
                <MapPin className="h-4 w-4 text-[#087ea4]" /> Region
              </h3>
              <ul className="space-y-1">
                {REGIONS.map((region) => (
                  <li key={region}>
                    <button
                      type="button"
                      onClick={() => setSelectedRegion(region)}
                      className={`flex w-full items-center justify-between rounded px-3 py-2 text-sm font-medium transition-colors ${
                        selectedRegion === region
                          ? 'bg-[#087ea4] text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{region + ' India'}</span>
                      <span className={`text-xs ${selectedRegion === region ? 'text-white/80' : 'text-slate-400'}`}>{regionCounts[region]}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600">
                  <Search className="h-4 w-4" />
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={data.filterLabel ?? 'cbse schools'} className="w-40 bg-transparent outline-none placeholder:text-slate-500" />
                  {search && <button type="button" onClick={() => setSearch('')} aria-label="Clear search">×</button>}
                </label>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex overflow-hidden rounded border border-slate-300 bg-white">
                  <button type="button" onClick={() => setView('grid')} className={`p-2 ${view === 'grid' ? 'bg-[#087ea4] text-white' : 'text-slate-700'}`} title="Grid view"><Grid2X2 className="h-4 w-4" /></button>
                  <button type="button" onClick={() => setView('list')} className={`p-2 ${view === 'list' ? 'bg-[#087ea4] text-white' : 'text-slate-700'}`} title="List view"><List className="h-4 w-4" /></button>
                </div>
                <select
                  className="rounded border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-600 outline-none"
                  value={sort}
                  onChange={(event) => setSort(event.target.value as 'relevance' | 'newest' | 'price')}
                  aria-label="Sort listings"
                >
                  <option value="relevance">Sort By</option>
                  <option value="newest">Newest</option>
                  <option value="price">Price</option>
                </select>
              </div>
            </div>

            <div className={`mt-8 grid gap-8 ${view === 'grid' ? 'md:grid-cols-2 xl:grid-cols-2' : 'grid-cols-1'}`}>
              {filteredListings.map((listing, index) => (
                <article key={listing.title} className={`relative border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md ${view === 'list' ? 'flex gap-5 p-4' : 'p-6'}`}>
                  {(listing.premium || index < 2) && <span className="absolute right-0 top-0 bg-emerald-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">Premium</span>}
                  {listing.image && <MediaImage src={listing.image} alt={listing.title} className={`${view === 'list' ? 'h-32 w-44' : 'mb-5 h-40 w-full'} object-cover`} />}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#087ea4]">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        {listing.region ? `${listing.region} India` : 'Verified Institution'}
                      </div>
                      <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-red-500 inline" />
                        {listing.location ?? 'India'}
                      </span>
                    </div>

                    <h2
                      className="text-lg sm:text-xl font-bold leading-snug text-slate-950 mb-2 cursor-pointer hover:text-[#087ea4] transition-colors"
                      onClick={() => setDossierListing(listing)}
                      title="Click to view full asset dossier"
                    >
                      {listing.title}
                    </h2>

                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-500">
                      <span><Mail className="mr-1 inline h-3.5 w-3.5 text-[#087ea4]" />Email Verified</span>
                      <span><Phone className="mr-1 inline h-3.5 w-3.5 text-emerald-600" />Direct Mandate</span>
                      <span className="text-amber-600 font-semibold flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-current" />{listing.rating ?? '6.8'} Rating</span>
                    </div>

                    <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">{listing.description}</p>

                    {(listing.ndaUrl || listing.mandateUrl) && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {listing.ndaUrl && (
                          <a
                            href={resolveImage(listing.ndaUrl)}
                            onClick={handleDownloadClick}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded bg-[#087ea4]/10 px-2.5 py-1 text-xs font-semibold text-[#087ea4] hover:bg-[#087ea4]/20 transition"
                          >
                            <FileText className="h-3 w-3" /> NDA
                          </a>
                        )}
                        {listing.mandateUrl && (
                          <a
                            href={resolveImage(listing.mandateUrl)}
                            onClick={handleDownloadClick}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 rounded bg-[#087ea4]/10 px-2.5 py-1 text-xs font-semibold text-[#087ea4] hover:bg-[#087ea4]/20 transition"
                          >
                            <FileText className="h-3 w-3" /> Mandate
                          </a>
                        )}
                      </div>
                    )}
                    <div className="mt-4 border-t border-slate-100 pt-3 text-sm">
                      <div className="flex justify-between"><span className="text-slate-500">Run Rate Sales</span><strong>{listing.sales ?? 'Price on request'}</strong></div>
                      <div className="mt-2 flex justify-between"><span className="text-slate-500">EBITDA Margin</span><strong className="text-emerald-600 font-bold">{listing.margin ?? '25 %'}</strong></div>
                      <div className="mt-2 flex justify-between"><span className="text-slate-500">Asking Price</span><strong className="text-[#087ea4] font-bold">{listing.askingPrice ?? 'Contact us'}</strong></div>
                    </div>
                    <div className="mt-5 grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => setDossierListing(listing)}
                        className="rounded-lg border border-[#087ea4] bg-white px-3 py-2.5 text-xs sm:text-sm font-bold text-[#087ea4] hover:bg-[#087ea4]/5 transition text-center cursor-pointer shadow-xs"
                      >
                        View Dossier
                      </button>
                      <button
                        type="button"
                        onClick={() => openContactForm(listing)}
                        className="rounded-lg bg-[#e6bb00] px-3 py-2.5 text-xs sm:text-sm font-bold text-slate-950 hover:bg-[#d5ab00] transition text-center cursor-pointer shadow-xs"
                      >
                        Contact Business
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              {filteredListings.length === 0 && <div className="col-span-full py-20 text-center text-slate-500">No listings found.</div>}
            </div>
          </div>
        </div>
      </section>

      {contactListing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 p-6">
              <div>
                <h2 className="text-lg font-bold text-slate-950">Contact Business</h2>
                <p className="mt-1 text-sm text-slate-500">{contactListing.title}</p>
              </div>
              <button type="button" onClick={closeContactForm} aria-label="Close" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {submitted ? (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-green-700">
                  Thank you. Your enquiry has been sent — the listing owner will get back to you soon.
                </div>
              ) : (
                <form onSubmit={submitContactForm} className="space-y-4">
                  {formError && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">{formError}</div>}
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
                      <input type="tel" pattern="(?:\+91[ -]?)?[6-9][0-9]{9}" className="form-input" required value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} placeholder="+91 98765 43210" />
                    </div>
                    <div>
                      <label className="form-label">Institution / Company</label>
                      <input className="form-input" value={formData.institution} onChange={(event) => setFormData({ ...formData, institution: event.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Message *</label>
                    <textarea className="form-input min-h-[110px]" required value={formData.message} onChange={(event) => setFormData({ ...formData, message: event.target.value })} />
                  </div>
                  <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded bg-[#e6bb00] px-4 py-3 font-semibold text-slate-950 hover:bg-[#d5ab00] disabled:opacity-60">
                    <Send className="h-4 w-4" />
                    {submitting ? 'Sending...' : 'Send Enquiry'}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Institutional Dossier Modal */}
      {dossierListing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm overflow-y-auto" role="dialog" aria-modal="true">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl my-8 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 p-5 sm:p-6 bg-slate-50/80">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#087ea4]">
                    {dossierListing.region ? `${dossierListing.region} India` : 'Verified Institution'} &bull; {dossierListing.location ?? 'India'}
                  </span>
                  {dossierListing.premium && (
                    <span className="bg-emerald-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded">Premium</span>
                  )}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-950 leading-tight">
                  {dossierListing.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDossierListing(null)}
                aria-label="Close"
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-200/80 hover:text-slate-700 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
              {dossierListing.image && (
                <div className="rounded-xl overflow-hidden h-56 sm:h-72 w-full bg-slate-100 shadow-inner">
                  <MediaImage src={dossierListing.image} alt={dossierListing.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Executive Summary & Overview</h3>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {dossierListing.description}
                </p>
              </div>

              {/* Financials & Key Stats Grid */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Institutional Valuation & Metrics</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase">Run Rate Sales</span>
                    <strong className="block text-sm sm:text-base font-bold text-slate-900 mt-1">{dossierListing.sales ?? 'On request'}</strong>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase">EBITDA Margin</span>
                    <strong className="block text-sm sm:text-base font-bold text-emerald-600 mt-1">{dossierListing.margin ?? '25 %'}</strong>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase">Asking Price</span>
                    <strong className="block text-sm sm:text-base font-bold text-[#087ea4] mt-1">{dossierListing.askingPrice ?? 'Contact us'}</strong>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-center">
                    <span className="block text-[11px] font-semibold text-slate-400 uppercase">Asset Rating</span>
                    <strong className="block text-sm sm:text-base font-bold text-amber-500 mt-1 flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 fill-current" />{dossierListing.rating ?? '6.8'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Legal Documents */}
              {(dossierListing.ndaUrl || dossierListing.mandateUrl) && (
                <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100/80">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#087ea4] mb-2.5">Confidential Due Diligence Documents</h3>
                  <div className="flex flex-wrap gap-3">
                    {dossierListing.ndaUrl && (
                      <a
                        href={resolveImage(dossierListing.ndaUrl)}
                        onClick={handleDownloadClick}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-white border border-[#087ea4]/30 px-3.5 py-2 text-xs font-bold text-[#087ea4] hover:bg-[#087ea4] hover:text-white transition shadow-xs"
                      >
                        <FileText className="h-4 w-4" /> Download NDA Document
                      </a>
                    )}
                    {dossierListing.mandateUrl && (
                      <a
                        href={resolveImage(dossierListing.mandateUrl)}
                        onClick={handleDownloadClick}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 rounded-lg bg-white border border-[#087ea4]/30 px-3.5 py-2 text-xs font-bold text-[#087ea4] hover:bg-[#087ea4] hover:text-white transition shadow-xs"
                      >
                        <FileText className="h-4 w-4" /> Download Mandate Document
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setDossierListing(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = dossierListing;
                  setDossierListing(null);
                  openContactForm(target);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-[#e6bb00] hover:bg-[#d5ab00] text-slate-950 font-bold text-sm transition shadow-sm"
              >
                Contact Business Regarding this Asset
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
