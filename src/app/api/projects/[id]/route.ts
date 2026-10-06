import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/server/db';
import { manageContainer } from '@/lib/server/docker';

export const dynamic = 'force-dynamic';

export async function DELETE(
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

    // Stop and remove container
    try {
      await manageContainer(project.container_name, 'remove');
    } catch {
      // Ignore if container doesn't exist
    }

    // Delete from DB (foreign keys cascade to deployments)
    db.prepare('DELETE FROM projects WHERE id = ?').run(id);

    db.prepare(`
      INSERT INTO activity_logs (id, type, title, details, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(`act-${Date.now()}`, 'stop', `${project.name} deleted`, 'Project removed from system', new Date().toISOString());

    return NextResponse.json({ success: true, message: `Project ${project.name} deleted.` });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
