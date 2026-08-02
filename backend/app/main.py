"""NexusAI Backend — FastAPI Application Entry Point."""

from fastapi import FastAPI

app = FastAPI(
    title="NexusAI API",
    description="Enterprise-grade AI Knowledge Workspace API",
    version="0.1.0",
)


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "nexusai-api"}
