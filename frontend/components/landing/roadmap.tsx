"use client";

import { ROADMAP_PHASES } from "@/lib/constants";
import { SectionHeader } from "@/components/shared/section-header";
import { AnimatedContainer, StaggerContainer, staggerChild } from "@/components/shared/animated-container";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, Sparkles, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Roadmap() {
  return (
    <section id="roadmap" className="py-24 relative bg-[#080B11] border-y border-[#1E293B]">
      <div className="container mx-auto px-4">
        <SectionHeader 
          badge="Milestones"
          title="Development Roadmap"
          description="NexusAI architectural progress and evolution toward enterprise-grade RAG."
        />
        
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {ROADMAP_PHASES.map((phase, i) => {
            const isCompleted = phase.status === "completed";
            const isCurrent = phase.status === "current";
            const isPlanned = phase.status === "planned";

            return (
              <AnimatedContainer key={i} variants={staggerChild} className="flex">
                <div className={`relative flex flex-col justify-between w-full rounded-2xl transition-all duration-300 ${
                  isCurrent
                    ? 'border-2 border-indigo-500 bg-[#0E131F] shadow-2xl shadow-indigo-600/15 glow-primary scale-[1.02] z-10'
                    : isCompleted
                    ? 'border border-[#1E293B] bg-[#0E131F]'
                    : 'border border-[#1E293B]/60 bg-[#0E131F]/50 opacity-75'
                }`}>
                  {isCurrent && (
                    <div className="absolute -top-3 left-6 rounded-full bg-indigo-600 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-md shadow-indigo-600/30">
                      Active Development
                    </div>
                  )}

                  <div className="p-6 pb-4">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        {phase.phase}
                      </span>
                      {isCompleted && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          COMPLETED
                        </span>
                      )}
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[11px] font-bold text-indigo-300 border border-indigo-500/30">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                          IN PROGRESS
                        </span>
                      )}
                      {isPlanned && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-800/40 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-400 border border-[#1E293B]">
                          <Clock className="w-3.5 h-3.5" />
                          PLANNED
                        </span>
                      )}
                    </div>

                    <h3 className={`text-lg font-bold leading-tight ${isCurrent ? 'text-white' : 'text-zinc-200'}`}>
                      {phase.title}
                    </h3>
                  </div>

                  <div className="p-6 pt-0 flex-1">
                    <ul className="space-y-2.5 mt-2">
                      {phase.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-2.5 text-xs">
                          {isCompleted ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          ) : isCurrent ? (
                            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                          ) : (
                            <Circle className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" />
                          )}
                          <span className={isCurrent ? 'text-zinc-200 font-medium' : isCompleted ? 'text-zinc-300' : 'text-zinc-500'}>
                            {item}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AnimatedContainer>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
