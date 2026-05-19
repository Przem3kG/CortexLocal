# 🧠 Cortex AI (CortexLocal)

Cortex AI is a local chatbot based on the RAG (Retrieval-Augmented Generation) architecture. This project allows you to text and chat with a Language Model (LLM) that bases its knowledge on your own custom documents. The entire system runs 100% locally, ensuring complete data privacy.

The project utilizes **LlamaIndex** for knowledge management, **ChromaDB** as the vector database, **Ollama** to run local AI models, and **Flask** to handle the server backend alongside a modern, streamed web user interface.

## ✨ Key Features

* **100% Local Processing:** Your data never leaves your machine, thanks to the deep integration with Ollama.
* **RAG Architecture:** The model answers queries based on documents placed within the `./dane` (data) folder.
* **Modern UI (Glassmorphism):** An aesthetic, responsive chat interface featuring frosted glass effects, gradient typography, and smooth entry animations.
* **Real-Time Streaming:** Utilizes Server-Sent Events (SSE) to stream answers token-by-token (just like ChatGPT).
* **Markdown Support:** Full support for text formatting (bolding, lists, code blocks) inside AI responses via `marked.js`.
* **Persistent Knowledge Base:** Uses ChromaDB to store document vector embeddings, allowing the database to be reused instantly without reprocessing files on every restart.

## 🛠️ Tech Stack

**Backend:**
* [Python 3](https://www.python.org/)
* [Flask](https://flask.palletsprojects.com/) (Web server)
* [LlamaIndex](https://www.llamaindex.ai/) (RAG orchestration)
* [ChromaDB](https://www.trychroma.com/) (Vector database)
* [Ollama](https://ollama.com/) (Local LLMs & Embeddings)

**Frontend:**
* HTML5, CSS3, Vanilla JavaScript
* [Marked.js](https://marked.js.org/) (Markdown parser)

## 🚀 Prerequisites

Before launching the project, ensure you have the following installed:
1. **Python 3.8+**
2. **Ollama:** Download and install from [ollama.com](https://ollama.com/)

After installing Ollama, pull the required models. Open your terminal and run:
```bash
ollama run llama3
ollama pull nomic-embed-text
```
## 📦 Installation & Setup
1. Clone the repository:
``` bash
git clone [https://github.com/Przem3kG/cortex-ai.git](https://github.com/Przem3kG/cortex-ai.git)
cd cortex-ai
```
2. Create and activate a virtual environment (optional but recommended):
``` bash
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate
```
3. Install dependencies: \
   Make sure to install the required Python packages: 
``` bash
pip install flask llama-index llama-index-llms-ollama llama-index-embeddings-ollama chromadb llama-index-vector-stores-chroma
```
4. Prepare your knowledge base:
* Create a folder named `dane` in the project's root directory.
* Drop your reference documents (e.g., `.txt`, `.pdf`, etc.) into this folder.

5. Launch the server:
``` bash
python server.py
```
6. Open the application: \
Navigate to your browser and open: http://127.0.0.1:5000

## 📂 Project Structure
``` plaintext
cortex-ai/
│
├── dane/                  # Folder for your source text/PDF documents (RAG context)
├── chroma_db/             # Automatically generated vector database storage
├── static/
│   ├── style.css          # Modern Glassmorphism styling and animations
│   └── script.js          # Frontend client logic & Server-Sent Events (SSE) streaming
├── templates/
│   └── index.html         # Main web chat layout
├── server.py              # Flask server configuration & LlamaIndex RAG pipeline
└── README.md              # Project documentation
```
## ⚙️ Configuration (Optional)
If you wish to change the LLM model being used, modify the following line in `server.py`:
```Python
Settings.llm = Ollama(model="your_preferred_model", request_timeout=300.0)
```
*Note: Ensure you pull the model first using Ollama (`ollama pull your_preferred_model`).*











