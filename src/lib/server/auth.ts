import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from './db';

const JWT_SECRET = process.env.DEPLOYHUB_SECRET || 'deployhub_super_secure_session_key_2026';
const COOKIE_NAME = 'deployhub_session';

export interface UserSession {
  id: string;
  username: string;
  role: string;
}

/**
 * Authenticates a user against SQLite users table.
 */
export async function authenticateUser(
  username: string,
  password: string
): Promise<{ success: boolean; session?: UserSession; error?: string }> {
  const db = getDatabase();
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username) as {
    id: string;
    username: string;
    password_hash: string;
    role: string;
  } | undefined;

  if (!user) {
    return { success: false, error: 'Invalid username or password.' };
  }

  const matches = bcrypt.compareSync(password, user.password_hash);
  if (!matches) {
    return { success: false, error: 'Invalid username or password.' };
  }

  const session: UserSession = {
    id: user.id,
    username: user.username,
    role: user.role,
  };

  return { success: true, session };
}

/**
 * Generates an HTTP-only session cookie for the user.
 */
export function createSessionToken(session: UserSession): string {
  return jwt.sign(session, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verifies session from request cookies.
 */
export function getSessionFromRequest(req: NextRequest): UserSession | null {
  const cookie = req.cookies.get(COOKIE_NAME);
  if (!cookie || !cookie.value) return null;

  try {
    const decoded = jwt.verify(cookie.value, JWT_SECRET) as UserSession;
    return decoded;
  } catch {
    return null;
  }
}

/**
 * Attaches the session cookie to an outgoing NextResponse.
 */
export function attachSessionCookie(res: NextResponse, session: UserSession): NextResponse {
  const token = createSessionToken(session);
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return res;
}

/**
 * Clears the session cookie from an outgoing NextResponse.
 */
export function clearSessionCookie(res: NextResponse): NextResponse {
  res.cookies.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return res;
}
