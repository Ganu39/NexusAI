"""Pydantic data models for RAG answer generation."""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AskRequest(BaseModel):
    """Request model for /api/v1/ask endpoint."""

    question: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="The user query or question to answer.",
    )
    top_k: int = Field(
        default=5,
        ge=1,
        le=10,
        description="Maximum number of context chunks to retrieve (1-10).",
    )
    user_id: Optional[str] = Field(
        default="default_user",
        description="Owner user identifier for workspace isolation.",
    )


class AskSource(BaseModel):
    """Source attribution item for grounding information."""

    chunk_id: str = Field(..., description="Unique chunk ID.")
    document_id: str = Field(..., description="Unique document UUID.")
    filename: str = Field(..., description="Original filename.")
    page_number: Optional[int] = Field(
        default=None,
        description="Page number if paginated document, else null.",
    )
    score: float = Field(..., description="Similarity relevance score.")
    metadata: Dict[str, Any] = Field(
        default_factory=dict,
        description="Preserved chunk metadata.",
    )
    text_snippet: Optional[str] = Field(
        default=None,
        description="Raw text snippet of the retrieved chunk.",
    )


class AskResponse(BaseModel):
    """Response model for /api/v1/ask endpoint."""

    question: str = Field(..., description="The user question answered.")
    answer: str = Field(
        ...,
        description="The grounded answer or fallback message.",
    )
    sources: List[AskSource] = Field(
        default_factory=list,
        description="List of cited source chunks.",
    )
    retrieved_chunks: int = Field(
        ...,
        description="Total number of chunks used to construct context.",
    )
    grounded: bool = Field(
        ...,
        description="True if answered from retrieved document context.",
    )
