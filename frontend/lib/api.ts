import {
  DocumentDeleteResponse,
  DocumentListResponse,
  IngestedDocumentSummary,
  UploadResponse,
} from "@/types";

const rawBaseUrl =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const API_BASE_URL = rawBaseUrl.replace(/\/+$/, "");

class ApiClientError extends Error {
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

export const apiClient = {
  /**
   * Upload a PDF, TXT, or DOCX document to backend.
   */
  async uploadDocument(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE_URL}/api/v1/upload`, {
      method: "POST",
      body: formData,
    });

    return handleResponse<UploadResponse>(response);
  },

  /**
   * List metadata summaries of all ingested documents.
   */
  async listDocuments(): Promise<DocumentListResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/documents`, {
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
    const response = await fetch(
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
   * Delete an ingested document metadata from storage by ID.
   */
  async deleteDocument(documentId: string): Promise<DocumentDeleteResponse> {
    const response = await fetch(
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
};
