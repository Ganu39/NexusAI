"use client";

import React, { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { DocumentUploader } from "@/components/documents/document-uploader";
import { DocumentList } from "@/components/documents/document-list";
import { apiClient } from "@/lib/api";
import { IngestedDocumentSummary } from "@/types";
import { RefreshCw, MessageSquare, Plus, Library } from "lucide-react";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<IngestedDocumentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const uploadSectionRef = useRef<HTMLDivElement>(null);

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
          : "Failed to load documents from NexusAI backend.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const scrollToUpload = () => {
    uploadSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <AppShell
      title="Knowledge Library"
      description="Upload, index, inspect and manage your knowledge."
      action={
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={scrollToUpload}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>+ Upload Document</span>
          </button>
          <Link
            href="/chat"
            className="flex items-center gap-2 rounded-xl border border-indigo-500/30 bg-[#0E131F] px-4 py-2 text-xs font-semibold text-indigo-300 hover:bg-[#141B2D] hover:text-white transition-all"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Open RAG Chat</span>
          </Link>
          <button
            onClick={fetchDocuments}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl border border-[#1E293B] bg-[#0E131F] px-3.5 py-2 text-xs font-medium text-zinc-300 hover:bg-[#141B2D] hover:text-white transition-all disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Upload Experience Section */}
        <section ref={uploadSectionRef} className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                Document Ingestion
              </h2>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">
              PDF • TXT • DOCX (Max 10MB)
            </span>
          </div>
          <div className="rounded-2xl border border-[#1E293B] bg-[#0E131F] p-6 shadow-sm">
            <DocumentUploader onUploadSuccess={() => fetchDocuments()} />
          </div>
        </section>

        {/* Knowledge Repository Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Library className="h-4 w-4 text-indigo-400" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300">
                Indexed Documents
              </h2>
              <span className="rounded-full bg-[#141B2D] border border-[#1E293B] px-2.5 py-0.5 text-xs font-semibold text-indigo-400 font-mono">
                {documents.length}
              </span>
            </div>
          </div>

          <DocumentList
            documents={documents}
            loading={loading}
            error={error}
            onRefresh={fetchDocuments}
          />
        </section>
      </div>
    </AppShell>
  );
}

