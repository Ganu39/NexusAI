"use client";

import { SectionHeader } from "@/components/shared/section-header";
import { AnimatedContainer, StaggerContainer, staggerChild } from "@/components/shared/animated-container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Brain, Layers, Zap, CheckCircle2 } from "lucide-react";

const CAPABILITIES = [
  {
    icon: Brain,
    title: "Context-Aware Generation",
    description: "Powered by Google's Gemini, NexusAI doesn't just retrieve facts; it understands the nuance of your specialized domain.",
    bullets: ["Synthesizes information across multiple sources", "Maintains conversational memory", "Cites exact page numbers and paragraphs"]
  },
  {
    icon: Layers,
    title: "Multi-Modal Understanding",
    description: "Knowledge isn't just text. NexusAI processes and indexes rich documents to capture the full picture.",
    bullets: ["PDFs with complex layouts", "Images and scanned documents via OCR", "Tabular data extraction"]
  },
  {
    icon: Zap,
    title: "Adaptive Learning",
    description: "Your knowledge base evolves. The vector store automatically updates and optimizes as you add new information.",
    bullets: ["Real-time document ingestion", "Automatic semantic chunking", "Continuous index optimization"]
  }
];

export function AiCapabilities() {
  return (
    <section className="py-24 relative bg-card/20 border-y border-border/50">
      <div className="container mx-auto px-4">
        <SectionHeader 
          badge="Intelligence"
          title="AI-Powered Capabilities"
          description="State-of-the-art AI models combined with advanced vector search."
        />
        
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {CAPABILITIES.map((cap, i) => {
            const Icon = cap.icon;
            return (
              <AnimatedContainer key={i} variants={staggerChild}>
                <Card className="h-full glass relative overflow-hidden group border-border hover:border-accent/50 transition-colors">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl -mr-16 -mt-16 group-hover:bg-accent/10 transition-colors"></div>
                  <CardHeader>
                    <Icon className="w-8 h-8 text-accent mb-4" />
                    <CardTitle className="text-2xl">{cap.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {cap.description}
                    </p>
                    <ul className="space-y-3">
                      {cap.bullets.map((bullet, j) => (
                        <li key={j} className="flex items-start gap-2">
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                          <span className="text-sm text-foreground/80">{bullet}</span>
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
