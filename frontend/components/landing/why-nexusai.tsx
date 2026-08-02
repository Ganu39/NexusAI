"use client";

import { SectionHeader } from "@/components/shared/section-header";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { Check, X } from "lucide-react";

export function WhyNexusAi() {
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-4">
        <SectionHeader 
          title="Why choose NexusAI?"
          description="See how a dedicated AI Knowledge Workspace compares to traditional tools."
        />
        
        <AnimatedContainer animation="fade" delay={0.2} className="max-w-4xl mx-auto overflow-x-auto">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-4 gap-4 pb-4 border-b border-border text-sm font-semibold text-muted-foreground uppercase tracking-wider">
              <div className="col-span-1">Capability</div>
              <div className="col-span-1 text-center">Traditional Search</div>
              <div className="col-span-1 text-center">Standard ChatGPT</div>
              <div className="col-span-1 text-center text-primary glow-primary-text">NexusAI</div>
            </div>
            
            {[
              { label: "Semantic Understanding", t: false, c: true, n: true },
              { label: "Grounding in Private Data", t: true, c: false, n: true },
              { label: "Automatic Citations", t: false, c: false, n: true },
              { label: "Privacy & Data Control", t: true, c: false, n: true },
              { label: "Multi-document Synthesis", t: false, c: false, n: true },
              { label: "Enterprise RBAC", t: true, c: false, n: true },
            ].map((row, i) => (
              <div key={i} className={`grid grid-cols-4 gap-4 py-4 border-b border-border/50 ${i % 2 === 0 ? 'bg-card/20' : ''} rounded-lg px-2 items-center`}>
                <div className="col-span-1 font-medium text-foreground">{row.label}</div>
                <div className="col-span-1 flex justify-center">
                  {row.t ? <Check className="w-5 h-5 text-muted-foreground" /> : <X className="w-5 h-5 text-muted-foreground/30" />}
                </div>
                <div className="col-span-1 flex justify-center">
                  {row.c ? <Check className="w-5 h-5 text-muted-foreground" /> : <X className="w-5 h-5 text-muted-foreground/30" />}
                </div>
                <div className="col-span-1 flex justify-center bg-primary/10 py-2 rounded-md border border-primary/20">
                  {row.n ? <Check className="w-5 h-5 text-primary" /> : <X className="w-5 h-5 text-muted-foreground/30" />}
                </div>
              </div>
            ))}
          </div>
        </AnimatedContainer>
      </div>
    </section>
  );
}
