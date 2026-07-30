// In split deployments (e.g. frontend on Vercel, backend on Render), set
// VITE_API_BASE_URL to the backend's origin. Left unset, it defaults to the
// same origin (Docker Compose / local dev proxy).
const API_ORIGIN = (import.meta.env?.VITE_API_BASE_URL || '').trim().replace(/\/+$/, '');
const API_BASE = `${API_ORIGIN}/api`;

// Free-tier hosts (e.g. Render) spin the backend down after inactivity; the
// first request after a cold spell can take 10-50s and may bounce off a
// gateway error while the container boots. Retry transient failures instead
// of surfacing them as "invalid credentials" or similar to the user.
//
// Only safe (idempotent) requests retry by default: a 502/504 means the
// gateway gave up, NOT that the backend skipped the work, so blindly re-sending
// a POST can duplicate an offer, a chat message, or a broadcast. Endpoints that
// are genuinely safe to repeat opt in with `retry: true`.
const RETRY_DELAYS_MS = [2000, 5000, 10000];
const RETRYABLE_STATUSES = new Set([502, 503, 504]);

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Only safe methods retry unless a call explicitly opts in. Exported so the
 * rule stays checkable — see api.retry-check.ts.
 */
export function shouldRetry(method?: string, optIn?: boolean): boolean {
  const m = (method || 'GET').toUpperCase();
  return optIn ?? (m === 'GET' || m === 'HEAD');
}

export async function apiFetch<T>(
  endpoint: string,
  { retry, ...options }: RequestInit & { retry?: boolean } = {},
): Promise<T> {
  const canRetry = shouldRetry(options.method, retry);
  const token = localStorage.getItem('access_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    const isLastAttempt = !canRetry || attempt === RETRY_DELAYS_MS.length;

    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      if (!res.ok) {
        if (RETRYABLE_STATUSES.has(res.status) && !isLastAttempt) {
          await sleep(RETRY_DELAYS_MS[attempt]);
          continue;
        }
        const errData = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      return await res.json();
    } catch (err) {
      // A thrown TypeError here means the fetch itself failed (network error,
      // DNS not ready yet, etc.) rather than the server responding with an
      // error status — also worth retrying while the backend wakes up.
      if (err instanceof TypeError && !isLastAttempt) {
        await sleep(RETRY_DELAYS_MS[attempt]);
        continue;
      }
      throw err;
    }
  }

  // Unreachable: the final attempt always returns or throws above.
  throw new Error('Request failed');
}

// Auth API
export const authApi = {
  login: (userId: string, password: string) =>
    apiFetch<{ user: any; accessToken: string; refreshToken: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ userId, password }),
      // Safe to repeat: re-issuing tokens is idempotent, and auto-provisioning
      // is guarded by the unique email constraint. This is the call that
      // actually suffers from backend cold starts.
      retry: true
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
  getAllEvents: () => apiFetch<any[]>('/events'),
  getById: (id: string) => apiFetch<any>(`/events/${id}`),
  start: (id: string) => apiFetch<any>(`/events/${id}/start`, { method: 'POST' }),
  pause: (id: string) => apiFetch<any>(`/events/${id}/pause`, { method: 'POST' }),
  resume: (id: string) => apiFetch<any>(`/events/${id}/resume`, { method: 'POST' }),
  end: (id: string) => apiFetch<any>(`/events/${id}/end`, { method: 'POST' })
};

// Pitch sessions & queue
export const pitchApi = {
  getForEvent: (eventId: string) => apiFetch<any>(`/pitch/event/${eventId}`)
};

export const queueApi = {
  list: (eventId: string) => apiFetch<any[]>(`/queue?eventId=${eventId}`),
  join: (data: { eventId: string; startupId: string }) =>
    apiFetch<any>('/queue/join', { method: 'POST', body: JSON.stringify(data) }),
  advance: (eventId: string) => apiFetch<any[]>(`/queue/advance/${eventId}`, { method: 'POST' }),
  skip: (id: string) => apiFetch<any[]>(`/queue/${id}/skip`, { method: 'POST' })
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
    }),
  withdraw: (offerId: string) =>
    apiFetch<any>(`/offers/${offerId}/withdraw`, {
      method: 'POST'
    })
};

// Startups API
export const startupsApi = {
  getAll: () => apiFetch<any[]>('/startups'),
  getById: (id: string) => apiFetch<any>(`/startups/${id}`),
  create: (data: {
    name: string; sector: string; stage: string; description?: string;
    fundingAsk: string; equityOffered: string; valuation: string; arr?: string; clients?: string; pitchDeckUrl?: string;
  }) => apiFetch<any>('/startups', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Record<string, unknown>) =>
    apiFetch<any>(`/startups/${id}`, { method: 'PATCH', body: JSON.stringify(data) })
};

// Timeline API
export const timelineApi = {
  getForStartup: (startupId: string) => apiFetch<any[]>(`/timeline/${startupId}`)
};

// Users API
export const usersApi = {
  getMe: () => apiFetch<any>('/users/me'),
  updateMe: (data: { name?: string; company?: string; avatar?: string }) =>
    apiFetch<any>('/users/me', { method: 'PATCH', body: JSON.stringify(data) })
};

// Founders API
export const foundersApi = {
  getMe: () => apiFetch<any>('/founders/me'),
  getMyStartup: () => apiFetch<any>('/founders/me/startup'),
  updateMe: (data: { bio?: string; startupId?: string }) =>
    apiFetch<any>('/founders/me', { method: 'PATCH', body: JSON.stringify(data) })
};

// Sharks API
export const sharksApi = {
  getAll: () => apiFetch<any[]>('/sharks'),
  getMe: () => apiFetch<any>('/sharks/me'),
  updateMe: (data: { fundName?: string; minTicket?: string; maxTicket?: string }) =>
    apiFetch<any>('/sharks/me', { method: 'PATCH', body: JSON.stringify(data) }),
  getPortfolio: (id: string) => apiFetch<any>(`/sharks/${id}/portfolio`)
};

// Admin API
export const adminApi = {
  getActivityLogs: () => apiFetch<any[]>('/admin/activity-logs'),
  broadcast: (data: { title: string; message: string }) =>
    apiFetch<any>('/admin/broadcast', { method: 'POST', body: JSON.stringify(data) })
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
