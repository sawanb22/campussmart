import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '@/api/client';
import { setUserSession } from '@/lib/auth-session';
import ForgotPasswordModal from '@/components/forgot-password-modal';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const verifiedSuccess = searchParams.get('verified') === 'true';

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setUnverifiedEmail('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });
      setUserSession(data.accessToken, data.user);
      if (data.user?.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/my-account');
      }
    } catch (err: any) {
      if (err.response?.data?.code === 'EMAIL_NOT_VERIFIED') {
        setUnverifiedEmail(err.response?.data?.email || formData.email);
        setError(err.response?.data?.error || 'Please verify your email address before signing in.');
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (!err.response) {
        setError('Cannot reach server. Please check your connection or backend server.');
      } else {
        setError('Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoToVerify = () => {
    navigate('/registration?step=otp', {
      state: {
        email: unverifiedEmail || formData.email,
        password: formData.password,
        fromLogin: true,
        step: 'otp',
      },
    });
  };

  return (
    <main className="min-h-screen bg-[#f0f4f8] flex items-center justify-center py-4 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="text-3xl font-bold text-[#0a2463]">
              <span className="block leading-none">CAMPUS</span>
              <span className="block leading-none text-sm tracking-[0.3em]">MART</span>
            </div>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm w-full border border-gray-100 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500 mb-6">Sign in to your CampusMart account</p>

          {verifiedSuccess && !error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-3.5 text-sm text-green-800">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
              <span>Email verified successfully! Please sign in with your password.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required type="email" pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  required type={showPassword ? 'text' : 'password'}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
                  placeholder="Your password"
                  value={formData.password}
                  onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
                />
                <button type="button" onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="text-right">
                <button type="button" onClick={() => setShowForgotPassword(true)} className="text-xs font-semibold text-[#0a2463] hover:underline">
                  Forgot password?
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 space-y-2">
                <p>{error}</p>
                {unverifiedEmail && (
                  <button
                    type="button"
                    onClick={handleGoToVerify}
                    className="inline-flex items-center gap-1 font-semibold text-[#0a2463] underline hover:text-[#1a3a8f] text-xs"
                  >
                    Enter Verification Code <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#0a2463] text-white font-bold py-3 rounded-xl hover:bg-[#1a3a8f] transition-colors disabled:opacity-60">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in…</>
                : <>Sign In <ArrowRight className="w-4 h-4" /></>
              }
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/registration" className="font-semibold text-[#0a2463] hover:underline">Sign up</Link>
          </p>
        </div>
      </div>

      <ForgotPasswordModal open={showForgotPassword} onClose={() => setShowForgotPassword(false)} />
    </main>
  );
};

export default Login;
