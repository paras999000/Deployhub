'use client';

import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileArchive,
  Terminal,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCw,
  ExternalLink,
  Info,
  Copy,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DeployViewProps {
  onDeploymentComplete?: () => void;
  onNavigateToProjects?: () => void;
}

export function DeployView({ onDeploymentComplete, onNavigateToProjects }: DeployViewProps) {
  const [file, setFile] = useState<File | null>(null);
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [customPort, setCustomPort] = useState('');
  const [isDeploying, setIsDeploying] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [deployResult, setDeployResult] = useState<{
    success: boolean;
    projectId?: string;
    hostPort?: number;
    error?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  const handleFileChange = (selectedFile: File) => {
    if (selectedFile.name.endsWith('.zip')) {
      setFile(selectedFile);
      if (!projectName) {
        const baseName = selectedFile.name.replace(/\.zip$/i, '');
        // Format to Title Case or readable name
        const cleanName = baseName
          .replace(/[-_]+/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        setProjectName(cleanName);
      }
    } else {
      alert('Please select a valid .zip archive.');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleStartDeploy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !projectName.trim()) return;

    setIsDeploying(true);
    setLogs([
      `[${new Date().toTimeString().split(' ')[0]}] Initializing deployment pipeline...`,
      `[${new Date().toTimeString().split(' ')[0]}] Uploading "${file.name}" (${(file.size / 1024).toFixed(1)} KB)...`,
    ]);
    setDeployResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', projectName.trim());
    formData.append('description', description.trim());
    if (customPort.trim()) {
      formData.append('portOverride', customPort.trim());
    }

    try {
      const res = await fetch('/api/projects/deploy', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.logs && Array.isArray(data.logs)) {
        setLogs(data.logs);
      }

      if (data.success) {
        setDeployResult({
          success: true,
          projectId: data.projectId,
          hostPort: data.hostPort,
        });
        if (onDeploymentComplete) onDeploymentComplete();
      } else {
        setDeployResult({
          success: false,
          error: data.error || 'Deployment failed. Check build logs.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setLogs((prev) => [...prev, `[ERROR] Network error during deployment: ${msg}`]);
      setDeployResult({
        success: false,
        error: msg,
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleCopyLogs = () => {
    navigator.clipboard.writeText(logs.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
            <UploadCloud className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Deploy Project</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Upload a ZIP archive to automatically extract, build a Docker image, assign a host port, and start the container on your Ubuntu server.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload Form */}
        <div className="lg:col-span-6 space-y-5">
          <form onSubmit={handleStartDeploy} className="space-y-4">
            {/* Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                'group relative flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 text-center',
                isDragging
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : file
                  ? 'border-emerald-500/40 bg-slate-900/50'
                  : 'border-slate-800 hover:border-slate-700 bg-slate-900/30 hover:bg-slate-900/50'
              )}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                className="hidden"
              />

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-800/80 border border-slate-700/60 text-emerald-400 group-hover:scale-105 transition-transform">
                <FileArchive className="w-6 h-6" />
              </div>

              {file ? (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-white truncate max-w-xs">{file.name}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    {(file.size / (1024 * 1024)).toFixed(2)} MB • Click to replace
                  </p>
                </div>
              ) : (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-slate-200">
                    Drag and drop your project <span className="text-emerald-400">.zip</span> here
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">or click to browse from your device</p>
                </div>
              )}
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Project Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. My Next.js Web App"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  placeholder="Brief description of this project service..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/40"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                    Host Port (Optional)
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Range 3001-3999</span>
                </div>
                <input
                  type="number"
                  min="3001"
                  max="3999"
                  placeholder="Auto-assign (Default: next available port)"
                  value={customPort}
                  onChange={(e) => setCustomPort(e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-800/80 rounded-xl px-3.5 py-2 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/40 focus:ring-1 focus:ring-emerald-500/40 font-mono"
                />
                <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                  <Info className="w-3 h-3 text-slate-400" />
                  Leave blank to automatically select an unoccupied port.
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!file || !projectName.trim() || isDeploying}
              className={cn(
                'w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold tracking-wide transition-all shadow-lg active:scale-98',
                !file || !projectName.trim() || isDeploying
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
              )}
            >
              {isDeploying ? (
                <>
                  <RotateCw className="w-4 h-4 animate-spin" />
                  <span>Deploying to Ubuntu Server...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Deploy Project</span>
                </>
              )}
            </button>
          </form>

          {/* Workflow Steps Preview */}
          <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/60 space-y-2 text-xs">
            <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
              Deployment Pipeline Flow
            </span>
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>1. ZIP Extraction</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>2. Dockerfile Check</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>3. Image Build</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>4. Port Allocation</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>5. Container Start</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>6. Health Check</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Build Terminal & Result */}
        <div className="lg:col-span-6 flex flex-col space-y-4">
          {/* Terminal Box */}
          <div className="flex-1 flex flex-col rounded-2xl border border-white/[0.08] bg-[#070a10] overflow-hidden min-h-[380px]">
            {/* Terminal Header */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono font-medium text-slate-200">Deployment Logs</span>
              </div>

              {logs.length > 0 && (
                <button
                  onClick={handleCopyLogs}
                  className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-300 font-mono transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              )}
            </div>

            {/* Terminal Output */}
            <div className="flex-1 p-4 font-mono text-[11px] text-slate-300 overflow-y-auto space-y-1 max-h-[360px]">
              {logs.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-600 text-center py-16">
                  Select a project ZIP and click &quot;Deploy Project&quot; to begin stream.
                </div>
              ) : (
                logs.map((line, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'leading-relaxed whitespace-pre-wrap break-all',
                      line.includes('error') || line.includes('ERROR') || line.includes('Failed')
                        ? 'text-rose-400'
                        : line.includes('success') || line.includes('Success') || line.includes('passed')
                        ? 'text-emerald-400'
                        : line.includes('warning') || line.includes('WARN')
                        ? 'text-amber-400'
                        : 'text-slate-300'
                    )}
                  >
                    {line}
                  </div>
                ))
              )}
              <div ref={terminalEndRef} />
            </div>
          </div>

          {/* Result Alert Box */}
          {deployResult && (
            <div
              className={cn(
                'p-4 rounded-2xl border backdrop-blur-md flex items-center justify-between gap-3',
                deployResult.success
                  ? 'bg-emerald-950/40 border-emerald-500/30 text-slate-100'
                  : 'bg-rose-950/40 border-rose-500/30 text-slate-100'
              )}
            >
              <div className="flex items-center gap-3">
                {deployResult.success ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                )}
                <div>
                  <p className="text-xs font-semibold text-white">
                    {deployResult.success
                      ? `Successfully Deployed on Port :${deployResult.hostPort}`
                      : 'Deployment Failed'}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {deployResult.success
                      ? `Active at http://192.168.31.38:${deployResult.hostPort}`
                      : deployResult.error}
                  </p>
                </div>
              </div>

              {deployResult.success && (
                <div className="flex items-center gap-2">
                  <a
                    href={`http://192.168.31.38:${deployResult.hostPort}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-all active:scale-95"
                  >
                    <span>Open</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {onNavigateToProjects && (
                    <button
                      onClick={onNavigateToProjects}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                    >
                      View in Projects
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
