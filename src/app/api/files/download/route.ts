import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { safeResolvePath } from '@/lib/server/security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const relativePath = searchParams.get('path');

    if (!relativePath) {
      return NextResponse.json({ success: false, error: 'File path required.' }, { status: 400 });
    }

    const filePath = safeResolvePath(relativePath);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ success: false, error: 'File not found.' }, { status: 404 });
    }

    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      return NextResponse.json({ success: false, error: 'Cannot download a directory directly.' }, { status: 400 });
    }

    const fileName = path.basename(filePath);
    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': stat.size.toString(),
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
