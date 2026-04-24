import os
from typing import AsyncIterator
from anthropic import AsyncAnthropic

_client: AsyncAnthropic | None = None

SYSTEM_PROMPT = """You are a helpful assistant that answers questions based strictly on the provided context.

If the context does not contain enough information to answer the question, say so clearly.
Be factual, cite specific parts of the source material when useful, and do not draw on knowledge outside the provided context."""


def get_client() -> AsyncAnthropic:
    global _client
    if _client is None:
        _client = AsyncAnthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
    return _client


async def stream_rag_response(
    question: str,
    context_chunks: list[dict],
    conversation_history: list[dict],
) -> AsyncIterator[str]:
    context_text = "\n\n---\n\n".join(
        f"[Source: {chunk.get('source_name', 'Unknown')}]\n{chunk['content']}"
        for chunk in context_chunks
    )

    messages = list(conversation_history)
    messages.append(
        {
            "role": "user",
            "content": f"Context:\n{context_text}\n\nQuestion: {question}",
        }
    )

    async with get_client().messages.stream(
        model="claude-haiku-4-5-20251001",
        max_tokens=1024,
        system=SYSTEM_PROMPT,
        messages=messages,
    ) as stream:
        async for text in stream.text_stream:
            yield text
