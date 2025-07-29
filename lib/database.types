export interface MediaKit {
  id: string
  creator_name: string
  slug: string
  template_id?: string
  photo_url?: string
  photo_shape: "circle" | "square" | "rounded" | "custom"
  background_color: string
  created_at: string
  updated_at: string
  published: boolean
}

export interface MediaKitElement {
  id: string
  mediakit_id: string
  type: "social" | "text" | "metric" | "custom"
  platform?: string
  label: string
  value: string
  url?: string
  position_x: number
  position_y: number
  color: string
  animation: "none" | "scale" | "glow" | "both"
  order_index: number
}

export interface Template {
  id: string
  name: string
  description: string
  preview_image: string
  background_color: string
  elements: Omit<MediaKitElement, "id" | "mediakit_id">[]
}

export interface SocialPlatform {
  id: string
  name: string
  icon: string
  color: string
  placeholder: string
}
