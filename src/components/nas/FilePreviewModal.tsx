'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, Image as ImageIcon, ExternalLink, Calendar, HardDrive } from 'lucide-react';
import { FileItem } from '@/lib/server/storage';

interface FilePreviewModalProps {
  file: FileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenEditor?: (file: FileItem) => void;
}

export function FilePreviewModal({
  file,
  isOpen,
  onClose,
  onOpenEditor,
}: FilePreviewModalProps) {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    if (isOpen && file && !file.isImage && file.isEditable) {
      fetch(`/api/files/read?path=${encodeURIComponent(file.relativePath)}`)
        .then((r) => r.json())
        .then((d) => {
          if (!isCancelled) {
            if (d.success) setTextContent(d.content);
            else setTextContent('Could not read file content.');
          }
        })
        .catch(() => {
          if (!isCancelled) setTextContent('Error loading preview.');
        })
        .finally(() => {
          if (!isCancelled) setIsLoading(false);
        });
    } else {
      setTextContent(null);
    }
    return () => {
      isCancelled = true;
    };
  }, [isOpen, file]);

  if (!isOpen || !file) return null;

  const downloadUrl = `/api/files/download?path=${encodeURIComponent(file.relativePath)}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-3xl overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0c101a] p-6 shadow-2xl z-10 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-emerald-400 shrink-0">
                {file.isImage ? <ImageIcon className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white tracking-tight truncate">
                  {file.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono truncate">
                  /srv/storage/{file.relativePath}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={downloadUrl}
                download={file.name}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Download file"
              >
                <Download className="w-4 h-4" />
              </a>

              {file.isEditable && onOpenEditor && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenEditor(file);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-semibold transition-all flex items-center gap-1.5"
                >
                  <span>Edit File</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Preview Body */}
          <div className="mt-4 flex-1 overflow-y-auto min-h-[260px] flex items-center justify-center rounded-xl bg-slate-950/60 border border-slate-800/80 p-4">
            {file.isImage ? (
              <div className="max-h-[500px] flex items-center justify-center overflow-hidden">
                {/* Image element using downloadUrl as source */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={downloadUrl}
                  alt={file.name}
                  className="max-h-[480px] max-w-full object-contain rounded-lg shadow-lg"
                />
              </div>
            ) : file.isEditable ? (
              isLoading ? (
                <div className="text-xs text-slate-400 font-mono">Loading preview...</div>
              ) : (
                <pre className="w-full font-mono text-xs text-slate-300 whitespace-pre-wrap leading-relaxed self-start">
                  {textContent}
                </pre>
              )
            ) : (
              <div className="text-center space-y-2">
                <FileText className="w-10 h-10 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-300 font-medium">Binary / Unsupported File Type</p>
                <p className="text-[11px] text-slate-500">Preview not available for {file.extension || 'this format'}.</p>
                <a
                  href={downloadUrl}
                  download={file.name}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium hover:bg-slate-700 transition-colors mt-2"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download File ({file.sizeFormatted})</span>
                </a>
              </div>
            )}
          </div>

          {/* Metadata Footer */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 font-mono gap-2 shrink-0">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-slate-500" />
                {file.sizeFormatted}
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                {new Date(file.modified).toLocaleString()}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">Samba: \\192.168.31.38\storage</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
