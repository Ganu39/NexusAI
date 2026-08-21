"""Pinecone vector store implementation extending BaseVectorStore."""

from typing import List, Optional
from config.settings import settings
from models.chunk import TextChunk
from models.search import SearchResult
from services.vector_store import BaseVectorStore


class PineconeVectorStore(BaseVectorStore):
    """Pinecone cloud-backed vector store implementation."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        index_name: Optional[str] = None,
    ):
        self.api_key = api_key or settings.PINECONE_API_KEY
        self.index_name = index_name or settings.PINECONE_INDEX_NAME
        self.client = None
        self.index = None
        self._init_pinecone()

    def _init_pinecone(self) -> None:
        if not self.api_key:
            msg = (
                "PINECONE_API_KEY environment variable is required "
                "for Pinecone vector store."
            )
            raise ValueError(msg)
        try:
            from pinecone import Pinecone
            self.client = Pinecone(api_key=self.api_key)
            self.index = self.client.Index(self.index_name)
        except Exception as e:
            msg = f"Failed to connect to Pinecone index: {e}"
            raise RuntimeError(msg)

    def add_chunks(
        self, chunks: List[TextChunk], embeddings: List[List[float]]
    ) -> None:
        if not chunks or not embeddings or len(chunks) != len(embeddings):
            return

        vectors = []
        for chunk, emb in zip(chunks, embeddings):
            metadata = {
                "document_id": chunk.document_id,
                "text": chunk.text,
                "chunk_index": chunk.chunk_index,
            }
            if chunk.page_number is not None:
                metadata["page_number"] = chunk.page_number
            vectors.append((chunk.chunk_id, emb, metadata))

        if self.index:
            self.index.upsert(vectors=vectors)

    def similarity_search(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        user_id: Optional[str] = None,
    ) -> List[SearchResult]:
        if not self.index:
            return []

        filter_dict = None
        if user_id and user_id != "default_user":
            filter_dict = {"user_id": {"$eq": user_id}}
        res = self.index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True,
            filter=filter_dict,
        )
        results: List[SearchResult] = []
        for match in res.get("matches", []):
            meta = match.get("metadata", {})
            results.append(
                SearchResult(
                    chunk_id=match.get("id", ""),
                    document_id=meta.get("document_id", ""),
                    page_number=meta.get("page_number"),
                    chunk_index=meta.get("chunk_index", 0),
                    text=meta.get("text", ""),
                    score=float(match.get("score", 0.0)),
                    metadata=meta,
                )
            )
        return results

    def save_local(self, directory: Optional[str] = None) -> None:
        pass  # Cloud index is automatically persisted by Pinecone

    def load_local(self, directory: Optional[str] = None) -> bool:
        return self.index is not None
