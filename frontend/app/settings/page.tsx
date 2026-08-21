"use client";

import React, { useState, useEffect } from "react";
import {
  Settings as SettingsIcon,
  User,
  Copy,
  Check,
  RefreshCw,
  Cpu,
  Database,
  ShieldCheck,
  Trash2,
  HardDrive,
  Layers,
  Sparkles,
  Loader2,
  AlertCircle,
  Edit3,
  Save,
  X,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { apiClient, getOrCreateUserId, SystemMetrics } from "@/lib/api";

export default function SettingsPage() {
  const [userId, setUserId] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [metricsError, setMetricsError] = useState<string | null>(null);
  const [cacheCleared, setCacheCleared] = useState(false);

  // Custom User ID editing state
  const [isEditingUserId, setIsEditingUserId] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [idError, setIdError] = useState<string | null>(null);

  useEffect(() => {
    const currentId = getOrCreateUserId();
    setUserId(currentId);
    setCustomInput(currentId);
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    setLoadingMetrics(true);
    setMetricsError(null);
    try {
      const data = await apiClient.getMetrics();
      setMetrics(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load system metrics.";
      setMetricsError(msg);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const handleCopyUserId = () => {
    if (!userId) return;
    navigator.clipboard.writeText(userId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveCustomUserId = () => {
    const clean = customInput.trim();
    if (!clean) {
      setIdError("User ID cannot be empty.");
      return;
    }
    const sanitized = clean.replace(/[^a-zA-Z0-9_-]/g, "_");
    if (!sanitized) {
      setIdError("User ID must contain valid alphanumeric characters.");
      return;
    }

    localStorage.setItem("nexusai_user_id", sanitized);
    setUserId(sanitized);
    setIsEditingUserId(false);
    setIdError(null);
    window.location.reload();
  };

  const handleResetUserId = () => {
    if (
      window.confirm(
        "Generate a new random Workspace User ID? Your repository view will switch to a fresh isolated workspace."
      )
    ) {
      const newId = `usr_${Math.random().toString(36).substring(2, 11)}_${Date.now().toString(36)}`;
      localStorage.setItem("nexusai_user_id", newId);
      setUserId(newId);
      setCustomInput(newId);
      window.location.reload();
    }
  };

  const handleClearChatHistory = () => {
    if (window.confirm("Clear all locally saved chat history?")) {
      try {
        sessionStorage.removeItem("nexusai_rag_chat_messages");
        setCacheCleared(true);
        setTimeout(() => setCacheCleared(false), 2500);
      } catch {
        // Ignore
      }
    }
  };

  return (
    <AppShell
      title="Workspace Settings"
      description="Manage workspace isolation, custom user IDs, vector store provider, and operational telemetry."
    >
      <div className="max-w-5xl space-y-6">
        {/* 1. USER ID & WORKSPACE ISOLATION */}
        <div className="rounded-3xl border border-[#1E293B] bg-[#0E131F] p-6 sm:p-7 shadow-lg space-y-5">
          <div className="flex items-start justify-between border-b border-[#1E293B] pb-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Browser Workspace Isolation
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Unique client identifier isolating your document repository and vector searches.
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400 border border-emerald-500/20">
              Active Workspace
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-mono uppercase tracking-wider text-zinc-400">
                Your Workspace User ID:
              </label>
              {!isEditingUserId && (
                <button
                  onClick={() => {
                    setIsEditingUserId(true);
                    setCustomInput(userId);
                    setIdError(null);
                  }}
                  className="flex items-center gap-1.5 text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>Customize User ID</span>
                </button>
              )}
            </div>

            {isEditingUserId ? (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <input
                    type="text"
                    value={customInput}
                    onChange={(e) => setCustomInput(e.target.value)}
                    placeholder="Enter custom User ID (e.g. my_workspace_1)..."
                    className="flex-1 rounded-2xl border border-indigo-500/50 bg-[#080B11] px-4 py-3 font-mono text-xs text-indigo-300 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    autoFocus
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSaveCustomUserId}
                      className="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 py-3 text-xs font-semibold text-white hover:bg-indigo-500 transition-all shadow-sm"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save & Switch</span>
                    </button>
                    <button
                      onClick={() => {
                        setIsEditingUserId(false);
                        setIdError(null);
                      }}
                      className="flex items-center justify-center rounded-2xl border border-[#1E293B] bg-[#141B2D] p-3 text-zinc-400 hover:text-white transition-colors"
                      title="Cancel"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                {idError && (
                  <p className="text-xs text-rose-400">{idError}</p>
                )}
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Type any custom workspace name (e.g., <code className="text-indigo-300 font-mono">my_workspace</code> or <code className="text-indigo-300 font-mono font-semibold">team_alpha</code>). You can switch between custom IDs anytime!
                </p>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1 rounded-2xl border border-[#1E293B] bg-[#080B11] px-4 py-3 font-mono text-xs text-indigo-300 font-semibold select-all truncate">
                  {userId || "Loading User ID..."}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyUserId}
                    className="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-2xl border border-[#1E293B] bg-[#141B2D] px-4 py-3 text-xs font-semibold text-zinc-200 hover:bg-[#1E293B] hover:text-white transition-all shadow-sm"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 text-indigo-400" />
                        <span>Copy ID</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleResetUserId}
                    className="flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-all shadow-sm"
                    title="Generate a new random isolated workspace ID"
                  >
                    <RefreshCw className="h-4 w-4 text-rose-400" />
                    <span>Randomize</span>
                  </button>
                </div>
              </div>
            )}

            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Your User ID is saved in your browser&apos;s <code className="text-indigo-400 font-mono">localStorage</code>. Documents uploaded under this ID remain isolated to your session.
            </p>
          </div>
        </div>

        {/* 2. VECTOR STORE INFRASTRUCTURE & TELEMETRY */}
        <div className="rounded-3xl border border-[#1E293B] bg-[#0E131F] p-6 sm:p-7 shadow-lg space-y-5">
          <div className="flex items-start justify-between border-b border-[#1E293B] pb-4">
            <div className="flex items-center gap-3.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-600/20 text-purple-400 border border-purple-500/30 shadow-sm">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">
                  Vector Store & System Telemetry
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Operational metrics for vector embeddings and document indexing.
                </p>
              </div>
            </div>
            <button
              onClick={fetchMetrics}
              disabled={loadingMetrics}
              className="rounded-xl border border-[#1E293B] bg-[#141B2D] p-2 text-zinc-400 hover:text-white disabled:opacity-50 transition-colors"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`h-4 w-4 ${loadingMetrics ? "animate-spin text-indigo-400" : ""}`} />
            </button>
          </div>

          {loadingMetrics ? (
            <div className="flex items-center justify-center p-8 text-xs text-zinc-400 gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-indigo-400" />
              <span>Fetching telemetry metrics from production backend...</span>
            </div>
          ) : metricsError ? (
            <div className="flex items-center gap-3 rounded-2xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-300">
              <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
              <span>{metricsError}</span>
            </div>
          ) : metrics ? (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#1E293B] bg-[#080B11] p-4">
                <div className="flex items-center gap-2 text-xs text-zinc-300">
                  <Cpu className="h-4 w-4 text-purple-400" />
                  <span className="font-semibold">Active Vector Provider:</span>
                </div>
                <span className="rounded-full bg-purple-500/10 px-3.5 py-1 text-xs font-bold text-purple-300 border border-purple-500/20 font-mono uppercase">
                  {metrics.vector_provider} (Inner Product Cosine Similarity)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="rounded-2xl border border-[#1E293B] bg-[#080B11] p-4 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Total Documents</span>
                  <div className="text-lg font-bold text-white font-mono">{metrics.total_documents}</div>
                </div>

                <div className="rounded-2xl border border-[#1E293B] bg-[#080B11] p-4 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Indexed Documents</span>
                  <div className="text-lg font-bold text-emerald-400 font-mono">{metrics.total_indexed_documents}</div>
                </div>

                <div className="rounded-2xl border border-[#1E293B] bg-[#080B11] p-4 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Total Chunks</span>
                  <div className="text-lg font-bold text-purple-400 font-mono">{metrics.total_chunks_created}</div>
                </div>

                <div className="rounded-2xl border border-[#1E293B] bg-[#080B11] p-4 space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Embeddings Created</span>
                  <div className="text-lg font-bold text-indigo-400 font-mono">{metrics.total_embeddings_created}</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* 3. RAG ARCHITECTURE CONFIGURATION */}
        <div className="rounded-3xl border border-[#1E293B] bg-[#0E131F] p-6 sm:p-7 shadow-lg space-y-5">
          <div className="flex items-center gap-3.5 border-b border-[#1E293B] pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                RAG Engine Architecture
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                System parameters and LLM synthesis configurations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="rounded-2xl border border-[#1E293B] bg-[#080B11] p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">LLM Synthesis Engine</span>
              <div className="font-semibold text-white">Google Gemini 2.5 Flash</div>
            </div>

            <div className="rounded-2xl border border-[#1E293B] bg-[#080B11] p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Embedding Model</span>
              <div className="font-mono text-indigo-300 font-semibold">models/gemini-embedding-001 (3072d)</div>
            </div>

            <div className="rounded-2xl border border-[#1E293B] bg-[#080B11] p-4 space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Security Status</span>
              <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                <span>Prompt Injection Defense Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. LOCAL STORAGE MAINTENANCE */}
        <div className="rounded-3xl border border-[#1E293B] bg-[#0E131F] p-6 sm:p-7 shadow-lg space-y-5">
          <div className="flex items-center gap-3.5 border-b border-[#1E293B] pb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-600/20 text-rose-400 border border-rose-500/30 shadow-sm">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">
                Storage & Cache Maintenance
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Clear locally cached chat sessions and transient browser data.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xs font-semibold text-white">Clear Chat Session History</h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Resets locally persisted conversation turns stored in your browser session.
              </p>
            </div>

            <button
              onClick={handleClearChatHistory}
              className="flex items-center gap-2 rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-all shrink-0"
            >
              <Trash2 className="h-4 w-4 text-rose-400" />
              <span>{cacheCleared ? "Chat History Cleared!" : "Clear Chat History"}</span>
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
