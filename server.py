from flask import Flask, render_template, request, jsonify, Response
import os
from llama_index.core import VectorStoreIndex, SimpleDirectoryReader, Settings, StorageContext, PromptTemplate
from llama_index.core.node_parser import SentenceSplitter
from llama_index.llms.ollama import Ollama
from llama_index.embeddings.ollama import OllamaEmbedding
import chromadb
from llama_index.vector_stores.chroma import ChromaVectorStore
import json

app = Flask(__name__)

#Inicjalizacja RAG
print("Inicjalizacja serwera AI...")
Settings.llm = Ollama(model="llama3", request_timeout=300.0)
Settings.embed_model = OllamaEmbedding(model_name="nomic-embed-text")
# Settings.text_splitter = SentenceSplitter(chunk_size=512, chunk_overlap=50)

db = chromadb.PersistentClient(path="./chroma_db")
chroma_collection = db.get_or_create_collection("moj_projekt_rag")
vector_store = ChromaVectorStore(chroma_collection=chroma_collection)
storage_context = StorageContext.from_defaults(vector_store=vector_store)

if chroma_collection.count() == 0:
    documents = SimpleDirectoryReader("./dane").load_data()
    index = VectorStoreIndex.from_documents(documents, storage_context=storage_context)
else:
    index = VectorStoreIndex.from_vector_store(vector_store=vector_store)

query_engine = index.as_query_engine(streaming=True)

temp = (
"Context information is below.\n"
    "---------------------\n"
    "{context_str}\n"
    "---------------------\n"
    "Given the context information and not prior knowledge, answer the query.\n"
    "Query: {query_str}\n"
    "Answer: "
)
query_engine.update_prompts({"response_synthesizer:text_qa_template": PromptTemplate(temp)})
print("Server is Ready!")


# Endpointy Webowe (Routing)

# Wyświetla stronę HTML
@app.route('/')
def main_site():
    return render_template('index.html')


# Odbiera pytania z JavaScriptu i zwraca odpowiedź AI w formacie JSON
@app.route('/chat', methods=['POST'])
def czat():
    dane = request.get_json()
    question = dane.get('message')

    if not question:
        return jsonify({"error": "Missing question"}), 400

    res = query_engine.query(question)

    def generate():
        for fragment in res.response_gen:
            # Pakujemy fragment w JSON, aby bezpiecznie przesłać znaki nowej linii
            packa = json.dumps({"tekst": fragment})
            yield f"data: {packa}\n\n"

        # Po zakończeniu generowania wysyłamy sygnał końca
        yield f"data: {json.dumps({'over': True})}\n\n"

    return Response(generate(), mimetype='text/event-stream')


if __name__ == '__main__':
    # Serwer uruchomi się na porcie 5000
    app.run(debug=True, port=5000)