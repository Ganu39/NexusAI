"use client";

import { ROADMAP_PHASES } from "@/lib/constants";
import { SectionHeader } from "@/components/shared/section-header";
import { AnimatedContainer, StaggerContainer, staggerChild } from "@/components/shared/animated-container";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, Sparkles, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Roadmap() {
  return (
    <section id="roadmap" className="py-24 relative bg-card/20 border-y border-border/50">
      <div className="container mx-auto px-4">
        <SectionHeader 
          badge="Journey"
          title="Development Roadmap"
          description="NexusAI project milestones and ongoing evolution toward Enterprise."
        />
        
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {ROADMAP_PHASES.map((phase, i) => {
            const isCompleted = phase.status === "completed";
            const isCurrent = phase.status === "current";
            const isPlanned = phase.status === "planned";

            return (
              <AnimatedContainer key={i} variants={staggerChild} className="flex">
                <Card className={`relative flex flex-col justify-between w-full glass transition-all duration-300 ${
                  isCurrent
                    ? 'border-indigo-500 bg-indigo-950/20 shadow-2xl shadow-indigo-500/10 glow-primary scale-[1.02] z-10'
                    : isCompleted
                    ? 'border-emerald-500/30 bg-zinc-900/30'
                    : 'border-zinc-800 bg-zinc-950/40 opacity-80'
                }`}>
                  <CardHeader className="p-6 pb-4">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                        {phase.phase}
                      </span>
                      {isCompleted && (
                        <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 gap-1.5 text-[11px] font-semibold px-2.5 py-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          COMPLETED
                        </Badge>
                      )}
                      {isCurrent && (
                        <Badge variant="default" className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 shadow-md shadow-indigo-600/30 animate-pulse">
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          IN PROGRESS
                        </Badge>
                      )}
                      {isPlanned && (
                        <Badge variant="outline" className="border-zinc-700 bg-zinc-800/40 text-zinc-400 gap-1.5 text-[11px] font-semibold px-2.5 py-0.5">
                          <Clock className="w-3.5 h-3.5" />
                          PLANNED
                        </Badge>
                      )}
                    </div>

                    <CardTitle className={`text-lg font-bold leading-tight ${isCurrent ? 'text-white' : 'text-zinc-200'}`}>
                      {phase.title}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="p-6 pt-0 flex-1">
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
                  </CardContent>
                </Card>
              </AnimatedContainer>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
