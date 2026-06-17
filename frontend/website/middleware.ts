import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { STORAGES } from '@shared/constants/storage';

/**
 * Paths matched by a prefix — anything starting with these is public.
 * Auth pages must stay accessible to logged-out users.
 */
const PUBLIC_PREFIX_PATHS = ['/login', '/signup', '/forgot-password'];

/**
 * Development-only public paths (only when mock data is enabled)
 */
const DEV_PUBLIC_PREFIX_PATHS = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ? ['/mock-test'] : [];

/**
 * Paths matched exactly — the landing page `/` is public,
 * but NOT its subpaths (`/home`, `/courses/...` etc.).
 */
const PUBLIC_EXACT_PATHS = ['/'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(STORAGES.ACCESS_TOKEN)?.value;

  const isExactPublic = PUBLIC_EXACT_PATHS.includes(pathname);
  const isPrefixPublic = PUBLIC_PREFIX_PATHS.some((p) => pathname.startsWith(p));
  const isDevPublic = DEV_PUBLIC_PREFIX_PATHS.some((p) => pathname.startsWith(p));
  const isPublic = isExactPublic || isPrefixPublic || isDevPublic;

  // 1. Public paths
  if (isPublic) {
    // Already logged-in users visiting auth pages get bounced to /home.
    // The landing `/` and dev pages remain accessible to everyone.
    if (token && isPrefixPublic) {
      const url = req.nextUrl.clone();
      url.pathname = '/home';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // 2. Protected path without token → redirect to /login,
  //    preserve original path in `?from=` for post-login redirect.
  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 3. Authenticated → pass through
  return NextResponse.next();
}

// Skip Next.js internals + static assets.
export const config = {
  matcher: '/((?!api/public|_next/static|_next/image|favicon.ico).*)',
};
