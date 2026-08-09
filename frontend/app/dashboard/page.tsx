"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  HardDrive,
  Layers,
  FileCode,
  Upload,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { DocumentUploader } from "@/components/documents/document-uploader";
import { apiClient } from "@/lib/api";
import { IngestedDocumentSummary } from "@/types";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function DashboardPage() {
  const [documents, setDocuments] = useState<IngestedDocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.listDocuments();
      setDocuments(res.documents);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to connect to NexusAI backend service.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Calculate real metrics from backend data
  const totalDocs = documents.length;
  const totalSizeBytes = documents.reduce((acc, d) => acc + d.file_size, 0);
  const totalPages = documents.reduce((acc, d) => acc + d.page_count, 0);
  const totalChars = documents.reduce((acc, d) => acc + d.character_count, 0);

  const recentDocs = documents.slice(0, 5);

  return (
    <AppShell
      title="Knowledge Dashboard"
      description="Overview of your ingested documents and document intelligence knowledge base."
      action={
        <Link
          href="/documents"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500"
        >
          <Upload className="h-4 w-4" />
          <span>Upload Documents</span>
        </Link>
      }
    >
      <div className="space-y-8">
        {/* Banner Card */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/60 via-purple-950/40 to-zinc-950 p-6 md:p-8">
          <div className="relative z-10 max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Phase 2 RAG Engine Ready</span>
            </div>
            <h2 className="text-xl font-bold text-white md:text-2xl">
              Welcome to NexusAI Workspace
            </h2>
            <p className="text-sm text-zinc-400">
              Upload your documents to extract structure, build vector index embeddings,
              and prepare your knowledge base for grounded AI answers.
            </p>
          </div>
          <div className="absolute right-0 top-0 hidden h-full w-1/3 bg-gradient-to-l from-indigo-500/10 to-transparent md:block" />
        </div>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Documents"
            value={loading ? "..." : totalDocs}
            subtitle={totalDocs === 1 ? "1 document stored" : `${totalDocs} documents stored`}
            icon={FileText}
            color="indigo"
          />
          <StatCard
            title="Storage Used"
            value={loading ? "..." : formatBytes(totalSizeBytes)}
            subtitle="Raw document storage"
            icon={HardDrive}
            color="emerald"
          />
          <StatCard
            title="Pages Processed"
            value={loading ? "..." : totalPages.toLocaleString()}
            subtitle="Structured page sections"
            icon={Layers}
            color="purple"
          />
          <StatCard
            title="Total Characters"
            value={loading ? "..." : totalChars.toLocaleString()}
            subtitle="Extracted document text"
            icon={FileCode}
            color="amber"
          />
        </div>

        {/* Two Column Section */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Quick Upload CTA */}
          <div className="space-y-4 lg:col-span-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Quick Upload</h3>
              <span className="text-xs text-zinc-500">PDF, TXT, DOCX</span>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              <DocumentUploader
                compact
                onUploadSuccess={() => fetchDocuments()}
              />
            </div>
          </div>

          {/* Recent Uploads Table/List */}
          <div className="space-y-4 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Recent Documents</h3>
              <Link
                href="/documents"
                className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300"
              >
                <span>View all</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4">
              {loading ? (
                <div className="space-y-3 p-4">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-12 w-full animate-pulse rounded-lg bg-zinc-800/40"
                    />
                  ))}
                </div>
              ) : error ? (
                <div className="p-4 text-xs text-rose-400">{error}</div>
              ) : recentDocs.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">
                  No documents available. Upload a file to get started.
                </div>
              ) : (
                <div className="divide-y divide-zinc-800/60">
                  {recentDocs.map((doc) => (
                    <div
                      key={doc.document_id}
                      className="flex items-center justify-between py-3 px-2 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-zinc-800 text-zinc-400">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-white truncate max-w-[220px]">
                            {doc.filename}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {formatBytes(doc.file_size)} • {doc.page_count} pages
                          </span>
                        </div>
                      </div>
                      <Link
                        href={`/documents/${doc.document_id}`}
                        className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white"
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Getting Started Guide */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 space-y-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <span>Getting Started with NexusAI</span>
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 text-xs">
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 space-y-2">
              <div className="font-semibold text-indigo-400">1. Upload Knowledge</div>
              <p className="text-zinc-400">
                Upload PDF, TXT, or DOCX documents to extract structured text and metadata.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 space-y-2">
              <div className="font-semibold text-purple-400">2. Vector Search</div>
              <p className="text-zinc-400">
                Documents are chunked and embedded via Gemini into local FAISS index.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-4 space-y-2">
              <div className="font-semibold text-emerald-400">3. Grounded RAG</div>
              <p className="text-zinc-400">
                Queries trigger context building and Gemini 2.5 Flash grounded answers.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
