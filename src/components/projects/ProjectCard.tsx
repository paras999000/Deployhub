'use client';

import React, { useState } from 'react';
import {
  Eye,
  Globe,
  Clock,
  Box,
  Terminal,
  Play,
  Square,
  RotateCw,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { Project } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  onViewDetails: (project: Project) => void;
  onOpenProject?: (project: Project) => void;
  onViewLogs?: (project: Project) => void;
  onStart?: (project: Project) => void;
  onStop?: (project: Project) => void;
  onRestart?: (project: Project) => void;
  onDelete?: (project: Project) => void;
}

export function ProjectCard({
  project,
  onViewDetails,
  onOpenProject,
  onViewLogs,
  onStart,
  onStop,
  onRestart,
  onDelete,
}: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isRunning = project.status === 'RUNNING';

  const handleOpen = () => {
    if (onOpenProject) {
      onOpenProject(project);
    } else {
      window.open(project.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-slate-900/40 p-5 sm:p-6 backdrop-blur-md transition-all duration-300 hover:shadow-2xl',
        isRunning
          ? 'border-white/[0.07] hover:border-emerald-500/30 hover:bg-slate-900/60'
          : 'border-white/[0.05] hover:border-slate-700/50 hover:bg-slate-900/50'
      )}
    >
      <div>
        {/* Top bar: Icon, Name, Technology & Status */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-xl border font-mono font-bold text-sm transition-transform group-hover:scale-105',
                isRunning
                  ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.12)]'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
              )}
            >
              <Box className="w-5 h-5" />
            </div>

            <div>
              <h3 className="font-bold text-white text-base tracking-tight group-hover:text-emerald-300 transition-colors">
                {project.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-slate-400 font-mono">{project.technology}</span>
                <span className="text-slate-600">•</span>
                <span className="text-[11px] text-slate-500 font-mono">:{project.port}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <StatusBadge status={project.status} size="sm" />

            {/* Quick Actions Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Project Actions"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    onClick={() => setShowMenu(false)}
                    className="fixed inset-0 z-20"
                  />
                  <div className="absolute right-0 mt-1 w-36 rounded-xl border border-slate-700 bg-slate-900/95 backdrop-blur-md shadow-xl py-1 z-30 text-xs">
                    {onRestart && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onRestart(project);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Restart</span>
                      </button>
                    )}

                    {onViewLogs && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onViewLogs(project);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-left"
                      >
                        <Terminal className="w-3.5 h-3.5 text-slate-400" />
                        <span>View Logs</span>
                      </button>
                    )}

                    {onDelete && (
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          onDelete(project);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors text-left border-t border-slate-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Project Metadata details */}
        <div className="mt-5 grid grid-cols-2 gap-2.5 pt-4 border-t border-slate-800/60 text-xs">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
              Container
            </span>
            <div className="font-mono text-slate-300 truncate text-[11px]">{project.containerName}</div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500">
              Host Port
            </span>
            <div className="font-mono text-cyan-300">:{project.port}</div>
          </div>

          <div className="space-y-1 col-span-2 flex items-center gap-1.5 text-slate-400 font-mono text-[11px] pt-1">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Deployed {project.lastDeployed}</span>
          </div>
        </div>
      </div>

      {/* Card Actions Bar */}
      <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-col gap-2">
        {/* Main Action Buttons: Start/Stop & Open */}
        <div className="flex items-center gap-2">
          {isRunning ? (
            <button
              onClick={() => onStop && onStop(project)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 hover:text-rose-400 border border-slate-700/60 text-xs font-medium text-slate-300 transition-all active:scale-98"
              title="Stop container"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={() => onStart && onStart(project)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-800/40 text-xs font-medium text-emerald-400 transition-all active:scale-98"
              title="Start container"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start</span>
            </button>
          )}

          <button
            onClick={handleOpen}
            disabled={!isRunning}
            className={cn(
              'flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-medium transition-all active:scale-98',
              isRunning
                ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 hover:text-emerald-200'
                : 'bg-slate-900/40 border border-slate-800/40 text-slate-600 cursor-not-allowed opacity-60'
            )}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Open</span>
          </button>
        </div>

        {/* Secondary Details & Logs */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewLogs && onViewLogs(project)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Terminal className="w-3 h-3 text-slate-500" />
            <span>Logs</span>
          </button>

          <button
            onClick={() => onViewDetails(project)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-[11px] font-mono text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Eye className="w-3 h-3 text-slate-500" />
            <span>Details</span>
          </button>
        </div>
      </div>

      {/* Hover glow highlight */}
      <div
        className={cn(
          'pointer-events-none absolute -bottom-16 -right-16 h-32 w-32 rounded-full blur-2xl transition-opacity duration-300',
          isRunning ? 'bg-emerald-500/10 group-hover:opacity-100 opacity-30' : 'opacity-0'
        )}
      />
    </div>
  );
}
