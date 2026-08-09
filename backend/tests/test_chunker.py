"""Unit tests for TextChunker service."""

from models.document import DocumentPage, IngestedDocument
from services.chunker import TextChunker


def test_chunking_preserves_pages_and_ids():
    """Verify chunker preserves page numbers and creates deterministic IDs."""
    doc = IngestedDocument(
        document_id="doc_123",
        filename="report.pdf",
        file_type="pdf",
        mime_type="application/pdf",
        file_size=1024,
        page_count=2,
        character_count=500,
        pages=[
            DocumentPage(
                page_number=1, text="Page one text content for chunking."
            ),
            DocumentPage(
                page_number=2, text="Page two text content for chunking."
            ),
        ],
    )

    chunker = TextChunker(chunk_size=100, chunk_overlap=10)
    chunks = chunker.chunk_document(doc)

    assert len(chunks) == 2
    assert chunks[0].chunk_id == "doc_123_p1_c0"
    assert chunks[0].page_number == 1
    assert chunks[0].document_id == "doc_123"

    assert chunks[1].chunk_id == "doc_123_p2_c0"
    assert chunks[1].page_number == 2


def test_chunking_non_paginated_document():
    """Verify chunker handles non-paginated documents (page_number=None)."""
    doc = IngestedDocument(
        document_id="doc_txt",
        filename="notes.txt",
        file_type="txt",
        mime_type="text/plain",
        file_size=500,
        page_count=1,
        character_count=200,
        pages=[
            DocumentPage(page_number=None, text="Plain text document body.")
        ],
    )

    chunker = TextChunker(chunk_size=100, chunk_overlap=10)
    chunks = chunker.chunk_document(doc)

    assert len(chunks) == 1
    assert chunks[0].page_number is None
    assert "doc_txt_doc_c0" == chunks[0].chunk_id


def test_chunk_ordering_and_overlap():
    """Verify chunk indexing and text splitting logic."""
    long_text = "Word " * 300  # ~1500 chars
    doc = IngestedDocument(
        document_id="long_doc",
        filename="long.txt",
        file_type="txt",
        mime_type="text/plain",
        file_size=len(long_text),
        page_count=1,
        character_count=len(long_text),
        pages=[DocumentPage(page_number=1, text=long_text)],
    )

    chunker = TextChunker(chunk_size=500, chunk_overlap=100)
    chunks = chunker.chunk_document(doc)

    assert len(chunks) > 1
    for idx, chunk in enumerate(chunks):
        assert chunk.chunk_index == idx


def test_empty_document_chunking():
    """Verify empty document returns empty list of chunks."""
    doc = IngestedDocument(
        document_id="empty_doc",
        filename="empty.txt",
        file_type="txt",
        mime_type="text/plain",
        file_size=0,
        page_count=0,
        character_count=0,
        pages=[],
    )

    chunker = TextChunker()
    chunks = chunker.chunk_document(doc)
    assert chunks == []
