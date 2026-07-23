import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { ViewState, UserProfile, NotificationItem } from './types';
import { LivePitch } from './components/LivePitch';
import { Offers } from './components/Offers';
import { Negotiation } from './components/Negotiation';
import { Analytics } from './components/Analytics';
import { Settings } from './components/Settings';
import { TopBar } from './components/TopBar';
import { LoginPage } from './components/LoginPage';
import { NewBidModal, ViewDeckModal, SupportModal, SignOutModal } from './components/ModalsAndOverlays';
import { notificationsApi, offersApi, authApi, eventsApi, usersApi } from './lib/api';
import { getSocket } from './lib/socket';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

function mapApiUser(userData: any): UserProfile {
  return {
    id: userData.id,
    name: userData.name,
    role: userData.role === 'Admin' ? 'Admin' : userData.role === 'Founder' ? 'Founder' : 'Investor',
    company: userData.company || 'Syndicate',
    email: userData.email,
    avatar: userData.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=256&auto=format&fit=crop',
    balance: userData.balance || '$12,500,000',
    dealsClosed: userData.dealsClosed || 0
  };
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [authStatus, setAuthStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<UserProfile | null>(null);

  // Check stored auth session on mount
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setAuthStatus('unauthenticated');
      return;
    }

    authApi.getMe()
      .then((userData) => {
        if (userData?.email) {
          setUser(mapApiUser(userData));
          setAuthStatus('authenticated');
        } else {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          setAuthStatus('unauthenticated');
        }
      })
      .catch(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setAuthStatus('unauthenticated');
      });
  }, []);

  const handleLoginSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    setAuthStatus('authenticated');
    setCurrentView('dashboard');
  };

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setAuthStatus('unauthenticated');
    setCurrentView('dashboard');
  };

  // Notifications State
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { id: '1', title: 'New Term Sheet Offer', message: 'Apex Ventures submitted $2.5M offer for Quantum Dynamics AI.', timestamp: '10m ago', read: false, type: 'offer' },
    { id: '2', title: 'Live Pitch Starting', message: 'Nexus AI is entering the live stage now.', timestamp: '1h ago', read: false, type: 'event' },
    { id: '3', title: 'Escrow Verification', message: 'Proof of funds confirmed for $12.5M capital line.', timestamp: '3h ago', read: true, type: 'system' }
  ]);

  // Modals State
  const [isNewBidOpen, setIsNewBidOpen] = useState(false);
  const [isDeckOpen, setIsDeckOpen] = useState(false);
  const [deckCompany, setDeckCompany] = useState('Nexus AI');
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isSignOutOpen, setIsSignOutOpen] = useState(false);

  // The startup currently on the live pitch stage (target for new bids)
  const [liveStartupId, setLiveStartupId] = useState<string | null>(null);

  useEffect(() => {
    if (authStatus !== 'authenticated') return;

    eventsApi.getLiveEvent()
      .then((event) => setLiveStartupId(event?.startupId || event?.startup?.id || null))
      .catch(() => {});
  }, [authStatus]);

  // Fetch initial notifications from API when authenticated
  useEffect(() => {
    if (authStatus !== 'authenticated') return;

    notificationsApi.getAll()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const formatted: NotificationItem[] = data.map(n => ({
            id: n.id,
            title: n.title,
            message: n.message,
            timestamp: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            read: n.read,
            type: n.type as NotificationItem['type']
          }));
          setNotifications(formatted);
        }
      })
      .catch(() => {});
  }, [authStatus]);

  // Connect Socket.io real-time listeners when authenticated
  useEffect(() => {
    if (authStatus !== 'authenticated') return;

    const socket = getSocket();

    socket.on('offer_created', (offer: any) => {
      const newNotif: NotificationItem = {
        id: offer.id || Date.now().toString(),
        title: `New Offer from ${offer.sharkName || 'Investor'}`,
        message: `Submitted ${offer.amount} bid for ${offer.equity} equity.`,
        timestamp: 'Just now',
        read: false,
        type: 'offer'
      };
      setNotifications(prev => [newNotif, ...prev]);
    });

    return () => {
      socket.off('offer_created');
    };
  }, [authStatus]);

  const handleMarkNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    notificationsApi.markRead(id).catch(() => {});
  };

  const handleClearNotifications = () => {
    setNotifications([]);
    notificationsApi.markAllRead().catch(() => {});
  };

  const handleToggleRole = () => {
    setUser(prev => prev ? {
      ...prev,
      role: prev.role === 'Investor' ? 'Founder' : 'Investor'
    } : prev);
  };

  const handleSubmitBid = (bid: { company: string; amount: string; equity: string; terms: string }) => {
    if (!user) return;

    const newNotification: NotificationItem = {
      id: Date.now().toString(),
      title: `Bid Submitted: ${bid.company}`,
      message: `You submitted a bid of ${bid.amount} for ${bid.equity} equity.`,
      timestamp: 'Just now',
      read: false,
      type: 'offer'
    };
    setNotifications(prev => [newNotification, ...prev]);

    offersApi.create({
      startupId: liveStartupId || 'nexus-ai',
      amount: bid.amount,
      equity: bid.equity,
      terms: bid.terms
    }).catch(() => {});
  };

  const handleOpenDeck = (company: string) => {
    setDeckCompany(company);
    setIsDeckOpen(true);
  };

  const getPageTitle = (view: ViewState) => {
    switch (view) {
      case 'dashboard': return 'Venture Capital Console';
      case 'live-pitch': return 'Live Pitching Stage';
      case 'offers': return 'Founder Workspace & Term Sheets';
      case 'negotiation': return 'Live Negotiation Room';
      case 'analytics': return 'Portfolio & Deal Flow Analytics';
      case 'settings': return 'Platform & Profile Settings';
      default: return 'Sharktank Simulator';
    }
  };

  if (authStatus === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-label-mono text-on-surface-variant uppercase tracking-wider">Loading...</p>
        </div>
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView}
        onOpenNewBid={() => setIsNewBidOpen(true)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenSignOut={() => setIsSignOutOpen(true)}
      />

      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopBar 
          title={getPageTitle(currentView)}
          user={user}
          notifications={notifications}
          onMarkNotificationRead={handleMarkNotificationRead}
          onClearNotifications={handleClearNotifications}
          onNavigate={setCurrentView}
          onToggleRole={handleToggleRole}
          onOpenAuthModal={handleSignOut}
        />

        <div className="flex-1 overflow-hidden flex flex-col">
          {currentView === 'dashboard' && (
            <Dashboard 
              onNavigate={setCurrentView} 
              user={user}
              notifications={notifications}
              onMarkNotificationRead={handleMarkNotificationRead}
              onClearNotifications={handleClearNotifications}
              onToggleRole={handleToggleRole}
              onOpenNewBid={() => setIsNewBidOpen(true)}
              onOpenViewDeck={handleOpenDeck}
            />
          )}

          {currentView === 'live-pitch' && (
            <LivePitch 
              onNavigate={setCurrentView} 
              onOpenNewBid={() => setIsNewBidOpen(true)}
              onOpenViewDeck={handleOpenDeck}
            />
          )}

          {currentView === 'offers' && (
            <Offers 
              onNavigate={setCurrentView} 
              onOpenNewBid={() => setIsNewBidOpen(true)}
            />
          )}

          {currentView === 'negotiation' && (
            <Negotiation 
              onNavigate={setCurrentView} 
              onOpenCounterOffer={() => setIsNewBidOpen(true)}
            />
          )}

          {currentView === 'analytics' && (
            <Analytics onNavigate={setCurrentView} />
          )}

          {currentView === 'settings' && (
            <Settings user={user} onUpdateUser={(updated) => {
              setUser(prev => prev ? { ...prev, ...updated } : prev);
              const { name, company, avatar } = updated;
              if (name || company || avatar) {
                usersApi.updateMe({ name, company, avatar }).catch(() => {});
              }
            }} />
          )}
        </div>
      </main>

      <NewBidModal 
        isOpen={isNewBidOpen} 
        onClose={() => setIsNewBidOpen(false)} 
        onSubmitBid={handleSubmitBid} 
      />

      <ViewDeckModal 
        isOpen={isDeckOpen} 
        onClose={() => setIsDeckOpen(false)} 
        companyName={deckCompany} 
      />

      <SupportModal 
        isOpen={isSupportOpen} 
        onClose={() => setIsSupportOpen(false)} 
      />

      <SignOutModal 
        isOpen={isSignOutOpen} 
        onClose={() => setIsSignOutOpen(false)} 
        onConfirm={() => {
          setIsSignOutOpen(false);
          handleSignOut();
        }} 
      />
    </div>
  );
}
