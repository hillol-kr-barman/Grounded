from pathlib import Path

_MIME_MAP = {
    ".pdf": "application/pdf",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".txt": "text/plain",
    ".md": "text/markdown",
    ".csv": "text/csv",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}


def detect_mime_type(filename: str) -> str:
    return _MIME_MAP.get(Path(filename).suffix.lower(), "text/plain")


async def extract_text(
    file_path: str,
    filename: str,
    source_url: str | None = None,
) -> str:
    if source_url:
        from ingestion.parsers.url_parser import extract_text as _url
        return await _url(source_url)

    mime_type = detect_mime_type(filename)

    if mime_type == "application/pdf":
        from ingestion.parsers.pdf_parser import extract_text as _pdf
        return _pdf(file_path)

    if mime_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        from ingestion.parsers.docx_parser import extract_text as _docx
        return _docx(file_path)

    from ingestion.parsers.text_parser import extract_text as _text
    return _text(file_path, mime_type)
