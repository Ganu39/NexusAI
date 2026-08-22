'use client';

import React from 'react';
import { X, FileText, Upload, CheckCircle, Database } from 'lucide-react';

interface MobileKnowledgeSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileKnowledgeSheet({ isOpen, onClose }: MobileKnowledgeSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-sm md:hidden" aria-modal="true" role="dialog">
      <div className="w-full bg-slate-900 border-t border-cyan-500/30 rounded-t-3xl p-6 space-y-6 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <Database className="w-6 h-6 text-cyan-400" />
            <div>
              <h2 className="text-lg font-bold text-white font-mono">Knowledge Base</h2>
              <p className="text-xs text-slate-400">3 Documents Vectorized</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close knowledge base sheet"
            className="min-w-[48px] min-h-[48px] flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-slate-300 active:scale-95 transition-transform"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Upload dropzone button */}
        <button
          onClick={() => alert('Upload triggered')}
          className="w-full min-h-[56px] border-2 border-dashed border-cyan-500/40 rounded-2xl flex items-center justify-center gap-3 bg-cyan-500/10 text-cyan-300 font-medium text-sm hover:bg-cyan-500/20 active:scale-[0.98] transition-all"
        >
          <Upload className="w-5 h-5" />
          <span>Upload Document (PDF / TXT)</span>
        </button>

        {/* Documents list */}
        <div className="space-y-3">
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-violet-400" />
              <div>
                <p className="text-sm font-medium text-slate-200">architecture_spec.pdf</p>
                <p className="text-xs font-mono text-slate-400">1.2 MB • 42 chunks</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
              <CheckCircle className="w-3 h-3" /> Indexed
            </span>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-violet-400" />
              <div>
                <p className="text-sm font-medium text-slate-200">api_endpoints.txt</p>
                <p className="text-xs font-mono text-slate-400">340 KB • 12 chunks</p>
              </div>
            </div>
            <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-full border border-cyan-500/20">
              <CheckCircle className="w-3 h-3" /> Indexed
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileKnowledgeSheet;
