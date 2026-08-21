"""FAISS vector store service for embedding indexing and similarity search."""

import json
import os
from abc import ABC, abstractmethod
from typing import Dict, List, Optional
import faiss
import numpy as np

from config.settings import settings
from models.chunk import TextChunk
from models.search import SearchResult


class BaseVectorStore(ABC):
    """Abstract interface for vector store databases."""

    @abstractmethod
    def add_chunks(
        self, chunks: List[TextChunk], embeddings: List[List[float]]
    ) -> None:
        """Add text chunks and corresponding embedding vectors to store."""
        pass

    @abstractmethod
    def similarity_search(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        user_id: Optional[str] = None,
    ) -> List[SearchResult]:
        """Search for top_k most similar chunks given a query vector."""
        pass

    @abstractmethod
    def save_local(self, directory: Optional[str] = None) -> None:
        """Persist index and metadata to local disk."""
        pass

    @abstractmethod
    def load_local(self, directory: Optional[str] = None) -> bool:
        """Load index and metadata from local disk."""
        pass


class FAISSVectorStore(BaseVectorStore):
    """FAISS-backed local vector store using L2-normalized vectors.

    Using L2-normalized vectors with IndexFlatIP (Inner Product) is
    mathematically identical to Cosine Similarity.
    """

    def __init__(self, directory: Optional[str] = None):
        self.directory = directory or settings.VECTOR_STORE_DIR
        self.index: Optional[faiss.IndexFlatIP] = None
        self.metadata_store: List[Dict] = []
        self.chunk_id_map: Dict[str, int] = {}
        self.dimension: Optional[int] = None
        self.load_local()

    def _init_index(self, dimension: int) -> None:
        self.dimension = dimension
        self.index = faiss.IndexFlatIP(dimension)

    def add_chunks(
        self, chunks: List[TextChunk], embeddings: List[List[float]]
    ) -> None:
        if not chunks or not embeddings:
            return

        if len(chunks) != len(embeddings):
            raise ValueError(
                f"Mismatch between chunks count ({len(chunks)}) and "
                f"embeddings count ({len(embeddings)})."
            )

        vec_np = np.array(embeddings, dtype=np.float32)
        if vec_np.ndim != 2:
            raise ValueError("Embeddings must be a 2D array of vectors.")

        dimension = vec_np.shape[1]

        if self.index is None:
            self._init_index(dimension)
        elif self.dimension != dimension:
            raise ValueError(
                f"Vector dimension mismatch. Index dimension: "
                f"{self.dimension}, given dimension: {dimension}."
            )

        # Normalize vectors for Cosine Similarity equivalence via Inner Product
        faiss.normalize_L2(vec_np)

        start_idx = self.index.ntotal
        self.index.add(vec_np)

        for idx, chunk in enumerate(chunks):
            stored_idx = start_idx + idx
            chunk_dict = chunk.model_dump()
            self.metadata_store.append(chunk_dict)
            self.chunk_id_map[chunk.chunk_id] = stored_idx

    def similarity_search(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        user_id: Optional[str] = None,
    ) -> List[SearchResult]:
        if (
            self.index is None
            or self.index.ntotal == 0
            or not self.metadata_store
        ):
            return []

        search_k = min(top_k * 4 if user_id else top_k, self.index.ntotal)
        query_np = np.array([query_embedding], dtype=np.float32)

        if query_np.shape[1] != self.dimension:
            raise ValueError(
                f"Query vector dimension ({query_np.shape[1]}) does not match "
                f"index dimension ({self.dimension})."
            )

        faiss.normalize_L2(query_np)
        distances, indices = self.index.search(query_np, search_k)

        results: List[SearchResult] = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx < 0 or idx >= len(self.metadata_store):
                continue
            meta = self.metadata_store[idx]

            # Filter by user_id workspace isolation if specified
            if user_id and user_id != "default_user":
                meta_dict = meta.get("metadata", {})
                chunk_user = meta.get("user_id") or meta_dict.get("user_id")
                if chunk_user and chunk_user != user_id:
                    continue

            result = SearchResult(
                chunk_id=meta["chunk_id"],
                document_id=meta["document_id"],
                page_number=meta.get("page_number"),
                chunk_index=meta["chunk_index"],
                text=meta["text"],
                score=float(dist),
                metadata=meta.get("metadata", {}),
            )
            results.append(result)
            if len(results) >= top_k:
                break

        return results

    def save_local(self, directory: Optional[str] = None) -> None:
        target_dir = directory or self.directory
        os.makedirs(target_dir, exist_ok=True)

        if self.index is not None:
            faiss.write_index(
                self.index, os.path.join(target_dir, "index.faiss")
            )

        meta_payload = {
            "dimension": self.dimension,
            "metadata_store": self.metadata_store,
            "chunk_id_map": self.chunk_id_map,
        }
        with open(
            os.path.join(target_dir, "metadata.json"), "w", encoding="utf-8"
        ) as f:
            json.dump(meta_payload, f, indent=2)

    def load_local(self, directory: Optional[str] = None) -> bool:
        target_dir = directory or self.directory
        index_path = os.path.join(target_dir, "index.faiss")
        meta_path = os.path.join(target_dir, "metadata.json")

        if not os.path.exists(index_path) or not os.path.exists(meta_path):
            return False

        try:
            self.index = faiss.read_index(index_path)
            with open(meta_path, "r", encoding="utf-8") as f:
                meta_payload = json.load(f)
            self.dimension = meta_payload.get("dimension")
            self.metadata_store = meta_payload.get("metadata_store", [])
            self.chunk_id_map = meta_payload.get("chunk_id_map", {})
            return True
        except Exception:
            return False
