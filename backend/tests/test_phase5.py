"""Unit tests for Phase 5 Advanced Infrastructure & Streaming features."""

from unittest.mock import patch
from fastapi.testclient import TestClient
from app.main import app
from services.vector_store_factory import get_vector_store
from services.vector_store import FAISSVectorStore

client = TestClient(app)


def test_vector_store_factory_default():
    """Verify vector_store_factory returns FAISSVectorStore by default."""
    store = get_vector_store()
    assert isinstance(store, FAISSVectorStore)


def test_metrics_endpoint():
    """Verify GET /api/v1/metrics returns system telemetry."""
    response = client.get("/api/v1/metrics")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "nexusai-api"
    assert "vector_provider" in data
    assert "total_documents" in data


@patch(
    "services.embedding.GeminiEmbeddingProvider.__init__",
    return_value=None,
)
@patch("services.llm.GeminiLLMProvider.__init__", return_value=None)
@patch("services.rag.RAGService.answer_question_stream")
def test_ask_stream_endpoint(
    mock_answer_stream, mock_llm_init, mock_embed_init
):
    """Verify POST /api/v1/ask/stream returns Server-Sent Events stream."""
    mock_sources = []
    mock_tokens = ["Hello", " ", "world!"]

    def mock_gen():
        for t in mock_tokens:
            yield t

    mock_answer_stream.return_value = (mock_sources, True, mock_gen())

    payload = {"question": "What is NexusAI?", "top_k": 3}
    response = client.post("/api/v1/ask/stream", json=payload)

    assert response.status_code == 200
    assert "text/event-stream" in response.headers["content-type"]
    body = response.text
    assert "event" in body
    assert "metadata" in body
