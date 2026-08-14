"use client";

import Link from "next/link";
import { FileText, MessageSquare, LayoutDashboard, ArrowRight, Upload, Cpu, Sparkles } from "lucide-react";
import { AnimatedContainer, StaggerContainer, staggerChild } from "@/components/shared/animated-container";

export function ProductActions() {
  return (
    <section className="py-20 relative border-y border-[#1E293B] bg-[#080B11]">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Interactive Workflows</span>
          </div>
          <h2 className="text-3xl font-bold text-white tracking-tight">
            Explore NexusAI Workflows
          </h2>
          <p className="text-sm text-zinc-400">
            Direct access to core document intelligence workflows powered by Gemini 2.5 Flash and local FAISS vector store.
          </p>
        </div>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Card 1: Documents */}
          <AnimatedContainer variants={staggerChild}>
            <div className="group flex flex-col justify-between h-full rounded-2xl border border-[#1E293B] bg-[#0E131F] p-6 hover:border-emerald-500/40 hover:bg-[#141B2D] transition-all duration-300">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <FileText className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Document Repository
                  </h3>
                  <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                    Upload PDF, TXT, and DOCX files. Extract structured text and organize your document repository.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/documents"
                  className="inline-flex items-center justify-between w-full rounded-xl bg-emerald-600/10 px-4 py-2.5 text-xs font-semibold text-emerald-300 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white transition-all group/btn"
                >
                  <span>Open Documents</span>
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </AnimatedContainer>

          {/* Card 2: RAG Chat */}
          <AnimatedContainer variants={staggerChild}>
            <div className="group flex flex-col justify-between h-full rounded-2xl border border-[#1E293B] bg-[#0E131F] p-6 hover:border-purple-500/40 hover:bg-[#141B2D] transition-all duration-300">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-purple-300 transition-colors">
                    Grounded RAG Q&A Chat
                  </h3>
                  <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                    Ask questions grounded in vector chunks. Receive verified answers with precise source citations.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/chat"
                  className="inline-flex items-center justify-between w-full rounded-xl bg-purple-600/10 px-4 py-2.5 text-xs font-semibold text-purple-300 border border-purple-500/20 hover:bg-purple-600 hover:text-white transition-all group/btn"
                >
                  <span>Start RAG Chat</span>
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </AnimatedContainer>

          {/* Card 3: Dashboard */}
          <AnimatedContainer variants={staggerChild}>
            <div className="group flex flex-col justify-between h-full rounded-2xl border border-[#1E293B] bg-[#0E131F] p-6 hover:border-indigo-500/40 hover:bg-[#141B2D] transition-all duration-300">
              <div className="space-y-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <LayoutDashboard className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                    Knowledge Workspace
                  </h3>
                  <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                    Overview metrics, storage usage, recent document activity, and system processing health.
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-between w-full rounded-xl bg-indigo-600/10 px-4 py-2.5 text-xs font-semibold text-indigo-300 border border-indigo-500/20 hover:bg-indigo-600 hover:text-white transition-all group/btn"
                >
                  <span>Open Dashboard</span>
                  <ArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </AnimatedContainer>
        </StaggerContainer>
      </div>
    </section>
  );
}
