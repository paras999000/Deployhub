import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { safeResolvePath } from '@/lib/server/security';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const destPath = (formData.get('destPath') as string) || '';
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ success: false, error: 'No files provided.' }, { status: 400 });
    }

    const targetDir = safeResolvePath(destPath);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const uploadedNames: string[] = [];

    for (const file of files) {
      const sanitizedName = file.name.replace(/[/\\:*?"<>|]/g, '');
      if (!sanitizedName || sanitizedName === '.' || sanitizedName === '..') continue;

      const filePath = safeResolvePath(path.join(destPath, sanitizedName));
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      fs.writeFileSync(filePath, buffer);
      uploadedNames.push(sanitizedName);
    }

    return NextResponse.json({
      success: true,
      message: `Uploaded ${uploadedNames.length} file(s) successfully.`,
      uploaded: uploadedNames,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
