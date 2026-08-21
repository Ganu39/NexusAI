"""Document storage service for persisting and retrieving documents."""

import os
from typing import List, Optional
from config.settings import settings
from models.document import IngestedDocument, IngestedDocumentSummary


def save_document(doc: IngestedDocument) -> str:
    """Save an IngestedDocument to local JSON storage."""
    os.makedirs(settings.DOCUMENTS_DIR, exist_ok=True)
    file_path = os.path.join(settings.DOCUMENTS_DIR, f"{doc.document_id}.json")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(doc.model_dump_json(indent=2))
    return file_path


def get_stored_document(document_id: str) -> Optional[IngestedDocument]:
    """Retrieve an IngestedDocument by document_id."""
    file_path = os.path.join(settings.DOCUMENTS_DIR, f"{document_id}.json")
    if not os.path.exists(file_path):
        return None
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = f.read()
        return IngestedDocument.model_validate_json(data)
    except Exception:
        return None


def list_stored_documents() -> List[IngestedDocumentSummary]:
    """List metadata summaries of all stored documents sorted by date desc."""
    if not os.path.exists(settings.DOCUMENTS_DIR):
        return []

    summaries: List[IngestedDocumentSummary] = []
    for filename in os.listdir(settings.DOCUMENTS_DIR):
        if not filename.endswith(".json"):
            continue
        doc_id = filename[:-5]
        doc = get_stored_document(doc_id)
        if doc:
            summaries.append(
                IngestedDocumentSummary(
                    document_id=doc.document_id,
                    filename=doc.filename,
                    file_type=doc.file_type,
                    file_size=doc.file_size,
                    page_count=doc.page_count,
                    character_count=doc.character_count,
                    created_at=doc.created_at,
                    is_indexed=doc.is_indexed,
                    processing_status=doc.processing_status,
                    chunks_created=doc.chunks_created,
                    embeddings_created=doc.embeddings_created,
                    indexed_at=doc.indexed_at,
                )
            )

    # Sort descending by created_at or document_id
    summaries.sort(key=lambda d: d.created_at or "", reverse=True)
    return summaries


def delete_stored_document(document_id: str) -> bool:
    """Delete a stored document JSON file from storage.

    Note: Deletes document metadata file. Does not rebuild FAISS vector index.
    """
    file_path = os.path.join(settings.DOCUMENTS_DIR, f"{document_id}.json")
    if not os.path.exists(file_path):
        return False
    try:
        os.remove(file_path)
        return True
    except Exception:
        return False
