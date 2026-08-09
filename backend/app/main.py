"""NexusAI Backend — FastAPI Application Entry Point."""

from fastapi import FastAPI
from api.rag import router as rag_router
from api.search import router as search_router
from api.upload import router as upload_router

app = FastAPI(
    title="NexusAI API",
    description="Enterprise-grade AI Knowledge Workspace API",
    version="0.1.0",
)

app.include_router(upload_router)
app.include_router(upload_router, prefix="/api/v1")
app.include_router(search_router)
app.include_router(search_router, prefix="/api/v1")
app.include_router(rag_router)
app.include_router(rag_router, prefix="/api/v1")


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "service": "nexusai-api"}
