from query import GraphRAGQuery

graph_rag = GraphRAGQuery()

query = "what is INSAT-3DR ?"
result = graph_rag.get_connected_nodes(query)
print("RESULT:", result)
print("===== LLM RESPONSE =====")
print(result["llm_response"])

print("\n===== Main Section =====")
print(f"{result['title']} (ID: {result['id']})\n{result['answer']}")

print("\n===== Related Sections =====")
for context in result["context"]:
    print(f"- {context['title']} [Similarity: {context['cosine_similarity']:.2f}]")

graph_rag.close()
