import { Project, StatItem, ServerOverviewData, ActivityItem } from '@/types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'ServerTest',
    technology: 'Next.js',
    status: 'RUNNING',
    port: 3001,
    environment: 'Production',
    containerName: 'servertest_app_1',
    lastDeployed: '2 hours ago',
    url: 'http://server.local/server-test',
    description: 'Internal testing service and webhook listener for automated deployment verification.',
    cpu: '3.4%',
    memory: '112 MB',
    gitBranch: 'main'
  },
  {
    id: 'proj-2',
    name: 'API Gateway',
    technology: 'Node.js',
    status: 'RUNNING',
    port: 3002,
    environment: 'Production',
    containerName: 'api_gateway_prod',
    lastDeployed: '1 day ago',
    url: 'http://server.local/api-gateway',
    description: 'Centralized edge routing, rate-limiting, and reverse proxy dispatch for internal services.',
    cpu: '1.8%',
    memory: '78 MB',
    gitBranch: 'stable'
  },
  {
    id: 'proj-3',
    name: 'Portfolio',
    technology: 'React',
    status: 'STOPPED',
    port: 3003,
    environment: 'Development',
    containerName: 'portfolio_client_dev',
    lastDeployed: '3 days ago',
    url: 'http://server.local/portfolio',
    description: 'Personal portfolio showcase with interactive project case studies and blog posts.',
    cpu: '0.0%',
    memory: '0 MB',
    gitBranch: 'feature/dark-mode'
  }
];

export const INITIAL_STATS: StatItem[] = [
  {
    id: 'stat-1',
    label: 'DEPLOYED PROJECTS',
    value: '3',
    secondaryText: 'Active configurations',
    trend: { value: '+1 this week', isPositive: true },
    iconName: 'folder-git'
  },
  {
    id: 'stat-2',
    label: 'RUNNING CONTAINERS',
    value: '3',
    secondaryText: 'All services responding',
    trend: { value: '2 healthy, 1 standby', isPositive: true },
    iconName: 'boxes'
  },
  {
    id: 'stat-3',
    label: 'SERVER UPTIME',
    value: '99.9%',
    secondaryText: '42 days uninterrupted',
    trend: { value: 'Zero dropouts', isPositive: true },
    iconName: 'activity'
  },
  {
    id: 'stat-4',
    label: 'STORAGE',
    value: '435 GB FREE',
    secondaryText: 'of 500 GB total NVMe',
    trend: { value: '87% available', isPositive: true },
    iconName: 'hard-drive'
  }
];

export const INITIAL_SERVER_DATA: ServerOverviewData = {
  status: 'ONLINE',
  dockerStatus: 'RUNNING',
  environment: 'SELF-HOSTED',
  hostname: 'ubuntu-srv-01',
  ip: '192.168.1.150',
  kernel: 'Linux 6.8.0-generic',
  uptime: '42d 14h 22m',
  healthMessage: 'Server is healthy',
  metrics: {
    cpu: { percentage: 18, label: '18%' },
    memory: { percentage: 16, label: '16%' },
    storage: { percentage: 8, label: '8%' },
    containers: { total: 3, running: 2 }
  }
};

export const INITIAL_ACTIVITIES: ActivityItem[] = [
  {
    id: 'act-1',
    title: 'ServerTest deployed successfully',
    timestamp: '2 minutes ago',
    type: 'deploy',
    projectName: 'ServerTest'
  },
  {
    id: 'act-2',
    title: 'API Gateway container restarted',
    timestamp: '15 minutes ago',
    type: 'restart',
    projectName: 'API Gateway'
  },
  {
    id: 'act-3',
    title: 'Portfolio stopped',
    timestamp: '1 hour ago',
    type: 'stop',
    projectName: 'Portfolio'
  },
  {
    id: 'act-4',
    title: 'Docker image pulled',
    timestamp: '3 hours ago',
    type: 'docker'
  },
  {
    id: 'act-5',
    title: 'Caddy reverse proxy started',
    timestamp: '5 hours ago',
    type: 'proxy'
  }
];
