"use client";

import { FEATURES } from "@/lib/constants";
import { SectionHeader } from "@/components/shared/section-header";
import { AnimatedContainer, StaggerContainer, staggerChild } from "@/components/shared/animated-container";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export function Features() {
  return (
    <section id="features" className="py-24 relative bg-[#080B11]">
      <div className="container mx-auto px-4">
        <SectionHeader 
          badge="Features"
          title="Engineered for Document Intelligence"
          description="A complete suite of AI-powered tools designed to transform how you extract and interact with your knowledge base."
        />
        
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <AnimatedContainer key={i} variants={staggerChild}>
                <div className="h-full rounded-2xl border border-[#1E293B] bg-[#0E131F] p-6 hover:border-indigo-500/40 hover:bg-[#141B2D] transition-all duration-300 group flex flex-col justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6 text-indigo-400 group-hover:text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">{feature.description}</p>
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
