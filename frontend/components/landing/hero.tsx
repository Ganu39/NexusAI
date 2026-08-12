"use client";

import { ArrowRight, GitBranch, Upload, MessageSquare } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AnimatedContainer, StaggerContainer, staggerChild } from "@/components/shared/animated-container";
import { GradientBlob } from "@/components/shared/gradient-blob";

export function Hero() {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      <GradientBlob color="primary" size="lg" className="-top-24 -left-24 opacity-50" />
      <GradientBlob color="accent" size="lg" className="top-32 -right-24 opacity-50 animation-delay-2000" />

      <div className="container mx-auto px-4 relative z-10 text-center">
        <StaggerContainer className="max-w-4xl mx-auto flex flex-col items-center">
          <AnimatedContainer variants={staggerChild}>
            <Badge variant="outline" className="mb-6 px-4 py-1.5 text-sm bg-background/50 backdrop-blur-sm border-primary/20 text-primary">
              <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
              NexusAI Production RAG Engine Live
            </Badge>
          </AnimatedContainer>

          <AnimatedContainer variants={staggerChild}>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[1.1]">
              Your Knowledge, <br className="hidden md:block" />
              <span className="text-gradient">Supercharged by AI</span>
            </h1>
          </AnimatedContainer>

          <AnimatedContainer variants={staggerChild}>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Enterprise-grade AI Knowledge Workspace powered by Retrieval-Augmented Generation. Upload documents, generate vector embeddings, and query grounded answers with Gemini.
            </p>
          </AnimatedContainer>

          <AnimatedContainer variants={staggerChild} className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <Button asChild size="lg" className="gap-2 text-base h-12 px-8 w-full sm:w-auto group bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/25">
              <Link href="/dashboard">
                Open Workspace
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline" className="gap-2 text-base h-12 px-6 w-full sm:w-auto border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200">
              <Link href="/documents">
                <Upload className="w-4 h-4 text-emerald-400" />
                Upload Document
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline" className="gap-2 text-base h-12 px-6 w-full sm:w-auto border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-200">
              <Link href="/chat">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                Start RAG Chat
              </Link>
            </Button>

            <Button asChild size="lg" variant="ghost" className="gap-2 text-base h-12 px-4 w-full sm:w-auto text-zinc-400 hover:text-white">
              <Link href="https://github.com/Ganu39/NexusAI" target="_blank" rel="noreferrer">
                <GitBranch className="w-4 h-4" />
                View on GitHub ↗
              </Link>
            </Button>
          </AnimatedContainer>
        </StaggerContainer>
      </div>
    </section>
  );
}
