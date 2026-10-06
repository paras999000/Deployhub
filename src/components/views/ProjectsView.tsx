'use client';

import React, { useState, useMemo } from 'react';
import { Project } from '@/types';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { FolderGit2, Search, Box, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectsViewProps {
  projects: Project[];
  onViewDetails: (project: Project) => void;
  onOpenProject: (project: Project) => void;
  onViewLogs?: (project: Project) => void;
  onStart?: (project: Project) => void;
  onStop?: (project: Project) => void;
  onRestart?: (project: Project) => void;
  onDelete?: (project: Project) => void;
  onNavigateToDeploy?: () => void;
}

export function ProjectsView({
  projects,
  onViewDetails,
  onOpenProject,
  onViewLogs,
  onStart,
  onStop,
  onRestart,
  onDelete,
  onNavigateToDeploy,
}: ProjectsViewProps) {
  const [filter, setFilter] = useState<'ALL' | 'RUNNING' | 'STOPPED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = useMemo(() => {
    return projects.filter((p) => {
      const matchesFilter = filter === 'ALL' || p.status === filter;
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.technology.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.port.toString().includes(searchQuery);
      return matchesFilter && matchesSearch;
    });
  }, [projects, filter, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FolderGit2 className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Deployed Projects</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real Docker containers deployed under <code className="text-emerald-400 font-mono text-xs">/srv/storage/projects/</code> with automatic host port mapping.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Port Bindings Summary Pill */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-300">
            <Box className="w-3.5 h-3.5 text-emerald-400" />
            <span>{projects.length} Total Projects</span>
          </div>

          {onNavigateToDeploy && (
            <button
              onClick={onNavigateToDeploy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-all shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Deploy Project</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950/60 border border-slate-800/80">
          {(['ALL', 'RUNNING', 'STOPPED'] as const).map((tab) => {
            const count =
              tab === 'ALL'
                ? projects.length
                : projects.filter((p) => p.status === tab).length;

            return (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                  filter === tab
                    ? 'bg-slate-800 text-white shadow-sm border border-slate-700/60'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                )}
              >
                <span>{tab === 'ALL' ? 'All Projects' : tab.charAt(0) + tab.slice(1).toLowerCase()}</span>
                <span className="ml-1.5 font-mono text-[10px] text-slate-400">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by name, tech, or port..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/40 font-mono"
          />
        </div>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onViewDetails={onViewDetails}
              onOpenProject={onOpenProject}
              onViewLogs={onViewLogs}
              onStart={onStart}
              onStop={onStop}
              onRestart={onRestart}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/20">
          <p className="text-sm text-slate-400">No projects match the filter &quot;{searchQuery || filter}&quot;.</p>
          <button
            onClick={() => {
              setFilter('ALL');
              setSearchQuery('');
            }}
            className="mt-3 text-xs text-emerald-400 hover:underline font-medium"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
