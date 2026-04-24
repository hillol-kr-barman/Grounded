import os
from ingestion.extractor import extract_text
from ingestion.chunker import chunk_text
from services.embeddings import embed_batch
from services.retrieval import get_supabase

_EMBED_BATCH_SIZE = 100


async def ingest_document(
    document_id: str,
    knowledge_base_id: str,
    file_path: str | None,
    filename: str | None,
    source_url: str | None,
    source_name: str,
) -> int:
    supabase = get_supabase()

    try:
        text = await extract_text(
            file_path=file_path or "",
            filename=filename or "",
            source_url=source_url,
        )

        chunks = chunk_text(text)
        if not chunks:
            raise ValueError("No text could be extracted from the document.")

        for batch_start in range(0, len(chunks), _EMBED_BATCH_SIZE):
            batch = chunks[batch_start : batch_start + _EMBED_BATCH_SIZE]
            embeddings = await embed_batch(batch)
            rows = [
                {
                    "knowledge_base_id": knowledge_base_id,
                    "document_id": document_id,
                    "content": chunk,
                    "embedding": embedding,
                    "source_name": source_name,
                    "source_url": source_url,
                }
                for chunk, embedding in zip(batch, embeddings)
            ]
            supabase.table("document_chunks").insert(rows).execute()

        supabase.table("kb_documents").update(
            {"status": "ready", "chunk_count": len(chunks)}
        ).eq("id", document_id).execute()

        return len(chunks)

    except Exception:
        supabase.table("kb_documents").update({"status": "failed"}).eq(
            "id", document_id
        ).execute()
        raise

    finally:
        if file_path and os.path.exists(file_path):
            os.unlink(file_path)
