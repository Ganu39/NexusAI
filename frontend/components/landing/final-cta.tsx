"use client";

import Link from "next/link";
import { AnimatedContainer } from "@/components/shared/animated-container";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard, FileText, MessageSquare } from "lucide-react";
import { GradientBlob } from "@/components/shared/gradient-blob";

export function FinalCTA() {
  return (
    <section className="py-32 relative overflow-hidden">
      <GradientBlob color="primary" size="lg" className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />

      <div className="container mx-auto px-4 relative z-10 text-center">
        <AnimatedContainer animation="slide-up" className="max-w-3xl mx-auto glass border border-border/50 rounded-3xl p-12 glow-primary space-y-6">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Ready to Transform Your <span className="text-gradient">Knowledge?</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Experience the enterprise-grade AI knowledge workspace. Upload your documents and start receiving grounded answers today.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button asChild size="lg" className="h-14 px-8 text-base font-semibold group bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 w-full sm:w-auto">
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Open Dashboard
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 w-full sm:w-auto">
              <Link href="/documents">
                <FileText className="mr-2 h-5 w-5 text-emerald-400" />
                Manage Documents
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-14 px-8 text-base border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200 w-full sm:w-auto">
              <Link href="/chat">
                <MessageSquare className="mr-2 h-5 w-5 text-purple-400" />
                Start RAG Chat
              </Link>
            </Button>
          </div>
        </AnimatedContainer>
      </div>
    </section>
  );
}
