"""Unit tests for LLM provider abstraction."""

from typing import Iterator, Optional
from unittest.mock import MagicMock, patch
import pytest

from services.llm import BaseLLMProvider, GeminiLLMProvider


class MockLLMProvider(BaseLLMProvider):
    """Mock LLM provider for unit testing."""

    def __init__(self, response_text: str = "Mocked answer."):
        self.response_text = response_text

    def generate(
        self, prompt: str, system_instruction: Optional[str] = None
    ) -> str:
        return self.response_text

    def generate_stream(
        self, prompt: str, system_instruction: Optional[str] = None
    ) -> Iterator[str]:
        yield self.response_text


def test_missing_api_key_raises_value_error():
    """Verify missing GEMINI_API_KEY raises clear ValueError."""
    with patch("services.llm.settings.GEMINI_API_KEY", ""), \
         patch.dict("os.environ", {"GEMINI_API_KEY": ""}):
        with pytest.raises(ValueError) as exc_info:
            GeminiLLMProvider(api_key="")
        assert "GEMINI_API_KEY is not configured" in str(exc_info.value)


@patch("google.genai.Client")
def test_successful_gemini_generation_mocked(mock_client_cls):
    """Verify successful LLM generation with mocked Gemini API."""
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.text = "This is a grounded answer from Gemini."
    mock_client.models.generate_content.return_value = mock_response
    mock_client_cls.return_value = mock_client

    provider = GeminiLLMProvider(api_key="fake-test-key")
    result = provider.generate("Test prompt", system_instruction="Test system")

    assert result == "This is a grounded answer from Gemini."
    mock_client.models.generate_content.assert_called_once()


@patch("google.genai.Client")
def test_empty_gemini_response_raises_runtime_error(mock_client_cls):
    """Verify empty LLM response raises RuntimeError."""
    mock_client = MagicMock()
    mock_response = MagicMock()
    mock_response.text = ""
    mock_client.models.generate_content.return_value = mock_response
    mock_client_cls.return_value = mock_client

    provider = GeminiLLMProvider(api_key="fake-test-key")
    with pytest.raises(RuntimeError) as exc_info:
        provider.generate("Test prompt")
    assert "Gemini API returned an empty response" in str(exc_info.value)
