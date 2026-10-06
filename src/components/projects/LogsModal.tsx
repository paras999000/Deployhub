'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Terminal, Copy, Check, RefreshCw } from 'lucide-react';
import { Project } from '@/types';

interface LogsModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LogsModal({ project, isOpen, onClose }: LogsModalProps) {
  const [logs, setLogs] = useState<string>('Loading logs...');
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    if (isOpen && project) {
      fetch(`/api/projects/${project.id}/logs`)
        .then((res) => res.json())
        .then((data) => {
          if (!isCancelled) {
            if (data.success && data.logs) {
              setLogs(data.logs);
            } else {
              setLogs(data.error || 'Failed to fetch logs.');
            }
          }
        })
        .catch((err: unknown) => {
          if (!isCancelled) {
            const msg = err instanceof Error ? err.message : String(err);
            setLogs(`Error: ${msg}`);
          }
        });
    }
    return () => {
      isCancelled = true;
    };
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const handleManualRefresh = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/logs`);
      const data = await res.json();
      if (data.success && data.logs) {
        setLogs(data.logs);
      } else {
        setLogs(data.error || 'Failed to fetch logs.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setLogs(`Error: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(logs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/[0.12] bg-[#090d16] p-6 shadow-2xl z-10 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-emerald-400">
                <Terminal className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Logs — {project.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Container: {project.containerName} • Port :{project.port}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleManualRefresh}
                disabled={isLoading}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Refresh Logs"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
              </button>
              <button
                onClick={handleCopy}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Copy Logs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Logs Output Box */}
          <div className="mt-4 flex-1 overflow-y-auto rounded-xl bg-[#05080e] border border-slate-800/80 p-4 font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed">
            {logs}
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-mono">
            <span>Terminal stream output</span>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
