"""RAG orchestration service for NexusAI."""

from typing import Optional
from models.rag import AskRequest, AskResponse, AskSource
from services.embedding import BaseEmbeddingProvider, GeminiEmbeddingProvider
from services.vector_store import BaseVectorStore, FAISSVectorStore
from services.llm import BaseLLMProvider, GeminiLLMProvider
from services.context_builder import ContextBuilder
from services.prompts import RAG_SYSTEM_INSTRUCTION, build_rag_user_prompt


class RAGService:
    """Orchestrates RAG search, context building, and LLM generation."""

    def __init__(
        self,
        embedding_provider: Optional[BaseEmbeddingProvider] = None,
        vector_store: Optional[BaseVectorStore] = None,
        llm_provider: Optional[BaseLLMProvider] = None,
        context_builder: Optional[ContextBuilder] = None,
    ):
        """Initialize RAGService components.

        Args:
            embedding_provider: Embedding service.
            vector_store: Vector store.
            llm_provider: LLM service.
            context_builder: Context builder.
        """
        self.embedding_provider = (
            embedding_provider
            if embedding_provider is not None
            else GeminiEmbeddingProvider()
        )
        self.vector_store = (
            vector_store
            if vector_store is not None
            else FAISSVectorStore()
        )
        self.llm_provider = (
            llm_provider
            if llm_provider is not None
            else GeminiLLMProvider()
        )
        self.context_builder = (
            context_builder
            if context_builder is not None
            else ContextBuilder()
        )

    def answer_question(self, request: AskRequest) -> AskResponse:
        """Process user question through RAG pipeline.

        Args:
            request: AskRequest instance.

        Returns:
            AskResponse with grounded answer and sources.
        """
        # 1. Generate query embedding
        query_vector = self.embedding_provider.embed_query(request.question)

        # 2. Retrieve top_k similarity results
        raw_results = self.vector_store.similarity_search(
            query_vector, top_k=request.top_k
        )

        # 3. Filter results using ContextBuilder thresholding
        filtered_results = self.context_builder.filter_results(raw_results)

        # 4. Handle insufficient context (no chunks pass threshold)
        if not filtered_results:
            return AskResponse(
                question=request.question,
                answer=(
                    "I couldn't find enough information in the uploaded "
                    "documents to answer that question."
                ),
                sources=[],
                retrieved_chunks=0,
                grounded=False,
            )

        # 5. Build formatted context string
        context_text = self.context_builder.build_context(filtered_results)

        # 6. Build user prompt
        user_prompt = build_rag_user_prompt(request.question, context_text)

        # 7. Call LLM provider
        answer_text = self.llm_provider.generate(
            prompt=user_prompt,
            system_instruction=RAG_SYSTEM_INSTRUCTION,
        )

        # 8. Build AskSource list
        sources: list[AskSource] = []
        for res in filtered_results:
            filename = res.metadata.get("filename", "Unknown Document")
            sources.append(
                AskSource(
                    chunk_id=res.chunk_id,
                    document_id=res.document_id,
                    filename=filename,
                    page_number=res.page_number,
                    score=res.score,
                    metadata=res.metadata,
                )
            )

        return AskResponse(
            question=request.question,
            answer=answer_text,
            sources=sources,
            retrieved_chunks=len(sources),
            grounded=True,
        )
