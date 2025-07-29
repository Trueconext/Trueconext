"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { DatabaseSetupGuide } from "@/components/database-setup-guide"

export default function SetupPage() {
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
            <h1 className="text-3xl font-bold text-white">Database Setup</h1>
            <p className="text-gray-300">Initialize your TrueConext Media Kit database</p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <DatabaseSetupGuide />

          <div className="mt-8 text-center">
            <p className="text-gray-300 mb-4">
              After running the SQL script in your Supabase dashboard, return to the admin panel.
            </p>
            <Link href="/admin">
              <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                Back to Admin Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
