'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, FileCode, Check } from 'lucide-react';
import dynamic from 'next/dynamic';

// Dynamically import Monaco to prevent SSR issues
const Editor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface FileEditorModalProps {
  filePath: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (path: string) => void;
  onNotify?: (msg: string) => void;
}

function getLanguageFromExtension(pathStr: string): string {
  const ext = pathStr.split('.').pop()?.toLowerCase() || '';
  switch (ext) {
    case 'js':
    case 'jsx':
    case 'mjs':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'json':
      return 'json';
    case 'html':
      return 'html';
    case 'css':
    case 'scss':
      return 'css';
    case 'md':
      return 'markdown';
    case 'yml':
    case 'yaml':
      return 'yaml';
    case 'sh':
      return 'shell';
    case 'py':
      return 'python';
    case 'dockerfile':
      return 'dockerfile';
    default:
      return 'plaintext';
  }
}

export function FileEditorModal({
  filePath,
  isOpen,
  onClose,
  onSaved,
  onNotify,
}: FileEditorModalProps) {
  const [content, setContent] = useState<string>('');
  const [initialContent, setInitialContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [fileMeta, setFileMeta] = useState<{ size: number; modified: string } | null>(null);

  const hasUnsavedChanges = content !== initialContent;

  const loadFile = useCallback(async () => {
    if (!filePath) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/files/read?path=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      if (data.success) {
        setContent(data.content);
        setInitialContent(data.content);
        setFileMeta({ size: data.size, modified: data.modified });
      } else {
        if (onNotify) onNotify(`Failed to read file: ${data.error}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (onNotify) onNotify(`Error loading file: ${msg}`);
    } finally {
      setIsLoading(false);
    }
  }, [filePath, onNotify]);

  useEffect(() => {
    if (isOpen && filePath) {
      loadFile();
    }
  }, [isOpen, filePath, loadFile]);

  const handleSave = useCallback(async () => {
    if (!filePath || isSaving) return;
    setIsSaving(true);
    try {
      const res = await fetch('/api/files/write', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: filePath, content }),
      });
      const data = await res.json();
      if (data.success) {
        setInitialContent(content);
        if (onNotify) onNotify(`Saved ${filePath} successfully.`);
        if (onSaved) onSaved(filePath);
      } else {
        if (onNotify) onNotify(`Failed to save: ${data.error}`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      if (onNotify) onNotify(`Error saving file: ${msg}`);
    } finally {
      setIsSaving(false);
    }
  }, [filePath, isSaving, content, onNotify, onSaved]);

  // Keyboard shortcut Ctrl+S / Cmd+S
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
      if (e.key === 'Escape') {
        if (hasUnsavedChanges) {
          if (confirm('You have unsaved changes. Are you sure you want to close?')) {
            onClose();
          }
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasUnsavedChanges, handleSave, onClose]);

  if (!isOpen || !filePath) return null;

  const fileName = filePath.split('/').pop() || filePath;
  const language = getLanguageFromExtension(fileName);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (hasUnsavedChanges) {
              if (confirm('You have unsaved changes. Discard?')) onClose();
            } else {
              onClose();
            }
          }}
          className="fixed inset-0 bg-black/85 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          className="relative w-full max-w-5xl h-[88vh] overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0c101a] shadow-2xl z-10 flex flex-col"
        >
          {/* Editor Header */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-cyan-400 shrink-0">
                <FileCode className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-tight truncate">
                    {fileName}
                  </h3>
                  {hasUnsavedChanges && (
                    <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-950/50 text-amber-400 border border-amber-800/50">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                      Unsaved
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400 font-mono truncate">
                  /srv/storage{filePath.startsWith('/') ? filePath : `/${filePath}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={handleSave}
                disabled={isSaving || !hasUnsavedChanges}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 shadow-sm ${
                  hasUnsavedChanges
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                    : 'bg-slate-800/80 text-slate-500 border border-slate-700/40 cursor-not-allowed opacity-60'
                }`}
                title="Save (Ctrl+S)"
              >
                {isSaving ? <Check className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                <span>{isSaving ? 'Saving...' : 'Save File'}</span>
              </button>

              <button
                onClick={() => {
                  if (hasUnsavedChanges) {
                    if (confirm('You have unsaved changes. Discard and close?')) onClose();
                  } else {
                    onClose();
                  }
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                aria-label="Close editor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Editor Body */}
          <div className="flex-1 min-h-0 relative bg-[#1e1e1e]">
            {isLoading ? (
              <div className="h-full flex items-center justify-center text-slate-400 font-mono text-xs">
                Loading file content...
              </div>
            ) : (
              <Editor
                height="100%"
                language={language}
                theme="vs-dark"
                value={content}
                onChange={(val) => setContent(val || '')}
                options={{
                  minimap: { enabled: true },
                  fontSize: 13,
                  lineNumbers: 'on',
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  automaticLayout: true,
                }}
              />
            )}
          </div>

          {/* Editor Footer Status Bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-t border-slate-800 text-[11px] font-mono text-slate-400 shrink-0">
            <div className="flex items-center gap-4">
              <span>Lang: <span className="text-slate-200">{language}</span></span>
              {fileMeta && (
                <>
                  <span>Size: <span className="text-slate-200">{(fileMeta.size / 1024).toFixed(1)} KB</span></span>
                  <span className="hidden sm:inline">
                    Modified: <span className="text-slate-200">{new Date(fileMeta.modified).toLocaleString()}</span>
                  </span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500">Press Ctrl+S to save</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
