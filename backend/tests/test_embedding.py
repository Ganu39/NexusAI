"""Unit tests for GeminiEmbeddingProvider and BaseEmbeddingProvider."""

import pytest
from unittest.mock import MagicMock, patch
from services.embedding import BaseEmbeddingProvider, GeminiEmbeddingProvider


class MockEmbeddingProvider(BaseEmbeddingProvider):
    """Mock implementation of BaseEmbeddingProvider for offline testing."""

    def __init__(self, dimension: int = 768):
        self.dimension = dimension

    def embed_documents(self, texts: list[str]) -> list[list[float]]:
        return [[0.1] * self.dimension for _ in texts]

    def embed_query(self, text: str) -> list[float]:
        return [0.1] * self.dimension


def test_missing_api_key_raises_value_error():
    """Verify missing API key raises a clear ValueError."""
    with pytest.raises(ValueError) as exc_info:
        GeminiEmbeddingProvider(api_key="")
    assert "GEMINI_API_KEY is not configured" in str(exc_info.value)


@patch("langchain_google_genai.GoogleGenerativeAIEmbeddings")
def test_gemini_embedding_provider_mocked(mock_langchain_embeddings):
    """Verify GeminiEmbeddingProvider delegates calls correctly when mocked."""
    mock_instance = MagicMock()
    mock_instance.embed_documents.return_value = [[0.1, 0.2, 0.3]]
    mock_instance.embed_query.return_value = [0.1, 0.2, 0.3]
    mock_langchain_embeddings.return_value = mock_instance

    provider = GeminiEmbeddingProvider(api_key="fake_key_123")
    doc_vectors = provider.embed_documents(["hello world"])
    query_vector = provider.embed_query("hello")

    assert len(doc_vectors) == 1
    assert doc_vectors[0] == [0.1, 0.2, 0.3]
    assert query_vector == [0.1, 0.2, 0.3]


def test_mock_provider_batching():
    """Verify mock provider handles batch text inputs."""
    provider = MockEmbeddingProvider(dimension=4)
    results = provider.embed_documents(["text 1", "text 2", "text 3"])
    assert len(results) == 3
    assert len(results[0]) == 4
