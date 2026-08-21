"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Trash2,
  ExternalLink,
  AlertCircle,
  Loader2,
  Cpu,
  Sparkles,
} from "lucide-react";
import { IngestedDocumentSummary } from "@/types";
import { apiClient } from "@/lib/api";

interface DocumentListProps {
  documents: IngestedDocumentSummary[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

interface IndexState {
  chunks: number;
  embeddings: number;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

function formatDate(isoString?: string | null): string {
  if (!isoString) return "Recently";
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Recently";
  }
}

export function DocumentList({
  documents,
  loading,
  error,
  onRefresh,
}: DocumentListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"date" | "name" | "size" | "status">("date");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [indexingId, setIndexingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [indexState, setIndexState] = useState<Record<string, IndexState>>({});

  const handleDelete = async (documentId: string, filename: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${filename}"? Metadata will be removed.`
      )
    ) {
      return;
    }

    setDeletingId(documentId);
    setActionError(null);

    try {
      await apiClient.deleteDocument(documentId);
      onRefresh();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to delete document.";
      setActionError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const handleIndex = async (documentId: string) => {
    setIndexingId(documentId);
    setActionError(null);

    try {
      const res = await apiClient.indexDocument(documentId);
      setIndexState((prev) => ({
        ...prev,
        [documentId]: {
          chunks: res.chunks_created,
          embeddings: res.embeddings_created,
        },
      }));
      onRefresh();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to generate vector index.";
      setActionError(msg);
    } finally {
      setIndexingId(null);
    }
  };

  // Filter & Sort Logic
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.filename
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType =
      typeFilter === "ALL" ||
      doc.file_type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesType;
  });

  const sortedDocs = [...filteredDocs].sort((a, b) => {
    if (sortBy === "name") {
      return a.filename.localeCompare(b.filename);
    }
    if (sortBy === "size") {
      return b.file_size - a.file_size;
    }
    if (sortBy === "status") {
      const aIndexed = a.is_indexed ? 1 : 0;
      const bIndexed = b.is_indexed ? 1 : 0;
      return bIndexed - aIndexed;
    }
    // Default: date created_at or recent
    const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
    const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
    return dateB - dateA;
  });

  if (loading && documents.length === 0) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-2xl border border-[#1E293B] bg-[#0E131F] p-4 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#141B2D]" />
              <div className="space-y-2">
                <div className="h-4 w-48 rounded bg-[#141B2D]" />
                <div className="h-3 w-32 rounded bg-[#141B2D]/60" />
              </div>
            </div>
            <div className="h-8 w-20 rounded bg-[#141B2D]" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-rose-500/20 bg-rose-500/10 p-8 text-center text-rose-300">
        <AlertCircle className="h-8 w-8 text-rose-400 mb-2" />
        <p className="font-semibold text-rose-200 text-sm">Failed to Load Documents</p>
        <p className="mt-1 text-xs text-rose-300/80">{error}</p>
        <button
          onClick={onRefresh}
          className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#1E293B] bg-[#0E131F]/40 p-12 text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#141B2D] border border-[#1E293B] text-zinc-500 mb-4">
          <FileText className="h-7 w-7 text-indigo-400" />
        </div>
        <h3 className="text-sm font-semibold text-zinc-200">
          No documents uploaded yet
        </h3>
        <p className="mt-1 max-w-sm text-xs text-zinc-500">
          Upload PDF, TXT, or DOCX files above to populate your NexusAI
          knowledge base.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-[#1E293B] bg-[#0E131F] p-3 shadow-sm">
        {/* Search Input */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by name..."
            className="w-full rounded-xl border border-[#1E293B] bg-[#080B11] px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["ALL", "PDF", "TXT", "DOCX"].map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                typeFilter === type
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "border border-[#1E293B] bg-[#080B11] text-zinc-400 hover:text-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="text-[11px] uppercase tracking-wider text-zinc-500">Sort:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "date" | "name" | "size" | "status")}
            className="rounded-xl border border-[#1E293B] bg-[#080B11] px-2.5 py-1.5 text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="date">Newest</option>
            <option value="name">Name</option>
            <option value="size">Size</option>
            <option value="status">Index Status</option>
          </select>
        </div>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden overflow-hidden rounded-2xl border border-[#1E293B] bg-[#0E131F] md:block shadow-sm">
        <table className="w-full text-left text-xs text-zinc-300">
          <thead className="border-b border-[#1E293B] bg-[#080B11]/60 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
            <tr>
              <th className="px-5 py-3.5">Document</th>
              <th className="px-3 py-3.5">Format</th>
              <th className="px-3 py-3.5">Size</th>
              <th className="px-3 py-3.5">Pages</th>
              <th className="px-3 py-3.5">Chars</th>
              <th className="px-3 py-3.5">Uploaded</th>
              <th className="px-3 py-3.5">Indexing Status</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E293B]">
            {sortedDocs.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-xs text-zinc-500">
                  No documents match your search & filter criteria.
                </td>
              </tr>
            ) : (
              sortedDocs.map((doc) => {
                const isIndexed = doc.is_indexed || Boolean(indexState[doc.document_id]);
                const chunks = doc.chunks_created || indexState[doc.document_id]?.chunks || 0;
                const isIndexing = indexingId === doc.document_id;
                const isDeleting = deletingId === doc.document_id;

                return (
                  <tr
                    key={doc.document_id}
                    className="transition-colors hover:bg-[#141B2D]/50"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#141B2D] text-indigo-400 border border-[#1E293B]">
                          <FileText className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-white truncate max-w-[200px]">
                            {doc.filename}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {doc.document_id.slice(0, 8)}...
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      <span className="rounded-lg bg-[#141B2D] border border-[#1E293B] px-2 py-0.5 text-[10px] font-semibold text-zinc-300 uppercase">
                        {doc.file_type}
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-zinc-400 font-mono">
                      {formatBytes(doc.file_size)}
                    </td>
                    <td className="px-3 py-3.5 text-zinc-400">
                      {doc.page_count}
                    </td>
                    <td className="px-3 py-3.5 text-zinc-400 font-mono">
                      {doc.character_count.toLocaleString()}
                    </td>
                    <td className="px-3 py-3.5 text-zinc-400">
                      {formatDate(doc.created_at)}
                    </td>
                    <td className="px-3 py-3.5">
                      {isIndexed ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-medium text-purple-300 border border-purple-500/20">
                          <Sparkles className="h-3 w-3 text-purple-400" />
                          <span>Indexed {chunks > 0 ? `(${chunks} Chunks)` : "in FAISS"}</span>
                        </span>
                      ) : isIndexing ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-[11px] font-medium text-indigo-300 border border-indigo-500/20">
                          <Loader2 className="h-3 w-3 animate-spin text-indigo-400" />
                          <span className="font-mono text-[10px]">Indexing...</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-400 border border-emerald-500/20">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span>Uploaded</span>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleIndex(doc.document_id)}
                          disabled={isIndexing || isDeleting}
                          className={`flex items-center gap-1 rounded-xl border px-2.5 py-1 text-xs font-semibold transition-all ${
                            isIndexed
                              ? "border-purple-500/20 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20"
                              : "border-indigo-500/20 bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600/20"
                          } disabled:opacity-50`}
                          title="Generate FAISS Vector Embeddings"
                        >
                          {isIndexing ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Cpu className="h-3 w-3" />
                          )}
                          <span>{isIndexed ? "Re-Index" : "Index"}</span>
                        </button>

                        <Link
                          href={`/documents/${doc.document_id}`}
                          className="rounded-xl p-1.5 text-zinc-400 hover:bg-[#141B2D] hover:text-white transition-colors"
                          title="View Details"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>

                        <button
                          onClick={() => handleDelete(doc.document_id, doc.filename)}
                          disabled={isDeleting || isIndexing}
                          className="rounded-xl p-1.5 text-zinc-400 hover:bg-rose-500/10 hover:text-rose-400 disabled:opacity-50 transition-colors"
                          title="Delete Document"
                        >
                          {isDeleting ? (
                            <Loader2 className="h-4 w-4 animate-spin text-rose-400" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Responsive Cards */}
      <div className="space-y-3 md:hidden">
        {sortedDocs.length === 0 ? (
          <div className="py-8 text-center text-xs text-zinc-500">
            No documents match your search & filter.
          </div>
        ) : (
          sortedDocs.map((doc) => {
            const isIndexed = doc.is_indexed || Boolean(indexState[doc.document_id]);
            const isIndexing = indexingId === doc.document_id;
            const isDeleting = deletingId === doc.document_id;

            return (
              <div
                key={doc.document_id}
                className="flex flex-col gap-3 rounded-2xl border border-[#1E293B] bg-[#0E131F] p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#141B2D] text-indigo-400 border border-[#1E293B]">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-xs">
                        {doc.filename}
                      </h4>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {formatBytes(doc.file_size)} • {doc.file_type.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {isIndexed ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 px-2 py-0.5 text-[10px] font-medium text-purple-300 border border-purple-500/20">
                      <Sparkles className="h-3 w-3 text-purple-400" />
                      Indexed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                      Uploaded
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-zinc-400 border-t border-[#1E293B] pt-3">
                  <div>Pages: {doc.page_count}</div>
                  <div>Chars: {doc.character_count.toLocaleString()}</div>
                  <div>Date: {formatDate(doc.created_at)}</div>
                  {isIndexed && (
                    <div>Status: Indexed in FAISS</div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-[#1E293B] pt-2">
                  <button
                    onClick={() => handleIndex(doc.document_id)}
                    disabled={isIndexing || isDeleting}
                    className="flex items-center gap-1.5 rounded-xl border border-indigo-500/20 bg-indigo-600/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-600/20 disabled:opacity-50"
                  >
                    {isIndexing ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Cpu className="h-3.5 w-3.5" />
                    )}
                    <span>{isIndexed ? "Re-Index" : "Index Vector"}</span>
                  </button>
                  <Link
                    href={`/documents/${doc.document_id}`}
                    className="flex items-center gap-1.5 rounded-xl border border-[#1E293B] bg-[#141B2D] px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-[#1E293B]"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    <span>Details</span>
                  </Link>
                  <button
                    onClick={() => handleDelete(doc.document_id, doc.filename)}
                    disabled={isDeleting || isIndexing}
                    className="flex items-center gap-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-3 py-1.5 text-xs font-medium text-rose-300 hover:bg-rose-500/20 disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
