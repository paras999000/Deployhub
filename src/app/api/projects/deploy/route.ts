import { NextRequest, NextResponse } from 'next/server';
import { executeDeployment } from '@/lib/server/deployer';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const name = (formData.get('name') as string | null) || '';
    const description = (formData.get('description') as string | null) || '';
    const portOverrideStr = formData.get('portOverride') as string | null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No ZIP project file provided.' }, { status: 400 });
    }

    if (!name.trim()) {
      return NextResponse.json({ success: false, error: 'Project name is required.' }, { status: 400 });
    }

    if (!file.name.endsWith('.zip')) {
      return NextResponse.json({ success: false, error: 'Only .zip archives are supported.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const zipBuffer = Buffer.from(arrayBuffer);

    let portOverride: number | undefined;
    if (portOverrideStr && portOverrideStr.trim()) {
      const parsed = parseInt(portOverrideStr, 10);
      if (!isNaN(parsed)) portOverride = parsed;
    }

    const result = await executeDeployment({
      name: name.trim(),
      description: description.trim(),
      portOverride,
      zipBuffer,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Deployment failed. Check build logs.',
          logs: result.logs,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Project "${name}" deployed successfully!`,
      projectId: result.projectId,
      hostPort: result.hostPort,
      logs: result.logs,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
