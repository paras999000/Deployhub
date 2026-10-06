import { NextRequest, NextResponse } from 'next/server';
import { listDirectory, deleteItem, getStorageOverview } from '@/lib/server/storage';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const relativePath = searchParams.get('path') || '';

    const dirData = await listDirectory(relativePath);
    const storageOverview = await getStorageOverview();

    return NextResponse.json({
      success: true,
      currentPath: dirData.currentPath,
      items: dirData.items,
      storage: storageOverview,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const targetPath = searchParams.get('path');

    if (!targetPath) {
      return NextResponse.json({ success: false, error: 'Target path required.' }, { status: 400 });
    }

    deleteItem(targetPath);
    return NextResponse.json({ success: true, message: 'Item deleted successfully.' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
