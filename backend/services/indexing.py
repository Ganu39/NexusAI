"""Document indexing service connecting chunking, embeddings, and FAISS."""

from datetime import datetime, timezone
from typing import Optional
from models.document import IngestedDocument
from models.search import IndexingResponse
from services.chunker import TextChunker
from services.document_store import get_stored_document, save_document
from services.embedding import BaseEmbeddingProvider, GeminiEmbeddingProvider
from services.vector_store import BaseVectorStore, FAISSVectorStore


class DocumentIndexingService:
    """Service orchestrating document chunking, embedding, and vector store."""

    def __init__(
        self,
        chunker: Optional[TextChunker] = None,
        embedding_provider: Optional[BaseEmbeddingProvider] = None,
        vector_store: Optional[BaseVectorStore] = None,
    ):
        self.chunker = chunker or TextChunker()
        self._embedding_provider = embedding_provider
        self.vector_store = vector_store or FAISSVectorStore()
        # Attempt to load existing index if available
        self.vector_store.load_local()

    @property
    def embedding_provider(self) -> BaseEmbeddingProvider:
        if self._embedding_provider is None:
            self._embedding_provider = GeminiEmbeddingProvider()
        return self._embedding_provider

    def index_document(
        self, document_or_id: str | IngestedDocument
    ) -> IndexingResponse:
        """Index a document by document_id or IngestedDocument instance."""
        if isinstance(document_or_id, str):
            doc = get_stored_document(document_or_id)
            if not doc:
                msg = f"Document '{document_or_id}' not found in stored docs."
                raise ValueError(msg)
        else:
            doc = document_or_id

        try:
            chunks = self.chunker.chunk_document(doc)
            if not chunks:
                doc.is_indexed = False
                doc.processing_status = "failed"
                save_document(doc)
                return IndexingResponse(
                    document_id=doc.document_id,
                    chunks_created=0,
                    embeddings_created=0,
                    indexed=False,
                )

            texts = [chunk.text for chunk in chunks]
            embeddings = self.embedding_provider.embed_documents(texts)

            self.vector_store.add_chunks(chunks, embeddings)
            self.vector_store.save_local()

            # Update persistent document metadata
            doc.is_indexed = True
            doc.processing_status = "indexed"
            doc.chunks_created = len(chunks)
            doc.embeddings_created = len(embeddings)
            doc.indexed_at = datetime.now(timezone.utc).isoformat()
            save_document(doc)

            return IndexingResponse(
                document_id=doc.document_id,
                chunks_created=len(chunks),
                embeddings_created=len(embeddings),
                indexed=True,
            )
        except Exception:
            doc.processing_status = "failed"
            save_document(doc)
            raise
