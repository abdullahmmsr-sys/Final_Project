"""
Persistent Job Storage
Stores job data in Supabase for production (Railway) or falls back to file storage for local dev
"""
import json
import os
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime, timedelta
import threading

try:
    from backend.config import SUPABASE_URL, SUPABASE_SERVICE_KEY
except ImportError:
    from config import SUPABASE_URL, SUPABASE_SERVICE_KEY


class SupabaseJobStorage:
    """
    Supabase-based storage for job data
    Persists across Railway deployments
    """
    
    TABLE_NAME = "backend_jobs"
    
    def __init__(self):
        self._client = None
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()
        self._initialized = False
    
    def _get_client(self):
        """Lazy initialization of Supabase client"""
        if self._client is None:
            try:
                from supabase import create_client
                if SUPABASE_URL and SUPABASE_SERVICE_KEY:
                    self._client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
                    print("✓ Connected to Supabase for job storage")
                else:
                    print("⚠ Supabase credentials not configured")
            except ImportError:
                print("⚠ supabase-py not installed, using memory cache only")
            except Exception as e:
                print(f"⚠ Could not connect to Supabase: {e}")
        return self._client
    
    def _ensure_table(self):
        """Create table if it doesn't exist (run once on startup)"""
        if self._initialized:
            return
        
        client = self._get_client()
        if client:
            try:
                # Try to select from table to check if it exists
                client.table(self.TABLE_NAME).select("job_id").limit(1).execute()
                self._initialized = True
                self._load_all_jobs()
            except Exception as e:
                if "does not exist" in str(e) or "42P01" in str(e):
                    print(f"⚠ Table '{self.TABLE_NAME}' doesn't exist. Please create it in Supabase.")
                    print("   Run this SQL in Supabase SQL Editor:")
                    print(self._get_create_table_sql())
                else:
                    print(f"⚠ Supabase table check failed: {e}")
        self._initialized = True
    
    def _get_create_table_sql(self) -> str:
        """Get SQL to create the backend_jobs table"""
        return """
-- Backend Jobs table for persistent job storage
CREATE TABLE IF NOT EXISTS backend_jobs (
  job_id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'uploaded',
  filename TEXT,
  file_path TEXT,
  char_count INTEGER,
  word_count INTEGER,
  frameworks TEXT[],
  progress JSONB,
  results JSONB,
  error TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_backend_jobs_status ON backend_jobs(status);
CREATE INDEX IF NOT EXISTS idx_backend_jobs_created ON backend_jobs(created_at);

-- Allow public access (or restrict as needed)
ALTER TABLE backend_jobs ENABLE ROW LEVEL SECURITY;

-- Policy to allow all operations (adjust for your security needs)
CREATE POLICY "Allow all operations on backend_jobs" ON backend_jobs
  FOR ALL USING (true) WITH CHECK (true);
"""
    
    def _load_all_jobs(self):
        """Load all existing jobs from Supabase on startup"""
        client = self._get_client()
        if not client:
            return
        
        try:
            response = client.table(self.TABLE_NAME).select("*").execute()
            loaded_count = 0
            
            for row in response.data:
                job_id = row.get('job_id')
                if job_id:
                    # Convert row to job dict format
                    job_data = self._row_to_job(row)
                    self._cache[job_id] = job_data
                    loaded_count += 1
            
            if loaded_count > 0:
                print(f"✓ Loaded {loaded_count} existing job(s) from Supabase")
        except Exception as e:
            print(f"⚠ Could not load jobs from Supabase: {e}")
    
    def _row_to_job(self, row: dict) -> dict:
        """Convert Supabase row to job dictionary"""
        return {
            "job_id": row.get("job_id"),
            "status": row.get("status", "uploaded"),
            "filename": row.get("filename"),
            "file_path": row.get("file_path"),
            "char_count": row.get("char_count"),
            "word_count": row.get("word_count"),
            "frameworks": row.get("frameworks"),
            "progress": row.get("progress"),
            "results": row.get("results"),
            "error": row.get("error"),
            "created_at": row.get("created_at"),
            "started_at": row.get("started_at"),
            "completed_at": row.get("completed_at"),
            "failed_at": row.get("failed_at"),
        }
    
    def _job_to_row(self, job_data: dict) -> dict:
        """Convert job dictionary to Supabase row format"""
        row = {
            "job_id": job_data.get("job_id"),
            "status": job_data.get("status", "uploaded"),
            "filename": job_data.get("filename"),
            "file_path": str(job_data.get("file_path")) if job_data.get("file_path") else None,
            "char_count": job_data.get("char_count"),
            "word_count": job_data.get("word_count"),
            "frameworks": job_data.get("frameworks"),
            "progress": job_data.get("progress"),
            "results": job_data.get("results"),
            "error": job_data.get("error"),
            "updated_at": datetime.utcnow().isoformat(),
        }
        
        # Handle datetime fields
        for field in ["created_at", "started_at", "completed_at", "failed_at"]:
            if field in job_data and job_data[field]:
                row[field] = job_data[field]
        
        return row
    
    def set(self, job_id: str, job_data: Dict[str, Any]):
        """Store or update job data"""
        self._ensure_table()
        
        with self._lock:
            self._cache[job_id] = job_data
            
            client = self._get_client()
            if client:
                try:
                    row = self._job_to_row(job_data)
                    client.table(self.TABLE_NAME).upsert(row).execute()
                except Exception as e:
                    print(f"⚠ Could not save job to Supabase: {e}")
    
    def get(self, job_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve job data"""
        self._ensure_table()
        
        with self._lock:
            # Check cache first
            if job_id in self._cache:
                return self._cache[job_id]
            
            # Try Supabase
            client = self._get_client()
            if client:
                try:
                    response = client.table(self.TABLE_NAME).select("*").eq("job_id", job_id).single().execute()
                    if response.data:
                        job_data = self._row_to_job(response.data)
                        self._cache[job_id] = job_data
                        return job_data
                except Exception:
                    pass
            
            return None
    
    def exists(self, job_id: str) -> bool:
        """Check if job exists"""
        return self.get(job_id) is not None
    
    def delete(self, job_id: str):
        """Delete job data"""
        self._ensure_table()
        
        with self._lock:
            if job_id in self._cache:
                del self._cache[job_id]
            
            client = self._get_client()
            if client:
                try:
                    client.table(self.TABLE_NAME).delete().eq("job_id", job_id).execute()
                except Exception as e:
                    print(f"⚠ Could not delete job from Supabase: {e}")
    
    def get_all(self) -> Dict[str, Dict[str, Any]]:
        """Get all jobs"""
        self._ensure_table()
        
        with self._lock:
            return dict(self._cache)
    
    def update(self, job_id: str, updates: Dict[str, Any]):
        """Update specific fields in a job"""
        self._ensure_table()
        
        with self._lock:
            if job_id in self._cache:
                self._cache[job_id].update(updates)
                
                client = self._get_client()
                if client:
                    try:
                        # Prepare update data
                        update_row = {"updated_at": datetime.utcnow().isoformat()}
                        for key, value in updates.items():
                            if key == "file_path":
                                update_row[key] = str(value) if value else None
                            else:
                                update_row[key] = value
                        
                        client.table(self.TABLE_NAME).update(update_row).eq("job_id", job_id).execute()
                    except Exception as e:
                        print(f"⚠ Could not update job in Supabase: {e}")
    
    def cleanup_old_jobs(self, days: int = 30) -> int:
        """Clean up jobs older than specified days"""
        self._ensure_table()
        cutoff = datetime.utcnow() - timedelta(days=days)
        cutoff_str = cutoff.isoformat()
        
        deleted_count = 0
        
        with self._lock:
            # Clean from cache
            jobs_to_delete = []
            for job_id, job_data in self._cache.items():
                created_at_str = job_data.get('created_at')
                if created_at_str:
                    try:
                        if created_at_str < cutoff_str:
                            jobs_to_delete.append(job_id)
                    except Exception:
                        pass
            
            for job_id in jobs_to_delete:
                del self._cache[job_id]
                deleted_count += 1
            
            # Clean from Supabase
            client = self._get_client()
            if client:
                try:
                    client.table(self.TABLE_NAME).delete().lt("created_at", cutoff_str).execute()
                except Exception as e:
                    print(f"⚠ Could not cleanup old jobs from Supabase: {e}")
        
        if deleted_count > 0:
            print(f"✓ Cleaned up {deleted_count} old job(s)")
        
        return deleted_count
    
    def __contains__(self, job_id: str) -> bool:
        return self.exists(job_id)
    
    def __getitem__(self, job_id: str) -> Dict[str, Any]:
        job_data = self.get(job_id)
        if job_data is None:
            raise KeyError(f"Job '{job_id}' not found")
        return job_data
    
    def __setitem__(self, job_id: str, job_data: Dict[str, Any]):
        self.set(job_id, job_data)
    
    def __delitem__(self, job_id: str):
        if not self.exists(job_id):
            raise KeyError(f"Job '{job_id}' not found")
        self.delete(job_id)


class FileJobStorage:
    """
    File-based fallback storage for local development
    """
    
    def __init__(self, storage_dir: str = "job_data"):
        self.storage_dir = Path(storage_dir)
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        self._cache: Dict[str, Dict[str, Any]] = {}
        self._lock = threading.Lock()
        self._load_all_jobs()
    
    def _get_job_file_path(self, job_id: str) -> Path:
        return self.storage_dir / f"{job_id}.json"
    
    def _load_all_jobs(self):
        try:
            json_files = list(self.storage_dir.glob("*.json"))
            loaded_count = 0
            
            for file_path in json_files:
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        job_data = json.load(f)
                        job_id = job_data.get('job_id')
                        if job_id:
                            self._cache[job_id] = job_data
                            loaded_count += 1
                except Exception as e:
                    print(f"⚠ Could not load job from {file_path}: {e}")
            
            if loaded_count > 0:
                print(f"✓ Loaded {loaded_count} existing job(s) from disk")
        except Exception as e:
            print(f"⚠ Could not load jobs from storage: {e}")
    
    def _save_job_to_disk(self, job_id: str, job_data: Dict[str, Any]):
        try:
            file_path = self._get_job_file_path(job_id)
            serializable_data = self._make_serializable(job_data)
            
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(serializable_data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"⚠ Error saving job {job_id} to disk: {e}")
    
    def _make_serializable(self, obj):
        if isinstance(obj, dict):
            return {key: self._make_serializable(value) for key, value in obj.items()}
        elif isinstance(obj, (list, tuple)):
            return [self._make_serializable(item) for item in obj]
        elif isinstance(obj, (str, int, float, bool, type(None))):
            return obj
        elif isinstance(obj, Path):
            return str(obj)
        elif isinstance(obj, datetime):
            return obj.isoformat()
        else:
            return str(obj)
    
    def set(self, job_id: str, job_data: Dict[str, Any]):
        with self._lock:
            self._cache[job_id] = job_data
            self._save_job_to_disk(job_id, job_data)
    
    def get(self, job_id: str) -> Optional[Dict[str, Any]]:
        with self._lock:
            return self._cache.get(job_id)
    
    def exists(self, job_id: str) -> bool:
        with self._lock:
            return job_id in self._cache
    
    def delete(self, job_id: str):
        with self._lock:
            if job_id in self._cache:
                del self._cache[job_id]
            
            file_path = self._get_job_file_path(job_id)
            try:
                if file_path.exists():
                    file_path.unlink()
            except Exception as e:
                print(f"⚠ Error deleting job file {job_id}: {e}")
    
    def get_all(self) -> Dict[str, Dict[str, Any]]:
        with self._lock:
            return dict(self._cache)
    
    def update(self, job_id: str, updates: Dict[str, Any]):
        with self._lock:
            if job_id in self._cache:
                self._cache[job_id].update(updates)
                self._save_job_to_disk(job_id, self._cache[job_id])
    
    def cleanup_old_jobs(self, days: int = 30) -> int:
        cutoff = datetime.utcnow() - timedelta(days=days)
        
        with self._lock:
            jobs_to_delete = []
            
            for job_id, job_data in self._cache.items():
                created_at_str = job_data.get('created_at')
                if created_at_str:
                    try:
                        created_at = datetime.fromisoformat(created_at_str.replace('Z', '+00:00'))
                        if created_at < cutoff:
                            jobs_to_delete.append(job_id)
                    except Exception:
                        pass
            
            for job_id in jobs_to_delete:
                self.delete(job_id)
            
            if jobs_to_delete:
                print(f"✓ Cleaned up {len(jobs_to_delete)} old job(s)")
            
            return len(jobs_to_delete)
    
    def __contains__(self, job_id: str) -> bool:
        return self.exists(job_id)
    
    def __getitem__(self, job_id: str) -> Dict[str, Any]:
        job_data = self.get(job_id)
        if job_data is None:
            raise KeyError(f"Job '{job_id}' not found")
        return job_data
    
    def __setitem__(self, job_id: str, job_data: Dict[str, Any]):
        self.set(job_id, job_data)
    
    def __delitem__(self, job_id: str):
        if not self.exists(job_id):
            raise KeyError(f"Job '{job_id}' not found")
        self.delete(job_id)


def create_storage():
    """Create the appropriate storage based on environment"""
    if SUPABASE_URL and SUPABASE_SERVICE_KEY:
        print("📦 Using Supabase for persistent job storage")
        return SupabaseJobStorage()
    else:
        print("📦 Using file-based storage (local development)")
        return FileJobStorage()


# Create global instance
persistent_storage = create_storage()
