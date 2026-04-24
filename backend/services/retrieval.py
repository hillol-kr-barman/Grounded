import os
from supabase import create_client, Client

_supabase: Client | None = None


def get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        _supabase = create_client(
            os.getenv("SUPABASE_URL", ""),
            os.getenv("SUPABASE_SERVICE_KEY", ""),
        )
    return _supabase


async def search_chunks(
    query_embedding: list[float],
    kb_id: str,
    match_count: int = 5,
) -> list[dict]:
    result = get_supabase().rpc(
        "match_chunks",
        {
            "query_embedding": query_embedding,
            "kb_id": kb_id,
            "match_count": match_count,
        },
    ).execute()
    return result.data or []
