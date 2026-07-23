import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, ShieldCheck, RefreshCw } from 'lucide-react';
import { authApi } from '../lib/api';
import { UserProfile } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
}

function mapApiUser(res: { user: any }): UserProfile {
  return {
    id: res.user.id,
    name: res.user.name,
    role: res.user.role === 'Admin' ? 'Admin' : res.user.role === 'Founder' ? 'Founder' : 'Investor',
    company: res.user.company || 'Venture Syndicate',
    email: res.user.email,
    avatar: res.user.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop',
    balance: res.user.balance || '$12,500,000',
    dealsClosed: res.user.dealsClosed || 0
  };
}

export function LoginPage({ onLoginSuccess }: LoginPageProps) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!userId.trim() || !password) {
      setErrorMessage('Please enter your user ID and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.login(userId.trim(), password);
      localStorage.setItem('access_token', res.accessToken);
      localStorage.setItem('refresh_token', res.refreshToken);
      onLoginSuccess(mapApiUser(res));
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative"
      >
        <div className="text-center mb-8">
          <h1 className="font-headline-md text-3xl font-bold text-on-surface">VentureFlow</h1>
          <p className="font-label-mono text-xs text-on-surface-variant uppercase tracking-wider mt-1">
            Institutional Grade
          </p>
        </div>

        <div className="bg-surface-container border border-outline-variant rounded-2xl shadow-2xl p-8 glass-panel">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3 border border-primary/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold font-headline-md text-on-surface">Sign In</h2>
            <p className="text-xs text-on-surface-variant mt-1 font-body-md">
              Enter your credentials to access the platform
            </p>
          </div>

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="userId" className="block text-xs font-label-mono text-on-surface-variant mb-1">
                User ID
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
                <input
                  id="userId"
                  type="text"
                  required
                  autoComplete="username"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm text-on-surface focus:border-primary outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-label-mono text-on-surface-variant mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2.5 bg-surface border border-outline-variant rounded-xl text-sm text-on-surface focus:border-primary outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-label-mono text-xs uppercase tracking-wider font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[10px] text-on-surface-variant mt-6 font-label-mono">
          Venture Capital Console &middot; Secure Access
        </p>
      </motion.div>
    </div>
  );
}
