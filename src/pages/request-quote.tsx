import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Send, CheckCircle, Package, ArrowLeft } from 'lucide-react';
import api from '@/api/client';
import { getUserSession } from '@/lib/auth-session';
import { useWishlist } from '@/contexts/WishlistContext';

const RequestQuote = () => {
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [prefillNotice, setPrefillNotice] = useState('');

  const { items: wishlistItems } = useWishlist();
  const user = getUserSession();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    collegeName: user?.institution || '',
    authorisedPerson: '',
    address: '',
    pincode: '',
    requirement: '',
    budget: '',
    timeline: '',
  });

  useEffect(() => {
    const productSlug = searchParams.get('product');
    const qty = searchParams.get('qty') || '1';
    const fromWishlist = searchParams.get('fromWishlist') === 'true';

    if (productSlug) {
      api.get(`/products/${encodeURIComponent(productSlug)}`)
        .then(({ data }) => {
          setPrefillNotice(`Inquiry pre-filled for product: ${data.name}`);
          setFormData((prev) => ({
            ...prev,
            requirement: `Product Requested: ${data.name}\nSKU: ${data.sku || 'N/A'}\nQuantity: ${qty}\nUnit Price: ₹${data.price.toLocaleString('en-IN')}\n\nAdditional requirements: `,
          }));
        })
        .catch(() => {
          setPrefillNotice(`Inquiry for product: ${productSlug}`);
          setFormData((prev) => ({
            ...prev,
            requirement: `Product Requested: ${productSlug}\nQuantity: ${qty}\n\nAdditional requirements: `,
          }));
        });
    } else if (fromWishlist) {
      if (wishlistItems.length > 0) {
        setPrefillNotice(`Inquiry pre-filled with ${wishlistItems.length} items from your wishlist.`);
        const itemsList = wishlistItems
          .map((item, idx) => {
            if (item.product) {
              return `${idx + 1}. ${item.product.name} (SKU: ${item.product.sku || 'N/A'}) - ₹${item.product.price.toLocaleString('en-IN')}`;
            }
            return `${idx + 1}. ${item.designTitle || 'Custom Space Design'}`;
          })
          .join('\n');
        setFormData((prev) => ({
          ...prev,
          requirement: `Wishlist Quotation Items:\n${itemsList}\n\nTarget delivery date and custom specifications: `,
        }));
      } else {
        // Fallback fetch if context hasn't loaded yet
        api.get('/wishlist')
          .then(({ data }) => {
            if (Array.isArray(data) && data.length > 0) {
              setPrefillNotice(`Inquiry pre-filled with ${data.length} items from your wishlist.`);
              const itemsList = data
                .map((item: any, idx: number) => {
                  if (item.product) {
                    return `${idx + 1}. ${item.product.name} (SKU: ${item.product.sku || 'N/A'}) - ₹${item.product.price.toLocaleString('en-IN')}`;
                  }
                  return `${idx + 1}. ${item.designTitle || 'Custom Space Design'}`;
                })
                .join('\n');
              setFormData((prev) => ({
                ...prev,
                requirement: `Wishlist Quotation Items:\n${itemsList}\n\nTarget delivery date and custom specifications: `,
              }));
            }
          })
          .catch(() => {});
      }
    }
  }, [searchParams, wishlistItems]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    try {
      await api.post('/contact/quote', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        institution: formData.collegeName,
        pincode: formData.pincode,
        items: `Authorised Person: ${formData.authorisedPerson}\nPincode: ${formData.pincode}\nBudget: ${formData.budget || 'Not specified'}\nTimeline: ${formData.timeline || 'Not specified'}`,
        message: `Address: ${formData.address}\nRequirements:\n${formData.requirement}`,
      });
      setSubmitted(true);
    } catch (err: any) {
      setSubmitError(err.response?.data?.error || 'Failed to submit quote request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <main className="min-h-screen bg-cm-gray flex items-center justify-center py-8">
        <div className="bg-white rounded-2xl p-8 shadow-card max-w-md w-full mx-4 text-center border border-slate-100 animate-in fade-in">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-cm-blue-dark mb-2">Quote Request Submitted!</h2>
          <p className="text-gray-600 mb-6 text-sm">
            Thank you. Our institutional solutions team will review your specifications and contact you with a formal quotation within 24 business hours.
          </p>
          <div className="space-y-3">
            <Link to="/shop" className="btn-primary w-full block text-sm">
              Continue Browsing Products
            </Link>
            <Link to="/my-account?tab=wishlist" className="btn-secondary w-full block text-sm">
              View Wishlist
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cm-gray py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link to="/shop" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-cm-blue transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Catalog
          </Link>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-card border border-slate-100">
          <h1 className="text-2xl sm:text-3xl font-bold text-cm-blue-dark mb-2 text-center">
            Request an Institutional Quote
          </h1>
          <p className="text-gray-500 text-center mb-6 text-xs sm:text-sm">
            Fill in your institution details and equipment requirements to receive official pricing, warranties, and deployment plans.
          </p>

          {prefillNotice && (
            <div className="mb-6 flex items-center gap-3 p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-xs font-semibold text-blue-800">
              <Package className="w-4 h-4 text-blue-600 shrink-0" />
              <span>{prefillNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {submitError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {submitError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">College / University / School Name *</label>
                <input
                  type="text"
                  value={formData.collegeName}
                  onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                  className="form-input text-sm"
                  placeholder="e.g. National Institute of Technology"
                  required
                />
              </div>
              <div>
                <label className="form-label">Authorised Person Designation *</label>
                <input
                  type="text"
                  value={formData.authorisedPerson}
                  onChange={(e) => setFormData({ ...formData, authorisedPerson: e.target.value })}
                  className="form-input text-sm"
                  placeholder="e.g. Principal / Dean / Procurement Head"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Contact Person Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="form-input text-sm"
                  placeholder="Your full name"
                  required
                />
              </div>
              <div>
                <label className="form-label">Official Email Address *</label>
                <input
                  type="email"
                  pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="form-input text-sm"
                  placeholder="procurement@college.edu.in"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  pattern="(?:\+91[ -]?)?[6-9][0-9]{9}"
                  minLength={10}
                  maxLength={14}
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="form-input text-sm"
                  placeholder="+91 98765 43210"
                  required
                />
              </div>
              <div>
                <label className="form-label">Campus Pincode *</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[1-9][0-9]{5}"
                  minLength={6}
                  maxLength={6}
                  value={formData.pincode}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })}
                  className="form-input text-sm font-mono"
                  placeholder="6-digit PIN code"
                  required
                />
              </div>
            </div>

            <div>
              <label className="form-label">Campus Address *</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="form-input text-sm"
                placeholder="Physical campus address, building, city, state"
                required
              />
            </div>

            <div>
              <label className="form-label">Equipment Requirements &amp; Quantities *</label>
              <textarea
                value={formData.requirement}
                onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                className="form-input min-h-[140px] text-sm font-mono text-xs leading-relaxed"
                placeholder="List required items, estimated quantities, room dimensions, or specific brands..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="form-label">Estimated Budget Range</label>
                <select
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="form-input text-sm"
                >
                  <option value="">Select budget range</option>
                  <option value="under-1l">Under ₹1 Lakh</option>
                  <option value="1-5l">₹1 - ₹5 Lakhs</option>
                  <option value="5-10l">₹5 - ₹10 Lakhs</option>
                  <option value="10-50l">₹10 - ₹50 Lakhs</option>
                  <option value="above-50l">Above ₹50 Lakhs</option>
                </select>
              </div>
              <div>
                <label className="form-label">Required Deployment Timeline</label>
                <select
                  value={formData.timeline}
                  onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                  className="form-input text-sm"
                >
                  <option value="">Select timeline</option>
                  <option value="immediate">Immediate (within 2 weeks)</option>
                  <option value="1-3m">1 - 3 Months</option>
                  <option value="3-6m">3 - 6 Months</option>
                  <option value="6-12m">Upcoming Academic Year</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-60"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Submitting Quotation Request...' : 'Submit Institutional Quote Request'}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default RequestQuote;
