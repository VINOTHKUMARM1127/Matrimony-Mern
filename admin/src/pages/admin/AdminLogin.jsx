import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';
import * as adminApi from '../../api/adminApi';
import { Shield, Eye, EyeOff, Heart, Mail, Lock, AlertCircle } from 'lucide-react';
import Button from '../../components/common/Button';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { signIn, isAuthenticated, user } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const isAdmin = await adminApi.checkIsAdmin(email);
      if (!isAdmin) {
        throw new Error('Access denied. Admin privileges required.');
      }
      await signIn(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel (desktop) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden bg-neutral-900 p-12 text-white">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              'radial-gradient(circle at 20% 20%, rgba(239,68,99,0.35), transparent 45%), radial-gradient(circle at 80% 80%, rgba(212,175,55,0.25), transparent 45%)',
          }}
        />
        <div className="relative flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-xl shadow-primary-900/50">
            <Heart size={22} className="text-white" fill="white" />
          </div>
          <div>
            <p className="font-bold text-lg tracking-tight">Wedring Matrimony</p>
            <p className="text-xs text-neutral-400">Admin Control Center</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
            Manage your platform with confidence.
          </h2>
          <p className="mt-4 text-neutral-400 leading-relaxed">
            Members, premium plans, profile distribution, and quotas — all from one elegant dashboard.
          </p>
        </div>

        <div className="relative flex items-center gap-2 text-xs text-neutral-500">
          <Shield size={14} />
          <span>Secured admin access · End-to-end encrypted session</span>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-[#f4f6fb]">
        <div className="w-full max-w-md animate-rise">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg">
              <Heart size={22} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-xl text-neutral-900">Wedring Admin</span>
          </div>

          <div className="bg-white rounded-3xl shadow-[var(--shadow-card)] border border-neutral-200/70 p-8">
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-neutral-900">Welcome back</h1>
              <p className="text-neutral-500 mt-1 text-sm">Sign in to access the admin portal.</p>
            </div>

            {error && (
              <div className="flex items-start gap-2.5 bg-error-50 border border-error-200 text-error-700 p-3.5 rounded-xl mb-5 text-sm animate-fade-in">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-neutral-700 text-sm font-semibold mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:bg-white focus:border-primary-400 focus:ring-4 focus:ring-primary-100 transition-all"
                    placeholder="admin@matrimony.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-700 text-sm font-semibold mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-neutral-50 border border-neutral-200 text-neutral-900 rounded-xl py-3 pl-11 pr-11 focus:outline-none focus:bg-white focus:border-primary-400 focus:ring-4 focus:ring-primary-100 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <Button type="submit" fullWidth isLoading={isLoading} size="lg" className="mt-2">
                {isLoading ? 'Signing in…' : 'Sign In as Admin'}
              </Button>
            </form>
          </div>

          <p className="text-center text-xs text-neutral-400 mt-6">
            Protected area · Authorized personnel only
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
