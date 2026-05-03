import os
import tempfile
import zipfile
from pathlib import Path

SUPPORTED_EXTS = {'.pdf', '.docx', '.txt', '.md', '.csv', '.xlsx'}


def extract_files(zip_path: str) -> list[tuple[str, str]]:
    """Return [(inner_filename, extracted_text)] for every supported file in the zip."""
    results: list[tuple[str, str]] = []

    with zipfile.ZipFile(zip_path) as zf:
        for info in zf.infolist():
            if info.is_dir():
                continue
            ext = Path(info.filename).suffix.lower()
            if ext not in SUPPORTED_EXTS:
                continue

            raw = zf.read(info.filename)
            tmp_path: str | None = None
            try:
                with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
                    tmp.write(raw)
                    tmp_path = tmp.name

                if ext == '.pdf':
                    from ingestion.parsers.pdf_parser import extract_text
                    text = extract_text(tmp_path)
                elif ext == '.docx':
                    from ingestion.parsers.docx_parser import extract_text
                    text = extract_text(tmp_path)
                else:
                    text = raw.decode('utf-8', errors='replace')

                if text.strip():
                    results.append((info.filename, text))
            except Exception:
                pass
            finally:
                if tmp_path and os.path.exists(tmp_path):
                    os.unlink(tmp_path)

    return results
