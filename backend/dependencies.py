from fastapi import HTTPException, Header
from services.retrieval import get_supabase


async def get_current_user_id(authorization: str = Header(...)) -> str:
    supabase = get_supabase()
    token = authorization.replace("Bearer ", "")
    try:
        result = supabase.auth.get_user(token)
        if not result.user:
            raise HTTPException(status_code=401, detail="Unauthorized")
        return result.user.id
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired session. Please sign in again.")
