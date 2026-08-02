"use client";

import { PRICING_TIERS } from "@/lib/constants";
import { SectionHeader } from "@/components/shared/section-header";
import { AnimatedContainer, StaggerContainer, staggerChild } from "@/components/shared/animated-container";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Pricing() {
  return (
    <section id="pricing" className="py-24 relative">
      <div className="container mx-auto px-4">
        <SectionHeader 
          badge="Pricing"
          title="Simple, Transparent Pricing"
          description="Start for free, upgrade when you need enterprise power."
        />
        
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-center">
          {PRICING_TIERS.map((tier, i) => (
            <AnimatedContainer key={i} variants={staggerChild}>
              <Card className={`relative flex flex-col h-full glass transition-transform duration-300 ${tier.popular ? 'border-primary scale-105 shadow-2xl glow-primary z-10' : 'border-border/50'}`}>
                {tier.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <Badge variant="default" className="uppercase tracking-widest text-[10px]">Most Popular</Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-8 pt-8">
                  <CardTitle className="text-xl text-muted-foreground font-normal mb-2">{tier.name}</CardTitle>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-foreground">{tier.price}</span>
                    {tier.period && <span className="text-muted-foreground">{tier.period}</span>}
                  </div>
                  <CardDescription className="mt-4">{tier.description}</CardDescription>
                </CardHeader>
                
                <CardContent className="flex-1">
                  <ul className="space-y-4">
                    {tier.features.map((feature, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-primary shrink-0" />
                        <span className="text-sm text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant={tier.available ? "default" : "outline"}
                    disabled={!tier.available}
                  >
                    {tier.cta}
                  </Button>
                </CardFooter>
              </Card>
            </AnimatedContainer>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}
