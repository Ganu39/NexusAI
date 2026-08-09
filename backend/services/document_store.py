"""Document storage service for persisting and retrieving documents."""

import os
from typing import Optional
from config.settings import settings
from models.document import IngestedDocument


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
