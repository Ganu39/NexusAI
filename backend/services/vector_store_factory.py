"""Factory module for creating BaseVectorStore instances."""

import logging
from config.settings import settings
from services.vector_store import BaseVectorStore, FAISSVectorStore

logger = logging.getLogger(__name__)


def get_vector_store() -> BaseVectorStore:
    """Instantiate and return the configured vector store provider."""
    provider = (settings.VECTOR_STORE_PROVIDER or "faiss").lower()

    if provider == "pinecone":
        try:
            from services.vector_store_pinecone import PineconeVectorStore
            return PineconeVectorStore()
        except Exception as e:
            logger.warning(
                f"Failed to initialize PineconeVectorStore ({e}). "
                f"Falling back to FAISSVectorStore."
            )
            return FAISSVectorStore()

    # Default provider: FAISS
    return FAISSVectorStore()
