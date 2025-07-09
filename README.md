## Project Directory Structure

```
WEBSITE2PDF+CHAGEDETECTION PIPELINE/
├── BAH 2025/
│   ├── changedetection.io/
│   │   └── website-se-leke-pdf-tak/
│   │       ├── output/
│   │       │   ├── changes.json
│   │       │   ├── changes.pdf
│   │       │   ├── combined_1.pdf
│   │       │   ├── combined_initial.pdf
│   │       │   ├── latest.pdf
│   │       │   ├── master_structured_content.json
│   │       ├── initialize_master_file.py
│   │       ├── json_merger.py
│   │       ├── requirements.txt      ( Make sure to install the requirements)
│   │       ├── url_cache.json
│   │       ├── webhook_server.py     (Main backend logic file)
│   │       └── website-to-pdf.py
│   ├── Document-Based-GraphRag/
│   │   └── Document-Based-GraphRag/
│   │       └── src/
│   │           ├── analysis/
│   │           │   ├── __init__.py
│   │           │   ├── header_detection.py
│   │           │   ├── models.py
│   │           │   ├── output_utils.py
│   │           │   ├── pdf_parser.py
│   │           │   ├── text_utils.py
│   │           │   └── toc_extractor.py
│   │           ├── utils/
│   │           ├── __init__.py
│   │           ├── ingest.py
│   │           ├── parse_pdf.py
│   │           ├── query_api.py
│   │           ├── query.py
│   │           └── test_query.py
│   │           ├── requirements.txt      ( Make sure to install the requirements)
│   ├── MOSDACportal/
│   │   ├── node_modules/
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── assets/
│   │   │   └── components/
│   │   │       ├── chatbot.jsx
│   │   │       ├── datavisualization.jsx
│   │   │       ├── knowledgegraph.jsx
│   │   │       ├── portal.jsx
│   │   │       └── satellitetracker.jsx
│   │   ├── App.css
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── index.html
│   │   ├── main.jsx
│   │   ├── .gitignore
│   │   ├── eslint.config.js
│   │   └── package-lock.json
│   └── venv/
└── .gitignore
```



## Project Setup and Running Instructions

This guide provides instructions to set up and run the backend (Flask server) and frontend (React application) components of your project.

## 1. Project Structure Overview

Your project is organized into several key directories:

* `BAH 2025`: The main project folder.
    * `changedetection.io/website-se-leke-pdf-tak`: Contains the Flask backend for webhook processing, PDF conversion, JSON merging, and Neo4j ingestion.
    * `Document-Based-GraphRag/Document-Based-GraphRag/src`: Houses the core Python modules for PDF parsing, graph ingestion, and querying.
    * `MOSDACportal`: Contains the React frontend application.

## 2. Prerequisites

Before you begin, ensure you have the following installed:

