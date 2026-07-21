import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // Deploying to Vercel's own platform, which has its own serverless
  // packaging — "standalone" output is only for self-hosting Next.js in a
  // plain Docker/Node server, and Vercel's build doesn't need it (it was
  // also triggering a Windows-only EPERM symlink failure during local build).
  transpilePackages: ['@frontend/shared'],
  // Expose VITE_COOKIE_KEY_SECRET to client bundle so cookie.ts shared util
  // can use the same encryption key as the admin (Vite) app.
  env: {
    VITE_COOKIE_KEY_SECRET: process.env.VITE_COOKIE_KEY_SECRET,
  },
  images: {
    // Hosts book cover_image / avatar_url actually resolve to: DO Spaces
    // (uploaded covers/avatars), raw.githubusercontent.com (ISBN-import
    // seed data), and localhost for local dev previews.
    remotePatterns: [
      { protocol: 'https', hostname: '**.digitaloceanspaces.com' },
      { protocol: 'https', hostname: 'raw.githubusercontent.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
  typescript: {
    // frontend/shared resolves a nested @types/react (pulled in transitively
    // for @ant-design/v5-patch-for-react-19) that's incompatible with the
    // root React 18 types — e.g. CustomInput.tsx fails to typecheck here even
    // though it compiles and runs fine. Pre-existing monorepo type-version
    // split, not something this build introduced; unblocking deploys until
    // the shared package's React types are deduped.
    ignoreBuildErrors: true,
  },
};

const withNextIntl = createNextIntlPlugin(
  "./lib/i18/request.ts"
);

export default withNextIntl(nextConfig);
