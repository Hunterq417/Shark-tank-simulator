import { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, ArrowRight, AlertCircle, RefreshCw } from 'lucide-react';
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
      {/* Faint engraved monogram, watermark-quiet */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
        <span className="font-display text-[42rem] leading-none text-on-surface/[0.015] -mt-24">S</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md relative"
      >
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-semibold text-on-surface tracking-tight">Sharktank Simulator</h1>
          <div className="flex items-center justify-center gap-3 mt-3">
            <span className="h-px w-8 bg-primary/40" />
            <p className="font-label-mono text-[10px] text-primary/80 uppercase tracking-[0.35em]">
              Private Capital
            </p>
            <span className="h-px w-8 bg-primary/40" />
          </div>
        </div>

        {/* Sign-in rendered as a bone-stock document with a brass edge */}
        <div className="paper brass-edge pl-8 pr-8 py-9">
          <div className="mb-7">
            <h2 className="text-lg font-display font-semibold text-[#1c1a15]">Sign in</h2>
            <p className="text-xs text-[#6b665b] mt-1">Enter your credentials to access the console.</p>
          </div>

          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 py-2.5 px-3 border-l-2 border-error bg-error/5 text-error text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="userId" className="block text-[10px] font-label-mono text-[#8a8477] uppercase tracking-[0.2em] mb-2">
                User ID
              </label>
              <input
                id="userId"
                type="text"
                required
                autoComplete="username"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="your@email.com"
                className="w-full pb-2 bg-transparent border-b border-[#c9c2b2] text-sm text-[#1c1a15] placeholder:text-[#b3ab99] focus:border-[#8a6d34] outline-none transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-label-mono text-[#8a8477] uppercase tracking-[0.2em] mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pb-2 pr-8 bg-transparent border-b border-[#c9c2b2] text-sm text-[#1c1a15] placeholder:text-[#b3ab99] focus:border-[#8a6d34] outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 text-[#8a8477] hover:text-[#1c1a15] cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 mt-2 bg-[#14181c] hover:bg-[#22282f] text-bone text-[11px] uppercase tracking-[0.2em] font-label-mono transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              style={{ color: 'var(--bone)' }}
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

        <p className="text-center text-[10px] text-on-surface-variant mt-6 font-label-mono uppercase tracking-[0.2em]">
          Venture Capital Console
        </p>
      </motion.div>
    </div>
  );
}
