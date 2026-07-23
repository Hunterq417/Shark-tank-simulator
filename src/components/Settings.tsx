import { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  ShieldCheck, 
  Key, 
  Wallet, 
  Palette, 
  Save, 
  CheckCircle2, 
  DollarSign, 
  Sparkles,
  Building,
  Mail,
  Globe
} from 'lucide-react';
import { UserProfile } from '../types';

interface SettingsProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
}

export function Settings({ user, onUpdateUser }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'security'>('profile');
  
  // Local form state
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [company, setCompany] = useState(user.company);
  const [role, setRole] = useState(user.role);
  const [minTicket, setMinTicket] = useState('$100K');
  const [maxTicket, setMaxTicket] = useState('$5M');
  const [currency, setCurrency] = useState('USD ($)');
  
  // Toggle states
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [liveBiddingPush, setLiveBiddingPush] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [twoFactor, setTwoFactor] = useState(true);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSave = () => {
    onUpdateUser({
      name,
      email,
      company,
      role
    });
    setToastMessage('Settings saved successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-background p-8 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-20 right-8 z-50 bg-secondary-container text-on-secondary-container px-4 py-3 rounded-xl border border-secondary/30 shadow-2xl flex items-center gap-2 font-label-mono text-sm"
        >
          <CheckCircle2 className="w-5 h-5 text-secondary" />
          {toastMessage}
        </motion.div>
      )}

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-6">
          <div>
            <div className="flex items-center gap-2">
              <SettingsIcon className="w-6 h-6 text-primary" />
              <h1 className="font-headline-lg text-3xl font-bold text-on-surface">Platform Settings</h1>
            </div>
            <p className="text-on-surface-variant text-sm mt-1">Manage your account credentials, investment criteria, and notifications.</p>
          </div>

          <button 
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 bg-secondary text-on-secondary hover:bg-secondary/90 rounded-xl font-label-mono font-bold text-sm uppercase tracking-wider shadow-lg shadow-secondary/20 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-outline-variant space-x-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-3 font-label-mono text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'profile' 
                ? 'border-primary text-primary font-bold' 
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <User className="w-4 h-4" />
            Profile & Entity
          </button>
          
          <button 
            onClick={() => setActiveTab('preferences')}
            className={`px-4 py-3 font-label-mono text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'preferences' 
                ? 'border-primary text-primary font-bold' 
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Investment Criteria
          </button>

          <button 
            onClick={() => setActiveTab('notifications')}
            className={`px-4 py-3 font-label-mono text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'notifications' 
                ? 'border-primary text-primary font-bold' 
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Bell className="w-4 h-4" />
            Alerts & Push
          </button>

          <button 
            onClick={() => setActiveTab('security')}
            className={`px-4 py-3 font-label-mono text-xs uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'security' 
                ? 'border-primary text-primary font-bold' 
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Security & API
          </button>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              <div className="glass-panel p-6 rounded-2xl border-outline-variant space-y-6">
                <h3 className="font-headline-md text-lg text-on-surface font-bold border-b border-outline-variant pb-3">User Identity</h3>

                <div className="flex items-center gap-6">
                  <div className="relative">
                    <img 
                      src={user.avatar} 
                      alt={name} 
                      className="w-20 h-20 rounded-full border-2 border-primary object-cover shadow-xl"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-surface-bright text-on-surface p-1.5 rounded-full border border-outline-variant">
                      <Sparkles className="w-3.5 h-3.5 text-secondary" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">{name}</h4>
                    <p className="text-xs text-on-surface-variant">{company} ({role})</p>
                    <button 
                      onClick={() => {
                        const avatarOptions = [
                          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=688&auto=format&fit=crop',
                          'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop',
                          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=256&auto=format&fit=crop'
                        ];
                        const nextAvatar = avatarOptions[(avatarOptions.indexOf(user.avatar) + 1) % avatarOptions.length];
                        onUpdateUser({ avatar: nextAvatar });
                        setToastMessage('Avatar updated!');
                        setTimeout(() => setToastMessage(null), 2000);
                      }}
                      className="mt-2 text-xs font-label-mono text-primary hover:underline"
                    >
                      Change Avatar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-label-mono uppercase text-on-surface-variant mb-2">Full Name</label>
                    <div className="flex items-center bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 focus-within:border-primary">
                      <User className="w-4 h-4 text-on-surface-variant mr-2" />
                      <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="bg-transparent border-none text-on-surface text-sm w-full focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-label-mono uppercase text-on-surface-variant mb-2">Corporate Email</label>
                    <div className="flex items-center bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 focus-within:border-primary">
                      <Mail className="w-4 h-4 text-on-surface-variant mr-2" />
                      <input 
                        type="email" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="bg-transparent border-none text-on-surface text-sm w-full focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-label-mono uppercase text-on-surface-variant mb-2">Fund / Entity Name</label>
                    <div className="flex items-center bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 focus-within:border-primary">
                      <Building className="w-4 h-4 text-on-surface-variant mr-2" />
                      <input 
                        type="text" 
                        value={company} 
                        onChange={(e) => setCompany(e.target.value)}
                        className="bg-transparent border-none text-on-surface text-sm w-full focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-label-mono uppercase text-on-surface-variant mb-2">Role Type</label>
                    <select 
                      value={role} 
                      onChange={(e) => setRole(e.target.value as 'Investor' | 'Founder')}
                      className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 text-on-surface text-sm focus:outline-none focus:border-primary font-label-mono"
                    >
                      <option value="Investor">Institutional Investor</option>
                      <option value="Founder">Startup Founder</option>
                    </select>
                  </div>
                </div>

              </div>

            </motion.div>
          )}

          {/* PREFERENCES TAB */}
          {activeTab === 'preferences' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl border-outline-variant space-y-6">
                <h3 className="font-headline-md text-lg text-on-surface font-bold border-b border-outline-variant pb-3">Ticket Size & Currency</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-label-mono uppercase text-on-surface-variant mb-2">Minimum Ticket Size</label>
                    <input 
                      type="text" 
                      value={minTicket} 
                      onChange={(e) => setMinTicket(e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 text-on-surface font-label-mono text-sm focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-label-mono uppercase text-on-surface-variant mb-2">Maximum Allocation</label>
                    <input 
                      type="text" 
                      value={maxTicket} 
                      onChange={(e) => setMaxTicket(e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 text-on-surface font-label-mono text-sm focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-label-mono uppercase text-on-surface-variant mb-2">Display Currency</label>
                    <select 
                      value={currency} 
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full bg-surface-container border border-outline-variant rounded-lg px-3 py-2.5 text-on-surface font-label-mono text-sm focus:outline-none focus:border-primary"
                    >
                      <option value="USD ($)">USD ($)</option>
                      <option value="EUR (€)">EUR (€)</option>
                      <option value="GBP (£)">GBP (£)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-outline-variant">
                  <h4 className="text-sm font-bold text-on-surface mb-3">Preferred Sectors</h4>
                  <div className="flex flex-wrap gap-3">
                    {['AI & Machine Learning', 'FinTech & Web3', 'CleanTech & Energy', 'B2B SaaS', 'Biotech', 'Cybersecurity'].map((sec, idx) => (
                      <span key={sec} className={`px-3 py-1.5 rounded-lg text-xs font-label-mono cursor-pointer transition-colors ${
                        idx < 3 ? 'bg-primary/20 text-primary border border-primary/30 font-bold' : 'bg-surface-container text-on-surface-variant border border-outline-variant'
                      }`}>
                        {sec}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl border-outline-variant space-y-6">
                <h3 className="font-headline-md text-lg text-on-surface font-bold border-b border-outline-variant pb-3">Notification Rules</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl border border-outline-variant">
                    <div>
                      <h4 className="font-bold text-on-surface text-sm">Real-time Bidding Push Alerts</h4>
                      <p className="text-xs text-on-surface-variant">Notify immediately when counter-offers or bids are submitted in live rooms.</p>
                    </div>
                    <button 
                      onClick={() => setLiveBiddingPush(!liveBiddingPush)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${liveBiddingPush ? 'bg-secondary' : 'bg-surface-bright'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${liveBiddingPush ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl border border-outline-variant">
                    <div>
                      <h4 className="font-bold text-on-surface text-sm">Email Digest & Term Sheets</h4>
                      <p className="text-xs text-on-surface-variant">Receive formal PDF term sheet summaries to your corporate email address.</p>
                    </div>
                    <button 
                      onClick={() => setEmailAlerts(!emailAlerts)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${emailAlerts ? 'bg-secondary' : 'bg-surface-bright'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${emailAlerts ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-surface-container rounded-xl border border-outline-variant">
                    <div>
                      <h4 className="font-bold text-on-surface text-sm">Deal Room Audio Feedback</h4>
                      <p className="text-xs text-on-surface-variant">Play subtle sound alerts during live pitch countdowns and new bid placements.</p>
                    </div>
                    <button 
                      onClick={() => setSoundEffects(!soundEffects)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${soundEffects ? 'bg-secondary' : 'bg-surface-bright'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${soundEffects ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl border-outline-variant space-y-6">
                <h3 className="font-headline-md text-lg text-on-surface font-bold border-b border-outline-variant pb-3">Security & Integration Keys</h3>

                <div className="space-y-4">
                  <div className="p-4 bg-surface-container rounded-xl border border-outline-variant flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-secondary" />
                      <div>
                        <h4 className="font-bold text-on-surface text-sm">Gemini AI Engine Connection</h4>
                        <p className="text-xs text-on-surface-variant">Used for automated pitch deck analysis and deal synergy calculations.</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-full font-label-mono text-xs">Active</span>
                  </div>

                  <div className="p-4 bg-surface-container rounded-xl border border-outline-variant flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-5 h-5 text-primary" />
                      <div>
                        <h4 className="font-bold text-on-surface text-sm">Two-Factor Authentication (2FA)</h4>
                        <p className="text-xs text-on-surface-variant">Hardware security key or authenticator app for deal closures.</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setTwoFactor(!twoFactor)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${twoFactor ? 'bg-secondary' : 'bg-surface-bright'}`}
                    >
                      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${twoFactor ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="p-4 bg-surface-container rounded-xl border border-outline-variant flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5 text-tertiary" />
                      <div>
                        <h4 className="font-bold text-on-surface text-sm">Institutional Escrow Wallet</h4>
                        <p className="text-xs text-on-surface-variant">Connected wallet: <span className="font-label-mono text-on-surface">0x8F3...4B21</span></p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setToastMessage('Escrow wallet verified');
                        setTimeout(() => setToastMessage(null), 2000);
                      }}
                      className="px-3 py-1.5 bg-surface-variant hover:bg-surface-bright border border-outline-variant text-on-surface rounded-lg font-label-mono text-xs"
                    >
                      Verify
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

        </div>

      </div>
    </div>
  );
}
