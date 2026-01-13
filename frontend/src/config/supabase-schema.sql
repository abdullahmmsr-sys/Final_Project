-- Supabase SQL Schema for Compliance Checker
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  organization TEXT,
  role TEXT DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Compliance Reports table
CREATE TABLE IF NOT EXISTS compliance_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  job_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_hash TEXT,
  overall_score DECIMAL(5,2),
  total_controls_evaluated INTEGER,
  frameworks TEXT[] NOT NULL,
  summary JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- For comparing reports of the same document
  document_fingerprint TEXT,
  
  UNIQUE(user_id, job_id)
);

-- Report Controls table (detailed control results)
CREATE TABLE IF NOT EXISTS report_controls (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  report_id UUID REFERENCES compliance_reports(id) ON DELETE CASCADE NOT NULL,
  framework_id TEXT NOT NULL,
  control_id TEXT NOT NULL,
  control_text TEXT,
  final_score INTEGER,
  compliance_status TEXT,
  score_justification TEXT,
  layer_scores JSONB,
  recommendations JSONB,
  risk_level TEXT,
  domain_name TEXT,
  subdomain_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(report_id, framework_id, control_id)
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON compliance_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_filename ON compliance_reports(filename);
CREATE INDEX IF NOT EXISTS idx_reports_document_fingerprint ON compliance_reports(document_fingerprint);
CREATE INDEX IF NOT EXISTS idx_controls_report_id ON report_controls(report_id);
CREATE INDEX IF NOT EXISTS idx_controls_control_id ON report_controls(control_id);

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_controls ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Reports policies
CREATE POLICY "Users can view own reports" ON compliance_reports
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reports" ON compliance_reports
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reports" ON compliance_reports
  FOR DELETE USING (auth.uid() = user_id);

-- Report controls policies
CREATE POLICY "Users can view own report controls" ON report_controls
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM compliance_reports 
      WHERE compliance_reports.id = report_controls.report_id 
      AND compliance_reports.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own report controls" ON report_controls
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM compliance_reports 
      WHERE compliance_reports.id = report_controls.report_id 
      AND compliance_reports.user_id = auth.uid()
    )
  );

-- Function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating profiles updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
