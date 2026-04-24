from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class KnowledgeBaseCreate(BaseModel):
    name: str
    description: Optional[str] = None


class KnowledgeBase(BaseModel):
    id: UUID
    user_id: UUID
    name: str
    description: Optional[str] = None
    created_at: datetime


class Document(BaseModel):
    id: UUID
    knowledge_base_id: UUID
    file_name: Optional[str] = None
    source_url: Optional[str] = None
    status: str
    chunk_count: int = 0
    created_at: datetime


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    knowledge_base_id: UUID
    conversation_history: list[ChatMessage] = []


class Source(BaseModel):
    name: Optional[str] = None
    url: Optional[str] = None


class URLIngestRequest(BaseModel):
    url: str
