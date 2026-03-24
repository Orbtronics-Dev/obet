const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("obet_access_token");
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("obet_access_token", access);
  localStorage.setItem("obet_refresh_token", refresh);
  document.cookie = `obet_access_token=${access}; path=/; max-age=3600`;
}

export function clearTokens() {
  localStorage.removeItem("obet_access_token");
  localStorage.removeItem("obet_refresh_token");
  document.cookie = "obet_access_token=; path=/; max-age=0";
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (response.status === 401) {
    clearTokens();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail ?? "Request failed");
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(path: string) => apiFetch<T>(path),
  post: <T>(path: string, body: unknown) =>
    apiFetch<T>(path, { method: "POST", body: JSON.stringify(body) }),
};

// Auth
export const authApi = {
  register: (data: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
  }) => api.post("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    api.post<{ access_token: string; refresh_token: string; token_type: string }>(
      "/auth/login",
      data
    ),

  me: () =>
    api.get<{
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      is_admin: boolean;
      balance: number;
      preferred_currency: string;
    }>("/auth/me"),
};

// Markets
export const marketsApi = {
  list: (params?: { category?: string; page?: number; page_size?: number }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set("category", params.category);
    if (params?.page) qs.set("page", String(params.page));
    if (params?.page_size) qs.set("page_size", String(params.page_size));
    return api.get<MarketListResponse>(`/markets?${qs}`);
  },
  get: (id: string) => api.get<Market>(`/markets/${id}`),
  placeBet: (marketId: string, data: { side: "YES" | "NO"; amount: number }) =>
    api.post(`/markets/${marketId}/positions`, data),
};

// Positions
export const positionsApi = {
  list: () => api.get<Position[]>("/positions"),
};

// Wallet
export const walletApi = {
  get: () => api.get<WalletDetail>("/wallet"),
  deposit: (data: { amount_usd: number; success_url?: string; cancel_url?: string }) =>
    api.post<{ checkout_url: string; session_id: string }>("/wallet/deposit", data),
  transactions: () => api.get<Transaction[]>("/wallet/transactions"),
};

// Admin
export const adminApi = {
  createMarket: (data: {
    title: string;
    description: string;
    category: string;
    resolution_date: string;
  }) => api.post<Market>("/admin/markets", data),
  resolveMarket: (marketId: string, outcome: "YES" | "NO") =>
    api.post(`/admin/markets/${marketId}/resolve`, { outcome }),
};

// Types
export interface Market {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  resolution_date: string;
  outcome: string | null;
  total_yes_amount: number;
  total_no_amount: number;
  yes_probability: number;
  no_probability: number;
  creator_id: string;
  created_at: string;
}

export interface MarketListResponse {
  items: Market[];
  total: number;
  page: number;
  page_size: number;
}

export interface Position {
  id: string;
  market_id: string;
  user_id: string;
  side: "YES" | "NO";
  amount: number;
  status: "OPEN" | "WON" | "LOST" | "CANCELLED";
  payout: number | null;
  created_at: string;
}

export interface Transaction {
  id: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  reference: string | null;
  created_at: string;
}

export interface WalletDetail {
  balance: number;
  currency: string;
  recent_transactions: Transaction[];
}
