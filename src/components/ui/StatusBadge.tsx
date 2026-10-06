import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'RUNNING' | 'STOPPED' | 'ONLINE' | 'OFFLINE' | 'Production' | 'Development' | 'Staging' | 'SELF-HOSTED' | 'LOCAL SERVER';
  className?: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  const isRunning = status === 'RUNNING' || status === 'ONLINE';
  const isStopped = status === 'STOPPED' || status === 'OFFLINE';
  const isDev = status === 'Development';
  const isEnvBadge = status === 'LOCAL SERVER' || status === 'SELF-HOSTED';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium rounded-full border transition-colors',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        isRunning && 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40',
        isStopped && 'bg-zinc-900/60 text-zinc-400 border-zinc-700/40',
        isDev && 'bg-amber-950/40 text-amber-400 border-amber-800/40',
        status === 'Production' && 'bg-cyan-950/40 text-cyan-400 border-cyan-800/40',
        isEnvBadge && 'bg-slate-900/80 text-slate-300 border-slate-700/60',
        className
      )}
    >
      <span
        className={cn(
          'rounded-full',
          size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2',
          isRunning && 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse',
          isStopped && 'bg-zinc-500',
          isDev && 'bg-amber-400',
          status === 'Production' && 'bg-cyan-400',
          isEnvBadge && 'bg-blue-400'
        )}
      />
      {status}
    </span>
  );
}
