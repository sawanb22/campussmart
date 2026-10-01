import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Phone, Building2, ArrowRight, CheckCircle, Shield } from 'lucide-react';
import api from '@/api/client';
import { setUserSession } from '@/lib/auth-session';

type Step = 'form' | 'otp' | 'done';

const Registration = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [step, setStep] = useState<Step>('form');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', institution: '', pincode: '',
  });

  useEffect(() => {
    const paramStep = searchParams.get('step');
    const paramEmail = searchParams.get('email');
    const stateEmail = location.state?.email;
    const statePassword = location.state?.password;
    const stateStep = location.state?.step;

    const emailToUse = paramEmail || stateEmail;
    if (emailToUse) {
      setFormData(prev => ({
        ...prev,
        email: emailToUse,
        password: statePassword || prev.password,
      }));
    }

    if (paramStep === 'otp' || stateStep === 'otp') {
      setStep('otp');
    }
  }, [searchParams, location.state]);

  const set = (k: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(p => ({ ...p, [k]: e.target.value }));

  // Step 1: submit form → create account → send OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      // Create or update unverified account first
      await api.post('/auth/register', formData);
      // Then send OTP for email verification
      await api.post('/auth/send-otp', { email: formData.email, purpose: 'verify' });
      setStep('otp');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
    }
    setSending(false);
  };

  // Step 2: verify OTP → log in
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/auth/verify-otp', { email: formData.email, code: otp, purpose: 'verify' });

      // If password is available (from form submission or passed from login state), auto-login
      if (formData.password) {
        const { data } = await api.post('/auth/login', {
          email: formData.email,
          password: formData.password,
        });
        setUserSession(data.accessToken, data.user);
        setStep('done');
        setTimeout(() => navigate(data.user?.role === 'admin' ? '/admin/dashboard' : '/my-account'), 1500);
      } else {
        // Password not in memory (e.g. user refreshed OTP screen) -> send to login with verified notice
        setStep('done');
        setTimeout(() => navigate('/login?verified=true'), 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid OTP. Please try again.');
    }
    setLoading(false);
  };

  const resendOtp = async () => {
    setError('');
    setSending(true);
    try {
      await api.post('/auth/send-otp', { email: formData.email, purpose: 'verify' });
    } catch {
      setError('Failed to resend OTP.');
    }
    setSending(false);
  };

  return (
    <main className="min-h-screen bg-[#f0f4f8] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="text-3xl font-poppins font-bold text-[#0a2463]">
              <span className="block leading-none">CAMPUS</span>
              <span className="block leading-none text-sm tracking-[0.3em]">MART</span>
            </div>
          </Link>
        </div>

        {/* ── STEP 1: Registration Form ── */}
        {step === 'form' && (
          <div className="bg-white rounded-lg shadow-sm w-full border border-gray-100 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h1>
            <p className="text-sm text-gray-500 mb-6">Join CampusMart to manage your campus needs</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input required className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                    placeholder="e.g. Priya Sharma" value={formData.name} onChange={set('name')} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input required type="email" pattern="[^\s@]+@[^\s@]+\.[^\s@]+" className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                    placeholder="you@example.com" value={formData.email} onChange={set('email')} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input required type={showPassword ? 'text' : 'password'} minLength={6}
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                    placeholder="Min. 6 characters" value={formData.password} onChange={set('password')} />
                  <button type="button" onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="tel" pattern="(?:\+91[ -]?)?[6-9][0-9]{9}" minLength={10} maxLength={14} className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                      placeholder="9876543210" value={formData.phone} onChange={set('phone')} />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-semibold text-gray-700">Pincode</label>
                  <input type="text" inputMode="numeric" pattern="[1-9][0-9]{5}" minLength={6} maxLength={6} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="6-digit pincode" value={formData.pincode} onChange={set('pincode')} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Institution</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    placeholder="College name" value={formData.institution} onChange={set('institution')} />
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
              )}

              <button type="submit" disabled={sending}
                className="w-full flex items-center justify-center gap-2 bg-[#0a2463] text-white font-bold py-3 rounded-xl hover:bg-[#1a3a8f] transition-colors disabled:opacity-60 mt-2">
                {sending ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Sending OTP…</>
                ) : (
                  <>Create Account <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-[#0a2463] hover:underline">Sign in</Link>
            </p>
          </div>
        )}

        {/* ── STEP 2: OTP Verification ── */}
        {step === 'otp' && (
          <div className="bg-white rounded-lg shadow-sm w-full border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">Check your email</h2>
            <p className="text-sm text-gray-500 mb-2">We sent a 6-digit verification code to</p>
            <p className="font-semibold text-gray-900 mb-6">{formData.email}</p>
            <p className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Please check your Spam or Junk folder if you don't see the OTP in your inbox.
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                required maxLength={6} minLength={6} type="text" inputMode="numeric" pattern="\d{6}"
                placeholder="Enter 6-digit OTP"
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full text-center text-3xl tracking-[1rem] font-bold border-2 border-gray-200 rounded-xl py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 placeholder:text-gray-300 placeholder:text-base placeholder:tracking-normal"
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
              )}

              <button type="submit" disabled={loading || otp.length !== 6}
                className="w-full flex items-center justify-center gap-2 bg-[#0a2463] text-white font-bold py-3 rounded-xl hover:bg-[#1a3a8f] transition-colors disabled:opacity-60">
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Verifying…</>
                ) : (
                  <>Verify & Continue <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <p className="text-sm text-gray-500 mt-5">
              Didn't receive it?{' '}
              <button onClick={resendOtp} disabled={sending}
                className="font-semibold text-blue-600 hover:underline disabled:opacity-50">
                {sending ? 'Sending…' : 'Resend OTP'}
              </button>
            </p>
            <p className="text-xs text-gray-400 mt-2">OTP expires in 10 minutes</p>
          </div>
        )}

        {/* ── STEP 3: Success ── */}
        {step === 'done' && (
          <div className="bg-white rounded-lg shadow-sm w-full border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Account verified!</h2>
            <p className="text-sm text-gray-500">Redirecting to your account…</p>
          </div>
        )}
      </div>
    </main>
  );
};

export default Registration;
