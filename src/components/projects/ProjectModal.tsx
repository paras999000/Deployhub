'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Cpu,
  Layers,
  Calendar,
  Network,
  Terminal,
  GitBranch,
} from 'lucide-react';
import { Project } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface ProjectModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  onNotify?: (message: string) => void;
}

export function ProjectModal({ project, isOpen, onClose, onNotify }: ProjectModalProps) {
  const [copied, setCopied] = React.useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(project.url);
    setCopied(true);
    if (onNotify) onNotify(`Copied ${project.url} to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenUrl = () => {
    window.open(project.url, '_blank', 'noopener,noreferrer');
    if (onNotify) onNotify(`Opening ${project.name} (${project.url})`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0c101a] p-6 sm:p-7 shadow-2xl z-10"
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-800/80 pb-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-800 border border-slate-700/80 text-emerald-400 font-mono font-bold text-base shadow-sm">
                {project.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg font-bold text-white tracking-tight">{project.name}</h3>
                  <StatusBadge status={project.status} size="sm" />
                </div>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  {project.technology} • {project.environment}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="mt-5 space-y-5">
            {project.description && (
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800/60">
                {project.description}
              </p>
            )}

            {/* URL Section */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Project Access URL
              </label>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
                <code className="text-xs font-mono text-emerald-300 flex-1 truncate select-all">
                  {project.url}
                </code>
                <button
                  onClick={handleCopyUrl}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
                  title="Copy URL"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Key-Value Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/70 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <Terminal className="w-3.5 h-3.5 text-slate-500" />
                  <span>Container Name</span>
                </div>
                <div className="font-mono text-slate-200 truncate">{project.containerName}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/70 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <Network className="w-3.5 h-3.5 text-slate-500" />
                  <span>Port Binding</span>
                </div>
                <div className="font-mono text-cyan-300">:{project.port}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/70 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>Environment</span>
                </div>
                <div className="font-mono text-slate-200">{project.environment}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/70 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Last Deployment</span>
                </div>
                <div className="font-mono text-slate-200">{project.lastDeployed}</div>
              </div>

              {project.gitBranch && (
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                    <GitBranch className="w-3.5 h-3.5 text-slate-500" />
                    <span>Branch</span>
                  </div>
                  <div className="font-mono text-slate-200">{project.gitBranch}</div>
                </div>
              )}

              {project.cpu && (
                <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-400 font-medium">
                    <Cpu className="w-3.5 h-3.5 text-slate-500" />
                    <span>Resource Usage</span>
                  </div>
                  <div className="font-mono text-slate-200">
                    {project.cpu} CPU / {project.memory}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleOpenUrl}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 hover:text-emerald-300 text-xs font-semibold transition-all shadow-sm active:scale-95"
            >
              <span>Open Project</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
