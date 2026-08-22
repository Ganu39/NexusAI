"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  Send,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Loader2,
  Sliders,
  ChevronDown,
  ChevronUp,
  CornerDownRight,
  Trash2,
  Eye,
  Database,
  Paperclip,
  Cpu,
  Terminal,
  Activity,
  Zap,
} from "lucide-react";
import { AskResponse, AskSource } from "@/types";
import { apiClient } from "@/lib/api";
import GlassCard from "@/components/ui/GlassCard";
import ReasoningDrawer from "@/components/chat/ReasoningDrawer";
import MobileKnowledgeSheet from "@/components/chat/MobileKnowledgeSheet";

// Dynamic 3D WebGL Canvases
const GlowingAIOrbCanvas = dynamic(() => import("@/components/3d/GlowingAIOrb"), {
  ssr: false,
  loading: () => (
    <div className="w-16 h-16 rounded-full bg-cyan-500/20 blur-md animate-pulse flex items-center justify-center border border-cyan-400/40">
      <Bot className="w-8 h-8 text-cyan-400" />
    </div>
  ),
});

const VectorParticleCloudCanvas = dynamic(() => import("@/components/3d/VectorParticleCloud"), {
  ssr: false,
});

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  response?: AskResponse;
  timestamp: string;
}

const RAG_RETRIEVAL_STEPS = [
  { id: "query", label: "[01_QUERY_INGEST]" },
  { id: "search", label: "[02_VECTOR_SEARCH]" },
  { id: "chunks", label: "[03_TOP_K_CHUNKS]" },
  { id: "context", label: "[04_ISOLATE_CONTEXT]" },
  { id: "gemini", label: "[05_LLM_SYNTHESIS]" },
  { id: "answer", label: "[06_CITATIONS_READY]" },
];

const SUGGESTED_QUESTIONS = [
  "What are the main requirements?",
  "Summarize the key findings",
  "What does this document explain?",
  "Where is this information mentioned?",
];

const SESSION_STORAGE_KEY = "nexusai_rag_chat_messages";

