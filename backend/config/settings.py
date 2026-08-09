"""Configuration settings for NexusAI Backend."""

import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings."""

    MAX_UPLOAD_SIZE_MB: int = 10
    UPLOAD_DIR: str = os.path.join(os.getcwd(), "temp_uploads")
    DOCUMENTS_DIR: str = os.path.join(os.getcwd(), "stored_documents")

    GEMINI_API_KEY: str = ""
    EMBEDDING_MODEL: str = "models/gemini-embedding-001"
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 150
    VECTOR_STORE_DIR: str = os.path.join(os.getcwd(), "faiss_index")

    LLM_MODEL: str = "gemini-2.5-flash"
    LLM_TEMPERATURE: float = 0.2
    MAX_CONTEXT_CHUNKS: int = 5
    MAX_CONTEXT_CHARACTERS: int = 12000
    RAG_MIN_RELEVANCE_SCORE: float = 0.30

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
