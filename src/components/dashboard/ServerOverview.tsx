'use client';

import React from 'react';
import { Server, CheckCircle2, Cpu, HardDrive, Database, Boxes } from 'lucide-react';
import { ServerOverviewData } from '@/types';
import { ProgressBar } from '@/components/ui/ProgressBar';

interface ServerOverviewProps {
  data: ServerOverviewData;
}

export function ServerOverview({ data }: ServerOverviewProps) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-slate-900/40 p-5 sm:p-6 backdrop-blur-md space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/80 border border-slate-700/60 text-emerald-400">
            <Server className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base tracking-tight">Server Overview</h3>
            <p className="text-xs text-slate-400 font-mono">ubuntu-srv-01 • 192.168.1.150</p>
          </div>
        </div>

        {/* Health status badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-xs font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{data.healthMessage}</span>
        </div>
      </div>

      {/* Progress Bars Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* CPU Usage */}
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/70 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-slate-300 font-medium">
              <Cpu className="w-4 h-4 text-emerald-400" />
              CPU Usage
            </span>
            <span className="font-mono font-bold text-white">{data.metrics.cpu.label}</span>
          </div>
          <ProgressBar
            percentage={data.metrics.cpu.percentage}
            colorScheme="emerald"
            showLabel={false}
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>4 Cores active</span>
            <span>Normal load</span>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/70 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-slate-300 font-medium">
              <Database className="w-4 h-4 text-cyan-400" />
              Memory
            </span>
            <span className="font-mono font-bold text-white">{data.metrics.memory.label}</span>
          </div>
          <ProgressBar
            percentage={data.metrics.memory.percentage}
            colorScheme="cyan"
            showLabel={false}
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>2.5 GB / 16 GB</span>
            <span>Plenty available</span>
          </div>
        </div>

        {/* Storage */}
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/70 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-slate-300 font-medium">
              <HardDrive className="w-4 h-4 text-indigo-400" />
              Storage
            </span>
            <span className="font-mono font-bold text-white">{data.metrics.storage.label}</span>
          </div>
          <ProgressBar
            percentage={data.metrics.storage.percentage}
            colorScheme="indigo"
            showLabel={false}
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>40 GB / 500 GB NVMe</span>
            <span>8% allocated</span>
          </div>
        </div>

        {/* Docker Containers */}
        <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800/70 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-2 text-slate-300 font-medium">
              <Boxes className="w-4 h-4 text-amber-400" />
              Docker Containers
            </span>
            <span className="font-mono font-bold text-white">{data.metrics.containers.total}</span>
          </div>
          <ProgressBar
            percentage={(data.metrics.containers.running / data.metrics.containers.total) * 100}
            colorScheme="amber"
            showLabel={false}
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>{data.metrics.containers.running} active running</span>
            <span>1 stopped</span>
          </div>
        </div>
      </div>
    </div>
  );
}
