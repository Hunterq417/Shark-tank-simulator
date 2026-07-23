import { useState } from 'react';
import { motion } from 'motion/react';
import { ViewState } from '../types';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  PieChart as PieIcon, 
  Download, 
  Filter, 
  Calendar, 
  ArrowUpRight, 
  Zap,
  CheckCircle2
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  Cell, 
  PieChart, 
  Pie 
} from 'recharts';

const dealFlowData = [
  { month: 'Jan', volume: 18.2, offers: 24, avgValuation: 16.5 },
  { month: 'Feb', volume: 22.4, offers: 31, avgValuation: 18.0 },
  { month: 'Mar', volume: 28.1, offers: 38, avgValuation: 19.2 },
  { month: 'Apr', volume: 32.5, offers: 42, avgValuation: 21.0 },
  { month: 'May', volume: 39.8, offers: 56, avgValuation: 22.8 },
  { month: 'Jun', volume: 48.2, offers: 64, avgValuation: 24.5 }
];

const sectorData = [
  { sector: 'AI & Data', volume: 24.5, count: 18, color: '#2563eb' },
  { sector: 'FinTech', volume: 14.2, count: 12, color: '#10b981' },
  { sector: 'CleanTech', volume: 9.8, count: 8, color: '#ffb95f' },
  { sector: 'HealthTech', volume: 7.4, count: 6, color: '#a855f7' },
  { sector: 'B2B SaaS', volume: 12.1, count: 11, color: '#ec4899' },
];

const stageData = [
  { name: 'Seed', value: 40, color: '#10b981' },
  { name: 'Series A', value: 35, color: '#2563eb' },
  { name: 'Series B', value: 15, color: '#ffb95f' },
  { name: 'Pre-Seed', value: 10, color: '#a855f7' },
];

const recentDeals = [
  { id: '1', company: 'Nexus AI', stage: 'Seed', sector: 'AI & Data', dealSize: '$2.5M', valuation: '$25.0M', lead: 'Apex Ventures', status: 'Closed' },
  { id: '2', company: 'Quantum Dynamics AI', stage: 'Series A', sector: 'AI & Data', dealSize: '$4.5M', valuation: '$37.5M', lead: 'Silver Lake', status: 'In Term Sheet' },
  { id: '3', company: 'EcoTech Solutions', stage: 'Seed', sector: 'CleanTech', dealSize: '$1.8M', valuation: '$18.0M', lead: 'Sequoia Capital', status: 'Closed' },
  { id: '4', company: 'FinFlow Protocol', stage: 'Series B', sector: 'FinTech', dealSize: '$8.0M', valuation: '$80.0M', lead: 'Andreessen Horowitz', status: 'Closed' },
  { id: '5', company: 'BioGen Innovations', stage: 'Pre-Seed', sector: 'HealthTech', dealSize: '$900K', valuation: '$9.0M', lead: 'Sarah Jenkins (Angel)', status: 'Closed' },
];

interface AnalyticsProps {
  onNavigate?: (view: ViewState) => void;
}

