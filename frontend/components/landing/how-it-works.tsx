"use client";

import React from "react";
import { SectionHeader } from "@/components/shared/section-header";
import { motion } from "framer-motion";
import {
  Upload,
  FileText,
  Layers,
  Database,
  Cpu,
  Search,
  Bot,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

const PIPELINE_STAGES = [
  {
    step: "01",
    title: "Upload",
    tech: "Multi-Format",
    desc: "Ingest PDF, plain TXT, or DOCX documents under 10MB.",
    icon: Upload,
  },
  {
    step: "02",
    title: "Extract",
    tech: "Page Boundary",
    desc: "Extract structured text while preserving pagination & layout.",
    icon: FileText,
  },
  {
    step: "03",
    title: "Chunk",
    tech: "Recursive Split",
    desc: "Chunk semantic passages with configurable chunk size & overlap.",
    icon: Layers,
  },
  {
    step: "04",
    title: "Embed",
    tech: "Gemini 3072d",
    desc: "Generate dense 3072-dimensional vector representations.",
    icon: Database,
  },
  {
    step: "05",
    title: "Index",
    tech: "FAISS Store",
    desc: "Index normalized vectors in local FAISS IndexFlatIP store.",
    icon: Cpu,
  },
  {
    step: "06",
    title: "Retrieve",
    tech: "Cosine Top-K",
    desc: "Perform cosine similarity matching for the user query.",
    icon: Search,
  },
  {
    step: "07",
    title: "Generate",
    tech: "Gemini 2.5 Flash",
    desc: "Synthesize answers strictly grounded within retrieved context.",
    icon: Bot,
  },
  {
    step: "08",
    title: "Cite",
    tech: "Page & Score",
    desc: "Attach explicit page numbers, chunk IDs, and similarity scores.",
    icon: CheckCircle2,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 relative bg-[#080B11] border-y border-[#1E293B]">
      <div className="container mx-auto px-4">
        <SectionHeader 
          badge="8-Stage Pipeline"
          title="How NexusAI Works"
          description="A deterministic technical pipeline from raw document ingestion to verified, citation-backed AI answer generation."
        />
        
        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {PIPELINE_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <motion.div
                key={stage.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: idx * 0.08 }}
                className="group relative flex flex-col justify-between rounded-2xl border border-[#1E293B] bg-[#0E131F] p-5 shadow-sm hover:border-indigo-500/50 hover:bg-[#141B2D] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600/15 text-indigo-400 border border-indigo-500/25 group-hover:scale-105 transition-transform">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="font-mono text-xs font-bold text-zinc-500 group-hover:text-indigo-400 transition-colors">
                      {stage.step}
                    </span>
                  </div>

                  <h4 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                    <span>{stage.title}</span>
                    <span className="rounded bg-[#141B2D] border border-[#1E293B] px-1.5 py-0.5 text-[9px] font-mono text-indigo-300">
                      {stage.tech}
                    </span>
                  </h4>

                  <p className="text-xs text-zinc-400 leading-relaxed mt-2">
                    {stage.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#1E293B]/60 flex items-center justify-between text-[10px] font-mono text-zinc-500">
                  <span>Stage {idx + 1} of 8</span>
                  {idx < PIPELINE_STAGES.length - 1 ? (
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                  ) : (
                    <span className="text-emerald-400 font-semibold">Ready</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
