"""Tests for document indexing and search API endpoints."""

from unittest.mock import patch
from fastapi.testclient import TestClient

from app.main import app
from models.document import DocumentPage, IngestedDocument
from services.document_store import save_document

client = TestClient(app)


def test_search_query_validation_empty():
    """Test searching with empty query string returns 422 error."""
    response = client.post("/search", json={"query": "", "top_k": 5})
    assert response.status_code == 422


def test_search_query_validation_too_long():
    """Test searching with query > 2000 chars returns 422 error."""
    long_query = "a" * 2001
    response = client.post("/search", json={"query": long_query, "top_k": 5})
    assert response.status_code == 422


def test_search_top_k_validation_bounds():
    """Test top_k validation bounds (1 <= top_k <= 50)."""
    # top_k = 0
    resp_0 = client.post("/search", json={"query": "test", "top_k": 0})
    assert resp_0.status_code == 422

    # top_k = 51
    resp_51 = client.post("/search", json={"query": "test", "top_k": 51})
    assert resp_51.status_code == 422


@patch(
    "services.embedding.GeminiEmbeddingProvider.__init__",
    return_value=None,
)
@patch("services.embedding.GeminiEmbeddingProvider.embed_query")
@patch("services.vector_store.FAISSVectorStore.similarity_search")
def test_successful_search_endpoint(
    mock_search, mock_embed_query, mock_init
):
    """Test successful POST /search API call with mocked dependencies."""
    mock_embed_query.return_value = [0.1] * 768
    mock_search.return_value = []

    payload = {"query": "RAG architecture", "top_k": 5}
    response = client.post("/search", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["query"] == "RAG architecture"
    assert data["results"] == []
    assert data["total_results"] == 0


@patch(
    "services.embedding.GeminiEmbeddingProvider.__init__", return_value=None
)
@patch("services.embedding.GeminiEmbeddingProvider.embed_documents")
def test_index_document_endpoint_not_found(mock_embed, mock_init):
    """Test indexing non-existent document_id returns 400 error."""
    response = client.post("/documents/non_existent_id/index")
    assert response.status_code == 400
    assert "not found" in response.json()["detail"].lower()


@patch(
    "services.embedding.GeminiEmbeddingProvider.__init__", return_value=None
)
@patch("services.embedding.GeminiEmbeddingProvider.embed_documents")
def test_successful_document_indexing(mock_embed_docs, mock_init):
    """Test indexing a stored document by document_id."""
    doc_id = "test_doc_to_index"
    doc = IngestedDocument(
        document_id=doc_id,
        filename="report.txt",
        file_type="txt",
        mime_type="text/plain",
        file_size=100,
        page_count=1,
        character_count=50,
        pages=[
            DocumentPage(
                page_number=1, text="Text for indexing service test."
            )
        ],
    )
    save_document(doc)

    mock_embed_docs.return_value = [[0.1] * 768]

    response = client.post(f"/documents/{doc_id}/index")
    assert response.status_code == 200
    data = response.json()
    assert data["document_id"] == doc_id
    assert data["chunks_created"] == 1
    assert data["indexed"] is True
