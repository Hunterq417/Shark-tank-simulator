import { useState } from 'react';
import { Search, Bell, User, Check, X, Shield, ArrowRight, Sparkles, ExternalLink } from 'lucide-react';
import { NotificationItem, UserProfile, ViewState } from '../types';

interface TopBarProps {
  title?: string;
  user: UserProfile;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onClearNotifications: () => void;
  onNavigate: (view: ViewState) => void;
  onToggleRole: () => void;
  onOpenAuthModal?: () => void;
}

export function TopBar({ 
  title, 
  user, 
  notifications, 
  onMarkNotificationRead, 
  onClearNotifications, 
  onNavigate,
  onToggleRole,
  onOpenAuthModal
}: TopBarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const mockSearchDatabase = [
    { name: 'Nexus AI', type: 'Pitch Event', details: 'Ask $2.5M for 15% | AI & Data', view: 'live-pitch' as ViewState },
    { name: 'Quantum Dynamics AI', type: 'Active Deal', details: 'Series A | $4.5M offered', view: 'negotiation' as ViewState },
    { name: 'Apex Ventures', type: 'Lead Syndicate', details: 'Lead Investor | $25M Fund', view: 'offers' as ViewState },
    { name: 'Silver Lake', type: 'Syndicate Pool', details: 'Institutional Investor', view: 'offers' as ViewState },
    { name: 'EcoTech Solutions', type: 'Pitch Event', details: 'Ask $1.8M for 10% | CleanTech', view: 'analytics' as ViewState },
  ];

  const filteredSearch = searchQuery.trim() === '' 
    ? [] 
    : mockSearchDatabase.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        item.type.toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <header className="flex justify-between items-center px-8 h-16 border-b border-outline-variant bg-surface-container-low/90 backdrop-blur-md shrink-0 z-30 relative">
      {/* Title / Breadcrumb */}
      <div className="flex items-center gap-3">
        <h2 className="font-headline-md text-lg text-on-surface font-bold">
          {title || 'VentureFlow Platform'}
        </h2>
      </div>

      {/* Center/Right controls */}
      <div className="flex items-center gap-4">
        
        {/* Search Bar */}
        <div className="relative">
          <div className="bg-surface border border-outline-variant/60 flex items-center px-3 py-1.5 rounded-lg focus-within:border-primary transition-colors">
            <Search className="w-4 h-4 text-on-surface-variant mr-2" />
            <input 
              type="text" 
              placeholder="Search deals, founders, investors..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="bg-transparent border-none outline-none text-xs text-on-surface w-48 md:w-64 placeholder:text-on-surface-variant font-body-md"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-on-surface-variant hover:text-on-surface">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Search Dropdown */}
          {showSearchResults && filteredSearch.length > 0 && (
            <div className="absolute right-0 top-11 w-80 bg-surface-container border border-outline-variant rounded-xl shadow-2xl p-2 z-50 glass-panel">
              <div className="text-[10px] font-label-mono uppercase text-on-surface-variant px-2 py-1 border-b border-outline-variant/50">
                Found ({filteredSearch.length}) results
              </div>
              <div className="divide-y divide-outline-variant/30 max-h-64 overflow-y-auto">
                {filteredSearch.map((res) => (
                  <button
                    key={res.name}
                    onClick={() => {
                      onNavigate(res.view);
                      setShowSearchResults(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-2.5 hover:bg-surface-variant/60 rounded-lg transition-colors flex justify-between items-center group cursor-pointer"
                  >
                    <div>
                      <div className="text-sm font-bold text-on-surface group-hover:text-primary transition-colors">{res.name}</div>
                      <div className="text-xs text-on-surface-variant">{res.details}</div>
                    </div>
                    <span className="text-[10px] font-label-mono text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{res.type}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Button */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 hover:bg-surface-variant rounded-lg text-on-surface-variant hover:text-on-surface transition-colors relative cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-secondary border-2 border-background animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-80 sm:w-96 bg-surface-container border border-outline-variant rounded-2xl shadow-2xl p-4 z-50 glass-panel space-y-3">
              <div className="flex justify-between items-center border-b border-outline-variant pb-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-primary" />
                  <h4 className="font-headline-md text-sm text-on-surface font-bold">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="bg-secondary/20 text-secondary border border-secondary/30 text-[10px] font-label-mono px-2 py-0.5 rounded-full">{unreadCount} new</span>
                  )}
                </div>
                <button 
                  onClick={onClearNotifications}
                  className="text-[10px] font-label-mono text-on-surface-variant hover:text-on-surface uppercase"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {notifications.length === 0 ? (
                  <div className="text-xs text-on-surface-variant text-center py-6">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div 
                      key={n.id} 
                      onClick={() => onMarkNotificationRead(n.id)}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-colors ${
                        n.read ? 'bg-surface-container-low/40 border-outline-variant/30 text-on-surface-variant' : 'bg-surface-container/90 border-secondary/30 text-on-surface'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold">{n.title}</span>
                        <span className="font-label-mono text-[10px] text-on-surface-variant">{n.timestamp}</span>
                      </div>
                      <p className="text-xs leading-relaxed">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Button */}
        <div className="relative">
          <button 
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-3 pl-3 border-l border-outline-variant hover:opacity-90 transition-opacity cursor-pointer"
          >
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-bold text-on-surface leading-tight">{user.name}</span>
              <span className="text-[10px] font-label-mono text-secondary uppercase">{user.role}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-surface-variant border-2 border-primary overflow-hidden shadow-md">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
          </button>

          {/* Profile Menu Dropdown */}
          {showProfileMenu && (
            <div className="absolute right-0 top-12 w-72 bg-surface-container border border-outline-variant rounded-2xl shadow-2xl p-4 z-50 glass-panel space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-outline-variant">
                <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full border border-primary object-cover" />
                <div>
                  <h4 className="text-sm font-bold text-on-surface">{user.name}</h4>
                  <p className="text-xs text-on-surface-variant">{user.company}</p>
                  <p className="text-[10px] font-label-mono text-secondary">{user.email}</p>
                </div>
              </div>

              <div className="bg-surface-container-low p-3 rounded-xl border border-outline-variant space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">Active Role:</span>
                  <span className="font-bold text-secondary font-label-mono">{user.role}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-on-surface-variant">Escrow Balance:</span>
                  <span className="font-bold text-on-surface font-label-mono">{user.balance}</span>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                {onOpenAuthModal && (
                  <button 
                    onClick={() => {
                      onOpenAuthModal();
                      setShowProfileMenu(false);
                    }}
                    className="w-full text-left py-2 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-xs font-label-mono text-primary flex items-center justify-between"
                  >
                    <span>Switch Account</span>
                    <User className="w-3.5 h-3.5" />
                  </button>
                )}

                <button 
                  onClick={() => {
                    onToggleRole();
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded-lg bg-surface-variant/50 hover:bg-surface-variant text-xs font-label-mono text-primary flex items-center justify-between"
                >
                  <span>Switch Role to {user.role === 'Investor' ? 'Founder' : 'Investor'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button 
                  onClick={() => {
                    onNavigate('settings');
                    setShowProfileMenu(false);
                  }}
                  className="w-full text-left py-2 px-3 rounded-lg hover:bg-surface-variant/50 text-xs font-label-mono text-on-surface flex items-center justify-between"
                >
                  <span>Edit Profile & Settings</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
