"use client";

import React, { useState } from "react";
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

export function RAGChat() {
  const [question, setQuestion] = useState("");
  const [topK, setTopK] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [expandedSources, setExpandedSources] = useState<Record<string, boolean>>({});

  const toggleSources = (msgId: string) => {
    setExpandedSources((prev) => ({
      ...prev,
      [msgId]: !prev[msgId],
    }));
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: "user",
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);
    setError(null);

    try {
      const askRes = await apiClient.askQuestion(trimmed, topK);
      const assistantMsgId = `assistant-${Date.now()}`;
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        sender: "assistant",
        text: askRes.answer,
        response: askRes,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to connect to NexusAI RAG engine.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
      {/* Chat Header Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20">
            <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-zinc-950">
              <Sparkles className="h-5 w-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Grounded RAG Assistant</h3>
            <p className="text-xs text-zinc-400">
              Grounded exclusively in your uploaded & indexed knowledge base
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-300">
            <Sliders className="h-3.5 w-3.5 text-indigo-400" />
            <span>Top Chunks (top_k):</span>
            <select
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="bg-transparent font-bold text-indigo-400 focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 7, 10].map((k) => (
                <option key={k} value={k} className="bg-zinc-900 text-white">
                  {k}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-8 space-y-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Bot className="h-8 w-8" />
            </div>
            <div className="max-w-md space-y-2">
              <h4 className="text-lg font-bold text-white">
                Ask Questions Grounded in Your Knowledge Base
              </h4>
              <p className="text-xs text-zinc-400">
                NexusAI retrieves relevant vector chunks from your indexed documents and
                synthesizes answers using Gemini 2.5 Flash with precise source attribution.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs w-full max-w-lg pt-4">
              <button
                onClick={() => setQuestion("Summarize the key topics in the uploaded documents.")}
                className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-left text-zinc-300 hover:border-indigo-500/40 hover:bg-zinc-900 transition-all"
              >
                💡 &quot;Summarize the key topics...&quot;
              </button>
              <button
                onClick={() => setQuestion("What specific details are mentioned regarding security?")}
                className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 text-left text-zinc-300 hover:border-indigo-500/40 hover:bg-zinc-900 transition-all"
              >
                🛡️ &quot;What details are mentioned...&quot;
              </button>
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
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shrink-0 shadow-md">
                  <Bot className="h-5 w-5" />
                </div>
              )}

              <div
                className={`flex max-w-3xl flex-col space-y-3 ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`rounded-2xl px-5 py-3.5 text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                      : "border border-zinc-800 bg-zinc-900/90 text-zinc-200"
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>

                {/* Grounding & Source Metadata Card */}
                {msg.response && (
                  <div className="w-full space-y-2 rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4 text-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {msg.response.grounded ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-semibold text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Grounded Answer
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 font-semibold text-amber-400 border border-amber-500/20">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Insufficient Context Fallback
                          </span>
                        )}
                        <span className="text-zinc-500">
                          ({msg.response.retrieved_chunks} context chunks retrieved)
                        </span>
                      </div>

                      {msg.response.sources.length > 0 && (
                        <button
                          onClick={() => toggleSources(msg.id)}
                          className="flex items-center gap-1 font-medium text-indigo-400 hover:text-indigo-300"
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

                    {/* Sources Attribution List */}
                    {expandedSources[msg.id] && msg.response.sources.length > 0 && (
                      <div className="mt-3 space-y-2 border-t border-zinc-800/80 pt-3">
                        <div className="font-semibold text-zinc-400 text-[11px] uppercase tracking-wider">
                          Attributed Sources & Citations:
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {msg.response.sources.map((src: AskSource, idx: number) => (
                            <div
                              key={src.chunk_id || idx}
                              className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 space-y-1 text-zinc-300"
                            >
                              <div className="flex items-center justify-between font-medium">
                                <div className="flex items-center gap-2 text-indigo-300 truncate">
                                  <FileText className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                                  <span className="truncate">{src.filename}</span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400">
                                    {src.page_number
                                      ? `Page ${src.page_number}`
                                      : "Full Doc"}
                                  </span>
                                  <span className="rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-emerald-400 border border-emerald-500/20">
                                    {(src.score * 100).toFixed(1)}% Score
                                  </span>
                                </div>
                              </div>
                              <p className="text-[11px] text-zinc-400 font-mono">
                                Chunk ID: {src.chunk_id}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <span className="text-[10px] text-zinc-500 px-1">
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === "user" && (
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-800 text-zinc-300 shrink-0 border border-zinc-700">
                  <User className="h-5 w-5" />
                </div>
              )}
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-4 items-start">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shrink-0 animate-pulse">
              <Bot className="h-5 w-5" />
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/90 px-5 py-3.5 text-sm text-zinc-300 flex items-center gap-3">
              <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
              <span>Synthesizing grounded answer from indexed vectors...</span>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
            <div>
              <p className="font-semibold text-rose-200">Query Failed</p>
              <p className="text-rose-300/80 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>

      {/* Input Form Footer */}
      <div className="border-t border-zinc-800 bg-zinc-900/80 p-4">
        <form onSubmit={handleSend} className="flex gap-3">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a question about your uploaded documents..."
            disabled={loading}
            className="flex-1 rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all hover:bg-indigo-500 disabled:opacity-50 shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>Ask</span>
          </button>
        </form>
        <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-zinc-500">
          <div className="flex items-center gap-1">
            <Info className="h-3 w-3 text-zinc-400" />
            <span>Answers are generated using Gemini 2.5 Flash grounded in retrieved vector context.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
