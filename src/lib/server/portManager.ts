import net from 'net';
import { getDatabase } from './db';

const MIN_PORT = 3001;
const MAX_PORT = 3999;

/**
 * Checks if a specific TCP port is free on the host.
 */
export async function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'EADDRINUSE' || err.code === 'EACCES') {
        resolve(false);
      } else {
        resolve(false);
      }
    });

    server.once('listening', () => {
      server.close(() => {
        resolve(true);
      });
    });

    server.listen(port, '0.0.0.0');
  });
}

/**
 * Returns an array of ports already recorded in the SQLite database.
 */
export function getDbAssignedPorts(): number[] {
  const db = getDatabase();
  const rows = db.prepare('SELECT host_port FROM projects').all() as { host_port: number }[];
  return rows.map((r) => r.host_port);
}

/**
 * Finds the next available port in range 3001-3999.
 * Validates against both database records and actual host socket availability.
 */
export async function findAvailablePort(startPort: number = MIN_PORT): Promise<number> {
  const dbPorts = new Set(getDbAssignedPorts());

  for (let port = startPort; port <= MAX_PORT; port++) {
    if (dbPorts.has(port)) {
      continue;
    }

    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
  }

  throw new Error(`No available ports found in range ${MIN_PORT}-${MAX_PORT}.`);
}

/**
 * Validates a user-requested port to ensure it's in the allowed range and unoccupied.
 */
export async function validateRequestedPort(port: number, excludeProjectId?: string): Promise<{ valid: boolean; reason?: string }> {
  if (port < MIN_PORT || port > MAX_PORT) {
    return { valid: false, reason: `Port must be between ${MIN_PORT} and ${MAX_PORT}.` };
  }

  const db = getDatabase();
  const query = excludeProjectId
    ? 'SELECT id FROM projects WHERE host_port = ? AND id != ?'
    : 'SELECT id FROM projects WHERE host_port = ?';
  const existing = excludeProjectId
    ? db.prepare(query).get(port, excludeProjectId)
    : db.prepare(query).get(port);

  if (existing) {
    return { valid: false, reason: `Port ${port} is already assigned to another project in the database.` };
  }

  const available = await isPortAvailable(port);
  if (!available) {
    return { valid: false, reason: `Port ${port} is currently in use by another service on the host.` };
  }

  return { valid: true };
}
