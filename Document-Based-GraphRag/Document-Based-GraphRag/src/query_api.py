# query_api.py
from flask import Flask, request, jsonify
from query import GraphRAGQuery
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend access

# Initialize the RAG system
rag = GraphRAGQuery()

@app.route('/ask', methods=['POST'])
def ask():
    data = request.json
    query = data.get("query", "")
    
    if not query:
        return jsonify({"status": "error", "message": "Query is missing."}), 400

    try:
        result = rag.get_connected_nodes(query)
        return jsonify(result)
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/health')
def health():
    return "RAG backend is running", 200

if __name__ == '__main__':
    app.run(port=5001)
