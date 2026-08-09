"""Request and response models for Search and Indexing APIs."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class SearchQuery(BaseModel):
    """Search request payload model."""

    query: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Search query string (1-2000 characters)",
    )
    top_k: int = Field(
        default=5,
        ge=1,
        le=50,
        description="Number of top matching results to return (1-50)",
    )


class SearchResult(BaseModel):
    """Single search result match."""

    chunk_id: str
    document_id: str
    page_number: Optional[int] = None
    chunk_index: int
    text: str
    score: float
    metadata: Dict[str, Any] = Field(default_factory=dict)


class SearchResponse(BaseModel):
    """Search response payload model."""

    query: str
    results: List[SearchResult]
    total_results: int


class IndexingResponse(BaseModel):
    """Response payload for document indexing."""

    document_id: str
    chunks_created: int
    embeddings_created: int
    indexed: bool
