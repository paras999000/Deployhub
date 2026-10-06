'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { DashboardView } from '@/components/views/DashboardView';
import { ProjectsView } from '@/components/views/ProjectsView';
import { DeployView } from '@/components/views/DeployView';
import { NasView } from '@/components/views/NasView';
import { DockerView } from '@/components/views/DockerView';
import { ServerView } from '@/components/views/ServerView';
import { SettingsView } from '@/components/views/SettingsView';
import { ProjectModal } from '@/components/projects/ProjectModal';
import { LogsModal } from '@/components/projects/LogsModal';
import { AuthModal } from '@/components/auth/AuthModal';
import { ToastContainer, ToastMessage } from '@/components/ui/Toast';
import { NavigationTab, Project, StatItem, ServerOverviewData, ActivityItem } from '@/types';
import { UserSession } from '@/lib/server/auth';
import {
  INITIAL_PROJECTS,
  INITIAL_STATS,
  INITIAL_SERVER_DATA,
  INITIAL_ACTIVITIES,
} from '@/data/mockData';

export default function Home() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Live Data States
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [stats, setStats] = useState<StatItem[]>(INITIAL_STATS);
  const [serverData, setServerData] = useState<ServerOverviewData>(INITIAL_SERVER_DATA);
  const [activities] = useState<ActivityItem[]>(INITIAL_ACTIVITIES);

  // User Auth State
  const [currentUser, setCurrentUser] = useState<UserSession | null>({
    id: 'user-1',
    username: 'admin',
    role: 'admin',
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Modals State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [logProject, setLogProject] = useState<Project | null>(null);

  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const addToast = (title: string, description?: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    setToasts((prev) => [...prev, { id, title, description, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch real projects from SQLite & Docker
  const loadProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      if (data.success && Array.isArray(data.projects)) {
        setProjects(data.projects);

        // Update Stat Item 1 (Deployed Projects)
        setStats((prev) =>
          prev.map((s) => (s.id === 'stat-1' ? { ...s, value: data.projects.length.toString() } : s))
        );
      }
    } catch {
      // Keep existing data on transient network error
    }
  }, []);

  // Fetch real server telemetry
  const loadServerStats = useCallback(async () => {
    try {
      const res = await fetch('/api/server/stats');
      const data = await res.json();
      if (data.success && data.stats) {
        setServerData(data.stats);

        // Update Stat Cards with real data
        setStats((prev) =>
          prev.map((s) => {
            if (s.id === 'stat-2') {
              return { ...s, value: data.stats.metrics.containers.running.toString() };
            }
            if (s.id === 'stat-3') {
              return { ...s, value: '99.9%', secondaryText: `${data.stats.uptime} uptime` };
            }
            if (s.id === 'stat-4') {
              return { ...s, value: `${data.stats.metrics.storage.freeGB} GB FREE` };
            }
            return s;
          })
        );
      }
    } catch {
      // Keep existing data
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadProjects();
    loadServerStats();

    // Check user session
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (d.authenticated && d.user) {
          setCurrentUser(d.user);
        }
      })
      .catch(() => {});
  }, [loadProjects, loadServerStats]);

  // Refresh handler
  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);

    try {
      await Promise.all([loadProjects(), loadServerStats()]);
      addToast(
        'Telemetry Synchronized',
        'Updated host metrics and project container status from Docker.',
        'success'
      );
    } finally {
      setIsRefreshing(false);
    }
  };

  // Project Action Handlers
  const handleStartProject = async (project: Project) => {
    try {
      addToast('Starting Container', `Sending start signal to ${project.containerName}...`, 'info');
      const res = await fetch(`/api/projects/${project.id}/start`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        addToast('Project Started', `${project.name} is now RUNNING on port :${project.port}.`, 'success');
        loadProjects();
      } else {
        addToast('Start Failed', data.error || 'Could not start project.', 'warning');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addToast('Action Error', msg, 'warning');
    }
  };

  const handleStopProject = async (project: Project) => {
    try {
      addToast('Stopping Container', `Sending stop signal to ${project.containerName}...`, 'info');
      const res = await fetch(`/api/projects/${project.id}/stop`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        addToast('Project Stopped', `${project.name} has been STOPPED.`, 'info');
        loadProjects();
      } else {
        addToast('Stop Failed', data.error || 'Could not stop project.', 'warning');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addToast('Action Error', msg, 'warning');
    }
  };

  const handleRestartProject = async (project: Project) => {
    try {
      addToast('Restarting Container', `Restarting ${project.name}...`, 'info');
      const res = await fetch(`/api/projects/${project.id}/restart`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        addToast('Project Restarted', `${project.name} restarted successfully.`, 'success');
        loadProjects();
      } else {
        addToast('Restart Failed', data.error || 'Could not restart project.', 'warning');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addToast('Action Error', msg, 'warning');
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (!confirm(`Are you sure you want to delete project "${project.name}" and remove its container?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        addToast('Project Deleted', `${project.name} has been removed.`, 'info');
        loadProjects();
      } else {
        addToast('Delete Failed', data.error || 'Could not delete project.', 'warning');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addToast('Delete Error', msg, 'warning');
    }
  };

  const handleOpenProject = (project: Project) => {
    if (project.status === 'STOPPED') {
      addToast(
        'Project is Stopped',
        `${project.name} is currently stopped on port :${project.port}. Start the container to access.`,
        'warning'
      );
      return;
    }
    window.open(project.url, '_blank', 'noopener,noreferrer');
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      addToast('Signed Out', 'You have been logged out.', 'info');
    } catch {
      setCurrentUser(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col md:flex-row antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onRefresh={handleRefresh}
          isRefreshing={isRefreshing}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              stats={stats}
              projects={projects}
              serverData={serverData}
              activities={activities}
              onViewDetails={(p) => {
                setSelectedProject(p);
                setIsModalOpen(true);
              }}
              onOpenProject={handleOpenProject}
              onNavigateToProjects={() => setActiveTab('projects')}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsView
              projects={projects}
              onViewDetails={(p) => {
                setSelectedProject(p);
                setIsModalOpen(true);
              }}
              onOpenProject={handleOpenProject}
              onViewLogs={(p) => setLogProject(p)}
              onStart={handleStartProject}
              onStop={handleStopProject}
              onRestart={handleRestartProject}
              onDelete={handleDeleteProject}
              onNavigateToDeploy={() => setActiveTab('deploy')}
            />
          )}

          {activeTab === 'deploy' && (
            <DeployView
              onDeploymentComplete={() => {
                loadProjects();
                loadServerStats();
                addToast('Deploy Finished', 'Project container launched.', 'success');
              }}
              onNavigateToProjects={() => setActiveTab('projects')}
            />
          )}

          {activeTab === 'nas' && (
            <NasView onNotify={(msg) => addToast('Storage Notice', msg, 'info')} />
          )}

          {activeTab === 'docker' && (
            <DockerView onNotify={(msg) => addToast('Docker Notice', msg, 'info')} />
          )}

          {activeTab === 'server' && (
            <ServerView
              serverData={serverData}
              projects={projects}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsView onNotify={(msg) => addToast('Settings Action', msg, 'info')} />
          )}
        </main>
      </div>

      {/* Project Details Modal */}
      <ProjectModal
        project={selectedProject}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onNotify={(msg) => addToast('Project Info', msg, 'info')}
      />

      {/* Terminal Logs Modal */}
      <LogsModal
        project={logProject}
        isOpen={Boolean(logProject)}
        onClose={() => setLogProject(null)}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthModalOpen(false);
          addToast('Signed In', `Welcome back, ${user.username}!`, 'success');
        }}
      />

      {/* Floating Notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
