'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';
import type { LoginResponse, UserRole } from '@/lib/types';
import SubmitButton from '@/components/SubmitButton';
import { useToast } from '@/components/Toast';

const demos: Array<{ role: UserRole; email: string; password: string }> = [
  { role: 'Admin', email: 'admin@demo.com', password: 'Admin@123' },
  { role: 'Teacher', email: 'teacher@demo.com', password: 'Teacher@123' },
  { role: 'Student', email: 'student@demo.com', password: 'Student@123' },
];

export default function LoginPage() {
  const router = useRouter();
  const { showError, showSuccess } = useToast();
  const [email, setEmail] = useState(demos[0].email);
  const [password, setPassword] = useState(demos[0].password);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');

    try {
      const payload = await api<LoginResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), password }),
      });

      window.localStorage.setItem('token', payload.token);
      window.localStorage.setItem('user', JSON.stringify(payload.user));
      showSuccess(`Welcome back, ${payload.user.fullName}!`);
      router.push(routeForRole(payload.user.role));
    } catch (reason) {
      const msg = reason instanceof Error ? reason.message : 'Login failed.';
      setError(msg);
      showError(msg);
    } finally {
      setBusy(false);
    }
  }

  function applyDemo(role: UserRole) {
    const demo = demos.find((item) => item.role === role);
    if (!demo) return;
    setEmail(demo.email);
    setPassword(demo.password);
    setError('');
  }

  return (
    <main className="login-page">
      <section className="login-story-panel">
        <Link href="/" className="brand-lockup brand-on-dark">
          <span className="brand-mark">CF</span>
          <span>
            <strong>CampusFlow</strong>
            <small>Assignment Registry</small>
          </span>
        </Link>
        <div className="login-story-copy">
          <span className="eyebrow eyebrow-dark">Controlled academic workflow</span>
          <h1>One login. A workspace matched to your role.</h1>
          <p>
            Authentication is JWT-based. Authorization is enforced again in the backend service layer with ownership
            and class-mapping checks.
          </p>
        </div>
        <div className="login-ledger">
          <div><span>01</span><strong>Admin</strong><small>Configure academic context</small></div>
          <div><span>02</span><strong>Teacher</strong><small>Create, publish and grade</small></div>
          <div><span>03</span><strong>Student</strong><small>Submit and review feedback</small></div>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-form-card">
          <span className="form-kicker">Welcome back</span>
          <h2>Sign in to continue</h2>
          <p className="muted">Choose a demo role or enter credentials manually.</p>

          <div className="demo-role-row">
            {demos.map((demo) => (
              <button
                key={demo.role}
                type="button"
                className="demo-role-button"
                onClick={() => applyDemo(demo.role)}
              >
                {demo.role}
              </button>
            ))}
          </div>

          {error && (
            <div className="alert alert-error alert-with-dismiss">
              <span>{error}</span>
              <button
                type="button"
                className="alert-close-btn"
                aria-label="Close error message"
                onClick={() => setError('')}
              >
                ✕
              </button>
            </div>
          )}

          <form className="form-stack" onSubmit={submit}>
            <label className="field-label">
              Email address
              <input
                className="field-control"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                required
              />
            </label>
            <label className="field-label">
              Password
              <input
                className="field-control"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            <SubmitButton block loading={busy} loadingText="Signing in…">
              Login
            </SubmitButton>
          </form>

          <div className="credential-note">
            <strong>Demo access</strong>
            <p>Admin@123 • Teacher@123 • Student@123</p>
          </div>
        </div>
      </section>
    </main>
  );
}

function routeForRole(role: UserRole): string {
  if (role === 'Admin') return '/admin';
  if (role === 'Teacher') return '/teacher';
  return '/student';
}
