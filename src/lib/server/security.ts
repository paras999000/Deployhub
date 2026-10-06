import path from 'path';
import fs from 'fs';

/**
 * Returns the configured root storage directory for NAS and Project files.
 * On Ubuntu server, defaults to /srv/storage.
 * In local development, falls back to ./storage_root in the current directory.
 */
export function getStorageRoot(): string {
  if (process.env.STORAGE_ROOT) {
    return path.resolve(process.env.STORAGE_ROOT);
  }

  // Check if /srv/storage exists (Ubuntu server environment)
  if (fs.existsSync('/srv/storage')) {
    return '/srv/storage';
  }

  // Fallback for local development/testing
  const localFallback = path.resolve(process.cwd(), 'storage_root');
  if (!fs.existsSync(localFallback)) {
    fs.mkdirSync(localFallback, { recursive: true });
  }
  return localFallback;
}

/**
 * Returns the data directory for SQLite database and internal state.
 */
export function getDataDirectory(): string {
  if (process.env.DEPLOYHUB_DATA_PATH) {
    const dir = path.resolve(process.env.DEPLOYHUB_DATA_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  const storageRoot = getStorageRoot();
  const defaultDir = path.join(storageRoot, '.deployhub');
  if (!fs.existsSync(defaultDir)) {
    fs.mkdirSync(defaultDir, { recursive: true });
  }
  return defaultDir;
}

/**
 * Ensures standard system storage subdirectories exist:
 * /srv/storage/projects
 * /srv/storage/backups
 */
export function ensureStorageDirectories(): {
  storageRoot: string;
  projectsDir: string;
  backupsDir: string;
} {
  const storageRoot = getStorageRoot();
  const projectsDir = path.join(storageRoot, 'projects');
  const backupsDir = path.join(storageRoot, 'backups');

  if (!fs.existsSync(projectsDir)) {
    fs.mkdirSync(projectsDir, { recursive: true });
  }
  if (!fs.existsSync(backupsDir)) {
    fs.mkdirSync(backupsDir, { recursive: true });
  }

  return { storageRoot, projectsDir, backupsDir };
}

/**
 * Safely resolves a requested relative path against an allowed root directory.
 * Strictly prevents path traversal attacks (e.g. '../', null bytes, escaping root).
 */
export function safeResolvePath(relativePath: string = '', baseRoot?: string): string {
  const root = baseRoot ? path.resolve(baseRoot) : getStorageRoot();

  // Strip null bytes
  const sanitized = relativePath.replace(/\0/g, '');

  // Resolve absolute path
  const target = path.resolve(root, sanitized.startsWith('/') ? sanitized.slice(1) : sanitized);

  // Security check: Must reside strictly inside the root
  if (target !== root && !target.startsWith(root + path.sep)) {
    throw new Error('Access denied: Path traversal attempted outside storage root.');
  }

  return target;
}
