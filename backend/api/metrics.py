"""Telemetry and system metrics API router for Phase 5."""

import os
from fastapi import APIRouter, status
from pydantic import BaseModel
from config.settings import settings
from services.document_store import list_stored_documents

router = APIRouter(tags=["Metrics & Infrastructure"])


class MetricsResponse(BaseModel):
    """System status telemetry and vector store metrics."""

    service: str = "nexusai-api"
    vector_provider: str
    total_documents: int
    total_indexed_documents: int
    total_chunks_created: int
    total_embeddings_created: int
    storage_directory_exists: bool


@router.get(
    "/metrics",
    response_model=MetricsResponse,
    status_code=status.HTTP_200_OK,
    summary="Get system telemetry and vector store metrics",
)
async def get_metrics() -> MetricsResponse:
    """Retrieve operational telemetry and vector store metrics."""
    docs = list_stored_documents()
    total_docs = len(docs)
    total_indexed = sum(1 for d in docs if d.is_indexed)
    total_chunks = sum(d.chunks_created for d in docs)
    total_embeddings = sum(d.embeddings_created for d in docs)

    provider = settings.VECTOR_STORE_PROVIDER or "faiss"

    return MetricsResponse(
        service="nexusai-api",
        vector_provider=provider.lower(),
        total_documents=total_docs,
        total_indexed_documents=total_indexed,
        total_chunks_created=total_chunks,
        total_embeddings_created=total_embeddings,
        storage_directory_exists=os.path.exists(settings.DOCUMENTS_DIR),
    )
