/**
 * Shared TypeScript types matching NexusAI backend API response models.
 */

export interface DocumentPage {
  page_number?: number | null;
  text: string;
}

export interface IngestedDocumentSummary {
  document_id: string;
  filename: string;
  file_type: string;
  file_size: number;
  page_count: number;
  character_count: number;
  created_at?: string | null;
}

export interface IngestedDocument extends IngestedDocumentSummary {
  mime_type: string;
  pages: DocumentPage[];
  metadata: Record<string, unknown>;
}

export interface UploadResponse {
  success: boolean;
  document: IngestedDocumentSummary;
  status: string;
}

export interface DocumentListResponse {
  documents: IngestedDocumentSummary[];
  total: number;
}

export interface DocumentDeleteResponse {
  success: boolean;
  document_id: string;
  message: string;
}

export interface ApiError {
  detail: string;
}
