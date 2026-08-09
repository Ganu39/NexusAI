"""Pydantic model for text chunks."""

from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class TextChunk(BaseModel):
    """Represents a text chunk created from an ingested document."""

    chunk_id: str = Field(description="Deterministic chunk identifier")
    document_id: str = Field(description="Source document identifier")
    page_number: Optional[int] = Field(
        default=None, description="1-based page number if available"
    )
    chunk_index: int = Field(
        description="Sequential index of the chunk within page/document"
    )
    text: str = Field(description="Extracted chunk text content")
    character_count: int = Field(description="Character count of chunk text")
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Chunk metadata"
    )
