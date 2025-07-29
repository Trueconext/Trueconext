-- Insert TrueConext branded templates
INSERT INTO templates (id, name, description, background_color) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Professional Dark', 'Clean professional template with dark theme', '#0a0a0a'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Gaming Streamer', 'Perfect for gaming content creators', '#1a1a2e'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Lifestyle Influencer', 'Bright and engaging for lifestyle content', '#2d1b69'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Minimalist', 'Clean and simple design', '#ffffff');

-- Insert template elements for Professional Dark
INSERT INTO template_elements (template_id, type, platform, label, value, position_x, position_y, color, animation, order_index) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'text', NULL, 'Creator Name', 'Your Name Here', 50, 20, '#ffffff', 'none', 1),
  ('550e8400-e29b-41d4-a716-446655440001', 'text', NULL, 'Subtitle', 'Content Creator', 50, 30, '#cccccc', 'none', 2),
  ('550e8400-e29b-41d4-a716-446655440001', 'social', 'instagram', 'Instagram', '@username', 25, 50, '#E4405F', 'scale', 3),
  ('550e8400-e29b-41d4-a716-446655440001', 'social', 'youtube', 'YouTube', 'Channel Name', 75, 50, '#FF0000', 'scale', 4),
  ('550e8400-e29b-41d4-a716-446655440001', 'social', 'tiktok', 'TikTok', '@username', 25, 65, '#000000', 'glow', 5),
  ('550e8400-e29b-41d4-a716-446655440001', 'social', 'x', 'X (Twitter)', '@username', 75, 65, '#1DA1F2', 'glow', 6),
  ('550e8400-e29b-41d4-a716-446655440001', 'metric', NULL, 'Total Following', '100K+', 50, 80, '#00ff88', 'both', 7);
