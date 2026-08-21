"""NexusAI Backend — FastAPI Application Entry Point."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.rag import router as rag_router
from api.search import router as search_router
from api.upload import router as upload_router
from config.settings import settings

app = FastAPI(
    title="NexusAI API",
    description="Enterprise-grade AI Knowledge Workspace API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(upload_router, prefix="/api/v1")
app.include_router(search_router)
app.include_router(search_router, prefix="/api/v1")
app.include_router(rag_router)
app.include_router(rag_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
@app.get("/api/v1/health", tags=["Health"])
async def health_check():
    """Health check endpoint for monitoring service availability."""
    return {"status": "healthy", "service": "nexusai-api"}
