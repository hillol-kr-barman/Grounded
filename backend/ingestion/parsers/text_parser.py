import pandas as pd

_SPREADSHEET_TYPES = {
    "text/csv",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
}


def extract_text(file_path: str, mime_type: str = "text/plain") -> str:
    if mime_type in _SPREADSHEET_TYPES:
        if "csv" in mime_type:
            df = pd.read_csv(file_path)
        else:
            df = pd.read_excel(file_path)
        return df.to_string(index=False)

    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        return f.read()
