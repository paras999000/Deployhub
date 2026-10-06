export type ProjectStatus = 'RUNNING' | 'STOPPED';

export interface Project {
  id: string;
  name: string;
  technology: string;
  status: ProjectStatus;
  port: number;
  environment: 'Production' | 'Development' | 'Staging';
  containerName: string;
  lastDeployed: string;
  url: string;
  description?: string;
  cpu?: string;
  memory?: string;
  gitBranch?: string;
}

export interface StatItem {
  id: string;
  label: string;
  value: string;
  secondaryText?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  iconName: 'folder-git' | 'boxes' | 'activity' | 'hard-drive';
}

export interface ServerMetric {
  name: string;
  percentage: number;
  detail: string;
  colorClass: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  timestamp: string;
  type: 'deploy' | 'restart' | 'stop' | 'docker' | 'proxy';
  projectName?: string;
}

export interface ServerOverviewData {
  status: 'ONLINE' | 'OFFLINE';
  dockerStatus: 'RUNNING' | 'STOPPED';
  environment: string;
  hostname: string;
  ip: string;
  kernel: string;
  uptime: string;
  healthMessage: string;
  metrics: {
    cpu: { percentage: number; label: string };
    memory: { percentage: number; label: string };
    storage: { percentage: number; label: string };
    containers: { total: number; running: number };
  };
}

export type NavigationTab = 'dashboard' | 'projects' | 'deploy' | 'nas' | 'docker' | 'server' | 'settings';
