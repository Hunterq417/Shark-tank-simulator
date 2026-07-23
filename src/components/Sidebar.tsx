import {
  LayoutDashboard,
  Radio,
  Briefcase,
  BarChart3,
  Settings,
  HelpCircle,
  LogOut,
  Plus
} from 'lucide-react';
import { ViewState } from '../types';
import { ReactNode } from 'react';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  onOpenNewBid: () => void;
  onOpenSupport: () => void;
  onOpenSignOut: () => void;
}

export function Sidebar({ currentView, onNavigate, onOpenNewBid, onOpenSupport, onOpenSignOut }: SidebarProps) {
  return (
    <nav className="hidden md:flex flex-col h-full py-6 px-4 bg-surface-container-low border-r border-outline-variant z-40 w-64 shrink-0">
      <div className="mb-8 px-4 cursor-pointer" onClick={() => onNavigate('dashboard')}>
        <h1 className="font-headline-md text-xl font-bold text-on-surface">VentureFlow</h1>
        <p className="font-label-mono text-xs text-on-surface-variant uppercase tracking-wider mt-1">Institutional Grade</p>
      </div>
      
      <button 
        onClick={onOpenNewBid}
        className="mb-8 w-full py-3 px-4 rounded-lg bg-gradient-to-b from-primary to-blue-700 text-white font-label-mono text-xs uppercase tracking-wider border border-blue-600 shadow-sm hover:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        New Bid
      </button>

      <div className="flex-1 space-y-1">
        <NavItem 
          icon={<LayoutDashboard className="w-5 h-5" />} 
          label="Dashboard" 
          isActive={currentView === 'dashboard'} 
          onClick={() => onNavigate('dashboard')} 
        />
        <NavItem 
          icon={<Radio className="w-5 h-5" />} 
          label="Live Pitches" 
          isActive={currentView === 'live-pitch' || currentView === 'negotiation'} 
          onClick={() => onNavigate('live-pitch')} 
          highlight
        />
        <NavItem 
          icon={<Briefcase className="w-5 h-5" />} 
          label="My Offers" 
          isActive={currentView === 'offers'} 
          onClick={() => onNavigate('offers')} 
        />
        <NavItem 
          icon={<BarChart3 className="w-5 h-5" />} 
          label="Analytics" 
          isActive={currentView === 'analytics'} 
          onClick={() => onNavigate('analytics')} 
        />
        <NavItem 
          icon={<Settings className="w-5 h-5" />} 
          label="Settings" 
          isActive={currentView === 'settings'} 
          onClick={() => onNavigate('settings')} 
        />
      </div>

      <div className="mt-auto space-y-1 pt-4 border-t border-outline-variant">
        <NavItem 
          icon={<HelpCircle className="w-5 h-5" />} 
          label="Support" 
          isActive={false} 
          onClick={onOpenSupport} 
        />
        <NavItem 
          icon={<LogOut className="w-5 h-5" />} 
          label="Sign Out" 
          isActive={false} 
          onClick={onOpenSignOut} 
        />
      </div>
    </nav>
  );
}


function NavItem({ icon, label, isActive, onClick, highlight }: { icon: ReactNode, label: string, isActive: boolean, onClick: () => void, highlight?: boolean }) {
  if (highlight && isActive) {
    return (
      <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-3 bg-secondary-container/20 text-secondary border border-secondary/30 rounded-lg transition-all duration-200">
        {icon}
        <span className="font-label-mono text-xs uppercase tracking-wider font-bold">{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        isActive 
          ? 'bg-surface-variant text-on-surface' 
          : 'text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface'
      }`}
    >
      {icon}
      <span className={`font-label-mono text-xs uppercase tracking-wider ${isActive ? 'font-bold' : ''}`}>
        {label}
      </span>
    </button>
  );
}
