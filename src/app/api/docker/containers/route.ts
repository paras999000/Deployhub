import { NextRequest, NextResponse } from 'next/server';
import { listAllContainers, manageContainer, getDockerLogs } from '@/lib/server/docker';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const containers = await listAllContainers();
    return NextResponse.json({ success: true, containers });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, containerId } = body;

    if (!action || !containerId) {
      return NextResponse.json(
        { success: false, error: 'Missing action or containerId' },
        { status: 400 }
      );
    }

    if (action === 'logs') {
      const logs = await getDockerLogs(containerId, 200);
      return NextResponse.json({ success: true, logs });
    }

    if (['start', 'stop', 'restart', 'remove'].includes(action)) {
      const result = await manageContainer(containerId, action);
      return NextResponse.json(result);
    }

    return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
