"use client";

import { AnimatedContainer } from "@/components/shared/animated-container";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { GradientBlob } from "@/components/shared/gradient-blob";

export function FinalCTA() {
  return (
    <section className="py-32 relative overflow-hidden">
      <GradientBlob color="primary" size="lg" className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />
      
      <div className="container mx-auto px-4 relative z-10 text-center">
        <AnimatedContainer animation="slide-up" className="max-w-3xl mx-auto glass border border-border/50 rounded-3xl p-12 glow-primary">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            Ready to Transform Your <span className="text-gradient">Knowledge?</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the waitlist today to be the first to experience the enterprise-grade AI knowledge workspace.
          </p>
          <Button size="lg" className="h-14 px-8 text-lg group">
            Get Started Now
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </AnimatedContainer>
      </div>
    </section>
  );
}
