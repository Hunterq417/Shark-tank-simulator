const API_BASE = '/api';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// Auth API
export const authApi = {
  login: (userId: string, password: string) =>
    apiFetch<{ user: any; accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ userId, password })
    }),
  register: (data: { email: string; password: string; name: string; role?: string; company?: string }) =>
    apiFetch<{ user: any; accessToken: string; refreshToken: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  forgotPassword: (email: string) =>
    apiFetch<{ message: string; resetCode?: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    }),
  resetPassword: (data: { email: string; code?: string; newPassword: string }) =>
    apiFetch<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  getMe: () => apiFetch<any>('/auth/me')
};

// Events & Pitch API
export const eventsApi = {
  getLiveEvent: () => apiFetch<any>('/events/live'),
  getAllEvents: () => apiFetch<any[]>('/events')
};

// Offers API
export const offersApi = {
  getAll: () => apiFetch<any[]>('/offers'),
  create: (data: { startupId: string; amount: string; equity: string; terms?: string; valuation?: string }) =>
    apiFetch<any>('/offers', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  counter: (offerId: string, data: { amount: string; equity: string; terms?: string }) =>
    apiFetch<any>(`/offers/${offerId}/counter`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  accept: (offerId: string) =>
    apiFetch<any>(`/offers/${offerId}/accept`, {
      method: 'POST'
    }),
  reject: (offerId: string) =>
    apiFetch<any>(`/offers/${offerId}/reject`, {
      method: 'POST'
    })
};

// Deals & AI Deal Analyzer API
export const dealsApi = {
  getAll: () => apiFetch<any[]>('/deals'),
  getAnalytics: () => apiFetch<any>('/deals/analytics'),
  analyze: (data: any) =>
    apiFetch<any>('/deals/analyze', {
      method: 'POST',
      body: JSON.stringify(data)
    })
};

// Notifications API
export const notificationsApi = {
  getAll: () => apiFetch<any[]>('/notifications'),
  markRead: (id: string) =>
    apiFetch<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: () =>
    apiFetch<any>('/notifications/read-all', { method: 'POST' })
};

// Negotiations & Chat API
export const negotiationsApi = {
  getRoom: (roomCode: string) => apiFetch<any>(`/negotiations/room/${roomCode}`),
  sendMessage: (negotiationId: string, data: { text: string; senderRole?: string }) =>
    apiFetch<any>(`/negotiations/${negotiationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),
  toggleFocus: (negotiationId: string, focusMode: boolean) =>
    apiFetch<any>(`/negotiations/${negotiationId}/focus`, {
      method: 'PATCH',
      body: JSON.stringify({ focusMode })
    })
};
