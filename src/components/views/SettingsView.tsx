'use client';

import React, { useState } from 'react';
import { Settings, ShieldCheck, Copy, Check, Terminal } from 'lucide-react';

interface SettingsViewProps {
  onNotify?: (msg: string) => void;
}

export function SettingsView({ onNotify }: SettingsViewProps) {
  const [copiedCaddy, setCopiedCaddy] = useState(false);

  const sampleCaddyConfig = `# /etc/caddy/Caddyfile
deploy.yourdomain.com {
    # Reverse proxy to DeployHub dashboard container
    reverse_proxy localhost:3000

    # Project path routing examples:
    # handle_path /server-test* {
    #     reverse_proxy localhost:3001
    # }
    # handle_path /api-gateway* {
    #     reverse_proxy localhost:3002
    # }

    encode gzip zstd
}
`;

  const handleCopyCaddy = () => {
    navigator.clipboard.writeText(sampleCaddyConfig);
    setCopiedCaddy(true);
    if (onNotify) onNotify('Copied Caddyfile configuration to clipboard!');
    setTimeout(() => setCopiedCaddy(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <Settings className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">System Settings & Proxy</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Self-hosted environment parameters, Docker container flags, and Caddy reverse proxy integration.
        </p>
      </div>

      {/* Caddy Reverse Proxy Section */}
      <div className="rounded-2xl border border-white/[0.07] bg-slate-900/40 p-5 sm:p-6 backdrop-blur-md space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm sm:text-base">
                Caddy Reverse Proxy Configuration
              </h3>
              <p className="text-xs text-slate-400">
                Automatic HTTPS (Let&apos;s Encrypt), HTTP/2, and zero SSL overhead inside the container.
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyCaddy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors"
          >
            {copiedCaddy ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedCaddy ? 'Copied' : 'Copy Caddyfile'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          DeployHub listens on plain HTTP on port <code className="text-emerald-400 font-mono">PORT=3000</code>.
          Place Caddy in front of it on your Ubuntu server to obtain automatic TLS certificates and secure domain routing.
        </p>

        {/* Code Block */}
        <div className="rounded-xl bg-slate-950/90 border border-slate-800 p-4 font-mono text-xs text-slate-300 overflow-x-auto relative">
          <pre>{sampleCaddyConfig}</pre>
        </div>
      </div>

      {/* Environment Flags & Variables */}
      <div className="rounded-2xl border border-white/[0.07] bg-slate-900/40 p-5 sm:p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <h3 className="font-bold text-white text-sm">Environment Variables</h3>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 gap-2">
            <div>
              <span className="font-mono font-bold text-white">PORT</span>
              <p className="text-slate-400 text-[11px] mt-0.5">The HTTP port the standalone server listens on.</p>
            </div>
            <div className="font-mono text-emerald-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              3000
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 gap-2">
            <div>
              <span className="font-mono font-bold text-white">NODE_ENV</span>
              <p className="text-slate-400 text-[11px] mt-0.5">Application environment lifecycle.</p>
            </div>
            <div className="font-mono text-emerald-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              production
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-slate-950/40 border border-slate-800/60 gap-2">
            <div>
              <span className="font-mono font-bold text-white">NEXT_TELEMETRY_DISABLED</span>
              <p className="text-slate-400 text-[11px] mt-0.5">Disabled for privacy and airgapped environments.</p>
            </div>
            <div className="font-mono text-emerald-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
              1
            </div>
          </div>
        </div>
      </div>

      {/* About DeployHub */}
      <div className="rounded-2xl border border-white/[0.07] bg-slate-900/40 p-5 sm:p-6 backdrop-blur-md space-y-3">
        <h3 className="font-bold text-white text-sm">About DeployHub</h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          DeployHub is built for developers and self-hosters who value simplicity, zero external databases, lightweight footprint, and quick single-command deployments on Ubuntu servers.
        </p>
        <div className="pt-2 text-xs font-mono text-slate-400">
          &quot;Your projects. Your server. One dashboard.&quot;
        </div>
      </div>
    </div>
  );
}
