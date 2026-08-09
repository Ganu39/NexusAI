"""Unit tests for FAISSVectorStore."""

import pytest
from models.chunk import TextChunk
from services.vector_store import FAISSVectorStore


def test_vector_store_add_and_search(tmp_path):
    """Test adding chunks to FAISSVectorStore and performing search."""
    store_dir = str(tmp_path / "faiss_test")
    vector_store = FAISSVectorStore(directory=store_dir)

    chunk_1 = TextChunk(
        chunk_id="doc1_p1_c0",
        document_id="doc1",
        page_number=1,
        chunk_index=0,
        text="Python is a programming language.",
        character_count=33,
        metadata={"filename": "doc1.txt"},
    )
    chunk_2 = TextChunk(
        chunk_id="doc2_p1_c0",
        document_id="doc2",
        page_number=1,
        chunk_index=0,
        text="FAISS is a vector search library.",
        character_count=33,
        metadata={"filename": "doc2.txt"},
    )

    # 4-dimensional vectors
    v1 = [1.0, 0.0, 0.0, 0.0]
    v2 = [0.0, 1.0, 0.0, 0.0]

    vector_store.add_chunks([chunk_1, chunk_2], [v1, v2])
    assert vector_store.index.ntotal == 2

    # Query similar to v1
    query_v1 = [0.9, 0.1, 0.0, 0.0]
    results = vector_store.similarity_search(query_v1, top_k=2)

    assert len(results) == 2
    assert results[0].chunk_id == "doc1_p1_c0"
    assert results[0].document_id == "doc1"
    assert results[0].score > results[1].score


def test_vector_store_persistence_and_reload(tmp_path):
    """Test saving vector store to disk and reloading it."""
    store_dir = str(tmp_path / "faiss_persist")
    store1 = FAISSVectorStore(directory=store_dir)

    chunk = TextChunk(
        chunk_id="doc1_p1_c0",
        document_id="doc1",
        page_number=1,
        chunk_index=0,
        text="Persistence test chunk.",
        character_count=23,
    )
    store1.add_chunks([chunk], [[0.5, 0.5, 0.5, 0.5]])
    store1.save_local()

    store2 = FAISSVectorStore(directory=store_dir)
    loaded = store2.load_local()

    assert loaded is True
    assert store2.index.ntotal == 1

    results = store2.similarity_search([0.5, 0.5, 0.5, 0.5], top_k=1)
    assert len(results) == 1
    assert results[0].chunk_id == "doc1_p1_c0"


def test_vector_store_empty_search(tmp_path):
    """Test searching on an empty or uninitialized vector store."""
    store_dir = str(tmp_path / "faiss_empty")
    store = FAISSVectorStore(directory=store_dir)
    results = store.similarity_search([1.0, 0.0, 0.0, 0.0], top_k=5)
    assert results == []


def test_dimension_mismatch_raises_value_error(tmp_path):
    """Test adding vectors of wrong dimension raises ValueError."""
    store_dir = str(tmp_path / "faiss_dim")
    store = FAISSVectorStore(directory=store_dir)

    chunk1 = TextChunk(
        chunk_id="c1",
        document_id="d1",
        chunk_index=0,
        text="Text 1",
        character_count=6,
    )
    store.add_chunks([chunk1], [[1.0, 0.0, 0.0]])

    chunk2 = TextChunk(
        chunk_id="c2",
        document_id="d1",
        chunk_index=1,
        text="Text 2",
        character_count=6,
    )
    with pytest.raises(ValueError):
        store.add_chunks([chunk2], [[1.0, 0.0, 0.0, 0.0]])
