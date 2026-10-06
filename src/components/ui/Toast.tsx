'use client';

import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  type?: 'success' | 'info' | 'warning';
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastProps) {
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-xl text-sm',
              toast.type === 'success' && 'bg-slate-900/95 border-emerald-500/30 text-slate-100',
              toast.type === 'warning' && 'bg-slate-900/95 border-amber-500/30 text-slate-100',
              (!toast.type || toast.type === 'info') && 'bg-slate-900/95 border-blue-500/30 text-slate-100'
            )}
          >
            <div className="mt-0.5 shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400" />}
              {(!toast.type || toast.type === 'info') && <Info className="w-4 h-4 text-sky-400" />}
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-xs tracking-wide text-white">{toast.title}</p>
              {toast.description && (
                <p className="mt-0.5 text-xs text-slate-400 leading-relaxed">{toast.description}</p>
              )}
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="text-slate-400 hover:text-white transition-colors p-0.5"
              aria-label="Dismiss toast"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
