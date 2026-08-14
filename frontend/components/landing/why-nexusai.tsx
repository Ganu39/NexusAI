"use client";

import { SectionHeader } from "@/components/shared/section-header";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { Check, X } from "lucide-react";

export function WhyNexusAi() {
  return (
    <section className="py-24 relative bg-[#080B11] border-y border-[#1E293B]">
      <div className="container mx-auto px-4">
        <SectionHeader 
          badge="Comparison"
          title="Why Choose NexusAI?"
          description="See how a dedicated enterprise AI Knowledge Workspace compares to generic search and chat tools."
        />
        
        <AnimatedContainer animation="fade" delay={0.2} className="max-w-4xl mx-auto overflow-x-auto">
          <div className="min-w-[700px] rounded-2xl border border-[#1E293B] bg-[#0E131F] p-6 shadow-sm">
            <div className="grid grid-cols-4 gap-4 pb-4 border-b border-[#1E293B] text-xs font-bold text-zinc-400 uppercase tracking-wider">
              <div className="col-span-1">Capability</div>
              <div className="col-span-1 text-center">Keyword Search</div>
              <div className="col-span-1 text-center">Standard Chatbots</div>
              <div className="col-span-1 text-center text-indigo-400">NexusAI RAG</div>
            </div>
            
            {[
              { label: "Semantic Vector Search (FAISS)", t: false, c: false, n: true },
              { label: "Grounding in Private Documents", t: true, c: false, n: true },
              { label: "Explicit Page & Score Citations", t: false, c: false, n: true },
              { label: "Multi-Format Parsing (PDF/TXT/DOCX)", t: true, c: false, n: true },
              { label: "Strict Prompt Injection Defenses", t: false, c: false, n: true },
              { label: "Isolated Backend Persistence", t: true, c: false, n: true },
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-4 gap-4 py-3.5 border-b border-[#1E293B]/60 ${i % 2 === 0 ? 'bg-[#141B2D]/40' : ''} rounded-xl px-3 items-center text-xs`}>
                <div className="col-span-1 font-medium text-white">{row.label}</div>
                <div className="col-span-1 flex justify-center">
                  {row.t ? <Check className="w-4 h-4 text-zinc-400" /> : <X className="w-4 h-4 text-zinc-600" />}
                </div>
                <div className="col-span-1 flex justify-center">
                  {row.c ? <Check className="w-4 h-4 text-zinc-400" /> : <X className="w-4 h-4 text-zinc-600" />}
                </div>
                <div className="col-span-1 flex justify-center bg-indigo-600/15 py-1.5 rounded-lg border border-indigo-500/30">
                  {row.n ? <Check className="w-4 h-4 text-indigo-400 font-bold" /> : <X className="w-4 h-4 text-zinc-600" />}
                </div>
              </div>
            ))}
          </div>
        </AnimatedContainer>
      </div>
    </section>
  );
}
