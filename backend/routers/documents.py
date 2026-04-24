import os
import tempfile
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, UploadFile, File
from models.schemas import URLIngestRequest
from services.retrieval import get_supabase
from ingestion.pipeline import ingest_document
from dependencies import get_current_user_id

router = APIRouter(prefix="/knowledge-bases", tags=["documents"])

_MAX_BYTES = int(os.getenv("MAX_UPLOAD_SIZE_MB", "20")) * 1024 * 1024

_ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md", ".csv", ".xlsx"}


@router.post("/{kb_id}/upload")
async def upload_document(
    kb_id: str,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user_id),
):
    content = await file.read()
    if len(content) > _MAX_BYTES:
        raise HTTPException(400, f"File exceeds {os.getenv('MAX_UPLOAD_SIZE_MB', '20')}MB limit.")

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in _ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"Unsupported file type: {ext}")

    doc_result = get_supabase().table("kb_documents").insert(
        {"knowledge_base_id": kb_id, "file_name": file.filename, "status": "processing"}
    ).execute()
    document_id = doc_result.data[0]["id"]

    with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
        tmp.write(content)
        tmp_path = tmp.name

    background_tasks.add_task(
        ingest_document,
        document_id=document_id,
        knowledge_base_id=kb_id,
        file_path=tmp_path,
        filename=file.filename,
        source_url=None,
        source_name=file.filename or "Uploaded file",
    )
    return {"id": document_id, "status": "processing"}


@router.post("/{kb_id}/url")
async def ingest_url(
    kb_id: str,
    body: URLIngestRequest,
    background_tasks: BackgroundTasks,
    user_id: str = Depends(get_current_user_id),
):
    doc_result = get_supabase().table("kb_documents").insert(
        {
            "knowledge_base_id": kb_id,
            "file_name": body.url,
            "source_url": body.url,
            "status": "processing",
        }
    ).execute()
    document_id = doc_result.data[0]["id"]

    background_tasks.add_task(
        ingest_document,
        document_id=document_id,
        knowledge_base_id=kb_id,
        file_path=None,
        filename=None,
        source_url=body.url,
        source_name=body.url,
    )
    return {"id": document_id, "status": "processing"}


@router.get("/{kb_id}/documents")
async def list_documents(kb_id: str, user_id: str = Depends(get_current_user_id)):
    result = (
        get_supabase()
        .table("kb_documents")
        .select("*")
        .eq("knowledge_base_id", kb_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data
