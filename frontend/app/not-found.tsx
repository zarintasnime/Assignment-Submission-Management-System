import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="landing-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', textAlign: 'center' }}>
      <div>
        <h1 style={{ fontSize: '3rem', marginBottom: '16px' }}>404</h1>
        <h2>Page not found</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>The requested resource could not be found.</p>
        <Link href="/" className="btn btn-primary">
          Return Home
        </Link>
      </div>
    </main>
  );
}
