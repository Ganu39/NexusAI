"use client";

import React, { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Trash2,
  Calendar,
  Layers,
  FileCode,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Shield,
  Cpu,
  Sparkles,
} from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { apiClient } from "@/lib/api";
import { IngestedDocumentSummary } from "@/types";

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(isoString?: string | null): string {
  if (!isoString) return "Unknown";
  try {
    const d = new Date(isoString);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Unknown";
  }
}

interface PageParams {
  params: Promise<{ documentId: string }>;
}

export default function DocumentDetailPage({ params }: PageParams) {
  const resolvedParams = use(params);
  const documentId = resolvedParams.documentId;
  const router = useRouter();

  const [doc, setDoc] = useState<IngestedDocumentSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [indexing, setIndexing] = useState(false);
  const [indexResult, setIndexResult] = useState<{
    chunks: number;
    embeddings: number;
  } | null>(null);

  useEffect(() => {
    async function loadDoc() {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.getDocument(documentId);
        setDoc(data);
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : "Document not found or backend unavailable.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    loadDoc();
  }, [documentId]);

  const handleIndex = async () => {
    if (!doc) return;
    setIndexing(true);
    setError(null);
    try {
      const res = await apiClient.indexDocument(doc.document_id);
      setIndexResult({
        chunks: res.chunks_created,
        embeddings: res.embeddings_created,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to generate vector index.";
      setError(msg);
    } finally {
      setIndexing(false);
    }
  };

  const handleDelete = async () => {
    if (!doc) return;
    if (
      !window.confirm(
        `Are you sure you want to delete "${doc.filename}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    setDeleting(true);
    try {
      await apiClient.deleteDocument(doc.document_id);
      router.push("/documents");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete document.";
      alert(msg);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AppShell
      title={doc ? doc.filename : "Document Details"}
      description={`Document ID: ${documentId}`}
      action={
        <div className="flex items-center gap-3">
          <Link
            href="/documents"
            className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Documents</span>
          </Link>
          {doc && (
            <>
              <button
                onClick={handleIndex}
                disabled={indexing || deleting}
                className="flex items-center gap-2 rounded-lg border border-indigo-500/20 bg-indigo-600/10 px-4 py-2 text-sm font-semibold text-indigo-300 hover:bg-indigo-600/20 disabled:opacity-50"
              >
                {indexing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Cpu className="h-4 w-4" />
                )}
                <span>{indexResult ? "Re-Index Vector" : "Index Vector"}</span>
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting || indexing}
                className="flex items-center gap-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-500/20 disabled:opacity-50"
              >
                {deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                <span>Delete Document</span>
              </button>
            </>
          )}
        </div>
      }
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center p-16 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
          <p className="text-sm text-zinc-400">Loading document details...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 p-12 text-center text-rose-300 space-y-4">
          <AlertCircle className="h-10 w-10 text-rose-400" />
          <div>
            <h3 className="text-lg font-semibold text-rose-200">
              Document Error
            </h3>
            <p className="mt-1 text-xs text-rose-300/80">{error}</p>
          </div>
          <Link
            href="/documents"
            className="rounded-lg bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500"
          >
            Return to Documents
          </Link>
        </div>
      ) : doc ? (
        <div className="space-y-8">
          {/* Header Card */}
          <div className="flex items-start justify-between rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 md:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
                <FileText className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{doc.filename}</h2>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-semibold text-zinc-300 uppercase">
                    {doc.file_type}
                  </span>
                </div>
                <p className="text-xs font-mono text-zinc-500">
                  ID: {doc.document_id}
                </p>
              </div>
            </div>

            {indexResult ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300 border border-purple-500/20">
                <Sparkles className="h-3.5 w-3.5 text-purple-400" />
                Indexed ({indexResult.chunks} Chunks)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Uploaded & Ingested
              </span>
            )}
          </div>

          {/* Index Result Banner */}
          {indexResult && (
            <div className="flex items-center gap-3 rounded-xl border border-purple-500/20 bg-purple-500/10 p-4 text-purple-300 text-sm">
              <Sparkles className="h-5 w-5 text-purple-400 shrink-0" />
              <div>
                <p className="font-semibold text-purple-200">
                  Document Vector Embeddings Generated Successfully!
                </p>
                <p className="text-xs text-purple-300/80 mt-0.5">
                  Created {indexResult.chunks} page-aware text chunks and{" "}
                  {indexResult.embeddings} Gemini vector embeddings in local FAISS
                  index.
                </p>
              </div>
            </div>
          )}

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <HardDrive className="h-4 w-4 text-emerald-400" />
                <span>File Size</span>
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {formatBytes(doc.file_size)}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Layers className="h-4 w-4 text-purple-400" />
                <span>Page Count</span>
              </div>
              <div className="text-xl font-bold text-white">
                {doc.page_count} {doc.page_count === 1 ? "Page" : "Pages"}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <FileCode className="h-4 w-4 text-amber-400" />
                <span>Character Count</span>
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {doc.character_count.toLocaleString()}
              </div>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5 space-y-2">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <Calendar className="h-4 w-4 text-indigo-400" />
                <span>Uploaded Date</span>
              </div>
              <div className="text-sm font-semibold text-white">
                {formatDate(doc.created_at)}
              </div>
            </div>
          </div>

          {/* System Info Card */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/20 p-6 space-y-3">
            <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-400" />
              <span>Document Processing Information</span>
            </h3>
            <div className="text-xs text-zinc-400 space-y-1">
              <p>
                • Structured text extraction completed preserving page boundaries.
              </p>
              <p>
                • Full document text is safely stored in backend isolated storage.
              </p>
              <p>
                • Vector embeddings generated via Gemini (`models/gemini-embedding-001`) and indexed in FAISS vector store.
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
