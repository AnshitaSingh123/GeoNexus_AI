import sys
import json
from pathlib import Path

# --- CONFIGURATION ---

# Set this to your existing combined PDF
COMBINED_PDF_PATH = r"C:\Users\ashis\OneDrive\Desktop\ALL PROJECTS\combined_initial.pdf"

# Set where you want the JSON to be saved
OUTPUT_JSON_PATH = r"C:\Users\ashis\OneDrive\Desktop\ALL PROJECTS\master_structured_content.json"

# Add GraphRAG src folder to sys.path
GRAPH_RAG_SRC = r"C:\Users\ashis\OneDrive\Desktop\ALL PROJECTS\website2pdf+chagedetection pipeline\BAH 2025\Document-Based-GraphRag\Document-Based-GraphRag\src"
sys.path.append(str(GRAPH_RAG_SRC))

# Import GraphRAG’s PDF parser
try:
    from pdf_reader import parse_pdf
except ImportError:
    print("❌ Could not import 'parse_pdf'. Check the GraphRAG 'src' path.")
    sys.exit(1)

def parse_combined_pdf_to_json(pdf_path: str, json_path: str):
    print(f"📄 Parsing PDF: {pdf_path}")
    if not Path(pdf_path).exists():
        print("❌ PDF not found. Please check the path.")
        return

    try:
        document = parse_pdf(pdf_path)
        structured_json = {
            "title": document.title or "Master Document",
            "sections": [s.__dict__ for s in document.sections]
        }
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(structured_json, f, indent=2, ensure_ascii=False)
        print(f"✅ Master JSON created at: {json_path}")
    except Exception as e:
        print(f"❌ Failed to parse PDF: {e}")

if __name__ == "__main__":
    parse_combined_pdf_to_json(COMBINED_PDF_PATH, OUTPUT_JSON_PATH)
-*