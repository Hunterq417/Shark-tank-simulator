import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Lock, 
  Mail, 
  User, 
  Building, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Briefcase, 
  KeyRound,
  RefreshCw
} from 'lucide-react';
import { authApi } from '../lib/api';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'register' | 'forgot' | 'reset';
}

export function AuthModal({ isOpen, onClose, onAuthSuccess, initialMode = 'login' }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>(initialMode);
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [selectedRole, setSelectedRole] = useState<'Shark' | 'Founder' | 'Admin'>('Shark');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [resetCode, setResetCode] = useState('');

  // UI Feedback State
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const resetMessages = () => {
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.login(email, password);
      localStorage.setItem('access_token', res.accessToken);
      localStorage.setItem('refresh_token', res.refreshToken);

      const userProfile: UserProfile = {
        id: res.user.id,
        name: res.user.name,
        role: res.user.role === 'ADMIN' ? 'Admin' : res.user.role === 'FOUNDER' ? 'Founder' : 'Investor',
        company: res.user.company || 'Venture Syndicate',
        email: res.user.email,
        avatar: res.user.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop',
        balance: res.user.balance || '$12,500,000',
        dealsClosed: res.user.dealsClosed || 0
      };

      setSuccessMessage('Authentication successful! Loading dashboard...');
      setTimeout(() => {
        onAuthSuccess(userProfile);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!email || !password || !name) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const rolePayload = selectedRole === 'Founder' ? 'Founder' : selectedRole === 'Admin' ? 'Admin' : 'Investor';
      const res = await authApi.register({
        email,
        password,
        name,
        role: rolePayload,
        company: company || (selectedRole === 'Founder' ? 'Stealth Startup' : 'Private Angel')
      });

      localStorage.setItem('access_token', res.accessToken);
      localStorage.setItem('refresh_token', res.refreshToken);

      const userProfile: UserProfile = {
        id: res.user.id,
        name: res.user.name,
        role: res.user.role === 'ADMIN' ? 'Admin' : res.user.role === 'FOUNDER' ? 'Founder' : 'Investor',
        company: res.user.company || 'Syndicate',
        email: res.user.email,
        avatar: res.user.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + encodeURIComponent(name),
        balance: res.user.balance || '$10,000,000',
        dealsClosed: 0
      };

      setSuccessMessage('Account registered successfully!');
      setTimeout(() => {
        onAuthSuccess(userProfile);
        onClose();
      }, 600);
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!email) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.forgotPassword(email);
      setSuccessMessage(res.message + (res.resetCode ? ` Verification code: ${res.resetCode}` : ''));
      if (res.resetCode) setResetCode(res.resetCode);
      setTimeout(() => {
        setMode('reset');
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Forgot password request failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetMessages();

    if (!email || !password) {
      setErrorMessage('Email and new password are required.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await authApi.resetPassword({
        email,
        code: resetCode,
        newPassword: password
      });
      setSuccessMessage(res.message);
      setTimeout(() => {
        setMode('login');
        setSuccessMessage('Please log in with your new password.');
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Password reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Demo Logins for QA
  const fillDemoCredentials = (role: 'Admin' | 'Founder' | 'Shark') => {
    resetMessages();
    if (role === 'Admin') {
      setEmail('admin@ventureflow.io');
      setPassword('password123');
      setSelectedRole('Admin');
    } else if (role === 'Shark') {
      setEmail('a.wright@apexventures.io');
      setPassword('password123');
      setSelectedRole('Shark');
    } else {
      setEmail('david@nexus.ai');
      setPassword('password123');
      setSelectedRole('Founder');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-surface-container border border-outline-variant rounded-2xl shadow-2xl p-6 glass-panel relative overflow-hidden text-on-surface"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-variant rounded-full transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 text-primary mb-3 border border-primary/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-headline-md">
            {mode === 'login' && 'Sign In to Sharktank Simulator'}
            {mode === 'register' && 'Create Investor Account'}
            {mode === 'forgot' && 'Reset Your Password'}
            {mode === 'reset' && 'Set New Password'}
          </h3>
          <p className="text-xs text-on-surface-variant mt-1 font-body-md">
            {mode === 'login' && 'Access institutional deal flow, live bidding & term sheets'}
            {mode === 'register' && 'Join the capital syndicate & startup pitch network'}
            {mode === 'forgot' && 'Enter your registered email to receive a verification code'}
            {mode === 'reset' && 'Enter verification code and your new password'}
          </p>
        </div>

        {/* Error Alert */}
        <AnimatePresence>
          {errorMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 rounded-xl bg-error/10 border border-error/30 text-error text-xs flex items-center gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </motion.div>
          )}

          {successMessage && (
            <motion.div 
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mb-4 p-3 rounded-xl bg-secondary/10 border border-secondary/30 text-secondary text-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Demo Credentials Bar for QA */}
        {mode === 'login' && (
          <div className="mb-5 p-3 rounded-xl bg-surface-container-low border border-outline-variant/60">
            <div className="text-[10px] font-label-mono text-on-surface-variant uppercase mb-2 flex justify-between items-center">
              <span>Quick Demo Accounts:</span>
              <span className="text-primary font-bold">QA Presets</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button 
                type="button"
                onClick={() => fillDemoCredentials('Shark')}
                className="py-1.5 px-2 text-[10px] font-label-mono bg-surface-variant/80 hover:bg-surface-variant rounded-lg border border-outline-variant text-on-surface flex items-center justify-center gap-1 cursor-pointer"
              >
                <Briefcase className="w-3 h-3 text-secondary" /> Shark / Investor
              </button>
              <button 
                type="button"
                onClick={() => fillDemoCredentials('Founder')}
                className="py-1.5 px-2 text-[10px] font-label-mono bg-surface-variant/80 hover:bg-surface-variant rounded-lg border border-outline-variant text-on-surface flex items-center justify-center gap-1 cursor-pointer"
              >
                <User className="w-3 h-3 text-primary" /> Founder
              </button>
              <button 
                type="button"
                onClick={() => fillDemoCredentials('Admin')}
                className="py-1.5 px-2 text-[10px] font-label-mono bg-surface-variant/80 hover:bg-surface-variant rounded-lg border border-outline-variant text-on-surface flex items-center justify-center gap-1 cursor-pointer"
              >
                <ShieldCheck className="w-3 h-3 text-amber-500" /> Admin
              </button>
            </div>
          </div>
        )}

        {/* MODE: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-label-mono text-on-surface-variant mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="investor@apexventures.io"
                  className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs text-on-surface focus:border-primary outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-label-mono text-on-surface-variant">Password</label>
                <button 
                  type="button" 
                  onClick={() => {
                    resetMessages();
                    setMode('forgot');
                  }}
                  className="text-[11px] font-label-mono text-primary hover:underline cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 bg-surface border border-outline-variant rounded-xl text-xs text-on-surface focus:border-primary outline-none"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-on-surface-variant">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-outline-variant bg-surface text-primary focus:ring-primary"
                />
                Remember me on this device
              </label>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-primary to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-label-mono text-xs uppercase tracking-wider font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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

            <div className="text-center pt-2">
              <span className="text-xs text-on-surface-variant">Don't have an account? </span>
              <button 
                type="button" 
                onClick={() => {
                  resetMessages();
                  setMode('register');
                }}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Register Now
              </button>
            </div>
          </form>
        )}

        {/* MODE: REGISTER */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-label-mono text-on-surface-variant mb-1">Select Role</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Shark', 'Founder', 'Admin'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRole(r)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-label-mono border text-center transition-all cursor-pointer ${
                      selectedRole === r 
                        ? 'bg-primary/20 border-primary text-primary font-bold' 
                        : 'bg-surface border-outline-variant text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {r === 'Shark' ? 'Investor (Shark)' : r}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-label-mono text-on-surface-variant mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alexander Wright"
                  className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs text-on-surface focus:border-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-label-mono text-on-surface-variant mb-1">Company / Fund Name</label>
              <div className="relative">
                <Building className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                <input 
                  type="text" 
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder="Apex Syndicate"
                  className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs text-on-surface focus:border-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-label-mono text-on-surface-variant mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="investor@apexventures.io"
                  className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs text-on-surface focus:border-primary outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-label-mono text-on-surface-variant mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-9 py-2 bg-surface border border-outline-variant rounded-xl text-xs text-on-surface focus:border-primary outline-none"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-label-mono text-on-surface-variant mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-on-surface-variant absolute left-3 top-2.5" />
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs text-on-surface focus:border-primary outline-none"
                />
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
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-on-surface-variant">Already have an account? </span>
              <button 
                type="button" 
                onClick={() => {
                  resetMessages();
                  setMode('login');
                }}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </div>
          </form>
        )}

        {/* MODE: FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-label-mono text-on-surface-variant mb-1">Your Registered Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-on-surface-variant absolute left-3 top-3" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="investor@apexventures.io"
                  className="w-full pl-9 pr-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs text-on-surface focus:border-primary outline-none"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-blue-600 text-white font-label-mono text-xs uppercase tracking-wider font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Send Reset Code</span>
                  <KeyRound className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <button 
                type="button" 
                onClick={() => {
                  resetMessages();
                  setMode('login');
                }}
                className="text-xs font-bold text-on-surface-variant hover:text-on-surface cursor-pointer"
              >
                ← Back to Login
              </button>
            </div>
          </form>
        )}

        {/* MODE: RESET PASSWORD */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-label-mono text-on-surface-variant mb-1">Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs text-on-surface focus:border-primary outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-label-mono text-on-surface-variant mb-1">Verification Reset Code</label>
              <input 
                type="text" 
                required
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value)}
                placeholder="VF-892104"
                className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs text-on-surface focus:border-primary outline-none font-label-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-label-mono text-on-surface-variant mb-1">New Password</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-xl text-xs text-on-surface focus:border-primary outline-none"
              />
            </div>

            <button 
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-primary hover:bg-blue-600 text-white font-label-mono text-xs uppercase tracking-wider font-bold shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
