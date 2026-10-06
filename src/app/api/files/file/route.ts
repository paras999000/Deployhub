import { NextRequest, NextResponse } from 'next/server';
import { createFile } from '@/lib/server/storage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path: parentPath, name, content } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'File name is required.' }, { status: 400 });
    }

    createFile(parentPath || '', name, content || '');
    return NextResponse.json({ success: true, message: `File "${name}" created.` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
