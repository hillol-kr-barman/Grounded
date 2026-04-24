import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from models.schemas import ChatRequest
from services.embeddings import embed_text
from services.retrieval import search_chunks
from services.llm import stream_rag_response
from dependencies import get_current_user_id

router = APIRouter(tags=["chat"])


@router.post("/chat")
async def chat(
    body: ChatRequest,
    user_id: str = Depends(get_current_user_id),
):
    query_embedding = await embed_text(body.message)
    chunks = await search_chunks(query_embedding, str(body.knowledge_base_id))

    seen: set[str] = set()
    unique_sources: list[dict] = []
    for chunk in chunks:
        name = chunk.get("source_name")
        if name and name not in seen:
            seen.add(name)
            unique_sources.append({"name": name, "url": chunk.get("source_url")})

    history = [{"role": m.role, "content": m.content} for m in body.conversation_history]

    async def generate():
        async for token in stream_rag_response(body.message, chunks, history):
            yield f"data: {json.dumps({'token': token})}\n\n"
        yield f"data: {json.dumps({'sources': unique_sources, 'done': True})}\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")
