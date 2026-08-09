"""Embedding service abstraction and Gemini provider implementation."""

from abc import ABC, abstractmethod
from typing import List, Optional
import os

from config.settings import settings


class BaseEmbeddingProvider(ABC):
    """Abstract interface for vector embedding providers."""

    @abstractmethod
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """Generate vector embeddings for a list of document texts."""
        pass

    @abstractmethod
    def embed_query(self, text: str) -> List[float]:
        """Generate a vector embedding for a single search query."""
        pass


class GeminiEmbeddingProvider(BaseEmbeddingProvider):
    """Google Gemini embedding provider using GoogleGenerativeAIEmbeddings."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
    ):
        self.api_key = (
            api_key
            or settings.GEMINI_API_KEY
            or os.environ.get("GEMINI_API_KEY", "")
        )
        self.model_name = (
            model_name or settings.EMBEDDING_MODEL
        )

        if not self.api_key:
            raise ValueError(
                "GEMINI_API_KEY is not configured. "
                "Please set GEMINI_API_KEY in configuration or environment."
            )

        try:
            from langchain_google_genai import GoogleGenerativeAIEmbeddings

            self.client = GoogleGenerativeAIEmbeddings(
                model=self.model_name,
                google_api_key=self.api_key,
            )
        except Exception as e:
            raise ValueError(
                f"Failed to initialize Gemini embedding provider: {str(e)}"
            )

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        try:
            return self.client.embed_documents(texts)
        except Exception as e:
            raise RuntimeError(
                f"Gemini API embedding generation failed: {str(e)}"
            )

    def embed_query(self, text: str) -> List[float]:
        if not text:
            raise ValueError("Query text cannot be empty.")
        try:
            return self.client.embed_query(text)
        except Exception as e:
            raise RuntimeError(
                f"Gemini API query embedding failed: {str(e)}"
            )
