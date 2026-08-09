"""Context builder service for RAG pipeline."""

from typing import List
from models.search import SearchResult
from config.settings import settings


class ContextBuilder:
    """Builds grounded context from retrieved SearchResult objects."""

    def __init__(
        self,
        min_relevance_score: float = settings.RAG_MIN_RELEVANCE_SCORE,
        max_chunks: int = settings.MAX_CONTEXT_CHUNKS,
        max_characters: int = settings.MAX_CONTEXT_CHARACTERS,
    ):
        """Initialize ContextBuilder parameters.

        Args:
            min_relevance_score: Minimum similarity score threshold.
            max_chunks: Maximum number of chunks to include.
            max_characters: Maximum cumulative character limit.
        """
        self.min_relevance_score = min_relevance_score
        self.max_chunks = max_chunks
        self.max_characters = max_characters

    def filter_results(
        self, search_results: List[SearchResult]
    ) -> List[SearchResult]:
        """Filter search results by score, chunk count, and char cap.

        Args:
            search_results: Raw list of retrieved SearchResult items.

        Returns:
            Filtered list of SearchResult items.
        """
        # 1. Filter by minimum relevance score
        valid_results = [
            r for r in search_results if r.score >= self.min_relevance_score
        ]

        # 2. Limit to max_chunks
        capped_chunks = valid_results[: self.max_chunks]

        # 3. Limit cumulative characters while preserving complete chunks
        filtered_results: List[SearchResult] = []
        current_chars = 0

        for result in capped_chunks:
            chunk_len = len(result.text)
            if (
                current_chars + chunk_len > self.max_characters
                and filtered_results
            ):
                break
            filtered_results.append(result)
            current_chars += chunk_len

        return filtered_results

    def build_context(self, search_results: List[SearchResult]) -> str:
        """Format filtered search results into a deterministic context string.

        Args:
            search_results: Raw or filtered SearchResult objects.

        Returns:
            Formatted context string.
        """
        filtered = self.filter_results(search_results)

        if not filtered:
            return ""

        context_blocks: List[str] = []
        for idx, item in enumerate(filtered, start=1):
            filename = item.metadata.get("filename", "Unknown Document")
            doc_id = item.document_id
            page = (
                item.page_number
                if item.page_number is not None
                else "N/A"
            )
            chunk_id = item.chunk_id

            block = (
                f"[Source {idx}]\n"
                f"Document: {filename}\n"
                f"Document ID: {doc_id}\n"
                f"Page: {page}\n"
                f"Chunk ID: {chunk_id}\n"
                f"Content:\n"
                f"{item.text}"
            )
            context_blocks.append(block)

        return "\n\n".join(context_blocks)
