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
      <div className="mb-8 px-3 cursor-pointer" onClick={() => onNavigate('dashboard')}>
        <h1 className="font-display text-lg font-semibold text-on-surface tracking-tight">Sharktank</h1>
        <p className="font-label-mono text-[9px] text-primary/70 uppercase tracking-[0.3em] mt-1">Private Capital</p>
      </div>

      <button
        onClick={onOpenNewBid}
        className="mb-8 w-full py-3 px-4 bg-primary text-on-primary font-label-mono text-[11px] uppercase tracking-[0.15em] hover:bg-primary-fixed transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
      <button onClick={onClick} className="w-full flex items-center gap-3 px-4 py-2.5 text-secondary-fixed transition-colors relative">
        <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-px bg-secondary-fixed" />
        {icon}
        <span className="font-label-mono text-[11px] uppercase tracking-[0.15em]">{label}</span>
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-secondary animate-pulse" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-2.5 transition-colors relative ${
        isActive
          ? 'text-on-surface'
          : 'text-on-surface-variant hover:text-on-surface'
      }`}
    >
      {isActive && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-4 w-px bg-primary" />}
      {icon}
      <span className="font-label-mono text-[11px] uppercase tracking-[0.15em]">
        {label}
      </span>
    </button>
  );
}