export function RAGChat() {
  const [question, setQuestion] = useState("");
  const [topK, setTopK] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});
  const [activePipelineStage, setActivePipelineStage] = useState<number>(-1);
  const [activeSourceModal, setActiveSourceModal] = useState<AskSource | null>(null);
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  // Restore session chat messages from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
          const expanded: Record<string, boolean> = {};
          parsed.forEach((m) => {
            if (m.sender === "assistant") expanded[m.id] = true;
          });
          setExpandedSources(expanded);
        }
      }
    } catch {
      // Ignore parse errors
    }
  }, []);

  // Save session chat messages to sessionStorage
  useEffect(() => {
    try {
      if (messages.length > 0) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(messages));
      } else {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
    } catch {
      // Ignore storage errors
    }
  }, [messages]);

  const toggleSources = (msgId: string) => {
    setExpandedSources((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const handleClearChat = () => {
    if (messages.length === 0) return;
    if (window.confirm("Purge active neural conversation logs?")) {
      setMessages([]);
      setExpandedSources({});
      setError(null);
      try {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
  };

  const handleSend = async (customQuestion?: string) => {
    const queryText = (customQuestion || question).trim();
    if (!queryText || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);
    setError(null);
    setActivePipelineStage(0);

    const stageTimer1 = setTimeout(() => setActivePipelineStage(1), 300);
    const stageTimer2 = setTimeout(() => setActivePipelineStage(2), 650);
    const stageTimer3 = setTimeout(() => setActivePipelineStage(3), 1000);
    const stageTimer4 = setTimeout(() => setActivePipelineStage(4), 1400);

    const assistantMsgId = `assistant-${Date.now()}`;
    const timestampStr = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    try {
      let isFirstMetadata = true;
      await apiClient.askQuestionStream(
        queryText,
        topK,
        (sources, grounded, retrieved_chunks) => {
          if (isFirstMetadata) {
            isFirstMetadata = false;
            setActivePipelineStage(5);
            const initialMsg: ChatMessage = {
              id: assistantMsgId,
              sender: "assistant",
              text: "",
              response: {
                question: queryText,
                answer: "",
                sources,
                retrieved_chunks,
                grounded,
              },
              timestamp: timestampStr,
            };
            setMessages((prev) => [...prev, initialMsg]);
            setExpandedSources((prev) => ({ ...prev, [assistantMsgId]: true }));
          }
        },
        (token) => {
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id === assistantMsgId) {
                const newText = msg.text + token;
                return {
                  ...msg,
                  text: newText,
                  response: msg.response
                    ? { ...msg.response, answer: newText }
                    : undefined,
                };
              }
              return msg;
            })
          );
        }
      );
    } catch {
      try {
        const askRes = await apiClient.askQuestion(queryText, topK);
        setActivePipelineStage(5);
        const assistantMsg: ChatMessage = {
          id: assistantMsgId,
          sender: "assistant",
          text: askRes.answer,
          response: askRes,
          timestamp: timestampStr,
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setExpandedSources((prev) => ({ ...prev, [assistantMsgId]: true }));
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "TERMINAL_ERROR: Connection reset by vector server.";
        setError(msg);
      }
    } finally {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      clearTimeout(stageTimer3);
      clearTimeout(stageTimer4);
      setLoading(false);
      setTimeout(() => setActivePipelineStage(-1), 2500);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col rounded-2xl border-2 border-cyan-500/40 bg-[#030712] overflow-hidden shadow-[0_0_40px_rgba(0,243,255,0.15)] relative font-mono">
      {/* 3D Holographic Vector Particle Background */}
      <VectorParticleCloudCanvas />

      {/* Cyber Scanline Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] z-20 opacity-30" />

      {/* 1. CYBERPUNK COMMAND HEADER */}
      <div className="flex flex-wrap items-center justify-between border-b border-cyan-500/30 bg-[#060d1a]/90 backdrop-blur-xl px-6 py-3.5 gap-4 z-30">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 relative flex items-center justify-center overflow-visible shrink-0 border border-cyan-400/40 rounded-xl bg-cyan-950/40 shadow-[0_0_15px_rgba(0,243,255,0.3)]">
            <GlowingAIOrbCanvas isProcessing={loading} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h3 className="font-extrabold text-cyan-300 text-base sm:text-lg tracking-wider uppercase drop-shadow-[0_0_8px_rgba(0,243,255,0.5)]">
                NEURAL_COMMAND_CENTER
              </h3>
              <span className="flex items-center gap-1.5 rounded-none bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-400/50 shadow-[0_0_10px_rgba(0,243,255,0.2)]">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
                SYSTEM_ONLINE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight flex items-center gap-2 mt-0.5">
              <span>LATENCY: <strong className="text-cyan-400">14ms</strong></span>
              <span>•</span>
              <span>FAISS_INDEX: <strong className="text-purple-400">3072d</strong></span>
              <span>•</span>
              <span>STATUS: <strong className="text-emerald-400">GROUNDED</strong></span>
            </p>
          </div>
        </div>

        {/* Telemetry Selectors & Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSheetOpen(true)}
            className="md:hidden flex items-center gap-2 min-h-[44px] px-3.5 rounded-xl border border-cyan-400 bg-cyan-500/20 text-cyan-300 text-xs font-bold hover:bg-cyan-500/40 active:scale-95 transition-all shadow-[0_0_10px_rgba(0,243,255,0.3)]"
          >
            <Database className="w-4 h-4 text-cyan-400" />
            <span>KNOWLEDGE_BASE</span>
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-slate-950 px-3.5 py-2 text-xs text-cyan-300 shadow-[0_0_10px_rgba(0,243,255,0.1)]">
            <Sliders className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-[11px] text-slate-400 font-mono">TOP_K:</span>
            <select
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="bg-transparent font-bold text-cyan-300 focus:outline-none cursor-pointer text-xs"
            >
              {[1, 2, 3, 4, 5, 7, 10].map((k) => (
                <option key={k} value={k} className="bg-black text-cyan-300">
                  k = {k}
                </option>
              ))}
            </select>
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="flex items-center gap-1.5 min-h-[44px] rounded-xl border border-rose-500/50 bg-rose-950/40 px-3.5 py-2 text-xs font-bold text-rose-300 hover:bg-rose-900/60 active:scale-95 transition-all shadow-[0_0_10px_rgba(255,0,85,0.3)]"
              title="Purge active neural logs"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-400" />
              <span>PURGE_LOGS</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. ARCHITECTURAL RETRIEVAL PIPELINE TERMINAL LOG STEPPER */}
      <div className="border-b border-cyan-500/20 bg-black/60 px-6 py-2.5 overflow-x-auto z-30">
        <div className="flex items-center justify-between min-w-[620px] text-[11px] font-mono">
          {RAG_RETRIEVAL_STEPS.map((step, idx) => {
            const isCurrent = activePipelineStage === idx;
            const isPassed = activePipelineStage > idx;
            return (
              <React.Fragment key={step.id}>
                <div
                  className={`flex items-center gap-1.5 transition-colors ${
                    isCurrent
                      ? "text-cyan-300 font-bold drop-shadow-[0_0_8px_rgba(0,243,255,0.8)]"
                      : isPassed
                      ? "text-emerald-400 font-semibold"
                      : "text-slate-600"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-none ${
                      isCurrent
                        ? "bg-cyan-400 animate-ping"
                        : isPassed
                        ? "bg-emerald-400"
                        : "bg-slate-800"
                    }`}
                  />
                  <span>{step.label}</span>
                </div>
                {idx < RAG_RETRIEVAL_STEPS.length - 1 && (
                  <span className="text-slate-700">═</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 3. MESSAGES SCROLL AREA */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 z-30">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 space-y-6">
            {/* 3D Holographic AI Orb Centerpiece */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <GlowingAIOrbCanvas isProcessing={loading} />
            </div>

            <div className="max-w-lg space-y-2">
              <h4 className="text-2xl font-black text-white tracking-widest uppercase font-mono drop-shadow-[0_0_12px_rgba(0,243,255,0.6)]">
                NEURAL_GROUNDED_INTERFACE
              </h4>
              <p className="text-xs sm:text-sm text-cyan-200/80 leading-relaxed font-mono max-w-md mx-auto">
                Execute queries against your vectorized FAISS knowledge repository. Real-time deterministic synthesis powered by Gemini 2.5 Flash.
              </p>
            </div>

            {/* Suggested Question Pills */}
            <div className="w-full max-w-xl space-y-3 pt-2">
              <div className="text-[11px] font-mono text-cyan-400 uppercase tracking-widest font-bold flex items-center justify-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span>SELECT_PRESET_QUERY:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setQuestion(q);
                      handleSend(q);
                    }}
                    className="min-h-[52px] border border-cyan-500/30 bg-slate-950/80 backdrop-blur-md p-4 text-left text-cyan-300 hover:border-cyan-400 hover:bg-cyan-950/50 hover:text-white active:scale-[0.98] transition-all shadow-[0_0_15px_rgba(0,243,255,0.1)] flex items-center justify-between group"
                  >
                    <span>⚡ &quot;{q}&quot;</span>
                    <span className="text-cyan-500 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all">▶</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-4 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "assistant" && (
                <div className="flex h-10 w-10 items-center justify-center bg-cyan-950 text-cyan-400 border border-cyan-400/50 shrink-0 shadow-[0_0_10px_rgba(0,243,255,0.3)]">
                  <Bot className="h-5 w-5" />
                </div>
              )}

              <div
                className={`flex max-w-3xl flex-col space-y-2.5 ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                {/* User Bubble */}
                {msg.sender === "user" ? (
                  <div className="bg-cyan-500 text-black font-bold px-5 py-3.5 text-xs sm:text-sm shadow-[0_0_20px_rgba(0,243,255,0.4)] leading-relaxed border border-cyan-300">
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                ) : (
                  /* Editorial AI Response Panel with Cyberpunk GlassCard */
                  <GlassCard className="w-full p-6 text-xs sm:text-sm text-slate-100 space-y-4 border-cyan-500/40 bg-[#060d1a]/95 shadow-[0_0_25px_rgba(0,243,255,0.15)]">
                    {/* Header Grounding Status */}
                    {msg.response && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 border-b border-cyan-500/20">
                        <div className="flex items-center gap-2.5">
                          {msg.response.grounded ? (
                            <span className="inline-flex items-center gap-1.5 bg-emerald-950/80 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.3)]">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              [GROUNDED_VERIFIED]
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 bg-rose-950/80 px-3 py-1 text-xs font-bold text-rose-400 border border-rose-500/50 shadow-[0_0_8px_rgba(255,0,85,0.3)]">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              [UNGROUNDED_CONTEXT]
                            </span>
                          )}
                          <span className="text-xs text-slate-400 font-mono">
                            ({msg.response.retrieved_chunks} CHUNKS_FOUND)
                          </span>
                        </div>

                        {msg.response.sources.length > 0 && (
                          <button
                            onClick={() => toggleSources(msg.id)}
                            className="flex items-center gap-1 text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                          >
                            <span>
                              {expandedSources[msg.id]
                                ? "[COLLAPSE_CITATIONS]"
                                : `[EXPAND_${msg.response.sources.length}_SOURCES]`}
                            </span>
                            {expandedSources[msg.id] ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Reasoning Drawer Component */}
                    <ReasoningDrawer />

                    {/* Answer Body */}
                    <div className="leading-relaxed text-slate-100 whitespace-pre-wrap text-sm sm:text-base font-mono">
                      {msg.text}
                    </div>

                    {/* Sources Attribution Grid */}
                    {msg.response && expandedSources[msg.id] && msg.response.sources.length > 0 && (
                      <div className="pt-3 border-t border-cyan-500/20 space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                          <div className="flex items-center gap-1.5">
                            <CornerDownRight className="h-3.5 w-3.5 text-purple-400" />
                            <span>CONNECTED_VECTOR_SOURCES:</span>
                          </div>
                          <span className="text-slate-500 text-[10px]">Click to view raw snippet</span>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5">
                          {msg.response.sources.map((src: AskSource, sIdx: number) => (
                            <div
                              key={src.chunk_id || sIdx}
                              onClick={() => setActiveSourceModal(src)}
                              className="border border-purple-500/40 bg-black/80 p-3.5 space-y-2 text-slate-300 hover:border-cyan-400 hover:bg-purple-950/30 transition-all cursor-pointer group shadow-[0_0_10px_rgba(147,51,234,0.15)]"
                            >
                              <div className="flex items-center justify-between font-medium">
                                <div className="flex items-center gap-2 text-purple-300 truncate max-w-[260px] sm:max-w-md">
                                  <FileText className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                                  <span className="truncate text-xs font-mono group-hover:text-cyan-300 transition-colors">{src.filename}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="bg-purple-500/20 px-2.5 py-1 text-[10px] font-mono font-bold text-purple-300 border border-purple-400/30">
                                    {(src.score * 100).toFixed(1)}% MATCH
                                  </span>
                                  <Eye className="h-3.5 w-3.5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </GlassCard>
                )}

                <span className="text-[10px] text-slate-500 font-mono px-2">
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === "user" && (
                <div className="flex h-10 w-10 items-center justify-center bg-slate-900 text-slate-300 shrink-0 border border-white/20">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Dynamic Loading Telemetry */}
        {loading && (
          <div className="flex gap-4 items-start">
            <div className="flex h-10 w-10 items-center justify-center bg-cyan-950 text-cyan-400 border border-cyan-400/50 shrink-0 animate-pulse">
              <Bot className="h-5 w-5" />
            </div>
            <div className="border border-cyan-400 bg-black/90 px-6 py-4 text-xs text-slate-200 flex items-center gap-3 shadow-[0_0_20px_rgba(0,243,255,0.3)] backdrop-blur-2xl">
              <Loader2 className="h-5 w-5 animate-spin text-cyan-400" />
              <div>
                <p className="font-extrabold text-cyan-300 font-mono text-sm uppercase tracking-wider">
                  {activePipelineStage <= 2
                    ? "[EXECUTING_VECTOR_SEARCH...]"
                    : "[SYNTHESIZING_LLM_RESPONSE...]"}
                </p>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Calculating cosine similarity metrics across FAISS vector space
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Feedback */}
        {error && (
          <div className="border-2 border-rose-500 bg-rose-950/40 p-4 text-xs text-rose-300 flex items-center justify-between gap-3 shadow-[0_0_20px_rgba(255,0,85,0.4)] font-mono">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
              <div>
                <p className="font-bold text-rose-200 uppercase">[QUERY_FAILED]</p>
                <p className="text-rose-300/80 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={() => handleSend()}
              className="border border-rose-400 bg-rose-600/30 px-4 py-2 text-xs font-bold text-rose-200 hover:bg-rose-600 active:scale-95 transition-all uppercase"
            >
              RETRY_EXECUTION
            </button>
          </div>
        )}
      </div>

      {/* 4. FUTURISTIC CYBER INPUT BAR FOOTER */}
      <div className="border-t-2 border-cyan-500/30 bg-[#060d1a]/95 backdrop-blur-2xl p-4 sm:p-5 z-30">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3"
        >
          <button
            type="button"
            onClick={() => setIsMobileSheetOpen(true)}
            className="min-h-[50px] min-w-[50px] flex items-center justify-center border border-cyan-500/40 bg-black text-cyan-400 hover:bg-cyan-950 hover:border-cyan-300 active:scale-95 transition-all shadow-[0_0_10px_rgba(0,243,255,0.2)]"
            title="Attach Document"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="[COMMAND] Enter query for vector knowledge retrieval..."
            disabled={loading}
            className="flex-1 min-h-[50px] border border-cyan-500/40 bg-black px-5 py-3.5 text-xs sm:text-sm text-cyan-300 placeholder-slate-600 focus:border-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-400/40 disabled:opacity-50 font-mono shadow-[inset_0_0_10px_rgba(0,0,0,0.8)]"
          />

          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="min-h-[50px] px-7 flex items-center justify-center gap-2 border border-cyan-300 bg-cyan-400 text-black font-extrabold text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_20px_rgba(0,243,255,0.4)] transition-all hover:bg-cyan-300 active:scale-95 disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Zap className="h-4 w-4 fill-black" />
            )}
            <span className="hidden sm:inline">EXECUTE</span>
          </button>
        </form>
      </div>

      {/* 5. MOBILE KNOWLEDGE BASE BOTTOM SHEET */}
      <MobileKnowledgeSheet
        isOpen={isMobileSheetOpen}
        onClose={() => setIsMobileSheetOpen(false)}
      />

      {/* 6. SOURCE SNIPPET VIEWER MODAL */}
      {activeSourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 font-mono">
          <div className="w-full max-w-2xl border-2 border-purple-500 bg-[#060d1a] p-6 shadow-[0_0_30px_rgba(147,51,234,0.3)] space-y-4">
            <div className="flex items-start justify-between border-b border-purple-500/30 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center bg-purple-950 text-purple-400 border border-purple-400">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base uppercase">{activeSourceModal.filename}</h4>
                  <p className="text-xs text-purple-300 font-mono">
                    CHUNK_ID: {activeSourceModal.chunk_id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSourceModal(null)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center p-1.5 text-slate-400 hover:bg-purple-950 hover:text-white transition-colors"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="bg-black border border-purple-500/40 px-3 py-1 text-purple-300 font-mono">
                {activeSourceModal.page_number ? `PAGE_${activeSourceModal.page_number}` : "FULL_DOC"}
              </span>
              <span className="bg-emerald-950 border border-emerald-500 px-3 py-1 font-bold text-emerald-400 font-mono">
                {(activeSourceModal.score * 100).toFixed(1)}% SIMILARITY
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-purple-300 uppercase tracking-wider font-bold">
                RETRIEVED_VECTOR_TEXT_SNIPPET:
              </span>
              <div className="max-h-80 overflow-y-auto border border-purple-500/30 bg-black p-4 text-xs sm:text-sm font-mono text-slate-200 leading-relaxed whitespace-pre-wrap">
                {activeSourceModal.text_snippet || "Text snippet preserved in vector metadata."}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveSourceModal(null)}
                className="min-h-[44px] border border-cyan-300 bg-cyan-400 px-6 py-2 text-xs font-black text-black uppercase hover:bg-cyan-300 transition-colors"
              >
                CLOSE_SNIPPET
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RAGChat;
