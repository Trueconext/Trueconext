"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Copy, ExternalLink } from "lucide-react"

export function DatabaseSetupGuide() {
  const sqlScript = `-- Create media_kits table
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

-- Insert sample templates
INSERT INTO templates (id, name, description, background_color) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Professional Dark', 'Clean professional template with dark theme', '#0a0a0a'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Gaming Streamer', 'Perfect for gaming content creators', '#1a1a2e'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Lifestyle Influencer', 'Bright and engaging for lifestyle content', '#2d1b69'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Minimalist', 'Clean and simple design', '#ffffff')
ON CONFLICT (id) DO NOTHING;

-- Insert template elements for Professional Dark
INSERT INTO template_elements (template_id, type, platform, label, value, position_x, position_y, color, animation, order_index) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'text', NULL, 'Creator Name', 'Your Name Here', 50, 20, '#ffffff', 'none', 1),
  ('550e8400-e29b-41d4-a716-446655440001', 'text', NULL, 'Subtitle', 'Content Creator', 50, 30, '#cccccc', 'none', 2),
  ('550e8400-e29b-41d4-a716-446655440001', 'social', 'instagram', 'Instagram', '@username', 25, 50, '#E4405F', 'scale', 3),
  ('550e8400-e29b-41d4-a716-446655440001', 'social', 'youtube', 'YouTube', 'Channel Name', 75, 50, '#FF0000', 'scale', 4),
  ('550e8400-e29b-41d4-a716-446655440001', 'social', 'tiktok', 'TikTok', '@username', 25, 65, '#000000', 'glow', 5),
  ('550e8400-e29b-41d4-a716-446655440001', 'social', 'x', 'X (Twitter)', '@username', 75, 65, '#1DA1F2', 'glow', 6),
  ('550e8400-e29b-41d4-a716-446655440001', 'metric', NULL, 'Total Following', '100K+', 50, 80, '#00ff88', 'both', 7)
ON CONFLICT DO NOTHING;`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript)
    alert("SQL script copied to clipboard!")
  }

  return (
    <Card className="bg-white/10 border-white/20">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <ExternalLink className="w-5 h-5" />
          Database Setup SQL Script
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-gray-900/50 p-4 rounded-lg max-h-96 overflow-y-auto">
          <pre className="text-sm text-gray-300 whitespace-pre-wrap">{sqlScript}</pre>
        </div>
        <div className="flex gap-4">
          <Button
            onClick={copyToClipboard}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy SQL Script
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
            className="border-white/20 text-white hover:bg-white/10 bg-transparent"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Supabase Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
