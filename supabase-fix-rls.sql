-- Run this in your Supabase SQL Editor to ensure data can be inserted!

-- If you are using the public anon key instead of the service_role key, 
-- Supabase blocks inserts by default for security (Row Level Security).
-- The following commands create policies that explicitly allow your app to insert data.

CREATE POLICY "Allow anon inserts on parents" 
ON parents FOR INSERT TO anon 
WITH CHECK (true);

CREATE POLICY "Allow anon inserts on students" 
ON students FOR INSERT TO anon 
WITH CHECK (true);

CREATE POLICY "Allow anon inserts on assessments" 
ON assessments FOR INSERT TO anon 
WITH CHECK (true);
