-- Scanned models table for Snap & Try feature
CREATE TABLE IF NOT EXISTS scanned_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL DEFAULT 'My Furniture',
  image_data TEXT, -- base64 data URL of the uploaded photo (for preview)
  meshy_task_id TEXT, -- Meshy AI task ID
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, succeeded, failed
  model_url TEXT, -- GLB download URL from Meshy
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scanned_models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scans"
  ON scanned_models FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scans"
  ON scanned_models FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own scans"
  ON scanned_models FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own scans"
  ON scanned_models FOR DELETE USING (auth.uid() = user_id);
