"use client";

import { HOW_IT_WORKS } from "@/lib/constants";
import { SectionHeader } from "@/components/shared/section-header";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { ArrowRight } from "lucide-react";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative">
      <div className="container mx-auto px-4">
        <SectionHeader 
          badge="Workflow"
          title="How NexusAI Works"
          description="A powerful pipeline from document ingestion to AI generation."
        />
        
        <div className="mt-16 flex flex-col md:flex-row justify-center items-center gap-4 md:gap-2">
          {HOW_IT_WORKS.map((step, i) => (
            <AnimatedContainer 
              key={i} 
              animation="slide-up" 
              delay={i * 0.1}
              className="flex flex-col md:flex-row items-center relative z-10 w-full md:w-auto"
            >
              <div className="flex flex-col items-center text-center w-40 glass p-4 rounded-xl border border-border hover:border-primary/50 transition-colors">
                <div className="w-10 h-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center mb-3">
                  {step.step}
                </div>
                <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                <p className="text-xs text-muted-foreground">{step.description}</p>
              </div>
              
              {i < HOW_IT_WORKS.length - 1 && (
                <div className="py-4 md:py-0 md:px-2 flex justify-center text-border">
                  <ArrowRight className="w-5 h-5 rotate-90 md:rotate-0" />
                </div>
              )}
            </AnimatedContainer>
          ))}
        </div>
      </div>
    </section>
  );
}
