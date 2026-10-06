'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  Folder,
  FileCode,
  FileText,
  Image as ImageIcon,
  FileArchive,
  Upload,
  FolderPlus,
  FilePlus,
  RefreshCw,
  Search,
  Download,
  Trash2,
  Edit2,
  HardDrive,
  ChevronRight,
  ArrowUp,
  Share2,
} from 'lucide-react';
import { FileItem, StorageOverview } from '@/lib/server/storage';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { FileEditorModal } from '@/components/nas/FileEditorModal';
import { FilePreviewModal } from '@/components/nas/FilePreviewModal';
import { cn } from '@/lib/utils';

interface NasViewProps {
  onNotify?: (msg: string) => void;
}

export function NasView({ onNotify }: NasViewProps) {
  const [currentPath, setCurrentPath] = useState('');
  const [items, setItems] = useState<FileItem[]>([]);
  const [storage, setStorage] = useState<StorageOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'modified'>('name');
  const [sortAsc, setSortAsc] = useState(true);

  // Modals state
  const [editingFilePath, setEditingFilePath] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadDirectory = useCallback(async (path: string = '') => {
    try {
      const res = await fetch(`/api/files?path=${encodeURIComponent(path)}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items);
        setCurrentPath(data.currentPath === '/' ? '' : data.currentPath);
        setStorage(data.storage);
      } else {
        if (onNotify) onNotify(`Error loading files: ${data.error}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (onNotify) onNotify(`Failed to connect to storage: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }, [onNotify]);

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath, loadDirectory]);

  // Breadcrumbs generator
  const breadcrumbs = useMemo(() => {
    const parts = currentPath.split('/').filter(Boolean);
    return parts.map((part, index) => ({
      name: part,
      path: '/' + parts.slice(0, index + 1).join('/'),
    }));
  }, [currentPath]);

  // Sorting and Filtering
  const displayedItems = useMemo(() => {
    const result = items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    result.sort((a, b) => {
      // Always folders first
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;

      let compareVal = 0;
      if (sortBy === 'name') {
        compareVal = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
      } else if (sortBy === 'size') {
        compareVal = a.size - b.size;
      } else if (sortBy === 'modified') {
        compareVal = new Date(a.modified).getTime() - new Date(b.modified).getTime();
      }

      return sortAsc ? compareVal : -compareVal;
    });

    return result;
  }, [items, searchQuery, sortBy, sortAsc]);

  // Navigate into folder
  const handleItemClick = (item: FileItem) => {
    if (item.isDirectory) {
      setCurrentPath(item.relativePath.startsWith('/') ? item.relativePath : `/${item.relativePath}`);
    } else if (item.isEditable) {
      setEditingFilePath(item.relativePath);
    } else {
      setPreviewFile(item);
    }
  };

  // Up one folder
  const handleGoUp = () => {
    if (!currentPath || currentPath === '/') return;
    const parts = currentPath.split('/').filter(Boolean);
    parts.pop();
    setCurrentPath(parts.length > 0 ? '/' + parts.join('/') : '');
  };

  // Upload handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('destPath', currentPath);
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    try {
      const res = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        if (onNotify) onNotify(`Uploaded ${files.length} file(s) successfully.`);
        loadDirectory(currentPath);
      } else {
        if (onNotify) onNotify(`Upload failed: ${data.error}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (onNotify) onNotify(`Upload error: ${msg}`);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Create folder
  const handleCreateFolder = async () => {
    const folderName = prompt('Enter new folder name:');
    if (!folderName || !folderName.trim()) return;

    try {
      const res = await fetch('/api/files/folder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: currentPath, name: folderName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        if (onNotify) onNotify(`Folder "${folderName}" created.`);
        loadDirectory(currentPath);
      } else {
        if (onNotify) onNotify(`Failed: ${data.error}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (onNotify) onNotify(`Error: ${msg}`);
    }
  };

  // Create empty file
  const handleCreateFile = async () => {
    const fileName = prompt('Enter new file name (e.g. config.json, notes.txt):');
    if (!fileName || !fileName.trim()) return;

    try {
      const res = await fetch('/api/files/file', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: currentPath, name: fileName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        if (onNotify) onNotify(`File "${fileName}" created.`);
        loadDirectory(currentPath);
      } else {
        if (onNotify) onNotify(`Failed: ${data.error}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (onNotify) onNotify(`Error: ${msg}`);
    }
  };

  // Rename item
  const handleRename = async (item: FileItem) => {
    const newName = prompt(`Rename "${item.name}" to:`, item.name);
    if (!newName || newName === item.name || !newName.trim()) return;

    try {
      const res = await fetch('/api/files/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: item.relativePath, newName: newName.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        if (onNotify) onNotify(`Renamed to "${newName}".`);
        loadDirectory(currentPath);
      } else {
        if (onNotify) onNotify(`Failed: ${data.error}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (onNotify) onNotify(`Error: ${msg}`);
    }
  };

  // Delete item
  const handleDelete = async (item: FileItem) => {
    const isFolder = item.isDirectory;
    const confirmMsg = isFolder
      ? `Are you sure you want to permanently delete folder "${item.name}" and all its contents?`
      : `Delete file "${item.name}"?`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/files?path=${encodeURIComponent(item.relativePath)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        if (onNotify) onNotify(`Deleted "${item.name}".`);
        loadDirectory(currentPath);
      } else {
        if (onNotify) onNotify(`Failed: ${data.error}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (onNotify) onNotify(`Error: ${msg}`);
    }
  };

  // File Icon helper
  const getFileIcon = (item: FileItem) => {
    if (item.isDirectory) {
      return <Folder className="w-5 h-5 text-amber-400 fill-amber-400/20" />;
    }
    if (item.isImage) {
      return <ImageIcon className="w-5 h-5 text-emerald-400" />;
    }
    if (['.zip', '.tar', '.gz', '.rar', '.7z'].includes(item.extension)) {
      return <FileArchive className="w-5 h-5 text-indigo-400" />;
    }
    if (item.isEditable) {
      return <FileCode className="w-5 h-5 text-cyan-400" />;
    }
    return <FileText className="w-5 h-5 text-slate-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Top Header & Samba Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <HardDrive className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white">NAS / File Manager</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Server disk manager rooted strictly at <code className="text-emerald-400 font-mono">/srv/storage</code> with live Windows Samba sync.
          </p>
        </div>

        {/* Windows Samba Path Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 font-mono">
          <Share2 className="w-3.5 h-3.5 text-cyan-400" />
          <span>Samba: \\192.168.31.38\storage</span>
        </div>
      </div>

      {/* Storage Capacity Overview Card */}
      {storage && (
        <div className="rounded-2xl border border-white/[0.07] bg-slate-900/40 p-5 sm:p-6 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                Storage Capacity — /srv/storage
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-bold font-mono text-white">
                  {storage.totalGB} GB Total
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  ({storage.freeGB} GB Free • {storage.usedGB} GB Used)
                </span>
              </div>
            </div>

            <div className="sm:w-72 w-full space-y-1.5">
              <ProgressBar
                percentage={storage.usagePercentage}
                colorScheme="cyan"
                label="Storage Usage"
                valueLabel={`${storage.usagePercentage}%`}
              />
            </div>
          </div>
        </div>
      )}

      {/* Actions & Breadcrumb Bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-slate-900/40 p-4 backdrop-blur-md">
        {/* Row 1: Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold transition-all shadow-sm active:scale-95 disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Uploading...' : 'Upload'}</span>
            </button>

            <button
              onClick={handleCreateFolder}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>New Folder</span>
            </button>

            <button
              onClick={handleCreateFile}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
            >
              <FilePlus className="w-3.5 h-3.5 text-cyan-400" />
              <span>New File</span>
            </button>

            <button
              onClick={() => loadDirectory(currentPath)}
              disabled={isLoading}
              className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Refresh files"
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin text-emerald-400')} />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search current folder..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/40 font-mono"
            />
          </div>
        </div>

        {/* Row 2: Breadcrumb path */}
        <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 pt-2 border-t border-slate-800/60 overflow-x-auto py-1">
          <button
            onClick={handleGoUp}
            disabled={!currentPath || currentPath === '/'}
            className="p-1 rounded hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed text-slate-400"
            title="Up one folder"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setCurrentPath('')}
            className="hover:text-emerald-400 text-slate-400 px-1 py-0.5 rounded hover:bg-slate-800"
          >
            /srv/storage
          </button>

          {breadcrumbs.map((crumb) => (
            <React.Fragment key={crumb.path}>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
              <button
                onClick={() => setCurrentPath(crumb.path)}
                className="hover:text-emerald-400 text-slate-200 px-1 py-0.5 rounded hover:bg-slate-800 whitespace-nowrap"
              >
                {crumb.name}
              </button>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Files Table / Explorer */}
      <div className="rounded-2xl border border-white/[0.07] bg-slate-900/40 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-mono text-[11px]">
                <th
                  onClick={() => {
                    if (sortBy === 'name') setSortAsc(!sortAsc);
                    else {
                      setSortBy('name');
                      setSortAsc(true);
                    }
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  NAME {sortBy === 'name' ? (sortAsc ? '↑' : '↓') : ''}
                </th>
                <th
                  onClick={() => {
                    if (sortBy === 'size') setSortAsc(!sortAsc);
                    else {
                      setSortBy('size');
                      setSortAsc(true);
                    }
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-white"
                >
                  SIZE {sortBy === 'size' ? (sortAsc ? '↑' : '↓') : ''}
                </th>
                <th
                  onClick={() => {
                    if (sortBy === 'modified') setSortAsc(!sortAsc);
                    else {
                      setSortBy('modified');
                      setSortAsc(true);
                    }
                  }}
                  className="py-3 px-4 cursor-pointer hover:text-white hidden md:table-cell"
                >
                  MODIFIED {sortBy === 'modified' ? (sortAsc ? '↑' : '↓') : ''}
                </th>
                <th className="py-3 px-4 text-right">ACTIONS</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60 font-mono">
              {displayedItems.length > 0 ? (
                displayedItems.map((item) => (
                  <tr
                    key={item.relativePath}
                    className="hover:bg-slate-800/40 transition-colors group"
                  >
                    {/* Name & Icon */}
                    <td className="py-2.5 px-4">
                      <div
                        onClick={() => handleItemClick(item)}
                        className="flex items-center gap-3 cursor-pointer select-none"
                      >
                        <div className="shrink-0">{getFileIcon(item)}</div>
                        <span className="font-sans font-medium text-slate-200 group-hover:text-emerald-300 transition-colors truncate max-w-xs sm:max-w-md">
                          {item.name}
                        </span>
                      </div>
                    </td>

                    {/* Size */}
                    <td className="py-2.5 px-4 text-slate-400 text-[11px]">
                      {item.sizeFormatted}
                    </td>

                    {/* Modified */}
                    <td className="py-2.5 px-4 text-slate-500 text-[11px] hidden md:table-cell">
                      {new Date(item.modified).toLocaleDateString()} {new Date(item.modified).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* Action buttons */}
                    <td className="py-2.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {item.isEditable && (
                          <button
                            onClick={() => setEditingFilePath(item.relativePath)}
                            className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800"
                            title="Edit file"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {!item.isDirectory && (
                          <a
                            href={`/api/files/download?path=${encodeURIComponent(item.relativePath)}`}
                            download={item.name}
                            className="p-1 rounded text-slate-400 hover:text-emerald-300 hover:bg-slate-800"
                            title="Download file"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          onClick={() => handleRename(item)}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                          title="Rename"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500 text-xs">
                    {searchQuery ? 'No matching files found.' : 'This folder is empty.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* File Editor Modal */}
      <FileEditorModal
        filePath={editingFilePath}
        isOpen={Boolean(editingFilePath)}
        onClose={() => setEditingFilePath(null)}
        onSaved={() => loadDirectory(currentPath)}
        onNotify={onNotify}
      />

      {/* File Preview Modal */}
      <FilePreviewModal
        file={previewFile}
        isOpen={Boolean(previewFile)}
        onClose={() => setPreviewFile(null)}
        onOpenEditor={(f) => setEditingFilePath(f.relativePath)}
      />
    </div>
  );
}
