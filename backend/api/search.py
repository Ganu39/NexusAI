"""API router for document indexing and semantic similarity search."""

from fastapi import APIRouter, HTTPException, status

from models.search import (
    IndexingResponse,
    SearchQuery,
    SearchResponse,
)
from services.embedding import GeminiEmbeddingProvider
from services.indexing import DocumentIndexingService
from services.vector_store import FAISSVectorStore

router = APIRouter(tags=["Search & Indexing"])


@router.post(
    "/documents/{document_id}/index",
    response_model=IndexingResponse,
    status_code=status.HTTP_200_OK,
    summary="Index an extracted document into vector store",
)
async def index_document_endpoint(document_id: str):
    """Index an extracted document by document_id."""
    try:
        service = DocumentIndexingService()
        return service.index_document(document_id)
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document indexing failed: {str(e)}",
        )


@router.post(
    "/search",
    response_model=SearchResponse,
    status_code=status.HTTP_200_OK,
    summary="Semantic similarity search over indexed chunks",
)
async def search_endpoint(query: SearchQuery):
    """Perform vector similarity search over indexed document chunks."""
    try:
        provider = GeminiEmbeddingProvider()
        query_vector = provider.embed_query(query.query)

        vector_store = FAISSVectorStore()
        vector_store.load_local()

        results = vector_store.similarity_search(
            query_embedding=query_vector, top_k=query.top_k
        )

        return SearchResponse(
            query=query.query,
            results=results,
            total_results=len(results),
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except RuntimeError as re:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(re),
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while executing search.",
        )
