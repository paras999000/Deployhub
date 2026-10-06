'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Boxes,
  Play,
  Square,
  RotateCw,
  Terminal,
  RefreshCw,
  Clock,
  Radio,
} from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { cn } from '@/lib/utils';

export interface DockerContainerItem {
  id: string;
  name: string;
  image: string;
  status: 'RUNNING' | 'STOPPED' | 'RESTARTING' | 'PAUSED' | 'UNKNOWN';
  state: string;
  created: number;
  ports: { hostPort?: number; containerPort: number; type: string }[];
  cpuUsage?: string;
  memoryUsage?: string;
}

interface DockerViewProps {
  onNotify?: (msg: string) => void;
}

export function DockerView({ onNotify }: DockerViewProps) {
  const [containers, setContainers] = useState<DockerContainerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);
  const [selectedLogContainer, setSelectedLogContainer] = useState<string | null>(null);
  const [logs, setLogs] = useState<string>('');
  const [isLogLoading, setIsLogLoading] = useState(false);

  const fetchContainers = useCallback(async () => {
    try {
      const res = await fetch('/api/docker/containers');
      const data = await res.json();
      if (data.success && Array.isArray(data.containers)) {
        setContainers(data.containers);
      }
    } catch (err: unknown) {
      console.error('Failed to fetch Docker containers:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchContainers();
  }, [fetchContainers]);

  const handleContainerAction = async (containerId: string, action: 'start' | 'stop' | 'restart') => {
    setActiveActionId(containerId);
    try {
      const res = await fetch('/api/docker/containers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, containerId }),
      });
      const data = await res.json();
      if (data.success) {
        if (onNotify) onNotify(`Container ${action} succeeded.`);
        fetchContainers();
      } else {
        if (onNotify) onNotify(`Action failed: ${data.error || data.message}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (onNotify) onNotify(`Error: ${msg}`);
    } finally {
      setActiveActionId(null);
    }
  };

  const handleFetchLogs = async (containerId: string, name: string) => {
    setSelectedLogContainer(name);
    setIsLogLoading(true);
    setLogs('Fetching live logs from Docker daemon...');
    try {
      const res = await fetch('/api/docker/containers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'logs', containerId }),
      });
      const data = await res.json();
      if (data.success && data.logs) {
        setLogs(data.logs);
      } else {
        setLogs(data.error || 'No logs available for this container.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setLogs(`Failed to fetch logs: ${msg}`);
    } finally {
      setIsLogLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Boxes className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Docker Containers</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time status and lifecycle controls for all containers running on host Docker socket.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchContainers}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-medium transition-colors"
          >
            <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin text-emerald-400')} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Containers Grid */}
      {containers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {containers.map((container) => {
            const isRunning = container.status === 'RUNNING';
            const isBusy = activeActionId === container.id;

            return (
              <div
                key={container.id}
                className={cn(
                  'group relative flex flex-col justify-between overflow-hidden rounded-2xl border bg-slate-900/40 p-5 sm:p-6 backdrop-blur-md transition-all duration-200',
                  isRunning
                    ? 'border-white/[0.07] hover:border-emerald-500/30'
                    : 'border-white/[0.05] hover:border-slate-700/50'
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={cn(
                          'flex h-10 w-10 items-center justify-center rounded-xl border shrink-0',
                          isRunning
                            ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-400'
                            : 'bg-slate-800/60 border-slate-700/60 text-slate-400'
                        )}
                      >
                        <Boxes className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-bold text-white text-sm sm:text-base truncate">
                          {container.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{container.image}</p>
                      </div>
                    </div>

                    <StatusBadge status={container.status === 'RUNNING' ? 'RUNNING' : 'STOPPED'} size="sm" />
                  </div>

                  {/* Ports & Metadata */}
                  <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-500">Port Mapping:</span>
                      <span className="text-cyan-300">
                        {container.ports.length > 0
                          ? container.ports
                              .map((p) => (p.hostPort ? `:${p.hostPort}->:${p.containerPort}` : `:${p.containerPort}`))
                              .join(', ')
                          : 'None'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-slate-500">State:</span>
                      <span className="text-slate-300 truncate max-w-[160px]">{container.state}</span>
                    </div>

                    {container.created > 0 && (
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-mono pt-1">
                        <Clock className="w-3 h-3 text-slate-600" />
                        <span>Created {new Date(container.created * 1000).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Container Actions */}
                <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center gap-2">
                  {isRunning ? (
                    <button
                      onClick={() => handleContainerAction(container.id, 'stop')}
                      disabled={isBusy}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 hover:text-rose-400 border border-slate-700/60 text-xs font-medium text-slate-300 transition-all disabled:opacity-50"
                      title="Stop container"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleContainerAction(container.id, 'start')}
                      disabled={isBusy}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-950/40 hover:bg-emerald-950/60 border border-emerald-800/40 text-xs font-medium text-emerald-400 transition-all disabled:opacity-50"
                      title="Start container"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleContainerAction(container.id, 'restart')}
                    disabled={isBusy}
                    className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-white transition-colors"
                    title="Restart container"
                  >
                    <RotateCw className={cn('w-4 h-4', isBusy && 'animate-spin')} />
                  </button>

                  <button
                    onClick={() => handleFetchLogs(container.id, container.name)}
                    className="p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-400 hover:text-white transition-colors"
                    title="View container logs"
                  >
                    <Terminal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/20">
          <Boxes className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400 font-medium">No Docker containers detected.</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Ensure the Docker socket <code className="text-slate-400 font-mono">/var/run/docker.sock</code> is mounted into the DeployHub container.
          </p>
        </div>
      )}

      {/* Terminal Log Viewer Drawer / Box when a container is selected */}
      {selectedLogContainer && (
        <div className="rounded-2xl border border-white/[0.08] bg-[#070a10] overflow-hidden shadow-2xl mt-8">
          <div className="flex items-center justify-between px-5 py-3 bg-slate-900/90 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-xs font-semibold text-white">
                Live Daemon Logs — {selectedLogContainer}
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                <Radio className="w-2.5 h-2.5 animate-pulse" />
                Connected
              </span>
            </div>

            <button
              onClick={() => setSelectedLogContainer(null)}
              className="text-xs font-mono text-slate-400 hover:text-white px-2 py-1 rounded hover:bg-slate-800"
            >
              Close
            </button>
          </div>

          <div className="p-4 font-mono text-xs text-slate-300 max-h-80 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {isLogLoading ? 'Streaming logs...' : logs}
          </div>
        </div>
      )}
    </div>
  );
}
