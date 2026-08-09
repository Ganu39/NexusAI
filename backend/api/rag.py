"""FastAPI router for RAG answer generation endpoints."""

from fastapi import APIRouter, HTTPException, status
from models.rag import AskRequest, AskResponse
from services.rag import RAGService

router = APIRouter(tags=["RAG"])


@router.post(
    "/ask",
    response_model=AskResponse,
    status_code=status.HTTP_200_OK,
    summary="Answer a question using grounded RAG context",
    description=(
        "Performs semantic search over indexed document chunks, builds "
        "grounded context, and invokes Gemini LLM to synthesize an answer "
        "with source attribution."
    ),
)
async def ask_question(request: AskRequest) -> AskResponse:
    """Answer a user question based on uploaded document context.

    Args:
        request: AskRequest containing user question and top_k limit.

    Returns:
        AskResponse containing grounded answer and sources.
    """
    try:
        rag_service = RAGService()
        return rag_service.answer_question(request)
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
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while generating RAG answer: {str(e)}",
        )
