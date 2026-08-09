"""API endpoint for file upload and document ingestion."""

import os
import re
import uuid
from typing import Set
from fastapi import APIRouter, File, HTTPException, UploadFile, status

from config.settings import settings
from models.document import (
    DocumentDeleteResponse,
    DocumentListResponse,
    IngestedDocument,
    IngestedDocumentSummary,
    UploadResponse,
)
from services.extractor import get_extractor

router = APIRouter(tags=["Ingestion"])

ALLOWED_EXTENSIONS: Set[str] = {"pdf", "txt", "docx"}
ALLOWED_MIME_TYPES: Set[str] = {
    "application/pdf",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "application/octet-stream",
}


def sanitize_filename(filename: str) -> str:
    """Sanitize original filename to prevent path traversal."""
    if not filename:
        return "unnamed_document"
    base = os.path.basename(filename)
    sanitized = re.sub(r"[^a-zA-Z0-9_.-]", "_", base)
    return sanitized or "unnamed_document"


def get_extension(filename: str) -> str:
    """Extract and normalize file extension."""
    parts = filename.rsplit(".", 1)
    if len(parts) > 1:
        return parts[1].lower()
    return ""


@router.post(
    "/upload",
    response_model=UploadResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload and ingest a document",
)
async def upload_document(file: UploadFile = File(...)):
    """Accept PDF, TXT, or DOCX, validate, and extract text/metadata."""
    if not file or not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No file provided.",
        )

    filename = sanitize_filename(file.filename)
    ext = get_extension(filename)

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported file extension '.{ext}'. "
                "Allowed types: pdf, txt, docx."
            ),
        )

    if file.content_type and file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Unsupported MIME type '{file.content_type}'. "
                "Allowed types: PDF, TXT, DOCX."
            ),
        )

    content = await file.read()

    if len(content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    max_bytes = settings.MAX_UPLOAD_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"File size ({len(content)} bytes) exceeds maximum limit "
                f"of {settings.MAX_UPLOAD_SIZE_MB}MB."
            ),
        )

    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    document_id = str(uuid.uuid4())
    temp_file_path = os.path.join(settings.UPLOAD_DIR, f"{document_id}.{ext}")

    try:
        with open(temp_file_path, "wb") as f:
            f.write(content)

        extractor = get_extractor(ext)
        pages, metadata = extractor.extract(temp_file_path)

        character_count = sum(len(page.text) for page in pages)
        page_count = len(pages)

        ingested_doc = IngestedDocument(
            document_id=document_id,
            filename=filename,
            file_type=ext,
            mime_type=file.content_type or "application/octet-stream",
            file_size=len(content),
            page_count=page_count,
            character_count=character_count,
            pages=pages,
            metadata=metadata,
        )

        from services.document_store import save_document
        save_document(ingested_doc)

        summary = IngestedDocumentSummary(
            document_id=ingested_doc.document_id,
            filename=ingested_doc.filename,
            file_type=ingested_doc.file_type,
            file_size=ingested_doc.file_size,
            page_count=ingested_doc.page_count,
            character_count=ingested_doc.character_count,
            created_at=ingested_doc.created_at,
        )

        return UploadResponse(
            success=True,
            document=summary,
            status="extracted",
        )

    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while processing document.",
        )
    finally:
        if os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass


@router.get(
    "/documents",
    response_model=DocumentListResponse,
    status_code=status.HTTP_200_OK,
    summary="List all uploaded document summaries",
)
async def list_documents() -> DocumentListResponse:
    """Retrieve metadata summaries of all ingested documents."""
    from services.document_store import list_stored_documents
    docs = list_stored_documents()
    return DocumentListResponse(documents=docs, total=len(docs))


@router.get(
    "/documents/{document_id}",
    response_model=IngestedDocumentSummary,
    status_code=status.HTTP_200_OK,
    summary="Get document summary by document_id",
)
async def get_document(document_id: str) -> IngestedDocumentSummary:
    """Retrieve metadata summary of a specific document."""
    from services.document_store import get_stored_document
    doc = get_stored_document(document_id)
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found.",
        )
    return IngestedDocumentSummary(
        document_id=doc.document_id,
        filename=doc.filename,
        file_type=doc.file_type,
        file_size=doc.file_size,
        page_count=doc.page_count,
        character_count=doc.character_count,
        created_at=doc.created_at,
    )


@router.delete(
    "/documents/{document_id}",
    response_model=DocumentDeleteResponse,
    status_code=status.HTTP_200_OK,
    summary="Delete an ingested document by document_id",
)
async def delete_document(document_id: str) -> DocumentDeleteResponse:
    """Safely delete stored document metadata.

    Note: Deletes document metadata file from storage.
    Does not rebuild FAISS vector index.
    """
    from services.document_store import delete_stored_document
    deleted = delete_stored_document(document_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID '{document_id}' not found.",
        )
    return DocumentDeleteResponse(
        success=True,
        document_id=document_id,
        message=f"Document '{document_id}' deleted successfully.",
    )
