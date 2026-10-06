'use client';

import React from 'react';
import { History, CheckCircle, RefreshCw, StopCircle, ArrowDownCircle, ShieldCheck } from 'lucide-react';
import { ActivityItem } from '@/types';
import { cn } from '@/lib/utils';

interface ActivityTimelineProps {
  activities: ActivityItem[];
}

const EVENT_CONFIG = {
  deploy: {
    icon: CheckCircle,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-950/40 border-emerald-800/40',
  },
  restart: {
    icon: RefreshCw,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-950/40 border-cyan-800/40',
  },
  stop: {
    icon: StopCircle,
    color: 'text-zinc-400',
    bgColor: 'bg-zinc-900/60 border-zinc-700/40',
  },
  docker: {
    icon: ArrowDownCircle,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-950/40 border-indigo-800/40',
  },
  proxy: {
    icon: ShieldCheck,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-950/40 border-emerald-800/40',
  },
};

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-slate-900/40 p-5 sm:p-6 backdrop-blur-md space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/80 border border-slate-700/60 text-slate-300">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base tracking-tight">Recent Activity</h3>
            <p className="text-xs text-slate-400">Deployment and daemon lifecycle logs</p>
          </div>
        </div>

        <span className="text-[11px] font-mono text-slate-500">Live Stream</span>
      </div>

      {/* Timeline items */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-px before:bg-slate-800">
        {activities.map((item) => {
          const config = EVENT_CONFIG[item.type] || EVENT_CONFIG.deploy;
          const Icon = config.icon;

          return (
            <div key={item.id} className="relative flex items-start gap-3 group">
              {/* Dot on line */}
              <div
                className={cn(
                  'absolute -left-6 top-1 flex h-5 w-5 items-center justify-center rounded-full border shadow-sm transition-transform group-hover:scale-110',
                  config.bgColor
                )}
              >
                <Icon className={cn('w-2.5 h-2.5', config.color)} />
              </div>

              {/* Event Content */}
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-200 group-hover:text-white transition-colors">
                  {item.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] font-mono text-slate-400">{item.timestamp}</span>
                  {item.projectName && (
                    <>
                      <span className="text-slate-600 text-xs">•</span>
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-800/60 px-1.5 py-0.5 rounded border border-slate-700/50">
                        {item.projectName}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
