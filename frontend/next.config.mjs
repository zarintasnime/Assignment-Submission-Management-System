/** @type {import('next').NextConfig} */
const nextConfig = {
  // The Dockerfile copies .next/standalone — without this the image build fails.
  output: 'standalone',

  // API traffic is proxied by the route handler in app/api/[...path]/route.ts,
  // which reads BACKEND_URL at request time, so no rewrite is needed here.
  reactStrictMode: true,
};

export default nextConfig;
