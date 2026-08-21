"""Document and API response schemas for Phase 2A Data Ingestion."""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class DocumentPage(BaseModel):
    """Represents a single page or segment of an ingested document."""

    page_number: Optional[int] = Field(
        default=None,
        description="1-based page number if applicable (e.g. PDF), else None",
    )
    text: str = Field(description="Extracted clean text for page/segment")


class IngestedDocument(BaseModel):
    """Internal model representing an ingested document."""

    document_id: str = Field(description="Unique internal document id")
    filename: str = Field(description="Sanitized original filename")
    file_type: str = Field(
        description="Normalized file extension (pdf, txt, docx)"
    )
    mime_type: str = Field(description="Validated MIME type")
    file_size: int = Field(description="File size in bytes")
    created_at: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="ISO 8601 UTC timestamp of ingestion",
    )
    page_count: int = Field(
        default=1, description="Total number of pages/sections"
    )
    character_count: int = Field(
        description="Total character count across all pages"
    )
    pages: List[DocumentPage] = Field(
        description="Structured page representation"
    )
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Additional document metadata"
    )
    is_indexed: bool = Field(
        default=False, description="Whether vectors are indexed in FAISS"
    )
    processing_status: str = Field(
        default="uploaded",
        description="Lifecycle status: uploaded, indexing, indexed, failed",
    )
    chunks_created: int = Field(
        default=0, description="Total text chunks generated for indexing"
    )
    embeddings_created: int = Field(
        default=0, description="Total Gemini embeddings generated"
    )
    indexed_at: Optional[str] = Field(
        default=None, description="ISO 8601 UTC timestamp when indexed"
    )


class IngestedDocumentSummary(BaseModel):
    """Document summary returned in API responses (excluding full text)."""

    document_id: str
    filename: str
    file_type: str
    file_size: int
    page_count: int
    character_count: int
    created_at: Optional[str] = None
    is_indexed: bool = False
    processing_status: str = "uploaded"
    chunks_created: int = 0
    embeddings_created: int = 0
    indexed_at: Optional[str] = None


class UploadResponse(BaseModel):
    """API response model for POST /upload."""

    success: bool = True
    document: IngestedDocumentSummary
    status: str = "extracted"


class DocumentListResponse(BaseModel):
    """API response model for GET /documents."""

    documents: List[IngestedDocumentSummary]
    total: int


class DocumentDeleteResponse(BaseModel):
    """API response model for DELETE /documents/{document_id}."""

    success: bool
    document_id: str
    message: str
