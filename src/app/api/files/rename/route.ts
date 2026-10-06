import { NextRequest, NextResponse } from 'next/server';
import { renameItem } from '@/lib/server/storage';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { path: itemPath, newName } = body;

    if (!itemPath || !newName || !newName.trim()) {
      return NextResponse.json({ success: false, error: 'Path and new name are required.' }, { status: 400 });
    }

    renameItem(itemPath, newName);
    return NextResponse.json({ success: true, message: `Renamed to "${newName}".` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
