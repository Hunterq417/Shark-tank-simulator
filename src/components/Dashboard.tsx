import { motion } from 'motion/react';
import { ViewState, UserProfile, NotificationItem } from '../types';
import { Radio, Briefcase, BarChart3, TrendingUp, Sparkles, ArrowRight, PlayCircle, Shield, Zap } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: ViewState) => void;
  user: UserProfile;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
  onToggleRole: () => void;
  onOpenNewBid: () => void;
  onOpenViewDeck: (company: string) => void;
}

export function Dashboard({ 
  onNavigate, 
  user,
  onOpenNewBid,
  onOpenViewDeck
}: DashboardProps) {
  return (
    <div className="flex-1 overflow-y-auto relative bg-background">
      {/* Background Graphic */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-primary/20 blur-[140px] rounded-full opacity-40" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-8 py-12 flex flex-col items-center">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mb-12">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 bg-secondary/10 border border-secondary/20 text-secondary text-xs font-label-mono uppercase px-3 py-1 rounded-full mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Institutional Bidding Engine v2.4</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-5xl md:text-6xl font-bold text-on-surface mb-6 leading-tight"
          >
            The Future of <br/>
            <span className="bg-gradient-to-r from-primary via-blue-400 to-secondary bg-clip-text text-transparent">
              Venture Capital is Live
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-on-surface-variant text-base md:text-lg max-w-2xl mx-auto mb-8 leading-relaxed"
          >
            Execute syndicates, analyze pitch decks with AI, and enter real-time negotiation rooms with top founders and LPs in milliseconds.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <button 
              onClick={() => onNavigate('offers')}
              className="px-6 py-3.5 rounded-xl bg-secondary text-on-secondary font-label-mono font-bold uppercase tracking-wider text-xs hover:bg-secondary/90 transition-all shadow-lg shadow-secondary/20 cursor-pointer flex items-center gap-2"
            >
              <Briefcase className="w-4 h-4" />
              Founder Workspace
            </button>

            <button 
              onClick={() => onNavigate('live-pitch')}
              className="px-6 py-3.5 rounded-xl bg-primary text-on-primary font-label-mono font-bold uppercase tracking-wider text-xs hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 cursor-pointer flex items-center gap-2"
            >
              <Radio className="w-4 h-4 animate-pulse" />
              Live Stage
            </button>

            <button 
              onClick={onOpenNewBid}
              className="px-6 py-3.5 rounded-xl border border-outline-variant bg-surface-container hover:bg-surface-bright text-on-surface font-label-mono text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-tertiary" />
              Submit Bid
            </button>
          </motion.div>
        </div>

        {/* Quick Stats Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          
          <div 
            onClick={() => onNavigate('live-pitch')}
            className="glass-panel p-6 rounded-2xl border-outline-variant hover:border-primary/40 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-label-mono text-on-surface-variant uppercase">Live Pitching</span>
              <span className="flex items-center gap-1 text-[10px] font-label-mono text-secondary bg-secondary/10 px-2 py-0.5 rounded border border-secondary/20">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
                Live Now
              </span>
            </div>
            <h3 className="font-headline-md text-xl text-on-surface font-bold group-hover:text-primary transition-colors">Nexus AI Stage</h3>
            <p className="text-xs text-on-surface-variant mt-1 mb-4">Autonomous ML systems asking $1.5M for 10%</p>
            <div className="flex items-center text-xs font-label-mono text-primary font-bold">
              Join Stage <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate('offers')}
            className="glass-panel p-6 rounded-2xl border-outline-variant hover:border-secondary/40 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-label-mono text-on-surface-variant uppercase">Active Term Sheets</span>
              <span className="text-[10px] font-label-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                3 Pending
              </span>
            </div>
            <h3 className="font-headline-md text-xl text-on-surface font-bold group-hover:text-secondary transition-colors">Quantum Dynamics AI</h3>
            <p className="text-xs text-on-surface-variant mt-1 mb-4">Apex Ventures leading with $4.5M offer</p>
            <div className="flex items-center text-xs font-label-mono text-secondary font-bold">
              Compare Offers <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate('analytics')}
            className="glass-panel p-6 rounded-2xl border-outline-variant hover:border-tertiary/40 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-label-mono text-on-surface-variant uppercase">Deal Analytics</span>
              <span className="text-[10px] font-label-mono text-tertiary bg-tertiary/10 px-2 py-0.5 rounded border border-tertiary/20">
                $48.2M Deployed
              </span>
            </div>
            <h3 className="font-headline-md text-xl text-on-surface font-bold group-hover:text-tertiary transition-colors">Syndicate Insights</h3>
            <p className="text-xs text-on-surface-variant mt-1 mb-4">View post-money valuations and sector distribution</p>
            <div className="flex items-center text-xs font-label-mono text-tertiary font-bold">
              View Analytics <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

        {/* Live Pitch Preview Stage Card */}
        <div className="w-full glass-panel rounded-2xl p-6 border border-outline-variant overflow-hidden relative">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-secondary animate-ping" />
              <h3 className="font-headline-md text-lg text-on-surface font-bold">Featured Pitch Event</h3>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => onOpenViewDeck('Nexus AI')}
                className="px-3 py-1.5 rounded-lg bg-surface-variant hover:bg-surface-bright text-xs font-label-mono text-on-surface border border-outline-variant"
              >
                Inspect Pitch Deck
              </button>
              <button 
                onClick={() => onNavigate('live-pitch')}
                className="px-4 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-label-mono font-bold uppercase"
              >
                Enter Room
              </button>
            </div>
          </div>

          <div className="bg-surface-container rounded-xl border border-outline-variant h-80 relative overflow-hidden flex items-center justify-center">
            <img 
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=2070&auto=format&fit=crop" 
              alt="Live Stage" 
              className="w-full h-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-black/40 to-transparent flex flex-col justify-end p-8">
              <div className="max-w-xl">
                <span className="text-xs font-label-mono text-secondary uppercase bg-secondary/10 px-2.5 py-1 rounded border border-secondary/20">Seed Stage • AI & Data</span>
                <h2 className="text-3xl font-bold text-white mt-2">Nexus AI Stage</h2>
                <p className="text-sm text-gray-300 mt-1">Autonomous enterprise ML models. Seeking $1.5M for 10% equity.</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
