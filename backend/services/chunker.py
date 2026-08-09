"""Text chunking service using RecursiveCharacterTextSplitter."""

from typing import List, Optional
from langchain_text_splitters import RecursiveCharacterTextSplitter

from config.settings import settings
from models.chunk import TextChunk
from models.document import IngestedDocument


class TextChunker:
    """Service to split IngestedDocument pages into TextChunks."""

    def __init__(
        self,
        chunk_size: Optional[int] = None,
        chunk_overlap: Optional[int] = None,
    ):
        self.chunk_size = (
            chunk_size if chunk_size is not None else settings.CHUNK_SIZE
        )
        self.chunk_overlap = (
            chunk_overlap
            if chunk_overlap is not None
            else settings.CHUNK_OVERLAP
        )
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
            is_separator_regex=False,
        )

    def chunk_document(self, doc: IngestedDocument) -> List[TextChunk]:
        """Chunk document content preserving page_number and metadata."""
        chunks: List[TextChunk] = []

        if not doc.pages:
            return chunks

        overall_chunk_counter = 0

        for page in doc.pages:
            page_text = page.text.strip()
            if not page_text:
                continue

            page_chunks = self.splitter.split_text(page_text)

            for p_idx, text_segment in enumerate(page_chunks):
                p_num_str = (
                    f"p{page.page_number}"
                    if page.page_number is not None
                    else "doc"
                )
                chunk_id = (
                    f"{doc.document_id}_{p_num_str}_c{p_idx}"
                )

                chunk = TextChunk(
                    chunk_id=chunk_id,
                    document_id=doc.document_id,
                    page_number=page.page_number,
                    chunk_index=overall_chunk_counter,
                    text=text_segment,
                    character_count=len(text_segment),
                    metadata={
                        "filename": doc.filename,
                        "file_type": doc.file_type,
                        "page_chunk_index": p_idx,
                    },
                )
                chunks.append(chunk)
                overall_chunk_counter += 1

        return chunks
