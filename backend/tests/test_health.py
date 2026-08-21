"""Smoke tests for the NexusAI backend application."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check():
    """Verify the health check endpoint returns a healthy status."""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "nexusai-api"


def test_api_v1_health_check():
    """Verify the /api/v1/health endpoint also returns healthy status."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "nexusai-api"


def test_head_health_check():
    """Verify HEAD method on health check endpoint returns 200 OK."""
    response = client.head("/health")
    assert response.status_code == 200
