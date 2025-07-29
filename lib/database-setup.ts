import { supabase } from "./supabase"

export async function initializeDatabase() {
  try {
    // Create media_kits table
    const { error: mediaKitsError } = await supabase.rpc("exec_sql", {
      sql: `
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
      `,
    })

    // Create media_kit_elements table
    const { error: elementsError } = await supabase.rpc("exec_sql", {
      sql: `
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
      `,
    })

    // Create templates table
    const { error: templatesError } = await supabase.rpc("exec_sql", {
      sql: `
        CREATE TABLE IF NOT EXISTS templates (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          preview_image TEXT,
          background_color TEXT DEFAULT '#1a1a1a',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `,
    })

    // Create template_elements table
    const { error: templateElementsError } = await supabase.rpc("exec_sql", {
      sql: `
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
      `,
    })

    if (mediaKitsError || elementsError || templatesError || templateElementsError) {
      throw new Error("Failed to create tables")
    }

    // Seed initial templates
    await seedTemplates()

    return { success: true }
  } catch (error) {
    console.error("Database initialization error:", error)
    return { success: false, error }
  }
}

async function seedTemplates() {
  // Check if templates already exist
  const { data: existingTemplates } = await supabase.from("templates").select("id").limit(1)

  if (existingTemplates && existingTemplates.length > 0) {
    return // Templates already seeded
  }

  // Insert templates
  const templates = [
    {
      id: "550e8400-e29b-41d4-a716-446655440001",
      name: "Professional Dark",
      description: "Clean professional template with dark theme",
      background_color: "#0a0a0a",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440002",
      name: "Gaming Streamer",
      description: "Perfect for gaming content creators",
      background_color: "#1a1a2e",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440003",
      name: "Lifestyle Influencer",
      description: "Bright and engaging for lifestyle content",
      background_color: "#2d1b69",
    },
    {
      id: "550e8400-e29b-41d4-a716-446655440004",
      name: "Minimalist",
      description: "Clean and simple design",
      background_color: "#ffffff",
    },
  ]

  await supabase.from("templates").insert(templates)

  // Insert template elements for Professional Dark
  const templateElements = [
    {
      template_id: "550e8400-e29b-41d4-a716-446655440001",
      type: "text",
      platform: null,
      label: "Creator Name",
      value: "Your Name Here",
      position_x: 50,
      position_y: 20,
      color: "#ffffff",
      animation: "none",
      order_index: 1,
    },
    {
      template_id: "550e8400-e29b-41d4-a716-446655440001",
      type: "text",
      platform: null,
      label: "Subtitle",
      value: "Content Creator",
      position_x: 50,
      position_y: 30,
      color: "#cccccc",
      animation: "none",
      order_index: 2,
    },
    {
      template_id: "550e8400-e29b-41d4-a716-446655440001",
      type: "social",
      platform: "instagram",
      label: "Instagram",
      value: "@username",
      position_x: 25,
      position_y: 50,
      color: "#E4405F",
      animation: "scale",
      order_index: 3,
    },
    {
      template_id: "550e8400-e29b-41d4-a716-446655440001",
      type: "social",
      platform: "youtube",
      label: "YouTube",
      value: "Channel Name",
      position_x: 75,
      position_y: 50,
      color: "#FF0000",
      animation: "scale",
      order_index: 4,
    },
  ]

  await supabase.from("template_elements").insert(templateElements)
}

export async function checkDatabaseSetup() {
  try {
    const { data, error } = await supabase.from("media_kits").select("id").limit(1)
    return { exists: !error, error }
  } catch (error) {
    return { exists: false, error }
  }
}
