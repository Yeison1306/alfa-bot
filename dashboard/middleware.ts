import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Allow health check and API health without auth
    if (path === '/api/health' || path.startsWith('/api/health')) {
      return NextResponse.next();
    }

    // Allow access to login page without auth
    if (path === '/login') {
      if (token) {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      return NextResponse.next();
    }

    // Protect dashboard routes
    if (path.startsWith('/dashboard')) {
      if (!token) {
        const url = new URL('/login', req.url);
        url.searchParams.set('callbackUrl', path);
        return NextResponse.redirect(url);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        // Allow health endpoints without auth
        if (path === '/api/health' || path.startsWith('/api/health')) return true;
        if (path === '/login') return true;
        if (path.startsWith('/dashboard')) return !!token;
        return true;
      },
    },
  }
);

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/api/health'],
};