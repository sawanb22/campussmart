import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Send, CheckCircle, Package, ArrowLeft, ShieldCheck, RefreshCw, X, Plus, Minus, Trash2 } from 'lucide-react';
import api from '@/api/client';
import { getUserSession } from '@/lib/auth-session';
import { useWishlist } from '@/contexts/WishlistContext';
import { resolveMediaUrl } from '@/lib/media-url';

interface QuoteItemRow {
  id: string;
  wishlistId?: number;
  name: string;
  sku?: string | null;
  category?: string;
  price?: number;
  quantity: number;
  image?: string;
  isDesign?: boolean;
}

const RequestQuote = () => {
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [prefillNotice, setPrefillNotice] = useState('');

  // Interactive Quote Items State
  const [quoteItems, setQuoteItems] = useState<QuoteItemRow[]>([]);
  const quoteItemsInitializedRef = useRef(false);

  // OTP Verification States
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const { items: wishlistItems, updateQuantity: updateWishlistQty } = useWishlist();
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
    const qtyParam = searchParams.get('qty');
    const initialQty = Math.max(1, parseInt(qtyParam || '1', 10) || 1);
    const fromWishlist = searchParams.get('fromWishlist') === 'true';

    if (productSlug) {
      if (quoteItemsInitializedRef.current) return;
      quoteItemsInitializedRef.current = true;
      api.get(`/products/${encodeURIComponent(productSlug)}`)
        .then(({ data }) => {
          setPrefillNotice(`Inquiry pre-filled for product: ${data.name}`);
          setQuoteItems([
            {
              id: `prod-${data.id}`,
              name: data.name,
              sku: data.sku,
              category: data.category?.name,
              price: data.price,
              quantity: initialQty,
              image: resolveMediaUrl(data.imageUrl),
            },
          ]);
        })
        .catch(() => {
          setPrefillNotice(`Inquiry for product: ${productSlug}`);
          setQuoteItems([
            {
              id: `prod-${productSlug}`,
              name: productSlug,
              quantity: initialQty,
            },
          ]);
        });
    } else if (fromWishlist) {
      if (quoteItemsInitializedRef.current) return;
      if (wishlistItems.length > 0) {
        quoteItemsInitializedRef.current = true;
        setPrefillNotice(`Inquiry pre-filled with ${wishlistItems.length} items from your wishlist.`);
        setQuoteItems(
          wishlistItems.map((item) => ({
            id: `wl-${item.id}`,
            wishlistId: item.id,
            name: item.product?.name || item.designTitle || 'Custom Space Design',
            sku: item.product?.sku,
            category: item.product?.category?.name || item.pageSlug || undefined,
            price: item.product?.price,
            quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
            image: resolveMediaUrl(item.product?.imageUrl || item.designImage || undefined),
            isDesign: !item.product,
          }))
        );
      } else {
        // Fallback fetch if context hasn't loaded yet
        api.get('/wishlist')
          .then(({ data }) => {
            if (quoteItemsInitializedRef.current) return;
            if (Array.isArray(data) && data.length > 0) {
              quoteItemsInitializedRef.current = true;
              setPrefillNotice(`Inquiry pre-filled with ${data.length} items from your wishlist.`);
              setQuoteItems(
                data.map((item: any) => ({
                  id: `wl-${item.id}`,
                  wishlistId: item.id,
                  name: item.product?.name || item.designTitle || 'Custom Space Design',
                  sku: item.product?.sku,
                  category: item.product?.category?.name || item.pageSlug || undefined,
                  price: item.product?.price,
                  quantity: item.quantity && item.quantity > 0 ? item.quantity : 1,
                  image: resolveMediaUrl(item.product?.imageUrl || item.designImage || undefined),
                  isDesign: !item.product,
                }))
              );
            }
          })
          .catch(() => {});
      }
    }
  }, [searchParams, wishlistItems]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleUpdateItemQuantity = (id: string, newQty: number) => {
    const validQty = Math.max(1, Math.min(10000, newQty || 1));
    setQuoteItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          if (item.wishlistId) {
            updateWishlistQty(item.wishlistId, validQty);
          }
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const handleRemoveItem = (id: string) => {
    setQuoteItems((prev) => prev.filter((item) => item.id !== id));
  };

  const totalUnits = quoteItems.reduce((acc, item) => acc + item.quantity, 0);

  const executeQuoteSubmission = async (otp?: string) => {
    setSubmitting(true);
    setSubmitError('');
    try {
      const itemsListSummary = quoteItems.length > 0
        ? quoteItems
            .map((item, idx) => {
              const skuPart = item.sku ? ` (SKU: ${item.sku})` : '';
              const pricePart = item.price ? ` [Est. ₹${item.price.toLocaleString('en-IN')}/unit]` : '';
              const typePart = item.isDesign ? ' [Custom Space Design]' : '';
              return `${idx + 1}. ${item.quantity} unit${item.quantity === 1 ? '' : 's'} × ${item.name}${skuPart}${typePart}${pricePart}`;
            })
            .join('\n')
        : 'General Institutional Inquiry (No specific items preselected)';

      const itemsPayload = [
        `Authorised Person: ${formData.authorisedPerson || 'Not specified'}`,
        `Campus Pincode: ${formData.pincode}`,
        `Budget Range: ${formData.budget || 'Not specified'}`,
        `Deployment Timeline: ${formData.timeline || 'Not specified'}`,
        `\nRequested Quotation Items (${quoteItems.length} items, ${totalUnits} total units):`,
        itemsListSummary,
      ].join('\n');

      const messagePayload = [
        `Campus Address: ${formData.address}`,
        formData.requirement ? `\nAdditional Requirements & Specifications:\n${formData.requirement}` : '',
      ].filter(Boolean).join('\n');

      await api.post('/contact/quote', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        institution: formData.collegeName,
        pincode: formData.pincode,
        items: itemsPayload,
        message: messagePayload,
        otpCode: otp,
      });
      setSubmitted(true);
      setShowOtpModal(false);
    } catch (err: any) {
      const msg = err.response?.data?.error || 'Failed to submit quote request. Please try again.';
      if (otp) {
        setOtpError(msg);
      } else {
        setSubmitError(msg);
      }
      throw err;
    } finally {
      setSubmitting(false);
      setOtpVerifying(false);
    }
  };

  const triggerSendOtp = async () => {
    setOtpSending(true);
    setOtpError('');
    try {
      await api.post('/contact/send-quote-otp', { email: formData.email.trim() });
      setResendCooldown(45);
    } catch (err: any) {
      setOtpError(err.response?.data?.error || 'Failed to send verification code. Please check your email.');
    } finally {
      setOtpSending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const isVerifiedUser = Boolean(
      user && user.email && user.email.toLowerCase() === formData.email.trim().toLowerCase()
    );

    if (isVerifiedUser) {
      // Logged-in verified user bypasses OTP requirement
      await executeQuoteSubmission();
      return;
    }

    // Unauthenticated guest user requires OTP verification
    setShowOtpModal(true);
    setOtpCode('');
    await triggerSendOtp();
  };

  const handleVerifyOtpAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      setOtpError('Please enter the 6-digit verification code.');
      return;
    }
    setOtpVerifying(true);
    setOtpError('');
    try {
      await executeQuoteSubmission(otpCode.trim());
    } catch {
      // Error handled in executeQuoteSubmission
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
                  pattern="(?:\+?91[\s\-]?)?0?[0-9\s\-]{10,14}"
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

            {quoteItems.length > 0 && (
              <div className="rounded-2xl border border-blue-100 bg-slate-50/80 p-4 sm:p-5 shadow-2xs">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-cm-blue" />
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                      Quotation Items &amp; Required Units ({quoteItems.length})
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 bg-blue-100 text-cm-blue rounded-full">
                    {totalUnits} Total Unit{totalUnits === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="space-y-3">
                  {quoteItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-xl p-3 border border-slate-200/90 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            onError={(e) => {
                              const fallback = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=400&q=80';
                              if (e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
                            }}
                            className="w-12 h-12 object-cover rounded-lg bg-slate-50 border border-slate-100 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-900 truncate" title={item.name}>
                            {item.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
                            {item.sku && <span>SKU: {item.sku}</span>}
                            {item.price && <span className="font-semibold text-slate-700">₹{item.price.toLocaleString('en-IN')}/unit</span>}
                            {item.isDesign && <span className="text-purple-600 font-semibold">Custom Space Design</span>}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-600">Units:</span>
                          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-l-lg transition"
                              title="Decrease units"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={10000}
                              value={item.quantity}
                              onChange={(e) => handleUpdateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                              className="w-12 text-center text-xs font-bold text-slate-900 border-x border-slate-200 py-1 outline-none focus:bg-blue-50/50"
                            />
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-r-lg transition"
                              title="Increase units"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                          title="Exclude item from this quote"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="form-label">
                {quoteItems.length > 0 ? 'Additional Requirements & Custom Specifications (Optional)' : 'Equipment Requirements & Quantities *'}
              </label>
              <textarea
                value={formData.requirement}
                onChange={(e) => setFormData({ ...formData, requirement: e.target.value })}
                className="form-input min-h-[120px] text-sm font-sans text-xs leading-relaxed"
                placeholder={
                  quoteItems.length > 0
                    ? 'Specify any customization details, preferred brands, dimensions, delivery dates, or institutional guidelines...'
                    : 'List required items, estimated quantities, room dimensions, or specific brands...'
                }
                required={quoteItems.length === 0}
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

      {/* Institutional Quote OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl max-w-md w-full border border-slate-100 relative">
            <button
              type="button"
              onClick={() => setShowOtpModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-cm-blue flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <h3 className="text-xl font-bold text-slate-900 text-center mb-1">
              Verify Official Email
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 text-center mb-6 leading-relaxed">
              To verify and protect institutional requests, a 6-digit confirmation code has been sent to{' '}
              <strong className="text-slate-800 break-all">{formData.email}</strong>
            </p>

            {otpError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center">
                {otpError}
              </div>
            )}

            <form onSubmit={handleVerifyOtpAndSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 text-center">
                  Enter 6-Digit Code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    if (otpError) setOtpError('');
                  }}
                  className="w-full text-center text-2xl font-mono font-bold tracking-[0.4em] py-3 px-4 border border-slate-200 rounded-xl focus:border-cm-blue focus:ring-2 focus:ring-cm-blue/20 outline-none transition-all"
                  placeholder="······"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={otpVerifying || otpCode.length < 4}
                className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {otpVerifying ? 'Verifying Code & Submitting...' : 'Verify & Submit Quotation'}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  disabled={resendCooldown > 0 || otpSending}
                  onClick={triggerSendOtp}
                  className="text-cm-blue hover:underline font-semibold disabled:text-slate-400 disabled:no-underline flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${otpSending ? 'animate-spin' : ''}`} />
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowOtpModal(false)}
                  className="text-slate-500 hover:text-slate-700 font-semibold"
                >
                  Edit Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
};

export default RequestQuote;
