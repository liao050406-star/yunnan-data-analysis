/**
 * 前端 API 客户端
 * 封装所有与后端 Express API 的交互
 */

const API_BASE =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:3001/api`;

// ─── Request Helper ───────────────────────────────────────────────────────────
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token');

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `请求失败 (${res.status})`);
  return data as T;
}

const get = <T>(url: string) => request<T>(url);
const post = <T>(url: string, body: object) =>
  request<T>(url, { method: 'POST', body: JSON.stringify(body) });
const put = <T>(url: string, body: object) =>
  request<T>(url, { method: 'PUT', body: JSON.stringify(body) });

// ─── Auth ────────────────────────────────────────────────────────────────────
export const authApi = {
  login: (username: string, password: string) =>
    post<{ session: { access_token: string }; user: any }>('/auth/login', { username, password }),

  logout: () => post<void>('/auth/logout', {}),

  me: () => get<{ user: any }>('/auth/me'),
};

// ─── Enterprise Filing ────────────────────────────────────────────────────────
export const filingApi = {
  getMyFiling: () => get<{ filing: any }>('/filings/my'),

  createFiling: (data: object) => post<{ filing: any }>('/filings', data),

  updateFiling: (id: string, data: object) => put<{ filing: any }>(`/filings/${id}`, data),

  saveDraft: (id: string, data: object) =>
    post<{ filing: any }>(`/filings/${id}/save-draft`, data),
};

// ─── Admin: Audit ─────────────────────────────────────────────────────────────
export const adminFilingApi = {
  list: (params?: { status?: string; region?: string; keyword?: string; page?: number }) => {
    const qs = new URLSearchParams(params as any).toString();
    return get<{ filings: any[]; total: number }>(`/admin/filings${qs ? '?' + qs : ''}`);
  },

  audit: (id: string, action: 'approve' | 'reject', note?: string) =>
    put<{ filing: any }>(`/admin/filings/${id}/audit`, { action, note }),
};

// ─── Data Submissions ─────────────────────────────────────────────────────────
export const submissionApi = {
  getMy: () => get<{ submissions: any[] }>('/submissions/my'),

  getCurrent: () =>
    get<{ submission: any; cycle: any; enterprise: any }>('/submissions/current'),

  submit: (data: object, isDraft = false) =>
    post<{ submission: any }>('/submissions', { ...data, isDraft }),

  adminAudit: (id: string, action: 'approve' | 'reject', note?: string) =>
    put<{ submission: any }>(`/admin/submissions/${id}/audit`, { action, note }),
};

// ─── Analytics ────────────────────────────────────────────────────────────────
export const analyticsApi = {
  overview: () => get<{
    totalEnterprises: number;
    pendingAudit: number;
    totalSubmissions: number;
    pendingSubmissions: number;
    totalEmployees: number;
  }>('/analytics/overview'),

  trend: () => get<{ trend: Array<{ period: string; total: number }> }>('/analytics/trend'),

  byIndustry: () =>
    get<{ distribution: Array<{ industry: string; label: string; count: number }> }>('/analytics/by-industry'),

  byRegion: () =>
    get<{ regions: Array<{ name: string; totalEmployees: number }> }>('/analytics/by-region'),
};

// ─── Survey Cycles ────────────────────────────────────────────────────────────
export const cyclesApi = {
  list: () => get<{ cycles: any[] }>('/cycles'),
  create: (data: object) => post<{ cycle: any }>('/cycles', data),
  update: (id: string, data: object) => put<{ cycle: any }>(`/cycles/${id}`, data),
};

// ─── Policy Library ───────────────────────────────────────────────────────────
export const policyApi = {
  list: (params?: { keyword?: string; category?: string }) => {
    const qs = new URLSearchParams(params as any).toString();
    return get<{ policies: any[] }>(`/policies${qs ? '?' + qs : ''}`);
  },
};

// ─── Compliance ───────────────────────────────────────────────────────────────
export const complianceApi = {
  check: () =>
    get<{ score: number; items: any[] }>('/compliance/check'),
};

// ─── Regional Grids ───────────────────────────────────────────────────────────
export const gridsApi = {
  list: () => get<{ grids: any[] }>('/grids'),
  create: (data: object) => post<{ grid: any }>('/grids', data),
};

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const auditLogsApi = {
  list: (page = 1) => get<{ logs: any[]; total: number }>(`/audit-logs?page=${page}`),
};

// ─── Feedback ─────────────────────────────────────────────────────────────────
export const feedbackApi = {
  submit: (data: { category: string; subject: string; content: string; priority?: string }) =>
    post<{ ticket: any }>('/feedback', data),

  getMy: () => get<{ tickets: any[] }>('/feedback/my'),
};