* **Python 3.x**: [https://www.python.org/downloads/](https://www.python.org/downloads/)
* **Node.js & npm**: [https://nodejs.org/](https://nodejs.org/) (npm is installed with Node.js)
* **wkhtmltopdf**: A command-line tool to convert HTML to PDF.
    * **Windows:** Download and install from [https://wkhtmltopdf.org/downloads.html](https://wkhtmltopdf.org/downloads.html). Make sure to add it to your system's PATH or update the `WKHTMLTOPDF_PATH` variable in `webhook_server.py`.
    * **Linux/macOS:** Install via your package manager (e.g., `sudo apt-get install wkhtmltopdf` or `brew install wkhtmltopdf`).
* **Neo4j Database (Optional but Recommended)**: If you plan to use the graph RAG features, you'll need a running Neo4j instance. Refer to the Neo4j documentation for installation: [https://neo4j.com/download/](https://neo4j.com/download/)

## 3. ChangeDetection.io Setup (Dockerized)

We'll use `changedetection.io` to monitor websites and notify your backend upon updates.

### 3.1 Clone the official repository

```bash
cd "BAH 2025"
git clone https://github.com/dgtlmoon/changedetection.io.git
cd changedetection.io
```

### 3.2 Create a Docker Compose file

Inside the `changedetection.io/` directory, create or edit `docker-compose.yml`:

```yaml
version: '3.3'

services:
  changedetection:
    image: ghcr.io/dgtlmoon/changedetection.io
    container_name: changedetection
    ports:
      - "5000:5000"
    volumes:
      - ./datastore:/datastore
    environment:
      - BASE_URL=http://localhost:5000
    restart: unless-stopped
```

### 3.3 Launch Changedetection.io

```bash
docker-compose up -d
```

- Access the web interface at: http://localhost:5000

### 3.4 Configure Watch and Webhook

1. Open the UI and **Add a new site** to monitor.
2. Scroll to **Notification > Webhook URL**.
3. Set it to:

```bash
http://host.docker.internal:5001/webhook  # Windows/macOS
```

> On Linux, use your host IP address or Docker bridge network.

---

## 4. Backend Setup and Running

The backend is a Flask application responsible for processing web changes, converting them to structured data, and updating a Neo4j knowledge graph.

### 4.1. Install Python Dependencies

1.  **Open your terminal or command prompt.**
2.  **Navigate to the backend directory:**
    ```
    cd "BAH 2025/changedetection.io/website-se-leke-pdf-tak"
    ```
3.  **Install required Python packages:**
    ```
    pip install Flask Flask-Cors PyMuPDF neo4j google-generativeai
    ```
    * `Flask`: The web framework.
    * `Flask-Cors`: For handling Cross-Origin Resource Sharing.
    * `PyMuPDF` (includes `fitz`): For PDF parsing.
    * `neo4j`: The Neo4j Python driver.

### 4.2. Configure `wkhtmltopdf` Path

* Open `webhook_server.py` located in `BAH 2025/changedetection.io/website-se-leke-pdf-tak`.
* Locate the `WKHTMLTOPDF_PATH` variable and ensure it points to the correct executable path on your system.
    ```python
    WKHTMLTOPDF_PATH = r"C:\Program Files\wkhtmltopdf\bin\wkhtmltopdf.exe" # Example for Windows
    # For Linux/macOS, it might be something like:
    # WKHTMLTOPDF_PATH = "/usr/local/bin/wkhtmltopdf"
    ```

### 4.3. Run the Backend Server

1.  **Ensure you are still in the backend directory:**
    ```
    cd "BAH 2025/changedetection.io/website-se-leke-pdf-tak"
    ```
2.  **Run the Flask application:**
    ```
    python webhook_server.py
    ```
    The server will start on `http://127.0.0.1:5001/` and will display messages like:
    ```
     * Serving Flask app 'webhook_server'
     * Debug mode: on
    ```
    Keep this terminal window open as long as you want the backend to run.

## 5. Frontend Setup and Running

The frontend is a React application that likely interacts with the backend for data visualization and querying.

### 5.1. Install Node.js Dependencies

1.  **Open a new terminal or command prompt window.**
2.  **Navigate to the frontend directory:**
    ```
    cd "BAH 2025/MOSDACportal"
    ```
3.  **Install required Node.js packages:**
    ```
    npm install
    ```
    This command reads `package.json` and installs all necessary dependencies (e.g., React, Vite, etc.).

### 5.2. Run the Frontend Development Server

1.  **Ensure you are still in the frontend directory:**
    ```
    cd "BAH 2025/MOSDACportal"
    ```
2.  **Start the React development server:**
    ```
    npm install
    npm run dev
    ```
    This will typically start the frontend on `http://localhost:5173/` (or a similar port). The terminal will show you the local URL where the application is accessible.

## 6. Usage

* **Backend (`webhook_server.py`):**
    * Listens for POST requests on `/webhook` (e.g., from `changedetection.io`) to process website changes.
    * Listens for POST requests on `/api/query` for graph RAG queries.
    * You can test these endpoints using `curl` or tools like Postman/Insomnia.

    Example `curl` for webhook:
    ```
    curl -X POST -H "Content-Type: application/json" -d '{"watch_url": "https://www.example.com"}' http://127.0.0.1:5001/webhook
    ```

    Example `curl` for query:
    ```
    curl -X POST -H "Content-Type: application/json" -d '{"query": "What is the main topic of the document?"}' http://127.0.0.1:5001/api/query
    ```

* **Frontend (`MOSDACportal`):**
    * Access the application in your web browser at the URL provided by `npm run dev` (e.g., `http://localhost:5173/`).
    * Interact with the UI components (e.g., `chatbot.jsx`, `datavisualization.jsx`, `knowledgegraph.jsx`) which will likely communicate with your Flask backend.

---

**Troubleshooting Tips:**

* **`ModuleNotFoundError`**: Double-check that you've run `pip install` for all necessary Python libraries and that your `sys.path` setup in `webhook_server.py` is correct.
* **`wkhtmltopdf` not found**: Verify the `WKHTMLTOPDF_PATH` in `webhook_server.py` is accurate for your system.
* **Neo4j connection issues**: Ensure your Neo4j database is running and accessible from the machine running the Flask app. Check connection details (URI, username, password) in your `ingest.py` and `query.py` files.
* **Frontend build issues**: If `npm install` or `npm run dev` fail, check the error messages for missing packages or syntax errors. You might need to clear `node_modules` and `package-lock.json` and try `npm install` again.
* **CORS errors**: If your frontend cannot communicate with the backend, ensure `Flask-Cors` is correctly configured in `webhook_server.py` (which it is, with `CORS(app)`).

