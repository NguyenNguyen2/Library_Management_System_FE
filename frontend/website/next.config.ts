import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  output: 'standalone',
  transpilePackages: ['@frontend/shared'],
  // Expose VITE_COOKIE_KEY_SECRET to client bundle so cookie.ts shared util
  // can use the same encryption key as the admin (Vite) app.
  env: {
    VITE_COOKIE_KEY_SECRET: process.env.VITE_COOKIE_KEY_SECRET,
  },
  images: {
    // Whitelist every *.fengshuimasteracademy.com subdomain so the CMS
    // (cms-api, cms-api-staging, ...) and API hosts can serve images via
    // next/image. Localhost covers local dev previews.
    remotePatterns: [
      { protocol: 'https', hostname: '**.fengshuimasteracademy.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
};

const withNextIntl = createNextIntlPlugin(
  "./lib/i18/request.ts"
);

export default withNextIntl(nextConfig);
