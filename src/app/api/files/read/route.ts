import { NextRequest, NextResponse } from 'next/server';
import { readFileContent } from '@/lib/server/storage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
      return NextResponse.json({ success: false, error: 'File path required.' }, { status: 400 });
    }

    const data = readFileContent(filePath);
    return NextResponse.json({ success: true, ...data });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
