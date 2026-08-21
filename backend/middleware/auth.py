"""Authentication dependency and middleware for NexusAI."""

from fastapi import Header, HTTPException, status
from config.settings import settings


async def verify_api_key(x_api_key: str = Header(default=None)):
    """Dependency verifying X-API-Key header if configured."""
    key = settings.NEXUSAI_API_KEY
    required_key = key.strip() if key else ""

    if not required_key:
        # Public / Development mode: no authentication required
        return True

    if not x_api_key or x_api_key.strip() != required_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unauthorized: Invalid or missing X-API-Key header.",
        )

    return True
