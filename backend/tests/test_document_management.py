"""Unit tests for document management endpoints (list, get, delete)."""

from fastapi.testclient import TestClient
from app.main import app
from models.document import IngestedDocument, DocumentPage
from services.document_store import save_document

client = TestClient(app)


def test_list_documents_empty():
    """Verify GET /api/v1/documents returns empty list when no docs exist."""
    resp = client.get("/api/v1/documents")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data["documents"], list)
    assert "total" in data


def test_get_document_not_found():
    """Verify GET /api/v1/documents/{id} returns 404 for nonexistent doc."""
    resp = client.get("/api/v1/documents/nonexistent-id-999")
    assert resp.status_code == 404


def test_delete_document_not_found():
    """Verify DELETE /api/v1/documents/{id} returns 404 for nonexistent doc."""
    resp = client.delete("/api/v1/documents/nonexistent-id-999")
    assert resp.status_code == 404


def test_document_lifecycle():
    """Verify save, list, get, and delete lifecycle."""
    doc = IngestedDocument(
        document_id="test-lifecycle-doc-123",
        filename="test_doc.txt",
        file_type="txt",
        mime_type="text/plain",
        file_size=100,
        page_count=1,
        character_count=100,
        pages=[DocumentPage(page_number=1, text="Test lifecycle content.")],
    )
    save_document(doc)

    # 1. Get doc by ID
    get_resp = client.get(f"/api/v1/documents/{doc.document_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["filename"] == "test_doc.txt"

    # 2. List docs
    list_resp = client.get("/api/v1/documents")
    assert list_resp.status_code == 200
    ids = [d["document_id"] for d in list_resp.json()["documents"]]
    assert doc.document_id in ids

    # 3. Delete doc
    del_resp = client.delete(f"/api/v1/documents/{doc.document_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["success"] is True

    del_url = f"/api/v1/documents/{doc.document_id}"
    assert client.get(del_url).status_code == 404
