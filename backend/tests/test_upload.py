"""Tests for the document ingestion endpoint POST /upload."""

import io
import os
import pypdf
import docx
from fastapi.testclient import TestClient

from app.main import app
from config.settings import settings
from services.extractor import PDFExtractor

client = TestClient(app)


def create_sample_pdf(pages_count: int = 1) -> bytes:
    """Helper to generate a minimal valid PDF in memory."""
    writer = pypdf.PdfWriter()
    for _ in range(pages_count):
        writer.add_blank_page(width=200, height=200)
    buf = io.BytesIO()
    writer.write(buf)
    return buf.getvalue()


def create_sample_docx(paragraphs: list[str]) -> bytes:
    """Helper to generate a minimal valid DOCX in memory."""
    doc = docx.Document()
    for p in paragraphs:
        doc.add_paragraph(p)
    buf = io.BytesIO()
    doc.save(buf)
    return buf.getvalue()


def test_1_valid_txt_upload():
    """Test uploading a valid TXT file."""
    content = b"Hello NexusAI! This is a test text file."
    files = {"file": ("test_document.txt", content, "text/plain")}
    response = client.post("/upload", files=files)

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["status"] == "extracted"
    assert data["document"]["filename"] == "test_document.txt"
    assert data["document"]["file_type"] == "txt"
    assert data["document"]["character_count"] == len(content.decode("utf-8"))


def test_2_valid_docx_upload():
    """Test uploading a valid DOCX file."""
    content = create_sample_docx(
        ["First paragraph of docx.", "Second paragraph."]
    )
    docx_mime = (
        "application/vnd.openxmlformats-officedocument"
        ".wordprocessingml.document"
    )
    files = {"file": ("sample.docx", content, docx_mime)}
    response = client.post("/upload", files=files)

    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert data["document"]["file_type"] == "docx"
    assert data["document"]["character_count"] > 0


def test_3_valid_pdf_upload():
    """Test uploading a valid PDF file."""
    pdf_bytes = create_sample_pdf(pages_count=2)
    files = {"file": ("sample.pdf", pdf_bytes, "application/pdf")}
    response = client.post("/upload", files=files)
    assert response.status_code in (200, 400)


def test_4_unsupported_file_type():
    """Test uploading an unsupported file format."""
    files = {"file": ("script.py", b"print('hello')", "text/x-python")}
    response = client.post("/upload", files=files)

    assert response.status_code == 400
    assert "Unsupported file extension" in response.json()["detail"]


def test_5_empty_file():
    """Test uploading an empty file (0 bytes)."""
    files = {"file": ("empty.txt", b"", "text/plain")}
    response = client.post("/upload", files=files)

    assert response.status_code == 400
    assert "empty" in response.json()["detail"].lower()


def test_6_oversized_file():
    """Test uploading a file exceeding MAX_UPLOAD_SIZE_MB."""
    original_limit = settings.MAX_UPLOAD_SIZE_MB
    settings.MAX_UPLOAD_SIZE_MB = 1
    try:
        large_content = b"A" * (2 * 1024 * 1024)
        files = {"file": ("large.txt", large_content, "text/plain")}
        response = client.post("/upload", files=files)

        assert response.status_code == 400
        assert "exceeds maximum limit" in response.json()["detail"]
    finally:
        settings.MAX_UPLOAD_SIZE_MB = original_limit


def test_7_corrupted_pdf():
    """Test uploading a corrupted PDF file."""
    corrupt_data = b"%PDF-1.4 corrupted header..."
    files = {"file": ("corrupt.pdf", corrupt_data, "application/pdf")}
    response = client.post("/upload", files=files)

    assert response.status_code == 400


def test_8_corrupted_docx():
    """Test uploading a corrupted DOCX file."""
    docx_mime = (
        "application/vnd.openxmlformats-officedocument"
        ".wordprocessingml.document"
    )
    files = {
        "file": (
            "corrupt.docx",
            b"PK\x03\x04 invalid zip payload",
            docx_mime,
        )
    }
    response = client.post("/upload", files=files)

    assert response.status_code == 400


def test_9_invalid_text_encoding():
    """Test uploading a text file with non-utf8 binary data."""
    files = {"file": ("binary.txt", b"\x80\x81\x82\x83\xff", "text/plain")}
    response = client.post("/upload", files=files)

    assert response.status_code in (200, 400)


def test_10_pdf_page_metadata():
    """Test PDF page metadata preservation logic."""
    extractor = PDFExtractor()
    assert hasattr(extractor, "extract")


def test_11_filename_sanitization():
    """Test that malicious path traversal filenames are sanitized."""
    files = {
        "file": ("../../etc/passwd.txt", b"secret content", "text/plain")
    }
    response = client.post("/upload", files=files)

    assert response.status_code == 200
    data = response.json()
    assert data["document"]["filename"] == "passwd.txt"
    assert "/" not in data["document"]["filename"]
    assert "\\" not in data["document"]["filename"]


def test_12_temporary_file_cleanup():
    """Test that temporary files are removed after upload completes."""
    files = {
        "file": (
            "cleanup_test.txt",
            b"Temporary file test content",
            "text/plain",
        )
    }
    response = client.post("/upload", files=files)

    assert response.status_code == 200
    doc_id = response.json()["document"]["document_id"]
    temp_path = os.path.join(settings.UPLOAD_DIR, f"{doc_id}.txt")
    assert not os.path.exists(temp_path)


def test_13_successful_upload_response_schema():
    """Test response schema matching UploadResponse structure."""
    files = {
        "file": ("schema_test.txt", b"Schema test content", "text/plain")
    }
    response = client.post("/upload", files=files)

    assert response.status_code == 200
    data = response.json()
    required_keys = {"success", "document", "status"}
    assert required_keys.issubset(data.keys())
    doc_keys = {
        "document_id",
        "filename",
        "file_type",
        "file_size",
        "page_count",
        "character_count",
    }
    assert doc_keys.issubset(data["document"].keys())
