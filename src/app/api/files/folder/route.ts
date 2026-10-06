import { NextRequest, NextResponse } from 'next/server';
import { createFolder } from '@/lib/server/storage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path: parentPath, name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ success: false, error: 'Folder name is required.' }, { status: 400 });
    }

    createFolder(parentPath || '', name);
    return NextResponse.json({ success: true, message: `Folder "${name}" created.` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
