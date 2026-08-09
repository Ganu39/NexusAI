"use client";

import { FAQ_ITEMS } from "@/lib/constants";
import { SectionHeader } from "@/components/shared/section-header";
import { AnimatedContainer, StaggerContainer, staggerChild } from "@/components/shared/animated-container";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 relative bg-card/20 border-y border-border/50">
      <div className="container mx-auto px-4">
        <SectionHeader 
          title="Frequently Asked Questions"
          description="Everything you need to know about NexusAI."
        />
        
        <StaggerContainer className="max-w-3xl mx-auto space-y-4">
          {FAQ_ITEMS.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <AnimatedContainer key={i} variants={staggerChild}>
                <div 
                  className="glass border border-border rounded-lg overflow-hidden transition-all duration-200"
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    aria-expanded={isOpen}
                    className="w-full text-left px-6 py-4 flex items-center justify-between focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span className="font-medium text-foreground">{item.question}</span>
                    <ChevronDown className={cn(
                      "w-5 h-5 text-muted-foreground transition-transform duration-200",
                      isOpen && "transform rotate-180 text-primary"
                    )} />
                  </button>
                  
                  <div 
                    className={cn(
                      "px-6 text-muted-foreground overflow-hidden transition-all duration-300 ease-in-out",
                      isOpen ? "max-h-96 pb-4 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <p className="leading-relaxed">{item.answer}</p>
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
