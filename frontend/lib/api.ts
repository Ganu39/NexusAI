import {
  AskResponse,
  AskSource,
  DocumentDeleteResponse,
  DocumentListResponse,
  IndexingResponse,
  IngestedDocumentSummary,
  UploadResponse,
} from "@/types";

const rawBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "https://nexusai-1xq9.onrender.com";
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

export class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorDetail = "An unexpected error occurred.";
    try {
      const errorJson = await response.json();
      if (errorJson.detail) {
        errorDetail = errorJson.detail;
      }
    } catch {
      errorDetail = `HTTP ${response.status}: ${response.statusText}`;
    }
    throw new ApiClientError(errorDetail, response.status);
  }
  return response.json() as Promise<T>;
}

async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (err) {
    const errorMsg =
      err instanceof Error ? err.message : "Network error connecting to backend";
    throw new ApiClientError(
      `${errorMsg}. If the backend is idling on Render, it may take 15–30 seconds to wake up.`,
      0
    );
  }
}

export interface SystemMetrics {
  service: string;
  vector_provider: string;
  total_documents: int;
  total_indexed_documents: int;
  total_chunks_created: int;
  total_embeddings_created: int;
  storage_directory_exists: boolean;
}

export const apiClient = {
  /**
   * Upload a PDF, TXT, or DOCX document to backend.
   */
  async uploadDocument(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await safeFetch(`${API_BASE_URL}/api/v1/upload`, {
      method: "POST",
      body: formData,
    });

    return handleResponse<UploadResponse>(response);
  },

  /**
   * List metadata summaries of all ingested documents.
   */
  async listDocuments(): Promise<DocumentListResponse> {
    const response = await safeFetch(`${API_BASE_URL}/api/v1/documents`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    return handleResponse<DocumentListResponse>(response);
  },

  /**
   * Get metadata summary of a specific document by ID.
   */
  async getDocument(documentId: string): Promise<IngestedDocumentSummary> {
    const response = await safeFetch(
      `${API_BASE_URL}/api/v1/documents/${encodeURIComponent(documentId)}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      }
    );

    return handleResponse<IngestedDocumentSummary>(response);
  },

  /**
   * Chunk, embed, and index an ingested document into FAISS vector store.
   */
  async indexDocument(documentId: string): Promise<IndexingResponse> {
    const response = await safeFetch(
      `${API_BASE_URL}/api/v1/documents/${encodeURIComponent(documentId)}/index`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      }
    );

    return handleResponse<IndexingResponse>(response);
  },

  /**
   * Delete an ingested document metadata from storage by ID.
   */
  async deleteDocument(documentId: string): Promise<DocumentDeleteResponse> {
    const response = await safeFetch(
      `${API_BASE_URL}/api/v1/documents/${encodeURIComponent(documentId)}`,
      {
        method: "DELETE",
        headers: {
          Accept: "application/json",
        },
      }
    );

    return handleResponse<DocumentDeleteResponse>(response);
  },

  /**
   * Execute grounded RAG answer generation with source attributions.
   */
  async askQuestion(question: string, topK: number = 5): Promise<AskResponse> {
    const response = await safeFetch(`${API_BASE_URL}/api/v1/ask`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ question, top_k: topK }),
    });

    return handleResponse<AskResponse>(response);
  },

  /**
   * Stream grounded RAG answer tokens using Server-Sent Events (SSE).
   */
  async askQuestionStream(
    question: string,
    topK: number = 5,
    onMetadata: (sources: AskSource[], grounded: boolean, retrievedChunks: number) => void,
    onToken: (token: string) => void
  ): Promise<void> {
    const response = await safeFetch(`${API_BASE_URL}/api/v1/ask/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify({ question, top_k: topK }),
    });

    if (!response.ok || !response.body) {
      throw new ApiClientError(`Streaming request failed (HTTP ${response.status})`, response.status);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const parsed = JSON.parse(line.slice(6));
            if (parsed.event === "metadata") {
              onMetadata(parsed.sources || [], Boolean(parsed.grounded), parsed.retrieved_chunks || 0);
            } else if (parsed.event === "token" && parsed.text) {
              onToken(parsed.text);
            }
          } catch {
            // Ignore malformed JSON chunks
          }
        }
      }
    }
  },

  /**
   * Get operational metrics and vector store provider.
   */
  async getMetrics(): Promise<SystemMetrics> {
    const response = await safeFetch(`${API_BASE_URL}/api/v1/metrics`, {
      method: "GET",
      headers: { Accept: "application/json" },
    });
    return handleResponse<SystemMetrics>(response);
  },
};
