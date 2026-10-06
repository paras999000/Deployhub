import { NextResponse } from 'next/server';
import { getRealServerStats } from '@/lib/server/system';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await getRealServerStats();
    return NextResponse.json({ success: true, stats });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
