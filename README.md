# Local AI SQL Assistant

A powerful, entirely local, and open-source SQL Chatbot integration. This project provides a Dockerized infrastructure for querying a PostgreSQL database using natural language via **Ollama** (`llama3.1`) and the **LangChain SQL Agent**.

It ships with a robust **FastAPI backend** and a generic, **drop-in JavaScript widget** that can instantly add AI-powered data querying capabilities to any existing web application or HTML page.

## ✨ Key Features

- **Embeddable Chat UI**: Includes a vanilla `widget.js` script that injects a polished, floating chat interface into ANY website—no frontend framework required.
- **Auto-Detect SQL Schema**: The LangChain ReAct agent intelligently discovers tables and infers the correct database schema to query on its own.
- **Zero-Latency Semantic Caching**: Identical user queries bypass the LLM entirely, yielding instant (`0.003s`) cached responses while reducing local GPU/CPU load.
- **Strict Schema Exclusions**: Define exactly which tables the AI is allowed to "see" via a whitelist in `config.yaml`. Sensitive tables are completely hidden from the agent.
- **100% Local & Private**: Powered entirely by Ollama running locally. No data ever leaves your machine—no external API keys or cloud subscriptions needed.
- **Instant Docker Setup**: Spin up the Postgres database and the FastAPI server simultaneously using a single `docker-compose` command.

## 🚀 Getting Started

### Prerequisites
1. **Docker**: Ensure [Docker Desktop](https://www.docker.com/) is installed and running.
2. **Ollama**: Ensure [Ollama](https://ollama.com/) is installed locally.
3. **LLM Model**: Pull the recommended Llama 3.1 model:
   ```bash
   ollama run llama3.1
   ```

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/sqlchatbot.git
   cd sqlchatbot
   ```

2. **Start the containers** via Docker Compose:
   ```bash
   docker-compose up --build -d
   ```
   > *Note: This automatically boots up a PostgreSQL database on port 5432 (pre-seeded with sample `employees` and `departments` data) alongside the FastAPI web server on port 8000.*

### Experiencing the Chatbot

To see the Chat UI in action, simply open the `index.html` file in your browser:

- Double-click `index.html` in your file explorer, or open it via the `file://` protocol.
- Click the chat bubble icon in the bottom right corner.
- Ask a natural language question about the data, such as:
  - *"List all employees in the Engineering department."*
  - *"Who is the highest paid person in Sales?"*

Because the widget is comprised of pure vanilla JavaScript and CSS (`widget.js`), integrating this into your own apps is as simple as dropping `<script src="widget.js"></script>` into your frontend codebase.

## 🛠 Project Architecture

- **`main.py`**: The FastAPI server. Initializes the LangChain SQLAgent, connects to Ollama, registers the memory cache, and serves the `POST /chat` endpoint.
- **`widget.js`**: A self-contained script containing auto-injecting HTML, CSS styling, and logic to communicate with the FastAPI backend.
- **`config.yaml`**: Configuration file used to enforce schema restriction. Only the tables listed under `allowed_tables` are visible to the AI.
- **`init.sql`**: Automatically sets up test tables and populates them with sample data when the Postgres container initializes for the first time.
- **`docker-compose.yml`**: Deploys the Python and Postgres containers, exposes port `8000` for the UI, and networks the application back to your host machine's Ollama listener.

## 🔒 Customizing Schema Access
To expose new tables or restrict existing ones, edit `config.yaml`:
```yaml
allowed_tables:
  - employees
  - departments
  # - my_new_super_secret_table  <-- Do not list this, and the LLM will never know it exists!
```
Restart the API container (`docker-compose restart app`) for changes to take effect.
