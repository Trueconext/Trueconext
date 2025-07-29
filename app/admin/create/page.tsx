"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, AlertCircle, Database } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import type { Template } from "@/lib/database.types"

export default function CreateMediaKit() {
  const router = useRouter()
  const [templates, setTemplates] = useState<Template[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
  const [creatorName, setCreatorName] = useState("")
  const [slug, setSlug] = useState("")
  const [loading, setLoading] = useState(false)
  const [databaseError, setDatabaseError] = useState<string | null>(null)

  useEffect(() => {
    fetchTemplates()
  }, [])

  useEffect(() => {
    // Auto-generate slug from creator name
    if (creatorName) {
      const generatedSlug = creatorName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
      setSlug(generatedSlug)
    }
  }, [creatorName])

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase.from("templates").select("*").order("name")

      if (error) {
        if (error.message.includes("does not exist")) {
          setDatabaseError("Database tables not found. Please set up the database first.")
        } else {
          setDatabaseError(`Database error: ${error.message}`)
        }
        setTemplates([])
      } else {
        setTemplates(data || [])
        setDatabaseError(null)
      }
    } catch (error) {
      console.error("Error fetching templates:", error)
      setDatabaseError("Failed to connect to database")
      setTemplates([])
    }
  }

  const createMediaKit = async () => {
    if (!creatorName || !slug) {
      alert("Please fill in all required fields")
      return
    }

    if (databaseError) {
      alert("Please set up the database first before creating media kits")
      return
    }

    setLoading(true)
    try {
      // Check if slug already exists
      const { data: existing } = await supabase.from("media_kits").select("id").eq("slug", slug).single()

      if (existing) {
        alert("This slug already exists. Please choose a different one.")
        setLoading(false)
        return
      }

      // Create media kit
      const { data: mediaKit, error } = await supabase
        .from("media_kits")
        .insert({
          creator_name: creatorName,
          slug: slug,
          template_id: selectedTemplate || null,
          published: false,
        })
        .select()
        .single()

      if (error) throw error

      // If template selected, copy template elements
      if (selectedTemplate) {
        const { data: templateElements } = await supabase
          .from("template_elements")
          .select("*")
          .eq("template_id", selectedTemplate)

        if (templateElements && templateElements.length > 0) {
          const elements = templateElements.map((el) => ({
            mediakit_id: mediaKit.id,
            type: el.type,
            platform: el.platform,
            label: el.label,
            value: el.value,
            url: el.url,
            position_x: el.position_x,
            position_y: el.position_y,
            color: el.color,
            animation: el.animation,
            order_index: el.order_index,
          }))

          await supabase.from("media_kit_elements").insert(elements)
        }
      }

      router.push(`/admin/edit/${mediaKit.id}`)
    } catch (error) {
      console.error("Error creating media kit:", error)
      alert("Error creating media kit. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  // Show database error if tables don't exist
  if (databaseError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link href="/admin">
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10 bg-transparent"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Create New Media Kit</h1>
              <p className="text-gray-300">Set up a new creator media kit</p>
            </div>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-yellow-400" />
                  <div>
                    <CardTitle className="text-white text-2xl">Database Setup Required</CardTitle>
                    <p className="text-gray-300 mt-2">
                      The database tables need to be created before you can create media kits.
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-800/50 p-4 rounded-lg">
                  <h3 className="text-white font-semibold mb-3">Setup Instructions:</h3>
                  <ol className="text-gray-300 space-y-2 list-decimal list-inside">
                    <li>Go to your Supabase project dashboard</li>
                    <li>Navigate to the "SQL Editor" section</li>
                    <li>Run the SQL scripts provided in the project setup</li>
                    <li>Come back here and refresh the page</li>
                  </ol>
                </div>

                <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg">
                  <p className="text-red-300">{databaseError}</p>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Refresh Page
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    Open Supabase Dashboard
                  </Button>
                  <Link href="/admin">
                    <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
                      Back to Dashboard
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10 bg-transparent">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Create New Media Kit</h1>
            <p className="text-gray-300">Set up a new creator media kit</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="creator-name" className="text-white">
                  Creator Name *
                </Label>
                <Input
                  id="creator-name"
                  value={creatorName}
                  onChange={(e) => setCreatorName(e.target.value)}
                  placeholder="Enter creator name"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div>
                <Label htmlFor="slug" className="text-white">
                  URL Slug *
                </Label>
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="creator-name"
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
                <p className="text-sm text-gray-400 mt-1">Will be available at: trueconext.com/mediakit/{slug}</p>
              </div>

              <div>
                <Label className="text-white">Choose Template (Optional)</Label>
                <Select value={selectedTemplate || "none"} onValueChange={setSelectedTemplate}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Start from scratch or choose a template" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Start from scratch</SelectItem>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {templates.length === 0 && !databaseError && (
                  <p className="text-sm text-gray-400 mt-1">No templates available yet</p>
                )}
              </div>

              <Button
                onClick={createMediaKit}
                disabled={loading || !creatorName || !slug || !!databaseError}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {loading ? "Creating..." : "Create Media Kit"}
              </Button>
            </CardContent>
          </Card>

          {/* Template Preview */}
          <Card className="bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="text-white">Template Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTemplate && selectedTemplate !== "none" ? (
                <div className="text-center text-gray-300">
                  <p>Template preview will be shown here</p>
                  <Badge className="mt-2">{templates.find((t) => t.id === selectedTemplate)?.name}</Badge>
                </div>
              ) : (
                <div className="text-center text-gray-400">
                  <p>Select a template to see preview</p>
                  <p className="text-sm mt-2">Or start from scratch to build your own</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
