"use client";

import { TRUSTED_TECH } from "@/lib/constants";
import { AnimatedContainer } from "@/components/shared/animated-container";

export function TrustedTech() {
  return (
    <section className="py-12 border-y border-[#1E293B] bg-[#080B11]">
      <div className="container mx-auto px-4">
        <AnimatedContainer animation="fade">
          <p className="text-center text-xs font-bold uppercase tracking-wider text-zinc-500 mb-8">
            POWERED BY ENTERPRISE-GRADE AI & VECTOR TECHNOLOGIES
          </p>
          
          {/* Marquee effect wrapper */}
          <div className="relative flex overflow-hidden group">
            <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-[#080B11] to-transparent z-10" />
            <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-[#080B11] to-transparent z-10" />
            
            <div className="flex space-x-12 animate-[marquee_30s_linear_infinite] group-hover:[animation-play-state:paused]">
              {[...TRUSTED_TECH, ...TRUSTED_TECH].map((tech, i) => (
                <div 
                  key={`${tech}-${i}`}
                  className="flex items-center justify-center whitespace-nowrap text-lg font-bold text-zinc-500/50 hover:text-zinc-300 transition-colors duration-300 font-mono"
                >
                  {tech}
                </div>
              ))}
            </div>
          </div>
        </AnimatedContainer>
      </div>
    </section>
  );
}
