import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/server/db';
import { getDockerLogs } from '@/lib/server/docker';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = getDatabase();
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as {
      id: string;
      name: string;
      container_name: string;
    } | undefined;

    if (!project) {
      return NextResponse.json({ success: false, error: 'Project not found.' }, { status: 404 });
    }

    // Try live Docker logs
    const dockerLogs = await getDockerLogs(project.container_name, 150);

    // Also get last deployment logs from SQLite
    const lastDeployment = db.prepare(
      'SELECT logs FROM deployments WHERE project_id = ? ORDER BY created_at DESC LIMIT 1'
    ).get(id) as { logs: string } | undefined;

    const combined = [
      `=== Project: ${project.name} (Container: ${project.container_name}) ===`,
      lastDeployment?.logs ? `\n--- Build Logs ---\n${lastDeployment.logs}\n` : '',
      `--- Container Runtime Logs ---\n${dockerLogs}`,
    ].filter(Boolean).join('\n');

    return NextResponse.json({ success: true, logs: combined });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
