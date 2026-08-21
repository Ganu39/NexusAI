"""User context dependency extracting X-User-ID header."""

from fastapi import Header


async def get_current_user_id(x_user_id: str = Header(default=None)) -> str:
    """Extract and validate X-User-ID header from request."""
    if x_user_id and x_user_id.strip():
        # Sanitize user_id to alphanumeric + underscore/hyphen
        clean_uid = "".join(
            c for c in x_user_id.strip() if c.isalnum() or c in ("-", "_")
        )
        if clean_uid:
            return clean_uid
    return "default_user"
