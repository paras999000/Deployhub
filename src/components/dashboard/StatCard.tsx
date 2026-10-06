'use client';

import React from 'react';
import { FolderGit2, Boxes, Activity, HardDrive } from 'lucide-react';
import { StatItem } from '@/types';
import { cn } from '@/lib/utils';

interface StatCardProps {
  item: StatItem;
  className?: string;
}

const ICON_MAP = {
  'folder-git': FolderGit2,
  'boxes': Boxes,
  'activity': Activity,
  'hard-drive': HardDrive,
};

export function StatCard({ item, className }: StatCardProps) {
  const Icon = ICON_MAP[item.iconName] || Activity;

  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-xl border border-white/[0.07] bg-slate-900/40 p-5 backdrop-blur-md transition-all duration-300 hover:border-white/15 hover:bg-slate-900/70 hover:shadow-[0_8px_30px_rgb(0,0,0,0.25)]',
        className
      )}
    >
      {/* Top row: Label & Icon */}
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
          {item.label}
        </span>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800/80 border border-slate-700/60 text-slate-300 group-hover:text-emerald-400 group-hover:border-emerald-500/40 group-hover:bg-emerald-950/20 transition-all">
          <Icon className="h-4.5 w-4.5" />
        </div>
      </div>

      {/* Metric value */}
      <div className="mt-3">
        <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white group-hover:text-emerald-300 transition-colors">
          {item.value}
        </div>
      </div>

      {/* Subtext and trend */}
      <div className="mt-2.5 flex items-center justify-between text-xs pt-2 border-t border-slate-800/50">
        <span className="text-slate-400 text-[11px] truncate">{item.secondaryText}</span>
        {item.trend && (
          <span
            className={cn(
              'text-[10px] font-mono px-1.5 py-0.5 rounded border',
              item.trend.isPositive
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                : 'bg-rose-950/40 text-rose-400 border-rose-800/40'
            )}
          >
            {item.trend.value}
          </span>
        )}
      </div>

      {/* Subtle corner light reflection */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-24 w-24 rounded-full bg-white/[0.02] blur-xl group-hover:bg-emerald-500/[0.06] transition-all" />
    </div>
  );
}
