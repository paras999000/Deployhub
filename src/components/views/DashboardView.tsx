'use client';

import React from 'react';
import { HeroSection } from '@/components/dashboard/HeroSection';
import { StatCard } from '@/components/dashboard/StatCard';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ServerOverview } from '@/components/dashboard/ServerOverview';
import { ActivityTimeline } from '@/components/dashboard/ActivityTimeline';
import { Project, StatItem, ServerOverviewData, ActivityItem } from '@/types';
import { FolderGit2, ArrowRight } from 'lucide-react';

interface DashboardViewProps {
  stats: StatItem[];
  projects: Project[];
  serverData: ServerOverviewData;
  activities: ActivityItem[];
  onViewDetails: (project: Project) => void;
  onOpenProject: (project: Project) => void;
  onNavigateToProjects: () => void;
}

export function DashboardView({
  stats,
  projects,
  serverData,
  activities,
  onViewDetails,
  onOpenProject,
  onNavigateToProjects,
}: DashboardViewProps) {
  return (
    <div className="space-y-8">
      {/* Hero Welcome Section */}
      <HeroSection onQuickAction={onNavigateToProjects} />

      {/* 4 Stat Cards */}
      <section aria-label="System Statistics">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((item) => (
            <StatCard key={item.id} item={item} />
          ))}
        </div>
      </section>

      {/* Deployed Projects Section */}
      <section aria-label="Deployed Projects" className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Deployed Projects
              </h2>
              <p className="text-xs text-slate-400">3 active personal server applications</p>
            </div>
          </div>

          <button
            onClick={onNavigateToProjects}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* 3 Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onViewDetails={onViewDetails}
              onOpenProject={onOpenProject}
            />
          ))}
        </div>
      </section>

      {/* Two Column Layout: Server Overview & Recent Activity */}
      <section aria-label="Server & Activity" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7">
          <ServerOverview data={serverData} />
        </div>
        <div className="lg:col-span-5">
          <ActivityTimeline activities={activities} />
        </div>
      </section>
    </div>
  );
}
