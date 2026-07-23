export type ViewState = 'dashboard' | 'live-pitch' | 'offers' | 'negotiation' | 'analytics' | 'settings';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'offer' | 'system' | 'negotiation' | 'event';
}

export interface UserProfile {
  id?: string;
  name: string;
  role: 'Investor' | 'Founder' | 'Admin';
  company: string;
  email: string;
  avatar: string;
  balance: string;
  dealsClosed: number;
}
