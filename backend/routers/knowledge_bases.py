from fastapi import APIRouter, Depends
from models.schemas import KnowledgeBase, KnowledgeBaseCreate
from services.retrieval import get_supabase
from dependencies import get_current_user_id

router = APIRouter(prefix="/knowledge-bases", tags=["knowledge-bases"])


@router.post("", response_model=KnowledgeBase)
async def create_kb(
    body: KnowledgeBaseCreate,
    user_id: str = Depends(get_current_user_id),
):
    result = get_supabase().table("knowledge_bases").insert(
        {"user_id": user_id, "name": body.name, "description": body.description}
    ).execute()
    return result.data[0]


@router.get("", response_model=list[KnowledgeBase])
async def list_kbs(user_id: str = Depends(get_current_user_id)):
    result = (
        get_supabase()
        .table("knowledge_bases")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.delete("/{kb_id}", status_code=204)
async def delete_kb(kb_id: str, user_id: str = Depends(get_current_user_id)):
    get_supabase().table("knowledge_bases").delete().eq("id", kb_id).eq(
        "user_id", user_id
    ).execute()
