import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/server/db';
import { manageContainer } from '@/lib/server/docker';

export const dynamic = 'force-dynamic';

export async function POST(
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

    await manageContainer(project.container_name, 'restart');

    db.prepare("UPDATE projects SET status = 'RUNNING', updated_at = ? WHERE id = ?")
      .run(new Date().toISOString(), id);

    db.prepare(`
      INSERT INTO activity_logs (id, type, title, details, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(`act-${Date.now()}`, 'restart', `${project.name} restarted`, 'Restarted via dashboard', new Date().toISOString());

    return NextResponse.json({ success: true, message: `${project.name} restarted successfully.` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
