import Database from 'better-sqlite3';
import path from 'path';
import bcrypt from 'bcryptjs';
import { getDataDirectory, ensureStorageDirectories } from './security';

let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (dbInstance) return dbInstance;

  ensureStorageDirectories();
  const dataDir = getDataDirectory();
  const dbPath = path.join(dataDir, 'deployhub.db');

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Initialize tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      description TEXT,
      container_name TEXT NOT NULL,
      image_name TEXT NOT NULL,
      host_port INTEGER NOT NULL UNIQUE,
      container_port INTEGER NOT NULL DEFAULT 3000,
      framework TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'STOPPED',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS deployments (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      status TEXT NOT NULL,
      logs TEXT,
      duration_ms INTEGER,
      created_at TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS activity_logs (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      details TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL
    );
  `);

  // Seed default projects if none exist
  const projectCount = db.prepare('SELECT COUNT(*) as count FROM projects').get() as { count: number };
  if (projectCount.count === 0) {
    const insertProject = db.prepare(`
      INSERT INTO projects (id, name, slug, description, container_name, image_name, host_port, container_port, framework, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const now = new Date().toISOString();

    insertProject.run(
      'proj-1',
      'ServerTest',
      'server-test',
      'Internal testing service and webhook listener for automated deployment verification.',
      'servertest_app_1',
      'deployhub-server-test:latest',
      3001,
      3000,
      'Next.js',
      'RUNNING',
      now,
      now
    );

    insertProject.run(
      'proj-2',
      'API Gateway',
      'api-gateway',
      'Centralized edge routing, rate-limiting, and reverse proxy dispatch for internal services.',
      'api_gateway_prod',
      'deployhub-api-gateway:latest',
      3002,
      3000,
      'Node.js',
      'RUNNING',
      now,
      now
    );

    insertProject.run(
      'proj-3',
      'Portfolio',
      'portfolio',
      'Personal portfolio showcase with interactive project case studies and blog posts.',
      'portfolio_client_dev',
      'deployhub-portfolio:latest',
      3003,
      3000,
      'React',
      'STOPPED',
      now,
      now
    );
  }

  // Seed default admin user if none exists
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('admin123', salt);
    db.prepare(`
      INSERT INTO users (id, username, password_hash, role, created_at)
      VALUES (?, ?, ?, ?, ?)
    `).run('user-1', 'admin', hash, 'admin', new Date().toISOString());
  }

  // Seed default activity logs if none exist
  const activityCount = db.prepare('SELECT COUNT(*) as count FROM activity_logs').get() as { count: number };
  if (activityCount.count === 0) {
    const insertAct = db.prepare(`
      INSERT INTO activity_logs (id, type, title, details, created_at)
      VALUES (?, ?, ?, ?, ?)
    `);
    const now = new Date();
    insertAct.run('act-1', 'deploy', 'ServerTest deployed successfully', 'Deployed to port :3001', new Date(now.getTime() - 2 * 60000).toISOString());
    insertAct.run('act-2', 'restart', 'API Gateway container restarted', 'Container restarted on :3002', new Date(now.getTime() - 15 * 60000).toISOString());
    insertAct.run('act-3', 'stop', 'Portfolio stopped', 'Container stopped on :3003', new Date(now.getTime() - 60 * 60000).toISOString());
    insertAct.run('act-4', 'docker', 'Docker image pulled', 'node:22-alpine pulled', new Date(now.getTime() - 180 * 60000).toISOString());
    insertAct.run('act-5', 'proxy', 'Caddy reverse proxy started', 'Caddy listening on edge', new Date(now.getTime() - 300 * 60000).toISOString());
  }

  dbInstance = db;
  return dbInstance;
}
