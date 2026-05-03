import logging
import os
from ingestion.extractor import extract_text
from ingestion.chunker import chunk_text
from services.embeddings import embed_batch
from services.retrieval import get_supabase

log = logging.getLogger(__name__)

_EMBED_BATCH_SIZE = 100


async def _upsert_chunks(
    supabase,
    chunks: list[str],
    document_id: str,
    knowledge_base_id: str,
    source_name: str,
    source_url: str | None,
) -> int:
    for batch_start in range(0, len(chunks), _EMBED_BATCH_SIZE):
        batch = chunks[batch_start : batch_start + _EMBED_BATCH_SIZE]
        log.info("[%s] embedding batch %d–%d", document_id[:8], batch_start, batch_start + len(batch))
        embeddings = await embed_batch(batch)
        log.info("[%s] inserting %d chunks into document_chunks", document_id[:8], len(batch))
        supabase.table("document_chunks").insert(
            [
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
        ).execute()
    return len(chunks)


async def ingest_document(
    document_id: str,
    knowledge_base_id: str,
    file_path: str | None,
    filename: str | None,
    source_url: str | None,
    source_name: str,
) -> int:
    log.info("[%s] ingestion started — file=%s", document_id[:8], filename or source_url)
    try:
        supabase = get_supabase()
        is_zip = filename and filename.lower().endswith('.zip')

        if is_zip and file_path:
            from ingestion.parsers.zip_parser import extract_files
            log.info("[%s] extracting zip", document_id[:8])
            file_entries = extract_files(file_path)
            if not file_entries:
                raise ValueError("No supported files found in the zip archive.")
            log.info("[%s] zip contains %d supported files", document_id[:8], len(file_entries))

            total_chunks = 0
            for inner_filename, text in file_entries:
                chunks = chunk_text(text)
                if chunks:
                    total_chunks += await _upsert_chunks(
                        supabase, chunks, document_id, knowledge_base_id,
                        source_name=inner_filename, source_url=None,
                    )
        else:
            log.info("[%s] extracting text", document_id[:8])
            text = await extract_text(
                file_path=file_path or "",
                filename=filename or "",
                source_url=source_url,
            )
            log.info("[%s] extracted %d chars, chunking", document_id[:8], len(text))
            chunks = chunk_text(text)
            if not chunks:
                raise ValueError("No text could be extracted from the document.")
            log.info("[%s] %d chunks to embed", document_id[:8], len(chunks))
            total_chunks = await _upsert_chunks(
                supabase, chunks, document_id, knowledge_base_id,
                source_name=source_name, source_url=source_url,
            )

        supabase.table("kb_documents").update(
            {"status": "ready", "chunk_count": total_chunks}
        ).eq("id", document_id).execute()
        log.info("[%s] done — %d chunks ingested", document_id[:8], total_chunks)
        return total_chunks

    except Exception as exc:
        log.error("[%s] ingestion failed: %s", document_id[:8], exc, exc_info=True)
        try:
            get_supabase().table("kb_documents").update({"status": "failed"}).eq(
                "id", document_id
            ).execute()
        except Exception:
            pass
        raise

    finally:
        if file_path and os.path.exists(file_path):
            os.unlink(file_path)
