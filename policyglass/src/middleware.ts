import { NextRequest, NextResponse } from 'next/server'
import { decrypt } from './app/lib/session'

// Protected routes that require authentication
const protectedRoutes = ['/dashboard', '/admin']
// Public routes that should not be protected
const publicRoutes = ['/home', '/login', '/register', '/password-reset', '/']

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => path.startsWith(route))

  // Skip middleware for API routes and static files
  if (path.startsWith('/api/') || path.includes('.')) {
    return NextResponse.next()
  }

  // Get session from cookies
  const sessionCookie = request.cookies.get('session')?.value
  const session = await decrypt(sessionCookie)

  // If accessing a protected route without a valid session, redirect to login
  if (isProtectedRoute && !session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Remove the problematic redirect that was causing loops
  // The login page should handle its own redirect logic

  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
