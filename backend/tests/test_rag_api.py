"""Unit tests for /api/v1/ask API endpoint."""

from unittest.mock import patch
from fastapi.testclient import TestClient

from app.main import app
from models.rag import AskResponse, AskSource

client = TestClient(app)


def test_ask_validation_empty_question():
    """Verify empty question raises HTTP 422 error."""
    resp = client.post("/ask", json={"question": "", "top_k": 5})
    assert resp.status_code == 422


def test_ask_validation_oversized_question():
    """Verify question > 2000 chars raises HTTP 422 error."""
    resp = client.post("/ask", json={"question": "a" * 2001, "top_k": 5})
    assert resp.status_code == 422


def test_ask_validation_invalid_top_k():
    """Verify top_k < 1 or > 10 raises HTTP 422 error."""
    resp_0 = client.post("/ask", json={"question": "test", "top_k": 0})
    assert resp_0.status_code == 422

    resp_11 = client.post("/ask", json={"question": "test", "top_k": 11})
    assert resp_11.status_code == 422


@patch(
    "services.embedding.GeminiEmbeddingProvider.__init__",
    return_value=None,
)
@patch("services.llm.GeminiLLMProvider.__init__", return_value=None)
@patch("services.rag.RAGService.answer_question")
def test_successful_ask_endpoint(
    mock_answer_question, mock_llm_init, mock_embed_init
):
    """Verify successful /ask endpoint execution."""
    mock_answer_question.return_value = AskResponse(
        question="What is NexusAI?",
        answer="NexusAI is an AI platform.",
        sources=[
            AskSource(
                chunk_id="c1",
                document_id="d1",
                filename="nexus.pdf",
                page_number=1,
                score=0.92,
                metadata={},
            )
        ],
        retrieved_chunks=1,
        grounded=True,
    )

    resp = client.post(
        "/api/v1/ask",
        json={"question": "What is NexusAI?", "top_k": 5},
    )

    assert resp.status_code == 200
    data = resp.json()
    assert data["grounded"] is True
    assert data["retrieved_chunks"] == 1
    assert "NexusAI is an AI platform" in data["answer"]
    assert len(data["sources"]) == 1
    assert data["sources"][0]["filename"] == "nexus.pdf"
