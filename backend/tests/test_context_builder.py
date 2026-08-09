"""Unit tests for ContextBuilder service."""

from models.search import SearchResult
from services.context_builder import ContextBuilder


def make_result(
    chunk_id: str,
    doc_id: str,
    score: float,
    text: str,
    filename: str = "test.txt",
    page: int | None = 1,
    chunk_idx: int = 0,
) -> SearchResult:
    """Helper to create SearchResult instances for testing."""
    return SearchResult(
        chunk_id=chunk_id,
        document_id=doc_id,
        score=score,
        text=text,
        page_number=page,
        chunk_index=chunk_idx,
        metadata={"filename": filename},
    )


def test_context_builder_filtering_score_threshold():
    """Verify results below min_relevance_score are filtered out."""
    builder = ContextBuilder(min_relevance_score=0.5)

    res1 = make_result("c1", "d1", 0.8, "High score text")
    res2 = make_result("c2", "d1", 0.4, "Low score text")

    filtered = builder.filter_results([res1, res2])
    assert len(filtered) == 1
    assert filtered[0].chunk_id == "c1"


def test_context_builder_max_chunks_limit():
    """Verify maximum chunk cap is respected."""
    builder = ContextBuilder(min_relevance_score=0.1, max_chunks=2)

    results = [
        make_result(f"c{i}", "d1", 0.9 - i * 0.1, f"Text {i}")
        for i in range(5)
    ]

    filtered = builder.filter_results(results)
    assert len(filtered) == 2
    assert [r.chunk_id for r in filtered] == ["c0", "c1"]


def test_context_builder_max_characters_limit():
    """Verify maximum cumulative character limit is respected."""
    builder = ContextBuilder(
        min_relevance_score=0.1, max_chunks=5, max_characters=35
    )

    r1 = make_result("c1", "d1", 0.9, "Short chunk 1.")  # 15 chars
    r2 = make_result("c2", "d1", 0.8, "Short chunk 2.")  # 15 chars (total 30)
    r3 = make_result(
        "c3", "d1", 0.7, "This text pushes it over cap."
    )  # 30 chars

    filtered = builder.filter_results([r1, r2, r3])
    assert len(filtered) == 2
    assert [r.chunk_id for r in filtered] == ["c1", "c2"]


def test_context_builder_deterministic_formatting():
    """Verify context formatting includes all source details and metadata."""
    builder = ContextBuilder(min_relevance_score=0.1)

    r1 = make_result(
        "c1", "doc-123", 0.85, "Content block A", filename="doc_a.pdf", page=3
    )
    r2 = make_result(
        "c2",
        "doc-456",
        0.75,
        "Content block B",
        filename="doc_b.txt",
        page=None,
    )

    context_str = builder.build_context([r1, r2])

    assert "[Source 1]" in context_str
    assert "Document: doc_a.pdf" in context_str
    assert "Document ID: doc-123" in context_str
    assert "Page: 3" in context_str
    assert "Chunk ID: c1" in context_str
    assert "ContentBlock A" not in context_str
    assert "Content block A" in context_str

    assert "[Source 2]" in context_str
    assert "Document: doc_b.txt" in context_str
    assert "Page: N/A" in context_str
