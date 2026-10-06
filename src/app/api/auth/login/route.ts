import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, attachSessionCookie } from '@/lib/server/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username and password required.' },
        { status: 400 }
      );
    }

    const authResult = await authenticateUser(username.trim(), password);
    if (!authResult.success || !authResult.session) {
      return NextResponse.json(
        { success: false, error: authResult.error || 'Invalid credentials.' },
        { status: 401 }
      );
    }

    const res = NextResponse.json({
      success: true,
      user: authResult.session,
    });

    return attachSessionCookie(res, authResult.session);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
