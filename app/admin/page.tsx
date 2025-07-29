"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Eye, Copy, Trash2, Database, AlertCircle } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import type { MediaKit } from "@/lib/database.types"

export default function AdminDashboard() {
  const [mediaKits, setMediaKits] = useState<MediaKit[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [databaseError, setDatabaseError] = useState<string | null>(null)
  const [setupMode, setSetupMode] = useState(false)

  useEffect(() => {
    checkDatabaseAndFetch()
  }, [])

  const checkDatabaseAndFetch = async () => {
    try {
      // Try to fetch from media_kits table to check if it exists
      const { data, error } = await supabase.from("media_kits").select("*").order("updated_at", { ascending: false })

      if (error) {
        if (error.message.includes("does not exist")) {
          setDatabaseError("Database tables not found. Please set up the database first.")
          setSetupMode(true)
        } else {
          setDatabaseError(`Database error: ${error.message}`)
        }
        setMediaKits([])
      } else {
        setMediaKits(data || [])
        setDatabaseError(null)
        setSetupMode(false)
      }
    } catch (error) {
      console.error("Error checking database:", error)
      setDatabaseError("Failed to connect to database")
      setMediaKits([])
    } finally {
      setLoading(false)
    }
  }

  const setupDatabase = async () => {
    setLoading(true)
    try {
      // For now, we'll show instructions since we can't create tables via RPC
      alert(
        "Please run the SQL scripts in the Supabase dashboard:\n\n1. Go to your Supabase project\n2. Navigate to SQL Editor\n3. Run the scripts provided in the setup instructions",
      )

      // Try to check again after user confirms
      setTimeout(() => {
        checkDatabaseAndFetch()
      }, 2000)
    } catch (error) {
      console.error("Setup error:", error)
    } finally {
      setLoading(false)
    }
  }

  const deleteMediaKit = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media kit?")) return

    try {
      const { error } = await supabase.from("media_kits").delete().eq("id", id)

      if (error) throw error
      setMediaKits(mediaKits.filter((kit) => kit.id !== id))
    } catch (error) {
      console.error("Error deleting media kit:", error)
    }
  }

  const duplicateMediaKit = async (kit: MediaKit) => {
    try {
      const { data: newKit, error } = await supabase
        .from("media_kits")
        .insert({
          creator_name: `${kit.creator_name} (Copy)`,
          slug: `${kit.slug}-copy-${Date.now()}`,
          template_id: kit.template_id,
          photo_url: kit.photo_url,
          photo_shape: kit.photo_shape,
          background_color: kit.background_color,
          published: false,
        })
        .select()
        .single()

      if (error) throw error

      // Copy elements
      const { data: elements } = await supabase.from("media_kit_elements").select("*").eq("mediakit_id", kit.id)

      if (elements && elements.length > 0) {
        const newElements = elements.map((el) => ({
          ...el,
          id: undefined,
          mediakit_id: newKit.id,
        }))

        await supabase.from("media_kit_elements").insert(newElements)
      }

      checkDatabaseAndFetch()
    } catch (error) {
      console.error("Error duplicating media kit:", error)
    }
  }

  const filteredKits = mediaKits.filter(
    (kit) =>
      kit.creator_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      kit.slug.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  // Show setup mode if database tables don't exist
  if (setupMode || databaseError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white/10 border-white/20">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-8 h-8 text-yellow-400" />
                  <div>
                    <CardTitle className="text-white text-2xl">Database Setup Required</CardTitle>
                    <p className="text-gray-300 mt-2">
                      The database tables need to be created before you can use the media kit generator.
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
                    <li>Come back here and click "Check Database" below</li>
                  </ol>
                </div>

                {databaseError && (
                  <div className="bg-red-900/20 border border-red-500/50 p-4 rounded-lg">
                    <p className="text-red-300">{databaseError}</p>
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    onClick={checkDatabaseAndFetch}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Check Database
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => window.open("https://supabase.com/dashboard", "_blank")}
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    Open Supabase Dashboard
                  </Button>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">TrueConext Media Kits</h1>
            <p className="text-gray-300">Manage creator media kits and templates</p>
          </div>
          <Link href="/admin/create">
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New Media Kit
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search media kits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-gray-400"
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-white">{mediaKits.length}</div>
              <div className="text-gray-300">Total Media Kits</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-white">{mediaKits.filter((kit) => kit.published).length}</div>
              <div className="text-gray-300">Published</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 border-white/20">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-white">{mediaKits.filter((kit) => !kit.published).length}</div>
              <div className="text-gray-300">Drafts</div>
            </CardContent>
          </Card>
        </div>

        {/* Media Kits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredKits.map((kit) => (
            <Card key={kit.id} className="bg-white/10 border-white/20 hover:bg-white/15 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">{kit.creator_name}</CardTitle>
                  <Badge variant={kit.published ? "default" : "secondary"}>
                    {kit.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <p className="text-gray-300 text-sm">/{kit.slug}</p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/edit/${kit.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Link href={`/mediakit/${kit.id}`} target="_blank">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => duplicateMediaKit(kit)}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteMediaKit(kit.id)}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredKits.length === 0 && !databaseError && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">
              {searchTerm ? "No media kits found matching your search." : "No media kits created yet."}
            </div>
            <Link href="/admin/create">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Create Your First Media Kit
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
