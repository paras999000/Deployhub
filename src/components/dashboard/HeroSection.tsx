'use client';

import React from 'react';
import { Server, Terminal, HardDrive, ArrowUpRight } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface HeroSectionProps {
  onQuickAction?: () => void;
}

export function HeroSection({ onQuickAction }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-gradient-to-b from-slate-900/70 via-slate-900/30 to-[#080b11] p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
      {/* Background radial accent */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-[90px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-20 w-60 h-60 rounded-full bg-cyan-500/5 blur-[80px] pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Self-Hosted Instance Active</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Welcome to <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">DeployHub</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl">
            Monitor and manage your projects from one place. Your projects. Your server. One dashboard.
          </p>

          {/* Quick status pills as required */}
          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Server Status:</span>
              <StatusBadge status="ONLINE" size="sm" />
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-400">Docker:</span>
              <StatusBadge status="RUNNING" size="sm" />
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-300">
              <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Environment:</span>
              <StatusBadge status="SELF-HOSTED" size="sm" />
            </div>
          </div>
        </div>

        {/* Quick action card / banner */}
        <div className="shrink-0 flex lg:flex-col items-stretch gap-3">
          <button
            onClick={onQuickAction}
            className="p-4 rounded-xl bg-slate-900/60 hover:bg-slate-900/90 border border-slate-800/80 hover:border-slate-700/80 backdrop-blur-md flex flex-col justify-between min-w-[200px] text-left transition-all group"
          >
            <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
              Host Address
            </div>
            <div className="text-sm font-mono font-medium text-slate-200 mt-1">
              192.168.1.150:3000
            </div>
            <div className="text-[11px] text-emerald-400 font-mono mt-2 flex items-center gap-1 group-hover:text-emerald-300">
              <span>View Deployed Projects</span>
              <ArrowUpRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
