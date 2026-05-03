import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
)
log = logging.getLogger(__name__)

load_dotenv()

from routers import knowledge_bases, documents, chat


@asynccontextmanager
async def lifespan(_):
    keys = {
        "SUPABASE_URL": bool(os.getenv("SUPABASE_URL")),
        "SUPABASE_SERVICE_KEY": bool(os.getenv("SUPABASE_SERVICE_KEY")),
        "OPENAI_API_KEY": bool(os.getenv("OPENAI_API_KEY")),
        "ANTHROPIC_API_KEY": bool(os.getenv("ANTHROPIC_API_KEY")),
    }
    for name, present in keys.items():
        log.info("  %-25s %s", name, "OK" if present else "MISSING ⚠")
    if not all(keys.values()):
        log.warning("Some env vars are missing — ingestion will fail.")
    yield


app = FastAPI(title="Grounded API", version="0.1.0", lifespan=lifespan)

origins = [
    "http://localhost:5173",
    "http://localhost:4173",
    os.getenv("FRONTEND_URL", ""),
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in origins if o],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(knowledge_bases.router)
app.include_router(documents.router)
app.include_router(chat.router)



@app.get("/health")
async def health():
    return {"status": "ok"}