export function Analytics({ onNavigate }: AnalyticsProps) {
  const [timeframe, setTimeframe] = useState<'1W' | '1M' | '1Q' | '1Y' | 'ALL'>('1M');
  const [sectorFilter, setSectorFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredDeals = sectorFilter === 'All' 
    ? recentDeals 
    : recentDeals.filter(d => d.sector === sectorFilter);

  return (
    <div className="flex-1 overflow-y-auto bg-background p-8 relative">
      {/* Toast */}
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

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-6">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-primary" />
              <h1 className="font-headline-lg text-3xl font-bold text-on-surface">Deal Flow Analytics</h1>
            </div>
            <p className="text-on-surface-variant text-sm mt-1">Real-time valuation trends, capital allocation metrics, and syndicate performance.</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Timeframe Selector */}
            <div className="bg-surface-container rounded-lg p-1 border border-outline-variant flex items-center gap-1">
              {(['1W', '1M', '1Q', '1Y', 'ALL'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => {
                    setTimeframe(tf);
                    triggerToast(`Filter updated to timeframe: ${tf}`);
                  }}
                  className={`px-3 py-1.5 rounded text-xs font-label-mono uppercase transition-all ${
                    timeframe === tf 
                      ? 'bg-primary text-on-primary font-bold shadow-sm' 
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            <button 
              onClick={() => triggerToast('Exporting analytics report as CSV...')}
              className="flex items-center gap-2 px-4 py-2 bg-surface-variant hover:bg-surface-bright border border-outline-variant rounded-lg text-on-surface text-xs font-label-mono uppercase transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          <div className="glass-panel p-6 rounded-2xl border-outline-variant relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="text-on-surface-variant text-xs font-label-mono uppercase">Total Capital Deployed</span>
              <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="font-display text-3xl font-bold text-on-surface mb-2">$48.2M</div>
            <div className="flex items-center gap-1 text-secondary text-xs font-label-mono">
              <TrendingUp className="w-4 h-4" />
              <span>+18.4% vs last quarter</span>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-outline-variant relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="text-on-surface-variant text-xs font-label-mono uppercase">Avg Post-Money Valuation</span>
              <div className="w-8 h-8 rounded-lg bg-secondary/10 border border-secondary/20 flex items-center justify-center text-secondary">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div className="font-display text-3xl font-bold text-on-surface mb-2">$22.5M</div>
            <div className="flex items-center gap-1 text-secondary text-xs font-label-mono">
              <TrendingUp className="w-4 h-4" />
              <span>+6.2% QoQ growth</span>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-outline-variant relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="text-on-surface-variant text-xs font-label-mono uppercase">Completed Pitch Events</span>
              <div className="w-8 h-8 rounded-lg bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary">
                <Zap className="w-4 h-4" />
              </div>
            </div>
            <div className="font-display text-3xl font-bold text-on-surface mb-2">38</div>
            <div className="flex items-center gap-1 text-on-surface-variant text-xs font-label-mono">
              <span>64 Active Bids placed</span>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border-outline-variant relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <span className="text-on-surface-variant text-xs font-label-mono uppercase">Term Sheet Acceptance</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
            <div className="font-display text-3xl font-bold text-on-surface mb-2">68.4%</div>
            <div className="flex items-center gap-1 text-secondary text-xs font-label-mono">
              <span>12.5 hrs avg response time</span>
            </div>
          </div>

        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Area Chart - Capital Deployed Trend */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border-outline-variant flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-headline-md text-lg text-on-surface font-bold">Capital Deployment Trend</h3>
                <p className="text-xs text-on-surface-variant">Monthly aggregated deal volume ($M) and average valuation</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-label-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-primary inline-block" />
                  <span className="text-on-surface-variant">Volume ($M)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-secondary inline-block" />
                  <span className="text-on-surface-variant">Avg Valuation ($M)</span>
                </div>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dealFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorValuation" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#e1e2ed' }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
                  <Area type="monotone" dataKey="avgValuation" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorValuation)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart - Stage Breakdown */}
          <div className="glass-panel p-6 rounded-2xl border-outline-variant flex flex-col justify-between">
            <div>
              <h3 className="font-headline-md text-lg text-on-surface font-bold mb-1">Funding Stage Breakdown</h3>
              <p className="text-xs text-on-surface-variant mb-6">Distribution of current active portfolio</p>
            </div>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {stageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#e1e2ed' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-outline-variant">
              {stageData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-on-surface">{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Sector Distribution Bar Chart */}
        <div className="glass-panel p-6 rounded-2xl border-outline-variant">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-headline-md text-lg text-on-surface font-bold">Capital Deployed by Sector</h3>
              <p className="text-xs text-on-surface-variant">Top performing technology domains on VentureFlow</p>
            </div>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="sector" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '12px', color: '#e1e2ed' }} />
                <Bar dataKey="volume" radius={[6, 6, 0, 0]}>
                  {sectorData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Deals Table */}
        <div className="glass-panel rounded-2xl border-outline-variant overflow-hidden">
          <div className="p-6 border-b border-outline-variant flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-headline-md text-lg text-on-surface font-bold">Recent Completed Term Sheets</h3>
              <p className="text-xs text-on-surface-variant">Latest syndicate agreements & valuations</p>
            </div>

            {/* Filter buttons */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
              <Filter className="w-4 h-4 text-on-surface-variant shrink-0" />
              {['All', 'AI & Data', 'CleanTech', 'FinTech', 'HealthTech'].map((sec) => (
                <button
                  key={sec}
                  onClick={() => setSectorFilter(sec)}
                  className={`px-3 py-1 rounded-md text-xs font-label-mono shrink-0 transition-colors ${
                    sectorFilter === sec 
                      ? 'bg-primary/20 text-primary border border-primary/30 font-bold' 
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-variant'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container-low/50 font-label-mono text-xs uppercase text-on-surface-variant">
                  <th className="py-4 px-6">Company</th>
                  <th className="py-4 px-6">Stage</th>
                  <th className="py-4 px-6">Sector</th>
                  <th className="py-4 px-6">Deal Size</th>
                  <th className="py-4 px-6">Valuation</th>
                  <th className="py-4 px-6">Lead Investor</th>
                  <th className="py-4 px-6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant text-sm">
                {filteredDeals.map((deal) => (
                  <tr key={deal.id} className="hover:bg-surface-variant/40 transition-colors">
                    <td className="py-4 px-6 font-bold text-on-surface flex items-center gap-2">
                      <div className="w-8 h-8 rounded bg-surface-variant border border-outline-variant flex items-center justify-center font-display text-xs text-primary">
                        {deal.company.charAt(0)}
                      </div>
                      {deal.company}
                    </td>
                    <td className="py-4 px-6 font-label-mono text-xs text-on-surface-variant">{deal.stage}</td>
                    <td className="py-4 px-6 text-on-surface-variant">{deal.sector}</td>
                    <td className="py-4 px-6 font-label-mono text-secondary font-bold">{deal.dealSize}</td>
                    <td className="py-4 px-6 font-label-mono text-on-surface">{deal.valuation}</td>
                    <td className="py-4 px-6 text-on-surface">{deal.lead}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-label-mono ${
                        deal.status === 'Closed' 
                          ? 'bg-secondary/10 text-secondary border border-secondary/20' 
                          : 'bg-tertiary/10 text-tertiary border border-tertiary/20'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full fill-current" />
                        {deal.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
