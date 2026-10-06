import { NextRequest, NextResponse } from 'next/server';
import { writeFileContent } from '@/lib/server/storage';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { path: filePath, content } = body;

    if (!filePath || content === undefined) {
      return NextResponse.json({ success: false, error: 'Path and content are required.' }, { status: 400 });
    }

    writeFileContent(filePath, content);
    return NextResponse.json({ success: true, message: 'File saved successfully.' });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 400 });
  }
}
