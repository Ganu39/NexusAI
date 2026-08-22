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
  Info,
  CornerDownRight,
  Trash2,
  Eye,
  X,
  Database,
} from "lucide-react";
import { AskResponse, AskSource } from "@/types";
import { apiClient } from "@/lib/api";
import GlassCard from "@/components/ui/GlassCard";
import ReasoningDrawer from "@/components/chat/ReasoningDrawer";
import MobileKnowledgeSheet from "@/components/chat/MobileKnowledgeSheet";

// Dynamic WebGL imports to prevent SSR issues
const GlowingAIOrbCanvas = dynamic(() => import("@/components/3d/GlowingAIOrb"), {
  ssr: false,
  loading: () => <div className="w-10 h-10 rounded-full bg-cyan-500/20 animate-pulse" />,
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
  { id: "query", label: "Question" },
  { id: "search", label: "Vector Search" },
  { id: "chunks", label: "Top-K Chunks" },
  { id: "context", label: "Isolated Context" },
  { id: "gemini", label: "Gemini 2.5 Flash" },
  { id: "answer", label: "Answer & Citations" },
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
    if (window.confirm("Clear current conversation history?")) {
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
            : "Failed to connect to NexusAI RAG engine.";
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
    <div className="flex h-[calc(100vh-10.5rem)] flex-col rounded-3xl border border-white/10 bg-slate-950/80 overflow-hidden shadow-2xl relative backdrop-blur-2xl">
      {/* Background 3D Vector Particle Cloud */}
      <VectorParticleCloudCanvas />

      {/* 1. TOP HEADER & RAG CONTROLS */}
      <div className="flex flex-wrap items-center justify-between border-b border-white/10 bg-slate-900/60 backdrop-blur-xl px-6 py-3.5 gap-4 z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 flex items-center justify-center relative">
            <GlowingAIOrbCanvas isProcessing={loading} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base tracking-tight font-mono">
                Grounded RAG Assistant
              </h3>
              <span className="flex items-center gap-1 rounded-full bg-cyan-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-cyan-400 border border-cyan-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                Knowledge Base Connected
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Vector index connected • Real-time source grounding
            </p>
          </div>
        </div>

        {/* Top-K Selector, Mobile Knowledge Drawer & Clear Chat */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileSheetOpen(true)}
            className="md:hidden flex items-center gap-2 min-h-[44px] px-3.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/20 active:scale-95 transition-transform"
          >
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Knowledge Base</span>
          </button>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-slate-900/80 px-3.5 py-2 text-xs text-slate-300 shadow-sm">
            <Sliders className="h-3.5 w-3.5 text-cyan-400" />
            <span className="text-[11px] text-slate-400 font-mono">Top-K Chunks:</span>
            <select
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="bg-transparent font-bold text-cyan-400 focus:outline-none cursor-pointer text-xs"
            >
              {[1, 2, 3, 4, 5, 7, 10].map((k) => (
                <option key={k} value={k} className="bg-slate-900 text-white">
                  k = {k}
                </option>
              ))}
            </select>
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="flex items-center gap-1.5 min-h-[44px] rounded-xl border border-rose-500/20 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 active:scale-95 transition-all"
              title="Clear conversation history"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-400" />
              <span>Clear Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. SUBTLE ARCHITECTURAL RETRIEVAL PIPELINE PROGRESS BAR */}
      <div className="border-b border-white/5 bg-slate-900/40 px-6 py-2 overflow-x-auto z-10">
        <div className="flex items-center justify-between min-w-[560px] text-[11px] font-mono text-slate-400">
          {RAG_RETRIEVAL_STEPS.map((step, idx) => {
            const isCurrent = activePipelineStage === idx;
            const isPassed = activePipelineStage > idx;
            return (
              <React.Fragment key={step.id}>
                <div
                  className={`flex items-center gap-1.5 transition-colors ${
                    isCurrent
                      ? "text-cyan-400 font-bold"
                      : isPassed
                      ? "text-emerald-400"
                      : "text-slate-500"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isCurrent
                        ? "bg-cyan-400 animate-ping"
                        : isPassed
                        ? "bg-emerald-400"
                        : "bg-slate-700"
                    }`}
                  />
                  <span>{step.label}</span>
                </div>
                {idx < RAG_RETRIEVAL_STEPS.length - 1 && (
                  <span className="text-slate-700">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 3. MESSAGES SCROLL AREA */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6 z-10">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 space-y-5">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-500/20 p-0.5 border border-cyan-400/30 shadow-xl shadow-cyan-500/10">
              <Bot className="h-8 w-8 text-cyan-400" />
            </div>

            <div className="max-w-md space-y-2">
              <h4 className="text-lg font-bold text-white tracking-tight font-mono">
                Ask Questions Grounded in Your Documents
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                NexusAI retrieves semantic vector chunks from your document repository and
                synthesizes grounded answers with verified source citations.
              </p>
            </div>

            {/* Suggested Question Pills */}
            <div className="w-full max-w-xl space-y-2 pt-2">
              <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Suggested Questions:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setQuestion(q);
                      handleSend(q);
                    }}
                    className="min-h-[48px] rounded-2xl border border-white/10 bg-slate-900/60 p-3.5 text-left text-slate-300 hover:border-cyan-400/50 hover:bg-slate-900/80 hover:text-white active:scale-[0.98] transition-all shadow-sm flex items-center justify-between group"
                  >
                    <span>💡 &quot;{q}&quot;</span>
                    <span className="text-slate-500 group-hover:text-cyan-400 transition-colors">→</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {msg.sender === "assistant" && (
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0 shadow-sm">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div
                className={`flex max-w-3xl flex-col space-y-2.5 ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                {/* User Bubble */}
                {msg.sender === "user" ? (
                  <div className="rounded-2xl bg-cyan-600 px-5 py-3.5 text-xs sm:text-sm text-white shadow-md shadow-cyan-600/20 leading-relaxed font-medium">
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                ) : (
                  /* Editorial AI Response Panel with Tactile GlassCard */
                  <GlassCard className="w-full p-5 sm:p-6 text-xs sm:text-sm text-slate-100 space-y-4">
                    {/* Header Grounding Status */}
                    {msg.response && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          {msg.response.grounded ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20 shadow-sm">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Grounded Answer
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400 border border-amber-500/20 shadow-sm">
                              <AlertTriangle className="h-3.5 w-3.5" />
                              Insufficient Context
                            </span>
                          )}
                          <span className="text-xs text-slate-400 font-mono">
                            ({msg.response.retrieved_chunks} chunks)
                          </span>
                        </div>

                        {msg.response.sources.length > 0 && (
                          <button
                            onClick={() => toggleSources(msg.id)}
                            className="flex items-center gap-1 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-md"
                          >
                            <span>
                              {expandedSources[msg.id]
                                ? "Hide Citations"
                                : `View ${msg.response.sources.length} Sources`}
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
                    <div className="leading-relaxed text-slate-100 whitespace-pre-wrap">
                      {msg.text}
                    </div>

                    {/* Sources Attribution Grid */}
                    {msg.response && expandedSources[msg.id] && msg.response.sources.length > 0 && (
                      <div className="pt-3 border-t border-white/10 space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                          <div className="flex items-center gap-1.5">
                            <CornerDownRight className="h-3.5 w-3.5 text-violet-400" />
                            <span>Connected Sources:</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5">
                          {msg.response.sources.map((src: AskSource, sIdx: number) => (
                            <div
                              key={src.chunk_id || sIdx}
                              onClick={() => setActiveSourceModal(src)}
                              className="rounded-xl border border-white/10 bg-slate-900/80 p-3.5 space-y-2 text-slate-300 hover:border-violet-400/50 hover:bg-slate-900 transition-all cursor-pointer group shadow-sm"
                            >
                              <div className="flex items-center justify-between font-medium">
                                <div className="flex items-center gap-2 text-violet-300 truncate max-w-[260px] sm:max-w-md">
                                  <FileText className="h-3.5 w-3.5 text-violet-400 shrink-0" />
                                  <span className="truncate text-xs font-mono group-hover:text-violet-200 transition-colors">{src.filename}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="rounded bg-violet-500/10 px-2.5 py-1 text-[10px] font-mono font-bold text-violet-400 border border-violet-500/20">
                                    {(src.score * 100).toFixed(1)}% Relevance
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
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-800 text-slate-300 shrink-0 border border-white/10">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Dynamic Loading State */}
        {loading && (
          <div className="flex gap-3.5 items-start">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 shrink-0 animate-pulse">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 px-5 py-4 text-xs text-slate-300 flex items-center gap-3 shadow-md backdrop-blur-xl">
              <Loader2 className="h-4 w-4 animate-spin text-cyan-400" />
              <div>
                <p className="font-semibold text-white font-mono">
                  {activePipelineStage <= 2
                    ? "Searching vector database..."
                    : "Synthesizing answer with grounded citations..."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Feedback */}
        {error && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
              <div>
                <p className="font-semibold text-rose-200">Query Error</p>
                <p className="text-rose-300/80 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={() => handleSend()}
              className="rounded-xl border border-rose-500/30 bg-rose-600/20 px-3.5 py-2 text-xs font-semibold text-rose-200 hover:bg-rose-600/30 active:scale-95 transition-all"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* 4. PREMIUM INPUT FORM FOOTER */}
      <div className="border-t border-white/10 bg-slate-900/80 backdrop-blur-xl p-4 sm:p-5 z-10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2.5"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question grounded in your indexed knowledge base..."
            disabled={loading}
            className="flex-1 min-h-[48px] rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/30 disabled:opacity-50 shadow-inner"
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="min-h-[48px] min-w-[48px] flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-xs sm:text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all hover:bg-cyan-400 active:scale-95 disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="hidden sm:inline">Ask</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-slate-900 p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/20 text-violet-400 border border-violet-500/30">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base font-mono">{activeSourceModal.filename}</h4>
                  <p className="text-xs font-mono text-slate-400">
                    Chunk ID: {activeSourceModal.chunk_id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSourceModal(null)}
                className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl p-1.5 text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-xl bg-slate-800 border border-white/10 px-3 py-1 text-slate-300 font-mono">
                {activeSourceModal.page_number ? `Page ${activeSourceModal.page_number}` : "Full Document"}
              </span>
              <span className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 font-bold text-emerald-400 font-mono">
                {(activeSourceModal.score * 100).toFixed(1)}% Similarity
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                Vector Chunk Text Snippet:
              </span>
              <div className="max-h-80 overflow-y-auto rounded-2xl border border-white/10 bg-slate-950 p-4 text-xs sm:text-sm font-mono text-slate-300 leading-relaxed whitespace-pre-wrap">
                {activeSourceModal.text_snippet || "Text snippet preserved in vector metadata."}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveSourceModal(null)}
                className="min-h-[44px] rounded-xl bg-cyan-500 px-5 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-400 transition-colors"
              >
                Close Snippet Viewer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RAGChat;
