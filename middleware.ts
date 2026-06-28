import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from './lib/auth';

const protectedRoutes = ['/user'];
const adminRoutes = ['/admin/dashboard'];
const publicRoutes = ['/login', '/signup', '/admin', '/'];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  const cookie = req.cookies.get('session')?.value;
  let session = null;
  
  if (cookie) {
    try {
      session = await decrypt(cookie);
    } catch (e) {
      console.error("Invalid session cookie");
    }
  }

  if (isProtectedRoute && !session?.userId) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }
  
  if (isAdminRoute && session?.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/admin', req.nextUrl));
  }

  if (isPublicRoute && session?.userId && path !== '/') {
    if (session.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/dashboard', req.nextUrl));
    }
    return NextResponse.redirect(new URL('/user', req.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
};
