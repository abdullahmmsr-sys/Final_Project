"""
Vector Store Manager - Handles FAISS indexes and chunk retrieval
"""
import json
import numpy as np
import faiss
from pathlib import Path
from typing import List, Dict, Any, Optional
from sentence_transformers import SentenceTransformer

try:
    from backend.config import FAISS_INDEXES, CHUNKS_FILES, EMBEDDINGS_FILES, RAG_CONFIG
except ImportError:
    from config import FAISS_INDEXES, CHUNKS_FILES, EMBEDDINGS_FILES, RAG_CONFIG


class VectorStoreManager:
    """Manages multiple FAISS vector stores for different compliance frameworks"""
    
    def __init__(self):
        self.indexes: Dict[str, faiss.Index] = {}
        self.chunks: Dict[str, List[Dict]] = {}
        self.embeddings: Dict[str, np.ndarray] = {}
        self.embedding_model = None
        self._loaded = False
    
    def load_all(self):
        """Load all FAISS indexes and chunks"""
        if self._loaded:
            return
        
        print("Loading FAISS indexes and chunks...")
        
        for framework, index_path in FAISS_INDEXES.items():
            if Path(index_path).exists():
                print(f"Loading {framework} index...")
                try:
                    self.indexes[framework] = faiss.read_index(str(index_path))
                    
                    # Load chunks
                    chunks_path = CHUNKS_FILES.get(framework)
                    if chunks_path and Path(chunks_path).exists():
                        self.chunks[framework] = self._load_chunks(chunks_path)
                    
                    # Load embeddings
                    embeddings_path = EMBEDDINGS_FILES.get(framework)
                    if embeddings_path and Path(embeddings_path).exists():
                        self.embeddings[framework] = np.load(str(embeddings_path))
                except Exception as e:
                    print(f"Warning: Failed to load {framework}: {e}")
            else:
                print(f"Warning: Index file not found: {index_path}")
        
        self._loaded = True
        print(f"Loaded {len(self.indexes)} vector stores")
    
    def _load_embedding_model(self):
        """Lazy load the embedding model only when needed"""
        if self.embedding_model is None:
            print("Loading embedding model (this may take a moment)...")
            self.embedding_model = SentenceTransformer('BAAI/bge-m3')
            print("Embedding model loaded!")
        return self.embedding_model
    
    def _load_chunks(self, path: Path) -> List[Dict]:
        """Load chunks from JSONL file"""
        chunks = []
        with open(path, 'r', encoding='utf-8') as f:
            for line in f:
                if line.strip():
                    chunks.append(json.loads(line))
        return chunks
    
    def get_all_controls(self, framework: str) -> List[Dict]:
        """Get all controls for a specific framework"""
        if framework not in self.chunks:
            return []
        return [c for c in self.chunks[framework] if c.get('meta', {}).get('type') == 'control']
    
    def search(
        self, 
        query: str, 
        framework: str, 
        top_k: int = None
    ) -> List[Dict[str, Any]]:
        """
        Search for similar chunks in the specified framework
        
        Args:
            query: The search query text
            framework: Which framework to search (nca_en, nca_ar, nist_en)
            top_k: Number of results to return
        
        Returns:
            List of matching chunks with similarity scores
        """
        if not self._loaded:
            self.load_all()
        
        if framework not in self.indexes:
            return []
        
        top_k = top_k or RAG_CONFIG["top_k"]
        
        # Encode query - use lazy loaded embedding model
        model = self._load_embedding_model()
        query_embedding = model.encode([query], convert_to_numpy=True)
        
        # Search FAISS index
        distances, indices = self.indexes[framework].search(
            query_embedding.astype(np.float32), 
            top_k
        )
        
        results = []
        for i, (dist, idx) in enumerate(zip(distances[0], indices[0])):
            if idx < len(self.chunks[framework]):
                chunk = self.chunks[framework][idx].copy()
                # Convert L2 distance to similarity score (0-1)
                similarity = 1 / (1 + dist)
                chunk['similarity'] = float(similarity)
                chunk['rank'] = i + 1
                results.append(chunk)
        
        return results
    
    def search_multi_framework(
        self, 
        query: str, 
        frameworks: List[str] = None,
        top_k: int = None
    ) -> Dict[str, List[Dict[str, Any]]]:
        """
        Search across multiple frameworks
        
        Args:
            query: The search query text
            frameworks: List of frameworks to search (default: all)
            top_k: Number of results per framework
        
        Returns:
            Dictionary mapping framework to results
        """
        if not self._loaded:
            self.load_all()
        
        frameworks = frameworks or list(self.indexes.keys())
        results = {}
        
        for framework in frameworks:
            if framework in self.indexes:
                results[framework] = self.search(query, framework, top_k)
        
        return results
    
    def get_control_by_id(self, framework: str, control_id: str) -> Optional[Dict]:
        """Get a specific control by its ID"""
        if framework not in self.chunks:
            return None
        
        for chunk in self.chunks[framework]:
            meta = chunk.get('meta', {})
            if meta.get('control_id') == control_id:
                return chunk
        
        return None
    
    def get_framework_structure(self, framework: str) -> Dict[str, Any]:
        """Get the hierarchical structure of a framework"""
        if framework not in self.chunks:
            return {}
        
        structure = {}
        for chunk in self.chunks[framework]:
            meta = chunk.get('meta', {})
            if meta.get('type') != 'control':
                continue
            
            # Get domain/function info
            if framework.startswith('nca'):
                domain_id = meta.get('domain_id', '')
                domain_name = meta.get('domain_name', '')
                subdomain_id = meta.get('subdomain_id', '')
                subdomain_name = meta.get('subdomain_name', '')
                
                if domain_id not in structure:
                    structure[domain_id] = {
                        'name': domain_name,
                        'subdomains': {}
                    }
                
                if subdomain_id not in structure[domain_id]['subdomains']:
                    structure[domain_id]['subdomains'][subdomain_id] = {
                        'name': subdomain_name,
                        'controls': []
                    }
                
                structure[domain_id]['subdomains'][subdomain_id]['controls'].append({
                    'id': meta.get('control_id'),
                    'text': chunk.get('text', '')
                })
            
            elif framework.startswith('nist'):
                func_id = meta.get('function_id', '')
                func_name = meta.get('function_name', '')
                cat_id = meta.get('category_id', '')
                cat_name = meta.get('category_name', '')
                
                if func_id not in structure:
                    structure[func_id] = {
                        'name': func_name,
                        'categories': {}
                    }
                
                if cat_id not in structure[func_id]['categories']:
                    structure[func_id]['categories'][cat_id] = {
                        'name': cat_name,
                        'controls': []
                    }
                
                structure[func_id]['categories'][cat_id]['controls'].append({
                    'id': meta.get('control_id'),
                    'text': chunk.get('text', '')
                })
        
        return structure


# Global instance
vector_store = VectorStoreManager()
