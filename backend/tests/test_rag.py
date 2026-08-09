"""Unit tests for RAGService orchestration."""

from unittest.mock import MagicMock
from models.rag import AskRequest
from models.search import SearchResult
from services.rag import RAGService
from tests.test_embedding import MockEmbeddingProvider
from tests.test_llm import MockLLMProvider


def test_rag_service_successful_answer():
    """Verify full RAG pipeline flow with mocked vector search and LLM."""
    mock_embed = MockEmbeddingProvider(dimension=768)
    mock_llm = MockLLMProvider("FAISS is used for local vector search.")

    mock_vector_store = MagicMock()
    mock_vector_store.similarity_search.return_value = [
        SearchResult(
            chunk_id="doc1_p1_c0",
            document_id="doc1",
            chunk_index=0,
            score=0.88,
            text="NexusAI uses FAISS for local vector search.",
            page_number=1,
            metadata={"filename": "nexus.pdf"},
        )
    ]

    rag_service = RAGService(
        embedding_provider=mock_embed,
        vector_store=mock_vector_store,
        llm_provider=mock_llm,
    )

    req = AskRequest(
        question="What vector database does NexusAI use?", top_k=5
    )
    response = rag_service.answer_question(req)

    assert response.grounded is True
    assert response.retrieved_chunks == 1
    assert "FAISS" in response.answer
    assert len(response.sources) == 1
    assert response.sources[0].filename == "nexus.pdf"
    assert response.sources[0].chunk_id == "doc1_p1_c0"
    assert response.sources[0].page_number == 1


def test_rag_service_insufficient_context_fallback():
    """Verify low relevance scores trigger insufficient context fallback."""
    mock_embed = MockEmbeddingProvider(dimension=768)
    mock_llm = MockLLMProvider("Should not be called")

    mock_vector_store = MagicMock()
    # Search result below min_relevance_score (0.30)
    mock_vector_store.similarity_search.return_value = [
        SearchResult(
            chunk_id="doc1_p1_c0",
            document_id="doc1",
            chunk_index=0,
            score=0.15,
            text="Irrelevant text content.",
            page_number=1,
            metadata={"filename": "nexus.pdf"},
        )
    ]

    rag_service = RAGService(
        embedding_provider=mock_embed,
        vector_store=mock_vector_store,
        llm_provider=mock_llm,
    )

    req = AskRequest(question="Unrelated question?", top_k=5)
    response = rag_service.answer_question(req)

    assert response.grounded is False
    assert response.retrieved_chunks == 0
    assert len(response.sources) == 0
    assert "couldn't find enough information" in response.answer
