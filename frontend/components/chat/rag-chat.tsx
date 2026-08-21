"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { AskResponse, AskSource } from "@/types";
import { apiClient } from "@/lib/api";

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

  // Restore session chat messages from sessionStorage
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
          // Default expand all assistant message sources
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

    // Simulate animated retrieval stage progression
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
      // Fallback to standard HTTP ask endpoint if SSE stream fails
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
    <div className="flex h-[calc(100vh-10.5rem)] flex-col rounded-3xl border border-[#1E293B] bg-[#0E131F] overflow-hidden shadow-2xl relative">
      {/* 1. TOP HEADER & RAG CONTROLS */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#1E293B] bg-[#080B11]/80 px-6 py-4 gap-4">
        <div className="flex items-center gap-3.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-md shadow-indigo-600/25">
            <div className="flex h-full w-full items-center justify-center rounded-[14px] bg-[#080B11]">
              <Sparkles className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base tracking-tight">
                Grounded RAG Assistant
              </h3>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Knowledge Base Connected
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Ask questions across your indexed knowledge base.
            </p>
          </div>
        </div>

        {/* Top-K Selector & Clear Chat */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-[#1E293B] bg-[#141B2D] px-3.5 py-1.5 text-xs text-zinc-300 shadow-sm">
            <Sliders className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-[11px] text-zinc-400 font-mono">Top-K Chunks:</span>
            <select
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="bg-transparent font-bold text-indigo-400 focus:outline-none cursor-pointer text-xs"
            >
              {[1, 2, 3, 4, 5, 7, 10].map((k) => (
                <option key={k} value={k} className="bg-[#0E131F] text-white">
                  k = {k}
                </option>
              ))}
            </select>
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleClearChat}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-all"
              title="Clear conversation history"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-400" />
              <span>Clear Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. SUBTLE ARCHITECTURAL RETRIEVAL PIPELINE PROGRESS BAR */}
      <div className="border-b border-[#1E293B] bg-[#080B11]/50 px-6 py-2 overflow-x-auto">
        <div className="flex items-center justify-between min-w-[560px] text-[11px] font-mono text-zinc-500">
          {RAG_RETRIEVAL_STEPS.map((step, idx) => {
            const isCurrent = activePipelineStage === idx;
            const isPassed = activePipelineStage > idx;
            return (
              <React.Fragment key={step.id}>
                <div
                  className={`flex items-center gap-1.5 transition-colors ${
                    isCurrent
                      ? "text-indigo-400 font-bold"
                      : isPassed
                      ? "text-emerald-400"
                      : "text-zinc-600"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isCurrent
                        ? "bg-indigo-400 animate-ping"
                        : isPassed
                        ? "bg-emerald-400"
                        : "bg-zinc-700"
                    }`}
                  />
                  <span>{step.label}</span>
                </div>
                {idx < RAG_RETRIEVAL_STEPS.length - 1 && (
                  <span className="text-zinc-700">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 3. MESSAGES SCROLL AREA */}
      <div className="flex-1 overflow-y-auto p-5 sm:p-7 space-y-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6 space-y-5">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-indigo-600 to-purple-600 p-0.5 shadow-xl shadow-indigo-600/25">
              <div className="flex h-full w-full items-center justify-center rounded-[22px] bg-[#080B11]">
                <Bot className="h-8 w-8 text-indigo-400" />
              </div>
            </div>

            <div className="max-w-md space-y-2">
              <h4 className="text-lg font-bold text-white tracking-tight">
                Ask Questions Grounded in Your Documents
              </h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                NexusAI retrieves semantic vector chunks from your FAISS repository and
                synthesizes grounded answers using Gemini 2.5 Flash with verified source citations.
              </p>
            </div>

            {/* Suggested Question Pills */}
            <div className="w-full max-w-xl space-y-2 pt-2">
              <div className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
                Suggested Questions:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    onClick={() => {
                      setQuestion(q);
                      handleSend(q);
                    }}
                    className="rounded-2xl border border-[#1E293B] bg-[#141B2D]/70 p-3.5 text-left text-zinc-300 hover:border-indigo-500/50 hover:bg-[#141B2D] hover:text-white transition-all shadow-sm flex items-center justify-between group"
                  >
                    <span>💡 &quot;{q}&quot;</span>
                    <span className="text-zinc-600 group-hover:text-indigo-400 transition-colors">→</span>
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
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shrink-0 shadow-sm">
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
                  <div className="rounded-2xl bg-indigo-600 px-5 py-3.5 text-xs sm:text-sm text-white shadow-md shadow-indigo-600/20 leading-relaxed font-medium">
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                ) : (
                  /* Editorial AI Response Panel */
                  <div className="w-full rounded-2xl border border-[#1E293B] bg-[#141B2D]/95 p-5 sm:p-6 text-xs sm:text-sm text-zinc-100 shadow-lg space-y-4">
                    {/* Header Grounding Status */}
                    {msg.response && (
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#1E293B]">
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
                          <span className="text-xs text-zinc-400 font-mono">
                            ({msg.response.retrieved_chunks} context chunks retrieved)
                          </span>
                        </div>

                        {msg.response.sources.length > 0 && (
                          <button
                            onClick={() => toggleSources(msg.id)}
                            className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
                          >
                            <span>
                              {expandedSources[msg.id]
                                ? "Hide Citations"
                                : `View ${msg.response.sources.length} Sources & Citations`}
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

                    {/* Answer Body */}
                    <div className="leading-relaxed text-zinc-100 whitespace-pre-wrap">
                      {msg.text}
                    </div>

                    {/* Fallback Notice when Grounded is False */}
                    {msg.response && !msg.response.grounded && (
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-3.5 text-xs text-amber-300 space-y-1">
                        <div className="font-semibold text-amber-200 flex items-center gap-1.5">
                          <AlertTriangle className="h-4 w-4 text-amber-400" />
                          <span>Strict Grounding Notice</span>
                        </div>
                        <p className="text-zinc-400 leading-relaxed text-[11px]">
                          The indexed knowledge base does not contain sufficient factual evidence to answer this query with confidence.
                          NexusAI avoided hallucinating details outside your documents.
                        </p>
                      </div>
                    )}

                    {/* Sources Attribution Grid */}
                    {msg.response && expandedSources[msg.id] && msg.response.sources.length > 0 && (
                      <div className="pt-3 border-t border-[#1E293B] space-y-2.5">
                        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                          <div className="flex items-center gap-1.5">
                            <CornerDownRight className="h-3.5 w-3.5 text-indigo-400" />
                            <span>Connected Source Citations:</span>
                          </div>
                          <span className="text-zinc-500 text-[10px]">Click any source card to view chunk text</span>
                        </div>

                        <div className="grid grid-cols-1 gap-2.5">
                          {msg.response.sources.map((src: AskSource, sIdx: number) => (
                            <div
                              key={src.chunk_id || sIdx}
                              onClick={() => setActiveSourceModal(src)}
                              className="rounded-xl border border-[#1E293B] bg-[#0E131F] p-3.5 space-y-2 text-zinc-300 hover:border-indigo-500/50 hover:bg-[#141B2D] transition-all cursor-pointer group shadow-sm"
                            >
                              <div className="flex items-center justify-between font-medium">
                                <div className="flex items-center gap-2 text-indigo-300 truncate max-w-[260px] sm:max-w-md">
                                  <FileText className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                                  <span className="truncate text-xs font-mono group-hover:text-indigo-200 transition-colors">{src.filename}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="rounded bg-[#141B2D] border border-[#1E293B] px-2 py-0.5 text-[10px] font-mono text-zinc-400">
                                    {src.page_number ? `Page ${src.page_number}` : "Full Document"}
                                  </span>
                                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/20">
                                    {(src.score * 100).toFixed(1)}% Relevance
                                  </span>
                                  <Eye className="h-3.5 w-3.5 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                                </div>
                              </div>
                              <p className="text-[10px] text-zinc-500 font-mono flex items-center justify-between">
                                <span>Vector Chunk ID: {src.chunk_id}</span>
                                <span className="text-indigo-400/80 group-hover:underline">Inspect Raw Text Snippet ↗</span>
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <span className="text-[10px] text-zinc-500 font-mono px-2">
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === "user" && (
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#141B2D] text-zinc-300 shrink-0 border border-[#1E293B]">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Dynamic Loading State */}
        {loading && (
          <div className="flex gap-3.5 items-start">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shrink-0 animate-pulse">
              <Bot className="h-4 w-4" />
            </div>
            <div className="rounded-2xl border border-[#1E293B] bg-[#141B2D] px-5 py-4 text-xs text-zinc-300 flex items-center gap-3 shadow-md">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
              <div>
                <p className="font-semibold text-white">
                  {activePipelineStage <= 2
                    ? "Searching FAISS vector database..."
                    : "Synthesizing grounded answer with Gemini 2.5 Flash..."}
                </p>
                <p className="text-[10px] text-zinc-500 font-mono mt-0.5">
                  Isolating context chunks and calculating similarity metrics
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Feedback with Retry */}
        {error && (
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
              <div>
                <p className="font-semibold text-rose-200">Query Execution Error</p>
                <p className="text-rose-300/80 mt-0.5">{error}</p>
              </div>
            </div>
            <button
              onClick={() => handleSend()}
              className="rounded-xl border border-rose-500/30 bg-rose-600/20 px-3.5 py-1.5 text-xs font-semibold text-rose-200 hover:bg-rose-600/30 transition-colors"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* 4. PREMIUM INPUT FORM FOOTER */}
      <div className="border-t border-[#1E293B] bg-[#080B11]/95 p-4 sm:p-5">
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
            className="flex-1 rounded-2xl border border-[#1E293B] bg-[#0E131F] px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none disabled:opacity-50 shadow-inner"
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-3 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-500 disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>Ask</span>
          </button>
        </form>
        <div className="flex flex-wrap items-center justify-between mt-2.5 px-1 text-[10px] text-zinc-500 font-mono gap-2">
          <div className="flex items-center gap-1.5">
            <Info className="h-3 w-3 text-indigo-400" />
            <span>Answers synthesized with Gemini 2.5 Flash from retrieved FAISS vector chunks.</span>
          </div>
          <span className="text-zinc-600 hidden sm:inline">Press Enter to ask • Shift+Enter for newline</span>
        </div>
      </div>

      {/* 5. SOURCE TEXT SNIPPET VIEWER MODAL */}
      {activeSourceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl rounded-3xl border border-[#1E293B] bg-[#0E131F] p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-[#1E293B] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">{activeSourceModal.filename}</h4>
                  <p className="text-xs font-mono text-zinc-400">
                    Chunk ID: {activeSourceModal.chunk_id} • Document ID: {activeSourceModal.document_id.slice(0, 8)}...
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveSourceModal(null)}
                className="rounded-xl p-1.5 text-zinc-400 hover:bg-[#141B2D] hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Metrics Chips */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="rounded-xl bg-[#141B2D] border border-[#1E293B] px-3 py-1 text-zinc-300 font-mono">
                {activeSourceModal.page_number ? `Page ${activeSourceModal.page_number}` : "Full Document"}
              </span>
              <span className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 font-bold text-emerald-400 font-mono">
                {(activeSourceModal.score * 100).toFixed(1)}% Cosine Similarity
              </span>
            </div>

            {/* Text Snippet Content Box */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider">
                Retrieved Vector Chunk Text Snippet:
              </span>
              <div className="max-h-80 overflow-y-auto rounded-2xl border border-[#1E293B] bg-[#080B11] p-4 text-xs sm:text-sm font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap">
                {activeSourceModal.text_snippet || "Text snippet preserved in vector metadata."}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveSourceModal(null)}
                className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
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
