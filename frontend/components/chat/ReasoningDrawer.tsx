'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Cpu, Database, CheckCircle2, Layers } from 'lucide-react';

interface ReasoningStep {
  title: string;
  detail: string;
  duration?: string;
  status: 'completed' | 'processing';
}

interface ReasoningDrawerProps {
  steps?: ReasoningStep[];
}

export function ReasoningDrawer({
  steps = [
    {
      title: 'Vector Database Querying',
      detail: 'Generated 1536-dimensional embedding using text-embedding-3-small. Searched Pinecone index with top_k=5.',
      duration: '140ms',
      status: 'completed',
    },
    {
      title: 'Document Reranking & Similarity Filter',
      detail: 'Applied cross-encoder reranker. Filtered out 2 chunks below 0.78 similarity threshold.',
      duration: '85ms',
      status: 'completed',
    },
    {
      title: 'Context Assembly & Prompt Augmentation',
      detail: 'Assembled 3 relevant chunks (total 840 tokens) into system context prompt.',
      duration: '12ms',
      status: 'completed',
    },
  ],
}: ReasoningDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="my-3 border border-violet-500/20 bg-slate-900/40 rounded-xl overflow-hidden backdrop-blur-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="reasoning-content"
        className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-mono text-violet-300 hover:bg-white/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
      >
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-semibold uppercase tracking-wider">Thought Process & Vector Retrieval</span>
          <span className="bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full text-[10px] border border-violet-500/30">
            {steps.length} Steps
          </span>
        </div>
        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isOpen && (
        <div id="reasoning-content" role="region" className="px-4 py-3 border-t border-white/5 space-y-3 text-xs">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold font-mono text-cyan-200">{step.title}</span>
                  {step.duration && <span className="text-[10px] font-mono text-slate-400">{step.duration}</span>}
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ReasoningDrawer;
