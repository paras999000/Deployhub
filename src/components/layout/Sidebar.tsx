'use client';

import React from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  UploadCloud,
  HardDrive,
  Boxes,
  Server,
  Settings,
  X,
  Radio,
  Terminal,
  Cpu
} from 'lucide-react';
import { NavigationTab } from '@/types';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'deploy', label: 'Deploy', icon: UploadCloud, badge: 'New' },
  { id: 'nas', label: 'NAS / Files', icon: HardDrive, badge: '465GB' },
  { id: 'docker', label: 'Docker', icon: Boxes },
  { id: 'server', label: 'Server', icon: Server, badge: 'Healthy' },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function Sidebar({ activeTab, onSelectTab, isMobileOpen, onCloseMobile }: SidebarProps) {
  const handleNavClick = (id: NavigationTab) => {
    onSelectTab(id);
    onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full justify-between p-4">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-transparent border border-emerald-500/30 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <Server className="h-5 w-5" />
            </div>
            <div>
              <h1 className="font-bold tracking-tight text-white text-base leading-tight">DeployHub</h1>
              <p className="text-[11px] text-slate-400 font-mono">v1.0.0 • personal</p>
            </div>
          </div>

          {/* Close button for mobile drawer */}
          <button
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1.5">
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-2">
            Overview
          </p>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  'w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all group',
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.08)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'w-4 h-4 transition-colors',
                      isActive ? 'text-emerald-400' : 'text-slate-500 group-hover:text-slate-300'
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'px-1.5 py-0.5 text-[10px] font-mono rounded-md border',
                      isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-800/80 text-slate-400 border-slate-700/50'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Host Status Footer Card */}
      <div className="pt-4 border-t border-slate-800/60 space-y-3">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400 flex items-center gap-1.5 text-[11px]">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              Node Status
            </span>
            <span className="text-[11px] font-mono text-emerald-400 font-medium">99.9% Up</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono pt-1 border-t border-slate-800/40">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-slate-500" />
              CPU Load
            </span>
            <span className="text-slate-300">18%</span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3 text-slate-500" />
              Docker
            </span>
            <span className="text-emerald-400">Active</span>
          </div>
        </div>

        <p className="text-[10px] text-slate-400 text-center font-mono">
          &quot;Your projects. Your server. One dashboard.&quot;
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-white/[0.07] bg-[#070a10] min-h-screen sticky top-0 h-screen z-40">
        {navContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden transition-opacity"
        />
      )}

      {/* Mobile Off-canvas Drawer */}
      <div
        className={cn(
          'fixed top-0 bottom-0 left-0 z-50 w-72 bg-[#070a10] border-r border-slate-800 md:hidden transition-transform duration-300 ease-in-out',
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {navContent}
      </div>
    </>
  );
}
