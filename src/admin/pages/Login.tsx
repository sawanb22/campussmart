import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, Lock, Mail, Eye, EyeOff } from 'lucide-react';
import api from '../api/client';
import { isAdminLoggedIn, syncAdminSession } from '../lib/auth';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (isAdminLoggedIn()) {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await api.post('/auth/login', { email, password });
            if (data.user.role !== 'admin') {
                setError('Admin access only. Use admin credentials.');
                return;
            }
            syncAdminSession(data.accessToken, data.user);
            navigate('/admin/dashboard');
        } catch (err: unknown) {
            const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error;
            setError(msg || 'Login failed. Check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cm-blue via-cm-blue-dark to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <GraduationCap className="w-8 h-8 text-cm-blue" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">CampusMart</h1>
                    <p className="text-white/60 mt-1">Admin Panel</p>
                </div>

                <div className="bg-white rounded-2xl shadow-2xl p-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Sign in to continue</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="form-label">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="email"
                                    pattern="[^\s@]+@[^\s@]+\.[^\s@]+"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input pl-9"
                                    placeholder="Email Address"
                                    autoComplete="username"
                                    name="email"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type={showPw ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pl-9 pr-10"
                                    placeholder=""
                                    autoComplete="current-password"
                                    name="password"
                                    required
                                />
                                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button type="submit" disabled={loading} className="w-full btn-primary py-2.5 text-base font-semibold disabled:opacity-60">
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>

                </div>
            </div>
        </div>
    );
}
