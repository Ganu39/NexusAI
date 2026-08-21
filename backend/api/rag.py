"""FastAPI router for RAG answer generation endpoints."""

import json
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import StreamingResponse
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
    """Answer a user question based on uploaded document context."""
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


@router.post(
    "/ask/stream",
    status_code=status.HTTP_200_OK,
    summary="Stream RAG answer tokens using Server-Sent Events (SSE)",
)
async def ask_question_stream(request: AskRequest):
    """Stream grounded RAG tokens via Server-Sent Events (SSE)."""
    try:
        rag_service = RAGService()
        sources, grounded, token_gen = (
            rag_service.answer_question_stream(request)
        )

        def event_generator():
            # Event 1: Initial metadata payload
            meta_payload = {
                "event": "metadata",
                "sources": [src.model_dump() for src in sources],
                "retrieved_chunks": len(sources),
                "grounded": grounded,
            }
            yield f"data: {json.dumps(meta_payload)}\n\n"

            # Event 2: Incremental text tokens
            for token in token_gen:
                token_payload = {"event": "token", "text": token}
                yield f"data: {json.dumps(token_payload)}\n\n"

            # Event 3: Done signal
            done_payload = {"event": "done"}
            yield f"data: {json.dumps(done_payload)}\n\n"

        return StreamingResponse(
            event_generator(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Streaming RAG answer failed: {str(e)}",
        )
