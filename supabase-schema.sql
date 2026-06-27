-- Schema for Mindverse Learning Diagnostic

-- Create Parents Table
CREATE TABLE IF NOT EXISTS parents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Students Table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Assessments Table
CREATE TABLE IF NOT EXISTS assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  overall_score NUMERIC NOT NULL,
  foundation_score NUMERIC NOT NULL,
  grade_score NUMERIC NOT NULL,-- Schema for Mindverse Learning Diagnostic

-- Create Parents Table
CREATE TABLE IF NOT EXISTS parents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Students Table
CREATE TABLE IF NOT EXISTS students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parent_id UUID REFERENCES parents(id) ON DELETE CASCADE,
  student_name TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Assessments Table
CREATE TABLE IF NOT EXISTS assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  responses JSONB NOT NULL,
  overall_score NUMERIC NOT NULL,
  foundation_score NUMERIC NOT NULL,
  grade_score NUMERIC NOT NULL,
  readiness_level TEXT NOT NULL,
  challenge_result TEXT NOT NULL,
  top_strengths JSONB,
  top_growth_areas JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) but allow all operations since we use the Service Role key from the server
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Optional: If you want to allow anonymous inserts directly from the client (not recommended over API routes, but here for completeness)
-- CREATE POLICY "Allow anon inserts" ON parents FOR INSERT TO anon WITH CHECK (true);
-- CREATE POLICY "Allow anon inserts" ON students FOR INSERT TO anon WITH CHECK (true);
-- CREATE POLICY "Allow anon inserts" ON assessments FOR INSERT TO anon WITH CHECK (true);

  readiness_level TEXT NOT NULL,
  challenge_result TEXT NOT NULL,
  top_strengths JSONB,
  top_growth_areas JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS) but allow all operations since we use the Service Role key from the server
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Optional: If you want to allow anonymous inserts directly from the client (not recommended over API routes, but here for completeness)
-- CREATE POLICY "Allow anon inserts" ON parents FOR INSERT TO anon WITH CHECK (true);
-- CREATE POLICY "Allow anon inserts" ON students FOR INSERT TO anon WITH CHECK (true);
-- CREATE POLICY "Allow anon inserts" ON assessments FOR INSERT TO anon WITH CHECK (true);
