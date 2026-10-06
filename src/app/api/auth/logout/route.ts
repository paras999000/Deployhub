import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const res = NextResponse.json({ success: true, message: 'Logged out successfully.' });
  return clearSessionCookie(res);
}
