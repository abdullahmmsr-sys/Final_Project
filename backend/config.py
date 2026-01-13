"""
Configuration settings for the Compliance RAG System
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()


BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR
UPLOAD_DIR = BASE_DIR / "uploads"


GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")


GROQ_MODELS = {
    "fast": "llama-3.3-70b-versatile",      
    "balanced": "llama-3.3-70b-versatile",  
    "precise": "llama-3.3-70b-versatile",  
}


FAISS_INDEXES = {
    "nca_en": DATA_DIR / "faiss_en_nca.index",
    "nca_ar": DATA_DIR / "faiss_ar_nca.index",
    "nist_en": DATA_DIR / "faiss_en_nist.index",
}


CHUNKS_FILES = {
    "nca_en": DATA_DIR / "chunks_en_nca.jsonl",
    "nca_ar": DATA_DIR / "chunks_ar_nca.jsonl",
    "nist_en": DATA_DIR / "chunks_en_nist.jsonl",
}


EMBEDDINGS_FILES = {
    "nca_en": DATA_DIR / "embeddings_en_nca.npy",
    "nca_ar": DATA_DIR / "embeddings_ar_nca.npy",
    "nist_en": DATA_DIR / "embeddings_en_nist.npy",
}


RAG_CONFIG = {
    "top_k": 5,                    
    "similarity_threshold": 0.6,   
    "chunk_overlap": 50,          
    "chunk_size": 1000,            
}


SCORING_CONFIG = {
    "fully_compliant": 100,
    "mostly_compliant": 75,
    "partially_compliant": 50,
    "minimally_compliant": 25,
    "non_compliant": 0,
}


SUPPORTED_FILE_TYPES = [".pdf", ".docx", ".doc", ".txt", ".xlsx", ".xls"]
ALLOWED_EXTENSIONS = {".pdf", ".docx", ".txt"}


SERVER_HOST = "0.0.0.0"
SERVER_PORT = 8000
