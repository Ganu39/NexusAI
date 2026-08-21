"""LLM provider abstraction for NexusAI."""

from abc import ABC, abstractmethod
from typing import Iterator, Optional
from google import genai
from google.genai import types

from config.settings import settings


class BaseLLMProvider(ABC):
    """Abstract base class for LLM providers."""

    @abstractmethod
    def generate(
        self, prompt: str, system_instruction: Optional[str] = None
    ) -> str:
        """Generate text from a prompt and optional system instruction."""
        pass

    @abstractmethod
    def generate_stream(
        self, prompt: str, system_instruction: Optional[str] = None
    ) -> Iterator[str]:
        """Stream text tokens from a prompt and optional system instruction."""
        pass


class GeminiLLMProvider(BaseLLMProvider):
    """Google Gemini LLM provider implementation."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        temperature: Optional[float] = None,
    ):
        """Initialize the Gemini LLM provider."""
        self.api_key = (
            api_key if api_key is not None else settings.GEMINI_API_KEY
        )
        self.model_name = (
            model_name if model_name is not None else settings.LLM_MODEL
        )
        self.temperature = (
            temperature
            if temperature is not None
            else settings.LLM_TEMPERATURE
        )

        if not self.api_key or not self.api_key.strip():
            raise ValueError(
                "GEMINI_API_KEY is not configured. "
                "Please set GEMINI_API_KEY in environment or .env file."
            )

        try:
            self.client = genai.Client(api_key=self.api_key)
        except Exception as e:
            raise ValueError(
                f"Failed to initialize Gemini LLM client: {str(e)}"
            )

    def generate(
        self, prompt: str, system_instruction: Optional[str] = None
    ) -> str:
        """Generate text using Google Gemini API."""
        if not prompt or not prompt.strip():
            raise ValueError("Prompt cannot be empty.")

        try:
            config = types.GenerateContentConfig(
                temperature=self.temperature,
                system_instruction=system_instruction,
            )
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=config,
            )

            if not response or not response.text:
                raise RuntimeError("Gemini API returned an empty response.")

            return response.text.strip()

        except Exception as e:
            if isinstance(e, (ValueError, RuntimeError)):
                raise
            raise RuntimeError(f"Gemini API generation failed: {str(e)}")

    def generate_stream(
        self, prompt: str, system_instruction: Optional[str] = None
    ) -> Iterator[str]:
        """Stream text tokens using Google Gemini API."""
        if not prompt or not prompt.strip():
            raise ValueError("Prompt cannot be empty.")

        try:
            config = types.GenerateContentConfig(
                temperature=self.temperature,
                system_instruction=system_instruction,
            )
            response_stream = self.client.models.generate_content_stream(
                model=self.model_name,
                contents=prompt,
                config=config,
            )

            for chunk in response_stream:
                if chunk and chunk.text:
                    yield chunk.text

        except Exception as e:
            raise RuntimeError(f"Gemini API streaming failed: {str(e)}")
