"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { DocumentUploader } from "@/components/documents/document-uploader";
import { DocumentList } from "@/components/documents/document-list";
import { apiClient } from "@/lib/api";
import { IngestedDocumentSummary } from "@/types";
import { RefreshCw, MessageSquare } from "lucide-react";

export default function DocumentsPage() {
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
          : "Failed to load documents from NexusAI backend.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return (
    <AppShell
      title="Document Management"
      description="Ingest, view, and manage files in your NexusAI knowledge repository."
      action={
        <div className="flex items-center gap-3">
          <Link
            href="/chat"
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-500"
          >
            <MessageSquare className="h-4 w-4" />
            <span>Open RAG Chat</span>
          </Link>
          <button
            onClick={fetchDocuments}
            disabled={loading}
            className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      }
    >
      <div className="space-y-8">
        {/* Upload Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white">Upload New Document</h2>
            <span className="text-xs text-zinc-500">
              PDF, TXT, DOCX • Max 10MB
            </span>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
            <DocumentUploader onUploadSuccess={() => fetchDocuments()} />
          </div>
        </section>

        {/* Document Repository Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Repository Files</h2>
              <span className="rounded-full bg-zinc-800 px-2.5 py-0.5 text-xs font-semibold text-zinc-400 font-mono">
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
