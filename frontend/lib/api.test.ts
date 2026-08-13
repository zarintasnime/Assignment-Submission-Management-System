import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { api, ApiError, buildUrl, getToken, logout, readErrorMessage } from './api';

describe('lib/api', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('buildUrl', () => {
    it('normalizes base url and formats endpoints with leading slash correctly', () => {
      expect(buildUrl('/admin/teachers')).toContain('/api/admin/teachers');
      expect(buildUrl('admin/students')).toContain('/api/admin/students');
      expect(buildUrl('/admin/teachers')).not.toContain('//admin');
    });
  });

  describe('getToken & logout', () => {
    it('returns token from localStorage if present', () => {
      localStorage.setItem('token', 'fake-jwt-token');
      expect(getToken()).toBe('fake-jwt-token');
    });

    it('returns null if no token is stored', () => {
      expect(getToken()).toBeNull();
    });

    it('clears token and user on logout', () => {
      localStorage.setItem('token', 'fake-jwt');
      localStorage.setItem('user', JSON.stringify({ fullName: 'Test User' }));
      
      delete (window as unknown as { location?: unknown }).location;
      (window as unknown as { location: { href: string } }).location = { href: '' };

      logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(window.location.href).toBe('/login');
    });
  });

  describe('readErrorMessage', () => {
    it('extracts detail field if present', async () => {
      const response = new Response(JSON.stringify({ detail: 'Invalid credentials provided' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
      const message = await readErrorMessage(response);
      expect(message).toBe('Invalid credentials provided');
    });

    it('extracts validation message from errors array', async () => {
      const response = new Response(
        JSON.stringify({ errors: [{ errorMessage: 'Email format is invalid' }] }),
        { status: 400, headers: { 'Content-Type': 'application/json' } },
      );
      const message = await readErrorMessage(response);
      expect(message).toBe('Email format is invalid');
    });

    it('handles non-JSON response gracefully (e.g. 502 Bad Gateway HTML page)', async () => {
      const response = new Response('<html><body>502 Bad Gateway</body></html>', {
        status: 502,
        headers: { 'Content-Type': 'text/html' },
      });
      const message = await readErrorMessage(response);
      expect(message).toBe('Server error (HTTP 502). Please try again later.');
    });
  });

  describe('api function error & network handling', () => {
    it('does not clear the session when a login attempt is rejected', async () => {
      localStorage.setItem('token', 'existing-token');
      global.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: 'Invalid email or password.' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(api('/auth/login', { method: 'POST' })).rejects.toThrow(
        'Invalid email or password.',
      );
      expect(localStorage.getItem('token')).toBe('existing-token');
    });

    it('throws ApiError with clean message on non-ok response', async () => {
      global.fetch = vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ detail: 'Resource not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }),
      );

      await expect(api('/unknown-endpoint')).rejects.toThrow(ApiError);
    });

    it('handles network failure or CORS error cleanly', async () => {
      global.fetch = vi.fn().mockRejectedValue(new TypeError('Failed to fetch'));

      await expect(api('/endpoint')).rejects.toThrow(
        'Cannot reach the API. Start the backend, then reload this page.',
      );
    });
  });
});
