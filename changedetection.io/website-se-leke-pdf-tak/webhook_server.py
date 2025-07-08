#!/usr/bin/env python3

from flask import Flask, request
from flask_cors import CORS

import subprocess
import json
import os
from pathlib import Path
import sys

# --- PATH SETUP ---
# Add the GraphRAG source directory to the Python path.
# This MUST be done BEFORE importing your custom modules.
# It assumes 'webhook_server.py' is inside 'website-se-leke-pdf-tak',
# and 'Document-Based-GraphRag' is two directories up from 'website-se-leke-pdf-tak'.
graphrag_src = (
    Path(__file__)
    .parent
    .parent
    .parent
    / "Document-Based-GraphRag"
    / "Document-Based-GraphRag"
    / "src"
)

# Add the path to sys.path if it's not already there
if str(graphrag_src) not in sys.path:
    sys.path.append(str(graphrag_src))
    print(f"Appended to sys.path: {graphrag_src}")


# --- CUSTOM MODULE IMPORTS ---
# These imports MUST come AFTER the sys.path modification to ensure
# Python can find them.
try:
    from pdf_reader import parse_pdf
    from ingest import GraphRAGIngestion
    from json_merger import JSONMerger
    from query import GraphRAGQuery
except ImportError as e:
    print(f"❌ Error importing custom modules: {e}")
    print(f"Please ensure the path '{graphrag_src}' is correct and contains all necessary files (pdf_reader.py, ingest.py, json_merger.py, query.py).")
    sys.exit(1) # Exit if essential modules can't be imported

app = Flask(__name__)
CORS(app)


# --- CONFIGURATION ---
# IMPORTANT: Adjust this path to your wkhtmltopdf executable.
# The current path is for Windows. For Linux/macOS, it might be '/usr/local/bin/wkhtmltopdf'
# or found in your system's PATH.
WKHTMLTOPDF_PATH = r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe"

# Define file paths for output
OUTPUT_DIR = Path(__file__).parent / "output"
MASTER_JSON_PATH = OUTPUT_DIR / "master_structured_content.json"
CHANGES_PDF_PATH = OUTPUT_DIR / "changes.pdf"
CHANGES_JSON_PATH = OUTPUT_DIR / "changes.json"

# --- HELPER FUNCTIONS ---
def initialize_master_json():
    """Creates an empty master JSON file if it doesn't exist."""
    if not MASTER_JSON_PATH.exists():
        print("Master JSON not found. Creating a new one.")
        with open(MASTER_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump({"title": "Master Document", "sections": []}, f, indent=2)

# --- FLASK WEBHOOK ---
@app.route("/webhook", methods=["POST"])
def webhook():
    """
    Webhook to detect website changes, convert them to PDF, parse to JSON,
    merge into a master file, and update the knowledge graph in Neo4j.
    """
    print("📦 Webhook received!")
    data = request.json or {}
    print("Payload:", json.dumps(data, indent=2))

    url = data.get("watch_url")
    if not url:
        print("❌ Missing 'watch_url' in payload.")
        return "Missing watch_url", 400

    # Ensure output directory and master file exist
    OUTPUT_DIR.mkdir(exist_ok=True)
    initialize_master_json()

    # 1. Convert the changed URL content to a PDF
    print(f"=== Converting {url} to PDF ===")
    try:
        subprocess.run([
            WKHTMLTOPDF_PATH,
            "--enable-local-file-access", # Allows access to local files referenced in the HTML
            url,
            str(CHANGES_PDF_PATH)
        ], check=True) # `check=True` raises CalledProcessError on non-zero exit codes
        print(f"✓ PDF of changes generated at {CHANGES_PDF_PATH}")
    except FileNotFoundError:
        print(f"❌ wkhtmltopdf not found at {WKHTMLTOPDF_PATH}. Please ensure it's installed and the path is correct.")
        return "wkhtmltopdf not found", 500
    except subprocess.CalledProcessError as e:
        print(f"❌ PDF generation failed: {e}")
        print(f"Stderr: {e.stderr.decode() if e.stderr else 'N/A'}")
        print(f"Stdout: {e.stdout.decode() if e.stdout else 'N/A'}")
        return "PDF generation failed", 500
    except Exception as e:
        print(f"❌ An unexpected error occurred during PDF generation: {e}")
        return "An unexpected error occurred during PDF generation", 500

    # 2. Parse the changed PDF to structured JSON
    try:
        print("=== Parsing Changes PDF ===")
        document = parse_pdf(str(CHANGES_PDF_PATH))
        structured_json = {
            "title": document.title,
            "sections": [s.__dict__ for s in document.sections] # Convert section objects to dictionaries
        }
        with open(CHANGES_JSON_PATH, "w", encoding="utf-8") as f:
            json.dump(structured_json, f, indent=2)
        print(f"✓ Changes JSON written to {CHANGES_JSON_PATH}")
    except Exception as e:
        print(f"❌ Parsing PDF failed: {e}")
        return "PDF parsing failed", 500

    # 3. Merge the changes JSON into the master JSON
    try:
        print("=== Merging JSON files ===")
        merger = JSONMerger()
        # The merge method updates MASTER_JSON_PATH with the merged content
        merger.merge(str(MASTER_JSON_PATH), str(CHANGES_JSON_PATH), str(MASTER_JSON_PATH))
        print(f"✓ Changes merged into {MASTER_JSON_PATH}")
    except Exception as e:
        print(f"❌ JSON merging failed: {e}")
        return "JSON merging failed", 500

    # 4. Ingest the updated master data into Neo4j (incremental update)
    try:
        print("=== Updating Neo4j Graph ===")
        ingestor = GraphRAGIngestion()
        # The update_graph method will handle incremental updates
        ingestor.update_graph(str(MASTER_JSON_PATH))
        ingestor.close() # Ensure the Neo4j connection is closed
        print("✓ Graph update complete")
    except Exception as e:
        print(f"❌ Neo4j update failed: {e}")
        return "Neo4j update failed", 500

    # Return success response with a 200 OK status code
    return "Webhook processed successfully", 200

@app.route("/api/query", methods=["POST"])
def query_graph():
    """
    API endpoint to query the knowledge graph using GraphRAGQuery.
    Expects a JSON payload with a 'query' field.
    """
    data = request.json or {}
    user_query = data.get("query")

    if not user_query:
        print("❌ Missing 'query' field in request for /api/query.")
        return {"error": "Missing 'query' field in request"}, 400

    try:
        print(f"=== Processing query: '{user_query}' ===")
        query_engine = GraphRAGQuery()
        response = query_engine.get_connected_nodes(user_query)
        print("RESULT:", response)
        print("===== LLM RESPONSE =====")
        print(response["llm_response"])
        
        print("\n===== Main Section =====")
        print(f"{response['title']} (ID: {response['id']})\n{response['answer']}")
        print("\n===== Related Sections =====")
        for context in response["context"]:
            print(f"- {context['title']} [Similarity: {context['cosine_similarity']:.2f}]")

        
        query_engine.close() # Ensure the Neo4j connection is closed
        print("✓ Query processed successfully.")
        return response, 200
    except Exception as e:
        print(f"❌ Query error: {e}")
        return {"error": str(e)}, 500

if __name__ == "__main__":
    # Run the Flask app
    # debug=True enables reloader and debugger, useful for development
    app.run(port=5001, debug=True)

