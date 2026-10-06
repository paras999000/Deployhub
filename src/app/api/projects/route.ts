import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/server/db';
import { listAllContainers } from '@/lib/server/docker';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = getDatabase();
    const projects = db.prepare('SELECT * FROM projects ORDER BY created_at DESC').all() as Array<{
      id: string;
      name: string;
      slug: string;
      description: string;
      container_name: string;
      image_name: string;
      host_port: number;
      container_port: number;
      framework: string;
      status: string;
      created_at: string;
      updated_at: string;
    }>;

    // Check live Docker container status to ensure synchronicity
    const liveContainers = await listAllContainers();
    const liveContainerMap = new Map(liveContainers.map((c) => [c.name, c.status]));

    const enriched = projects.map((p) => {
      const liveStatus = liveContainerMap.get(p.container_name);
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        technology: p.framework,
        status: liveStatus || p.status,
        port: p.host_port,
        containerPort: p.container_port,
        environment: 'Production',
        containerName: p.container_name,
        imageName: p.image_name,
        lastDeployed: new Date(p.updated_at).toLocaleDateString(),
        url: `http://192.168.31.38:${p.host_port}`,
      };
    });

    return NextResponse.json({ success: true, projects: enriched });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
