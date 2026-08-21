import json
import os
from typing import List, Union
from pydantic import field_validator
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
    VECTOR_STORE_PROVIDER: str = "faiss"
    PINECONE_API_KEY: str = ""
    PINECONE_INDEX_NAME: str = "nexusai-index"

    NEXUSAI_API_KEY: str = ""

    LLM_MODEL: str = "gemini-2.5-flash"
    LLM_TEMPERATURE: float = 0.2
    MAX_CONTEXT_CHUNKS: int = 5
    MAX_CONTEXT_CHARACTERS: int = 12000
    RAG_MIN_RELEVANCE_SCORE: float = 0.30

    ALLOWED_ORIGINS: Union[List[str], str] = [
        "https://nexusai-sage-beta.vercel.app",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    @field_validator("ALLOWED_ORIGINS", mode="after")
    @classmethod
    def validate_allowed_origins(cls, v: Union[List[str], str]) -> List[str]:
        if isinstance(v, str):
            if v.startswith("[") and v.endswith("]"):
                try:
                    parsed = json.loads(v)
                    if isinstance(parsed, list):
                        return [str(item).strip() for item in parsed]
                except Exception:
                    pass
            return [
                origin.strip() for origin in v.split(",") if origin.strip()
            ]
        return v

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
