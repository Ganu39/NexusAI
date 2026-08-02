"use client";

import { ROADMAP_PHASES } from "@/lib/constants";
import { SectionHeader } from "@/components/shared/section-header";
import { AnimatedContainer, StaggerContainer, staggerChild } from "@/components/shared/animated-container";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CircleDot, Circle } from "lucide-react";

export function Roadmap() {
  return (
    <section id="roadmap" className="py-24 relative bg-card/20 border-y border-border/50">
      <div className="container mx-auto px-4">
        <SectionHeader 
          badge="Journey"
          title="Development Roadmap"
          description="NexusAI is being built in phases. Follow our journey to Enterprise."
        />
        
        <StaggerContainer className="max-w-3xl mx-auto relative">
          {/* Vertical line */}
          <div className="absolute left-[27px] top-4 bottom-4 w-px bg-border md:left-1/2 md:-ml-px"></div>
          
          {ROADMAP_PHASES.map((phase, i) => {
            const isCurrent = phase.status === "current";
            return (
              <AnimatedContainer key={i} variants={staggerChild} className={`relative flex flex-col md:flex-row items-start md:items-center mb-10 last:mb-0 ${i % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                
                {/* Timeline dot */}
                <div className="absolute left-0 md:left-1/2 mt-5 md:mt-0 ml-[11px] md:-ml-4 z-10 bg-background rounded-full p-1">
                  {isCurrent ? (
                    <div className="relative">
                      <div className="absolute inset-0 bg-primary rounded-full animate-ping opacity-75"></div>
                      <CircleDot className="w-6 h-6 text-primary relative z-10 bg-background rounded-full" />
                    </div>
                  ) : (
                    <Circle className="w-6 h-6 text-muted-foreground bg-background rounded-full" />
                  )}
                </div>
                
                {/* Content */}
                <div className={`ml-14 md:ml-0 md:w-1/2 ${i % 2 === 0 ? 'md:pl-12' : 'md:pr-12 md:text-right'}`}>
                  <Card className={`glass ${isCurrent ? 'border-primary glow-primary' : 'border-border/50'}`}>
                    <CardHeader className="p-5">
                      <div className={`text-xs font-bold uppercase tracking-wider mb-1 ${isCurrent ? 'text-primary' : 'text-muted-foreground'}`}>
                        {phase.phase}
                      </div>
                      <CardTitle className="text-xl">{phase.title}</CardTitle>
                      <CardDescription>{phase.description}</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </AnimatedContainer>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
