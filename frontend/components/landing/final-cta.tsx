"use client";

import Link from "next/link";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard, FileText, MessageSquare } from "lucide-react";
import { GradientBlob } from "@/components/shared/gradient-blob";

export function FinalCTA() {
  return (
    <section className="py-28 relative overflow-hidden bg-[#080B11]">
      <div className="container mx-auto px-4 relative z-10 text-center">
        <AnimatedContainer animation="slide-up" className="max-w-3xl mx-auto border border-[#1E293B] bg-[#0E131F] rounded-3xl p-10 md:p-14 shadow-2xl space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
            Ready to Turn Your Documents into <span className="text-gradient-accent">Grounded Intelligence?</span>
          </h2>
          <p className="text-sm md:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            Experience the enterprise-grade AI knowledge workspace. Upload your documents and start receiving verified answers backed by source citations.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
            <Button asChild size="lg" className="h-12 px-7 text-sm font-semibold group bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 w-full sm:w-auto">
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Open Dashboard
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 text-sm font-semibold border-[#1E293B] bg-[#141B2D] hover:bg-[#1E293B] text-zinc-200 hover:text-white w-full sm:w-auto">
              <Link href="/documents">
                <FileText className="mr-2 h-4 w-4 text-emerald-400" />
                Manage Documents
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-6 text-sm font-semibold border-[#1E293B] bg-[#141B2D] hover:bg-[#1E293B] text-zinc-200 hover:text-white w-full sm:w-auto">
              <Link href="/chat">
                <MessageSquare className="mr-2 h-4 w-4 text-purple-400" />
                Start RAG Chat
              </Link>
            </Button>
          </div>
        </AnimatedContainer>
      </div>
    </section>
  );
}
