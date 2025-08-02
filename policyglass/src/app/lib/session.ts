import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { PrismaClient } from '../../generated/prisma'

const prisma = new PrismaClient()

// Session payload interface
export interface SessionPayload {
  userId: number
  username: string
  role: string
  expiresAt: Date
  [key: string]: any // Add index signature to make it compatible with JWTPayload
}

// Get the secret key from environment variables
const secretKey = process.env.JWT_SECRET || 'your-secret-key-here-change-this-in-production'
const encodedKey = new TextEncoder().encode(secretKey)

// Encrypt session payload
export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(encodedKey)
}

// Decrypt session token
export async function decrypt(session: string | undefined): Promise<SessionPayload | null> {
  try {
    if (!session) {
      return null
    }
    
    const { payload } = await jwtVerify(session, encodedKey, {
      algorithms: ['HS256'],
    })
    
    return payload as SessionPayload
  } catch (error) {
    console.log('Failed to verify session')
    return null
  }
}

// Create session and set cookie
export async function createSession(userId: number, username: string, role: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  const sessionPayload: SessionPayload = { userId, username, role, expiresAt }
  const session = await encrypt(sessionPayload)
  
  const cookieStore = await cookies()
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

// Delete session cookie
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

// Verify session for server components
export async function verifySession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  const session = await decrypt(sessionCookie)

  if (!session || new Date() > new Date(session.expiresAt)) {
    redirect('/login')
  }

  return session
}

// Get session without redirect (for conditional rendering)
export async function getSession() {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get('session')?.value
  const session = await decrypt(sessionCookie)

  if (!session || new Date() > new Date(session.expiresAt)) {
    return null
  }

  return session
}

// Check if user has required role
export async function hasRole(requiredRole: string): Promise<boolean> {
  const session = await getSession()
  return session?.role === requiredRole
}

// Check if user has any of the required roles
export async function hasAnyRole(requiredRoles: string[]): Promise<boolean> {
  const session = await getSession()
  return session ? requiredRoles.includes(session.role) : false
}

// Check if user has admin role
export async function isAdmin(): Promise<boolean> {
  return await hasRole('admin')
}
