import type { CurrentUser } from './types';

/**
 * All browser traffic goes through the Next.js route handler at `app/api/[...path]/route.ts`,
 * which forwards to the ASP.NET Core API using the server-side BACKEND_URL.
 * One base URL, one code path — no runtime URL guessing.
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, '') || '/api';

export function buildUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${cleanPath}`;
}

export class ApiError extends Error {
  constructor(
    public readonly message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem('token');
}

export function clearSession(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem('token');
    window.localStorage.removeItem('user');
  }
}

export function logout(): void {
  clearSession();
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

/** Endpoints where a 401 is an expected answer, not an expired session. */
const PUBLIC_PATHS = ['/auth/login'];

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const token = getToken();
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;

  let response: Response;
  try {
    response = await fetch(buildUrl(cleanPath), {
      ...options,
      headers,
      cache: 'no-store',
    });
  } catch {
    throw new ApiError(
      'Cannot reach the API. Start the backend, then reload this page.',
      0,
    );
  }

  if (!response.ok) {
    // An expired or rejected session ends the session — but a failed login does not.
    if (response.status === 401 && !PUBLIC_PATHS.includes(cleanPath) && typeof window !== 'undefined') {
      logout();
    }
    throw new ApiError(await readErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function getMe(): Promise<CurrentUser> {
  return api<CurrentUser>('/auth/me');
}

export async function readErrorMessage(response: Response): Promise<string> {
  try {
    const cloned = response.clone();
    const payload = (await cloned.json()) as Record<string, unknown>;

    if (typeof payload.detail === 'string' && payload.detail.trim()) {
      return payload.detail;
    }

    const validationMessage = firstValidationMessage(payload.errors);
    if (validationMessage) {
      return validationMessage;
    }

    if (typeof payload.title === 'string' && payload.title.trim()) {
      return payload.title;
    }
  } catch {
    // Fall through to a status-based message when the body is not JSON (e.g. 500 HTML or 502 Bad Gateway).
  }

  if (response.status >= 500) {
    return `Server error (HTTP ${response.status}). Please try again later.`;
  }

  return `Request failed with HTTP ${response.status}.`;
}

function firstValidationMessage(value: unknown): string | null {
  if (Array.isArray(value)) {
    const first = value[0];
    if (typeof first === 'string') {
      return first;
    }

    if (first && typeof first === 'object') {
      const item = first as Record<string, unknown>;
      if (typeof item.errorMessage === 'string') {
        return item.errorMessage;
      }
    }
  }

  if (value && typeof value === 'object') {
    for (const entry of Object.values(value as Record<string, unknown>)) {
      if (Array.isArray(entry) && typeof entry[0] === 'string') {
        return entry[0];
      }
    }
  }

  return null;
}
