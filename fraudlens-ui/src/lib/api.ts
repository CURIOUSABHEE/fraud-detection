const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const FASTAPI_URL = import.meta.env.VITE_FASTAPI_URL || 'http://localhost:8000';

async function request<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, ...init } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init.headers as Record<string, string> | undefined),
  };
  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Request failed: ${res.status}`);
  return data as T;
}

async function fastapiRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  const res = await fetch(`${FASTAPI_URL}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || `Request failed: ${res.status}`);
  return data as T;
}

export const api = {
  get: <T>(path: string, token?: string | null) =>
    request<T>(path, { method: 'GET', token }),

  post: <T>(path: string, body: unknown, token?: string | null) =>
    request<T>(path, { method: 'POST', body: JSON.stringify(body), token }),

  put: <T>(path: string, body: unknown, token?: string | null) =>
    request<T>(path, { method: 'PUT', body: JSON.stringify(body), token }),

  patch: <T>(path: string, body: unknown, token?: string | null) =>
    request<T>(path, { method: 'PATCH', body: JSON.stringify(body), token }),
};

export const fastapi = {
  get: <T>(path: string) =>
    fastapiRequest<T>(path, { method: 'GET' }),

  post: <T>(path: string, body: unknown) =>
    fastapiRequest<T>(path, { method: 'POST', body: JSON.stringify(body) }),
};
