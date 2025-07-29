-- Create media_kits table
CREATE TABLE IF NOT EXISTS media_kits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  template_id UUID,
  photo_url TEXT,
  photo_shape TEXT DEFAULT 'circle' CHECK (photo_shape IN ('circle', 'square', 'rounded', 'custom')),
  background_color TEXT DEFAULT '#1a1a1a',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published BOOLEAN DEFAULT false
);

-- Create media_kit_elements table
CREATE TABLE IF NOT EXISTS media_kit_elements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  mediakit_id UUID REFERENCES media_kits(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('social', 'text', 'metric', 'custom')),
  platform TEXT,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  url TEXT,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  color TEXT DEFAULT '#ffffff',
  animation TEXT DEFAULT 'none' CHECK (animation IN ('none', 'scale', 'glow', 'both')),
  order_index INTEGER DEFAULT 0
);

-- Create templates table
CREATE TABLE IF NOT EXISTS templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  preview_image TEXT,
  background_color TEXT DEFAULT '#1a1a1a',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create template_elements table
CREATE TABLE IF NOT EXISTS template_elements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('social', 'text', 'metric', 'custom')),
  platform TEXT,
  label TEXT NOT NULL,
  value TEXT NOT NULL,
  url TEXT,
  position_x INTEGER DEFAULT 0,
  position_y INTEGER DEFAULT 0,
  color TEXT DEFAULT '#ffffff',
  animation TEXT DEFAULT 'none' CHECK (animation IN ('none', 'scale', 'glow', 'both')),
  order_index INTEGER DEFAULT 0
);

-- Enable RLS
ALTER TABLE media_kits ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_kit_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_elements ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all for admin tool)
CREATE POLICY "Allow all operations" ON media_kits FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON media_kit_elements FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON templates FOR ALL USING (true);
CREATE POLICY "Allow all operations" ON template_elements FOR ALL USING (true);
