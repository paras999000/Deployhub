'use client';

import React from 'react';
import { ServerOverviewData, Project } from '@/types';
import { ServerOverview } from '@/components/dashboard/ServerOverview';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Server, Terminal, Network, Clock } from 'lucide-react';

interface ServerViewProps {
  serverData: ServerOverviewData;
  projects: Project[];
}

export function ServerView({ serverData, projects }: ServerViewProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Server className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Server Diagnostics</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Host system telemetry, Docker daemon health, and network socket allocations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge status="ONLINE" size="sm" />
          <StatusBadge status="SELF-HOSTED" size="sm" />
        </div>
      </div>

      {/* Primary Server Metrics Card */}
      <ServerOverview data={serverData} />

      {/* Host Specifications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Server className="w-4 h-4 text-emerald-400" />
            <span>Hostname</span>
          </div>
          <div className="font-mono text-sm font-semibold text-white">{serverData.hostname}</div>
          <div className="text-[11px] text-slate-500 font-mono">Ubuntu 24.04 LTS (x86_64)</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Network className="w-4 h-4 text-cyan-400" />
            <span>LAN IP Address</span>
          </div>
          <div className="font-mono text-sm font-semibold text-white">{serverData.ip}</div>
          <div className="text-[11px] text-slate-500 font-mono">Ubuntu Host: 192.168.31.38</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span>System Uptime</span>
          </div>
          <div className="font-mono text-sm font-semibold text-white">{serverData.uptime}</div>
          <div className="text-[11px] text-emerald-400 font-mono">Zero crash events</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <Terminal className="w-4 h-4 text-amber-400" />
            <span>Docker Engine</span>
          </div>
          <div className="font-mono text-sm font-semibold text-white">v26.1.4-ce</div>
          <div className="text-[11px] text-slate-500 font-mono">overlay2 driver</div>
        </div>
      </div>

      {/* Network Port Bindings Matrix */}
      <div className="rounded-2xl border border-white/[0.07] bg-slate-900/40 p-5 sm:p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Network className="w-4 h-4 text-cyan-400" />
            <h3 className="font-bold text-white text-sm">Host Port Mapping Matrix</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">Isolated loopback / LAN</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="py-2.5 px-3">PORT</th>
                <th className="py-2.5 px-3">APPLICATION</th>
                <th className="py-2.5 px-3">CONTAINER</th>
                <th className="py-2.5 px-3">STATUS</th>
                <th className="py-2.5 px-3 text-right">REVERSE PROXY ROUTE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr className="hover:bg-slate-800/30">
                <td className="py-3 px-3 text-emerald-400 font-semibold">:3000</td>
                <td className="py-3 px-3 font-sans font-medium text-white">DeployHub (This Dashboard)</td>
                <td className="py-3 px-3 text-slate-400">deployhub_app</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-800/40">
                    ACTIVE
                  </span>
                </td>
                <td className="py-3 px-3 text-right text-slate-400">/</td>
              </tr>
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/30">
                  <td className="py-3 px-3 text-cyan-400 font-semibold">:{p.port}</td>
                  <td className="py-3 px-3 font-sans font-medium text-white">{p.name}</td>
                  <td className="py-3 px-3 text-slate-400">{p.containerName}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] border ${
                        p.status === 'RUNNING'
                          ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                          : 'bg-zinc-900/60 text-zinc-400 border-zinc-700/40'
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right text-slate-400 font-mono">
                    /{p.name.toLowerCase().replace(/\s+/g, '-')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
