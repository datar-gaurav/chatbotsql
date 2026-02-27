import os
import sys
import yaml
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from langchain_core.globals import set_llm_cache
from langchain_community.cache import SQLiteCache
from langchain_community.utilities import SQLDatabase
from langchain_community.chat_models import ChatOllama
from langchain_community.agent_toolkits import create_sql_agent

# Load environment variables
load_dotenv()

# Global variables to hold our LangChain objects
agent_executor = None

class ChatRequest(BaseModel):
    query: str

@asynccontextmanager
async def lifespan(app: FastAPI):
    # This runs once when the FastAPI server starts up
    global agent_executor
    print("Initializing application...", flush=True)

    db_uri = os.environ.get("DB_URI")
    if not db_uri:
        print("ERROR: DB_URI environment variable not set.")
        sys.exit(1)

    print("Configuring LangChain SQLite Cache...", flush=True)
    # This will create a local SQLite DB for caching exact prompt matches
    set_llm_cache(SQLiteCache(database_path=".langchain.db"))

    print("Loading config...", flush=True)
    try:
        with open("config.yaml", "r") as f:
            config = yaml.safe_load(f)
            allowed_tables = config.get("allowed_tables", [])
            print(f"Allowed tables: {allowed_tables}")
    except Exception as e:
        print(f"Failed to load config.yaml: {e}")
        sys.exit(1)

    print("Connecting to database...", flush=True)
    try:
        db = SQLDatabase.from_uri(db_uri, include_tables=allowed_tables)
        print("Successfully connected to database.", flush=True)
    except Exception as e:
        print(f"Failed to connect to database: {e}", flush=True)
        sys.exit(1)

    print("Initializing Ollama LLM...", flush=True)
    ollama_host = os.environ.get("OLLAMA_HOST", "http://host.docker.internal:11434")
    llm = ChatOllama(model="llama3.1", temperature=0, base_url=ollama_host)

    print("Creating SQL Agent...", flush=True)
    agent_executor = create_sql_agent(
        llm=llm,
        db=db,
        agent_type="zero-shot-react-description",
        verbose=True,
        handle_parsing_errors=True
    )
    print("Application initialized successfully!", flush=True)

    yield  # Hand control back to FastAPI to start accepting requests

    # Cleanup (if any) would go here
    print("Shutting down application...", flush=True)

app = FastAPI(lifespan=lifespan)

# Allow all origins so any HTML file or app can embed the widget
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Extremely simple in-memory cache
# Maps user query strings verbatim to their resolved text answers. 
# Re-running the UI containers clears this.
response_cache = {}

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    if not agent_executor:
        raise HTTPException(status_code=500, detail="Agent is not initialized.")
    
    # 1. Intercept before doing ANY LLM work
    query_key = request.query.strip().lower()
    if query_key in response_cache:
        print(f"CACHE HIT for: {query_key}", flush=True)
        return {"response": response_cache[query_key]}
    
    # 2. Otherwise run the agent
    print(f"CACHE MISS for: {query_key}", flush=True)
    try:
        response = agent_executor.invoke({"input": request.query})
        final_answer = response.get("output", "I could not find an answer.")
        
        # 3. Store the expensive result in the cache dictionary
        response_cache[query_key] = final_answer
        
        return {"response": final_answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
