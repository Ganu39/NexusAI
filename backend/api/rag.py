"""FastAPI router for RAG answer generation endpoints."""

import json
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from middleware.user_context import get_current_user_id
from models.rag import AskRequest, AskResponse
from services.rag import RAGService

router = APIRouter(tags=["RAG"])


@router.post(
    "/ask",
    response_model=AskResponse,
    status_code=status.HTTP_200_OK,
    summary="Answer a question using grounded RAG context",
)
async def ask_question(
    request: AskRequest,
    user_id: str = Depends(get_current_user_id),
) -> AskResponse:
    """Answer a user question based on uploaded document context."""
    try:
        if request.user_id == "default_user" and user_id != "default_user":
            request.user_id = user_id
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
async def ask_question_stream(
    request: AskRequest,
    user_id: str = Depends(get_current_user_id),
):
    """Stream grounded RAG tokens via Server-Sent Events (SSE)."""
    try:
        if request.user_id == "default_user" and user_id != "default_user":
            request.user_id = user_id
        rag_service = RAGService()
        sources, grounded, token_gen = (
            rag_service.answer_question_stream(request)
        )

        def event_generator():
            meta_payload = {
                "event": "metadata",
                "sources": [src.model_dump() for src in sources],
                "retrieved_chunks": len(sources),
                "grounded": grounded,
            }
            yield f"data: {json.dumps(meta_payload)}\n\n"

            for token in token_gen:
                token_payload = {"event": "token", "text": token}
                yield f"data: {json.dumps(token_payload)}\n\n"

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
