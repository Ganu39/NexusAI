"""LLM provider abstraction for NexusAI."""

from abc import ABC, abstractmethod
from typing import Optional
from google import genai
from google.genai import types

from config.settings import settings


class BaseLLMProvider(ABC):
    """Abstract base class for LLM providers."""

    @abstractmethod
    def generate(
        self, prompt: str, system_instruction: Optional[str] = None
    ) -> str:
        """Generate text from a prompt and optional system instruction.

        Args:
            prompt: User prompt or grounded input text.
            system_instruction: System prompt framing rules and instructions.

        Returns:
            Generated text string.
        """
        pass


class GeminiLLMProvider(BaseLLMProvider):
    """Google Gemini LLM provider implementation."""

    def __init__(
        self,
        api_key: Optional[str] = None,
        model_name: Optional[str] = None,
        temperature: Optional[float] = None,
    ):
        """Initialize the Gemini LLM provider.

        Args:
            api_key: Gemini API key. Defaults to settings.GEMINI_API_KEY.
            model_name: Gemini model name. Defaults to settings.LLM_MODEL.
            temperature: LLM temperature. Defaults to settings.LLM_TEMPERATURE.
        """
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
        """Generate text using Google Gemini API.

        Args:
            prompt: Grounded prompt text.
            system_instruction: Optional system instruction.

        Returns:
            Generated answer text string.
        """
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
