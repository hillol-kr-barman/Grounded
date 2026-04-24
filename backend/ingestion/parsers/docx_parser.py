from docx import Document


def extract_text(file_path: str) -> str:
    doc = Document(file_path)
    return "\n\n".join(p.text for p in doc.paragraphs if p.text.strip())
