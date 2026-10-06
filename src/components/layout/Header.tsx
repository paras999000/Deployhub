'use client';

import React from 'react';
import { RefreshCw, Server, ShieldCheck, Menu, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { UserSession } from '@/lib/server/auth';

interface HeaderProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  onToggleMobileMenu?: () => void;
  currentUser?: UserSession | null;
  onLogout?: () => void;
}

export function Header({ onRefresh, isRefreshing, onToggleMobileMenu, currentUser, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-white/[0.07] bg-[#080b11]/85 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Mobile menu toggle & brand/server indicator */}
        <div className="flex items-center gap-3 md:gap-4">
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800/60 transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo on mobile view if sidebar hidden */}
          <div className="flex items-center gap-2.5 md:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-400">
              <Server className="h-5 w-5" />
            </div>
            <span className="font-bold tracking-tight text-white">DeployHub</span>
          </div>

          {/* Desktop Host / Server context */}
          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold text-slate-200">Production Server</span>
              <span className="text-slate-500">|</span>
              <span className="text-slate-400 font-mono">ubuntu-srv-01</span>
            </div>

            <StatusBadge status="LOCAL SERVER" size="sm" />
          </div>
        </div>

        {/* Right: Actions & User Avatar */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Refresh simulated data button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={cn(
              'inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-700/60 bg-slate-900/60 hover:bg-slate-800/80 hover:border-slate-600 text-xs font-medium text-slate-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm'
            )}
            title="Refresh dashboard metrics"
            aria-label="Refresh dashboard data"
          >
            <RefreshCw
              className={cn('w-3.5 h-3.5 text-slate-400 transition-transform', isRefreshing && 'animate-spin text-emerald-400')}
            />
            <span className="hidden sm:inline">{isRefreshing ? 'Syncing...' : 'Refresh'}</span>
          </button>

          {/* HTTPS / Caddy proxy indicator pill */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950/30 border border-emerald-800/30 text-[11px] font-medium text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Caddy Ready</span>
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block" />

          {/* User / Host Avatar & Logout */}
          <div className="flex items-center gap-2.5">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-600/80 flex items-center justify-center text-xs font-semibold text-slate-200 shadow-inner">
                {currentUser?.username?.substring(0, 2).toUpperCase() || 'DH'}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#080b11]" />
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-slate-200 leading-none">
                {currentUser?.username || 'admin'}
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                {currentUser?.role || 'host'}@192.168.31.38
              </p>
            </div>

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors ml-1"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
