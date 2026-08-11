"""Tests for CORS middleware configuration."""

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

VERCEL_ORIGIN = "https://nexusai-sage-beta.vercel.app"
LOCAL_ORIGIN = "http://localhost:3000"
UNAPPROVED_ORIGIN = "https://unapproved-malicious-domain.com"


def test_cors_preflight_vercel_origin():
    """Verify OPTIONS preflight request from Vercel returns CORS headers."""
    headers = {
        "Origin": VERCEL_ORIGIN,
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "content-type",
    }
    response = client.options("/api/v1/upload", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == VERCEL_ORIGIN
    assert "POST" in response.headers.get("access-control-allow-methods", "")


def test_cors_preflight_localhost_origin():
    """Verify OPTIONS preflight request from localhost returns CORS headers."""
    headers = {
        "Origin": LOCAL_ORIGIN,
        "Access-Control-Request-Method": "GET",
    }
    response = client.options("/api/v1/documents", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == LOCAL_ORIGIN


def test_cors_actual_request_vercel_origin():
    """Verify GET request with Vercel origin returns CORS headers."""
    headers = {"Origin": VERCEL_ORIGIN}
    response = client.get("/health", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == VERCEL_ORIGIN


def test_cors_unapproved_origin_rejected():
    """Verify an unapproved origin does not get Access-Control-Allow-Origin."""
    headers = {"Origin": UNAPPROVED_ORIGIN}
    response = client.get("/health", headers=headers)
    allowed_origin = response.headers.get("access-control-allow-origin")
    assert allowed_origin != UNAPPROVED_ORIGIN
