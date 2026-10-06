import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  percentage: number;
  label?: string;
  valueLabel?: string;
  colorScheme?: 'emerald' | 'cyan' | 'indigo' | 'amber';
  showLabel?: boolean;
  className?: string;
}

export function ProgressBar({
  percentage,
  label,
  valueLabel,
  colorScheme = 'emerald',
  showLabel = true,
  className,
}: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percentage));

  const barGradients = {
    emerald: 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.3)]',
    cyan: 'bg-gradient-to-r from-cyan-600 to-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.3)]',
    indigo: 'bg-gradient-to-r from-indigo-600 to-indigo-400 shadow-[0_0_12px_rgba(129,140,248,0.3)]',
    amber: 'bg-gradient-to-r from-amber-600 to-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.3)]',
  };

  return (
    <div className={cn('w-full space-y-2', className)}>
      {showLabel && (label || valueLabel) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-slate-400 font-medium">{label}</span>}
          {valueLabel && <span className="text-slate-200 font-mono font-semibold">{valueLabel}</span>}
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800/80 p-0.5 border border-slate-700/40">
        <div
          className={cn('h-full rounded-full transition-all duration-700 ease-out', barGradients[colorScheme])}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}
