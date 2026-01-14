-- ============================================================================
-- Backend Jobs table (for persistent job storage from Railway backend)
-- Run this SQL in your Supabase SQL Editor before deploying to Railway
-- ============================================================================

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

-- Allow public access for backend service key
ALTER TABLE backend_jobs ENABLE ROW LEVEL SECURITY;

-- Policy to allow all operations (backend uses service key which bypasses RLS)
CREATE POLICY "Allow all operations on backend_jobs" ON backend_jobs
  FOR ALL USING (true) WITH CHECK (true);

-- Function to update updated_at timestamp (if not exists)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating backend_jobs updated_at
DROP TRIGGER IF EXISTS update_backend_jobs_updated_at ON backend_jobs;
CREATE TRIGGER update_backend_jobs_updated_at
  BEFORE UPDATE ON backend_jobs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
