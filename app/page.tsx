"use client"

import React from "react"

import { useState, useRef, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Download,
  Eye,
  Edit,
  Plus,
  Trash2,
  Type,
  Share2,
  BarChart3,
  ImageIcon,
  ArrowUp,
  ArrowDown,
  Palette,
  AlignCenter,
  Copy,
} from "lucide-react"
import { socialPlatforms, metricTypes } from "@/lib/social-platforms"

interface MediaKitElement {
  id: string
  type: "social" | "text" | "metric" | "photo" | "chart"
  platform?: string
  label: string
  value: string
  url?: string
  x: number
  y: number
  color: string
  backgroundColor?: string
  fontSize?: number
  fontWeight?: "normal" | "bold" | "semibold"
  borderRadius?: number
  width?: number
  height?: number
  zIndex: number
  padding?: number
  shadow?: boolean
  chartData?: { label: string; value: number; color: string }[]
  chartTitle?: string
  hasBorder?: boolean
  borderColor?: string
  borderWidth?: number
}

interface BackgroundGradient {
  type: "linear" | "radial"
  direction: string
  colors: { color: string; position: number }[]
}

const GRID_SIZE = 5
const CANVAS_WIDTH = 400
const MIN_CANVAS_HEIGHT = 600
const FOOTER_HEIGHT = 60

const TRUECONEXT_COLORS = [
  "#10ff92",
  "#7822ff",
  "#23252a",
  "#2e3135",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#ffffff",
  "#000000",
]

const CHART_COLORS = [
  "#10ff92",
  "#7822ff",
  "#3b82f6",
  "#ec4899",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
]

const DEFAULT_GRADIENT: BackgroundGradient = {
  type: "linear",
  direction: "135deg",
  colors: [
    { color: "#2d2d2d", position: 0 },
    { color: "#181819", position: 100 },
  ],
}

export default function MediaKitGenerator() {
  const [elements, setElements] = useState<MediaKitElement[]>([])
  const [selectedElement, setSelectedElement] = useState<string | null>(null)
  const [creatorName, setCreatorName] = useState("Creator Name")
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [draggedElement, setDraggedElement] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [backgroundGradient, setBackgroundGradient] = useState<BackgroundGradient>(DEFAULT_GRADIENT)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Calculate dynamic canvas height based on elements
  const canvasHeight = useMemo(() => {
    if (elements.length === 0) return MIN_CANVAS_HEIGHT

    const maxY = Math.max(...elements.map((el) => el.y + (el.height || 50) + 20))

    return Math.max(MIN_CANVAS_HEIGHT, maxY + FOOTER_HEIGHT)
  }, [elements])

  const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE

  const getGradientCSS = (gradient: BackgroundGradient) => {
    const colorStops = gradient.colors.map((c) => `${c.color} ${c.position}%`).join(", ")

    if (gradient.type === "radial") {
      return `radial-gradient(circle, ${colorStops})`
    }
    return `linear-gradient(${gradient.direction}, ${colorStops})`
  }

  const addElement = (type: MediaKitElement["type"], platform?: string) => {
    const platformData = platform ? socialPlatforms.find((p) => p.id === platform) : null

    const nextY = elements.length === 0 ? 100 : Math.max(...elements.map((el) => el.y + (el.height || 50))) + 80

    const initialChartData =
      type === "chart"
        ? [
            { label: "Item 1", value: 60, color: CHART_COLORS[0] },
            { label: "Item 2", value: 40, color: CHART_COLORS[1] },
          ]
        : undefined

    const initialHeight =
      type === "photo"
        ? 120
        : type === "social"
          ? 50
          : type === "chart"
            ? Math.max(140, 60 + (initialChartData ? initialChartData.length * 25 : 2 * 25))
            : undefined

    const newElement: MediaKitElement = {
      id: `element-${Date.now()}`,
      type,
      platform,
      label:
        platformData?.name ||
        (type === "text" ? "Heading" : type === "metric" ? "Followers" : type === "chart" ? "Chart Title" : "Text"),
      value:
        platformData?.placeholder ||
        (type === "text"
          ? "Write here"
          : type === "metric"
            ? "100K+"
            : type === "chart"
              ? "Demographics"
              : "Enter text"),
      url: platform ? "https://example.com" : "",
      x: snapToGrid(200 - (type === "social" ? 140 : type === "photo" ? 60 : type === "chart" ? 150 : 50)),
      y: snapToGrid(nextY),
      color: type === "social" && platformData ? "#ffffff" : "#ffffff",
      backgroundColor:
        type === "social" && platformData
          ? platformData.color
          : type === "text"
            ? "transparent"
            : type === "chart"
              ? "rgba(255,255,255,0.1)"
              : type === "photo"
                ? "#10ff92"
                : "#10ff92",
      fontSize: type === "text" ? 24 : type === "social" ? 16 : type === "chart" ? 18 : 18,
      fontWeight: type === "text" ? "bold" : type === "chart" ? "bold" : "semibold",
      borderRadius: type === "photo" ? 50 : type === "social" ? 25 : type === "chart" ? 15 : 12,
      width: type === "photo" ? 120 : type === "social" ? 280 : type === "chart" ? 300 : 100,
      height: initialHeight || 50,
      zIndex: elements.length,
      padding: type === "social" ? 16 : type === "metric" ? 12 : type === "chart" ? 20 : 8,
      shadow: type === "social" || type === "metric" || type === "chart",
      chartData: initialChartData || [],
      chartTitle: type === "chart" ? "Demographics" : "",
      hasBorder: false,
      borderColor: "#10ff92",
      borderWidth: 3,
    }
    setElements([...elements, newElement])
    setSelectedElement(newElement.id)
  }

  const updateElement = (id: string, updates: Partial<MediaKitElement>) => {
    setElements(elements.map((el) => (el.id === id ? { ...el, ...updates } : el)))
  }

  const centerElement = (id: string) => {
    const element = elements.find((el) => el.id === id)
    if (!element) return

    const elementWidth = element.width || 100
    const centerX = snapToGrid((CANVAS_WIDTH - elementWidth) / 2)
    updateElement(id, { x: centerX })
  }

  const deleteElement = (id: string) => {
    setElements(elements.filter((el) => el.id !== id))
    if (selectedElement === id) {
      setSelectedElement(null)
    }
  }

  const moveElementLayer = (id: string, direction: "up" | "down") => {
    const element = elements.find((el) => el.id === id)
    if (!element) return

    const newZIndex = direction === "up" ? element.zIndex + 1 : element.zIndex - 1
    updateElement(id, { zIndex: Math.max(0, newZIndex) })
  }

  const handleMouseDown = (e: React.MouseEvent, elementId: string) => {
    if (isPreviewMode) return

    const element = elements.find((el) => el.id === elementId)
    if (!element) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    setDraggedElement(elementId)
    setSelectedElement(elementId)
    setDragOffset({
      x: e.clientX - rect.left - element.x,
      y: e.clientY - rect.top - element.y,
    })
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggedElement || !canvasRef.current) return

      const rect = canvasRef.current.getBoundingClientRect()
      const element = elements.find((el) => el.id === draggedElement)
      const elementWidth = element?.width || 100

      const newX = snapToGrid(Math.max(0, Math.min(CANVAS_WIDTH - elementWidth, e.clientX - rect.left - dragOffset.x)))
      const newY = snapToGrid(Math.max(0, Math.min(canvasHeight - 50, e.clientY - rect.top - dragOffset.y)))

      updateElement(draggedElement, { x: newX, y: newY })
    },
    [draggedElement, dragOffset, elements, canvasHeight],
  )

  const handleMouseUp = useCallback(() => {
    setDraggedElement(null)
  }, [])

  const handleTouchStart = (e: React.TouchEvent, elementId: string) => {
    if (isPreviewMode) return

    const element = elements.find((el) => el.id === elementId)
    if (!element) return

    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return

    const touch = e.touches[0]
    setDraggedElement(elementId)
    setSelectedElement(elementId)
    setDragOffset({
      x: touch.clientX - rect.left - element.x,
      y: touch.clientY - rect.top - element.y,
    })
  }

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!draggedElement || !canvasRef.current) return

      e.preventDefault() // Prevent scrolling while dragging

      const rect = canvasRef.current.getBoundingClientRect()
      const element = elements.find((el) => el.id === draggedElement)
      const elementWidth = element?.width || 100

      const touch = e.touches[0]
      const newX = snapToGrid(
        Math.max(0, Math.min(CANVAS_WIDTH - elementWidth, touch.clientX - rect.left - dragOffset.x)),
      )
      const newY = snapToGrid(Math.max(0, Math.min(canvasHeight - 50, touch.clientY - rect.top - dragOffset.y)))

      updateElement(draggedElement, { x: newX, y: newY })
    },
    [draggedElement, dragOffset, elements, canvasHeight],
  )

  const handleTouchEnd = useCallback(() => {
    setDraggedElement(null)
  }, [])

  React.useEffect(() => {
    if (draggedElement) {
      // Mouse events
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)

      // Touch events for mobile
      document.addEventListener("touchmove", handleTouchMove, { passive: false })
      document.addEventListener("touchend", handleTouchEnd)

      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
        document.removeEventListener("touchmove", handleTouchMove)
        document.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [draggedElement, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  const getSocialIconSVG = (platform: string) => {
    const icons: Record<string, string> = {
      instagram:
        '<rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="m15.5 6.5-1.1 1.1a3 3 0 1 1-4.24 0L9.05 6.4a5 5 0 1 0 7.08-.1z"/><circle cx="12" cy="12" r="3"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
      youtube:
        '<path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><polygon points="10,8 16,12 10,16" fill="currentColor"/>',
      tiktok: '<polygon points="5,3 19,12 5,21" fill="currentColor"/>',
      x: '<path d="m4 4 11.733 16h4.267l-11.733 -16z"/><path d="m20 4 -11.733 16h-4.267l11.733 -16z"/>',
      twitch: '<path d="M21 2H3v16h5v4l4-4h5l4-4V2zm-10 9V7h2v4h-2zm5 0V7h2v4h-2z"/>',
      facebook: '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
      linkedin:
        '<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>',
      snapchat: '<polygon points="23,7 16,12 23,17 23,7"/><polygon points="1,7 8,12 1,17 1,7"/>',
      bluesky: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
      website:
        '<circle cx="12" cy="12" r="10"/><path d="m2 12 20 0"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
      paypal: '<circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>',
      kick: '<polygon points="5,3 19,12 5,21" fill="currentColor"/>',
      trovo: '<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M12 8v8"/><path d="m8 12 4 4 4-4"/>',
    }
    return icons[platform] || '<circle cx="12" cy="12" r="10"/>'
  }

  const generateHTML = () => {
    const fileName = `${creatorName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-mediakit.html`

    const elementsHTML = elements
      .sort((a, b) => a.zIndex - b.zIndex)
      .map((element) => {
        const platformData = element.platform ? socialPlatforms.find((p) => p.id === element.platform) : null

        const baseStyle = `
          position: absolute;
          left: ${(element.x / CANVAS_WIDTH) * 100}%;
          top: ${(element.y / canvasHeight) * 100}%;
          color: ${element.color};
          font-size: ${element.fontSize}px;
          font-weight: ${element.fontWeight};
          z-index: ${element.zIndex};
          border-radius: ${element.borderRadius}px;
          ${element.width ? `width: ${element.width}px;` : ""}
          ${element.height ? `height: ${element.height}px;` : ""}
          ${element.padding ? `padding: ${element.padding}px;` : ""}
          ${element.backgroundColor && element.backgroundColor !== "transparent" ? `background: ${element.backgroundColor};` : ""}
          ${element.hasBorder && element.borderColor && element.borderWidth ? `border: ${element.borderWidth}px solid ${element.borderColor};` : ""}
          ${element.shadow ? "box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);" : ""}
          transition: transform 0.2s ease;
        `

        if (element.type === "photo") {
          return `
          <div style="${baseStyle}" class="hover-scale">
            <img src="${element.value}" alt="${element.label}" 
                 style="width: 100%; height: 100%; border-radius: ${element.borderRadius}px; object-fit: cover;" />
          </div>
        `
        }

        if (element.type === "chart") {
          const chartItemsHTML =
            element.chartData
              ?.map(
                (item) => `
          <div style="display: flex; align-items: center; font-size: 12px; margin-bottom: 6px;">
            <div style="width: 64px; text-align: right; margin-right: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.label}</div>
            <div style="flex: 1; background: rgba(0,0,0,0.2); border-radius: 12px; height: 12px; overflow: hidden;">
              <div style="height: 100%; border-radius: 12px; width: ${item.value}%; background: ${item.color}; transition: all 0.3s;"></div>
            </div>
            <div style="width: 40px; text-align: left; margin-left: 8px; font-size: 12px;">${item.value}%</div>
          </div>
        `,
              )
              .join("") || ""

          return `
          <div style="${baseStyle}" class="hover-scale">
            <div style="text-align: center; font-weight: bold; margin-bottom: 12px; font-size: 14px;">
              ${element.chartTitle || "Chart"}
            </div>
            <div>
              ${chartItemsHTML}
            </div>
          </div>
        `
        }

        if (element.type === "social" && element.url) {
          const iconSVG = platformData
            ? `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style="margin-right: 8px;">
            ${getSocialIconSVG(element.platform!)}
          </svg>
        `
            : ""

          return `
          <a href="${element.url}" target="_blank" style="${baseStyle} text-decoration: none; display: flex; align-items: center; justify-content: center;" class="hover-scale">
            ${iconSVG}${element.value}
          </a>
        `
        }

        return `
        <div style="${baseStyle}" class="hover-scale">
          ${element.value}
        </div>
      `
      })
      .join("")

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${creatorName} - Media Kit</title>
    <meta name="description" content="Media kit for ${creatorName} - Content Creator">
    <meta property="og:title" content="${creatorName} - Media Kit">
    <meta property="og:description" content="Media kit for ${creatorName} - Content Creator">
    <meta property="og:type" content="website">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: ${getGradientCSS(backgroundGradient)};
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }
        
        .mediakit-container {
            position: relative;
            width: 100%;
            max-width: 400px;
            height: ${canvasHeight}px;
            background: ${getGradientCSS(backgroundGradient)};
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
        }
        
        .footer {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            color: rgba(255, 255, 255, 0.6);
            font-size: 12px;
            text-align: center;
            font-weight: 500;
        }
        
        .footer a {
            color: inherit;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
            justify-content: center;
            transition: color 0.2s ease;
        }
        
        .footer a:hover {
            color: rgba(255, 255, 255, 0.8);
        }
        
        .hover-scale:hover {
            transform: scale(1.05);
        }
        
        @media (max-width: 480px) {
            .mediakit-container {
                max-width: 100%;
                height: 100vh;
                border-radius: 0;
            }
        }
    </style>
</head>
<body>
    <div class="mediakit-container">
        ${elementsHTML}
        <div class="footer">
            <a href="https://trueconext.com/" target="_blank" rel="noopener noreferrer">
                <img src="https://raw.githubusercontent.com/Trueconext/TrueConextW/refs/heads/main/Icon%20Only%20No%20Background.png" alt="TrueConext Logo" style="width: 16px; height: 16px; object-fit: contain;" />
                Powered by TrueConext
            </a>
        </div>
    </div>
</body>
</html>`

    const blob = new Blob([html], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    a.click()
    URL.revokeObjectURL(url)
  }

  const selectedEl = elements.find((el) => el.id === selectedElement)

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedElement && !isPreviewMode) {
        if (e.key === "Delete") {
          deleteElement(selectedElement)
        }
        if (e.key === "Escape") {
          setSelectedElement(null)
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selectedElement, isPreviewMode])

  return (
    <div className="min-h-screen" style={{ backgroundImage: getGradientCSS(backgroundGradient) }}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 gap-4">
          <div className="flex items-center gap-4">
            <img
              src="https://raw.githubusercontent.com/Trueconext/TrueConextW/refs/heads/main/Icon%20Only%20No%20Background.png"
              alt="TrueConext Logo"
              className="w-16 h-16 lg:w-24 lg:h-24 object-contain"
            />
            <div>
              <h1 className="text-2xl lg:text-4xl font-bold text-white mb-2">TrueConext Media Kit Generator</h1>
              <p className="text-gray-300 text-sm lg:text-base">Exclusive tool for TrueConext Creators</p>
            </div>
          </div>
          <div className="flex items-center gap-2 lg:gap-4 w-full lg:w-auto">
            <Button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent flex-1 lg:flex-none"
              size="sm"
            >
              {isPreviewMode ? <Edit className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              <span className="hidden sm:inline">{isPreviewMode ? "Edit Mode" : "Preview Mode"}</span>
              <span className="sm:hidden">{isPreviewMode ? "Edit" : "Preview"}</span>
            </Button>
            <Button
              onClick={generateHTML}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 flex-1 lg:flex-none"
              size="sm"
            >
              <Download className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Download HTML</span>
              <span className="sm:hidden">Download</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Scrollable */}
          {!isPreviewMode && (
            <div className="lg:col-span-1 max-h-screen overflow-y-auto space-y-6 pr-4">
              {/* Basic Settings */}
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Basic Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="creator-name" className="text-white">
                      Name
                    </Label>
                    <Input
                      id="creator-name"
                      value={creatorName}
                      onChange={(e) => setCreatorName(e.target.value)}
                      className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                    />
                  </div>

                  {/* Canvas Info */}
                  <div className="text-sm text-gray-300">
                    <p>
                      Canvas: {CANVAS_WIDTH} × {canvasHeight}px
                    </p>
                    <p>Elements: {elements.length}</p>
                  </div>

                  {/* Background Gradient */}
                  <div>
                    <Label className="text-white flex items-center gap-2">
                      <Palette className="w-4 h-4" />
                      Background Gradient
                    </Label>
                    <div className="space-y-3 mt-2">
                      <Select
                        value={backgroundGradient.type}
                        onValueChange={(value: "linear" | "radial") =>
                          setBackgroundGradient({ ...backgroundGradient, type: value })
                        }
                      >
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="linear">Linear</SelectItem>
                          <SelectItem value="radial">Radial</SelectItem>
                        </SelectContent>
                      </Select>

                      {backgroundGradient.type === "linear" && (
                        <Input
                          value={backgroundGradient.direction}
                          onChange={(e) => setBackgroundGradient({ ...backgroundGradient, direction: e.target.value })}
                          placeholder="135deg"
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        />
                      )}

                      <div className="space-y-2">
                        {backgroundGradient.colors.map((colorStop, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              type="color"
                              value={colorStop.color}
                              onChange={(e) => {
                                const newColors = [...backgroundGradient.colors]
                                newColors[index].color = e.target.value
                                setBackgroundGradient({ ...backgroundGradient, colors: newColors })
                              }}
                              className="w-16 bg-white/10 border-white/20"
                            />
                            <Slider
                              value={[colorStop.position]}
                              onValueChange={([value]) => {
                                const newColors = [...backgroundGradient.colors]
                                newColors[index].position = value
                                setBackgroundGradient({ ...backgroundGradient, colors: newColors })
                              }}
                              min={0}
                              max={100}
                              step={1}
                              className="flex-1"
                            />
                            <span className="text-white text-sm w-12">{colorStop.position}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Add Elements */}
              <Card className="bg-white/10 border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Add Elements</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="social" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 bg-white/10">
                      <TabsTrigger value="social" className="text-xs">
                        <Share2 className="w-4 h-4" />
                      </TabsTrigger>
                      <TabsTrigger value="text" className="text-xs">
                        <Type className="w-4 h-4" />
                      </TabsTrigger>
                      <TabsTrigger value="metric" className="text-xs">
                        <BarChart3 className="w-4 h-4" />
                      </TabsTrigger>
                      <TabsTrigger value="photo" className="text-xs">
                        <ImageIcon className="w-4 h-4" />
                      </TabsTrigger>
                      <TabsTrigger value="chart" className="text-xs">
                        <BarChart3 className="w-4 h-4" />
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="social" className="space-y-2">
                      {socialPlatforms.map((platform) => (
                        <Button
                          key={platform.id}
                          onClick={() => addElement("social", platform.id)}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start border-white/20 text-white hover:bg-white/10 bg-transparent"
                        >
                          <platform.icon className="w-4 h-4 mr-2" />
                          {platform.name}
                        </Button>
                      ))}
                    </TabsContent>

                    <TabsContent value="text" className="space-y-2">
                      <Button
                        onClick={() => addElement("text")}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start border-white/20 text-white hover:bg-white/10 bg-transparent"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Text Field
                      </Button>
                    </TabsContent>

                    <TabsContent value="metric" className="space-y-2">
                      {metricTypes.map((metric) => (
                        <Button
                          key={metric.id}
                          onClick={() => addElement("metric")}
                          variant="outline"
                          size="sm"
                          className="w-full justify-start border-white/20 text-white hover:bg-white/10 bg-transparent"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          {metric.label}
                        </Button>
                      ))}
                    </TabsContent>

                    <TabsContent value="photo" className="space-y-2">
                      <Button
                        onClick={() => addElement("photo")}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start border-white/20 text-white hover:bg-white/10 bg-transparent"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Photo
                      </Button>
                    </TabsContent>

                    <TabsContent value="chart" className="space-y-2">
                      <Button
                        onClick={() => addElement("chart")}
                        variant="outline"
                        size="sm"
                        className="w-full justify-start border-white/20 text-white hover:bg-white/10 bg-transparent"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Chart
                      </Button>
                      <div className="text-xs text-gray-400 px-2">
                        Perfect for demographics, age distribution, gender, location stats
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>

              {/* Element Properties */}
              {selectedEl && (
                <Card className="bg-white/10 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      Edit Element
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => centerElement(selectedEl.id)}
                          className="border-white/20 text-white hover:bg-white/10 bg-transparent p-1"
                          title="Center Element"
                        >
                          <AlignCenter className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveElementLayer(selectedEl.id, "up")}
                          className="border-white/20 text-white hover:bg-white/10 bg-transparent p-1"
                        >
                          <ArrowUp className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => moveElementLayer(selectedEl.id, "down")}
                          className="border-white/20 text-white hover:bg-white/10 bg-transparent p-1"
                        >
                          <ArrowDown className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteElement(selectedEl.id)}
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const newElement = {
                              ...selectedEl,
                              id: `element-${Date.now()}`,
                              x: selectedEl.x + 20,
                              y: selectedEl.y + 20,
                              zIndex: elements.length,
                            }
                            setElements([...elements, newElement])
                            setSelectedElement(newElement.id)
                          }}
                          className="border-white/20 text-white hover:bg-white/10 bg-transparent p-1"
                          title="Duplicate Element"
                        >
                          <Copy className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-white">Value</Label>
                      <Input
                        value={selectedEl.value}
                        onChange={(e) => updateElement(selectedEl.id, { value: e.target.value })}
                        className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                        placeholder={selectedEl.type === "photo" ? "Image URL" : "Enter value"}
                      />
                    </div>

                    {selectedEl.type === "social" && (
                      <div>
                        <Label className="text-white">URL</Label>
                        <Input
                          value={selectedEl.url || ""}
                          onChange={(e) => updateElement(selectedEl.id, { url: e.target.value })}
                          className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                          placeholder="https://..."
                        />
                      </div>
                    )}

                    {selectedEl.type === "chart" && (
                      <>
                        <div>
                          <Label className="text-white">Chart Title</Label>
                          <Input
                            value={selectedEl.chartTitle || ""}
                            onChange={(e) => updateElement(selectedEl.id, { chartTitle: e.target.value })}
                            className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                            placeholder="e.g., Age Distribution, Gender, Location"
                          />
                        </div>

                        <div>
                          <Label className="text-white">Chart Items</Label>
                          <div className="space-y-2 mt-2">
                            {selectedEl.chartData?.map((item, index) => (
                              <div key={index} className="space-y-2 p-3 bg-white/5 rounded-lg">
                                <div className="flex gap-2 items-center">
                                  <Input
                                    value={item.label}
                                    onChange={(e) => {
                                      const newData = [...(selectedEl.chartData || [])]
                                      newData[index].label = e.target.value
                                      updateElement(selectedEl.id, { chartData: newData })
                                    }}
                                    className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-xs flex-1"
                                    placeholder="Label"
                                  />
                                  <Input
                                    type="number"
                                    value={item.value}
                                    onChange={(e) => {
                                      const newData = [...(selectedEl.chartData || [])]
                                      newData[index].value = Math.max(
                                        0,
                                        Math.min(100, Number.parseInt(e.target.value) || 0),
                                      )
                                      updateElement(selectedEl.id, { chartData: newData })
                                    }}
                                    className="bg-white/10 border-white/20 text-white w-16 text-xs"
                                    min="0"
                                    max="100"
                                  />
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      const newData = selectedEl.chartData?.filter((_, i) => i !== index) || []
                                      const newHeight = Math.max(140, 60 + newData.length * 25)
                                      updateElement(selectedEl.id, { chartData: newData, height: newHeight })
                                    }}
                                    className="border-red-500/50 text-red-400 hover:bg-red-500/10 p-1"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </Button>
                                </div>

                                <div>
                                  <Label className="text-white text-xs">Color</Label>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {CHART_COLORS.map((color) => (
                                      <button
                                        key={color}
                                        onClick={() => {
                                          const newData = [...(selectedEl.chartData || [])]
                                          newData[index].color = color
                                          updateElement(selectedEl.id, { chartData: newData })
                                        }}
                                        className={`w-6 h-6 rounded border-2 ${
                                          item.color === color ? "border-white" : "border-transparent"
                                        }`}
                                        style={{ backgroundColor: color }}
                                      />
                                    ))}
                                  </div>
                                  <Input
                                    type="color"
                                    value={item.color}
                                    onChange={(e) => {
                                      const newData = [...(selectedEl.chartData || [])]
                                      newData[index].color = e.target.value
                                      updateElement(selectedEl.id, { chartData: newData })
                                    }}
                                    className="mt-1 w-full bg-white/10 border-white/20"
                                  />
                                </div>
                              </div>
                            ))}

                            <Button
                              size="sm"
                              onClick={() => {
                                const newData = [...(selectedEl.chartData || [])]
                                const colorIndex = newData.length % CHART_COLORS.length
                                newData.push({
                                  label: `Item ${newData.length + 1}`,
                                  value: 0,
                                  color: CHART_COLORS[colorIndex],
                                })
                                const newHeight = Math.max(140, 60 + newData.length * 25)
                                updateElement(selectedEl.id, { chartData: newData, height: newHeight })
                              }}
                              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Item
                            </Button>

                            <Button
                              size="sm"
                              onClick={() => {
                                const total = selectedEl.chartData?.reduce((sum, item) => sum + item.value, 0) || 0
                                if (total > 0) {
                                  const newData =
                                    selectedEl.chartData?.map((item) => ({
                                      ...item,
                                      value: Math.round((item.value / total) * 100),
                                    })) || []
                                  updateElement(selectedEl.id, { chartData: newData })
                                }
                              }}
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              Balance to 100%
                            </Button>

                            <div className="text-xs text-gray-400">
                              Total: {selectedEl.chartData?.reduce((sum, item) => sum + item.value, 0) || 0}%
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <Label className="text-white">Text Color</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {TRUECONEXT_COLORS.map((color) => (
                          <button
                            key={color}
                            onClick={() => updateElement(selectedEl.id, { color })}
                            className={`w-8 h-8 rounded border-2 ${
                              selectedEl.color === color ? "border-white" : "border-transparent"
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <Input
                        type="color"
                        value={selectedEl.color}
                        onChange={(e) => updateElement(selectedEl.id, { color: e.target.value })}
                        className="mt-2 bg-white/10 border-white/20"
                      />
                    </div>

                    {selectedEl.type !== "photo" && (
                      <div>
                        <Label className="text-white">Background Color</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <button
                            onClick={() => updateElement(selectedEl.id, { backgroundColor: "transparent" })}
                            className={`w-8 h-8 rounded border-2 bg-transparent ${
                              selectedEl.backgroundColor === "transparent" ? "border-white" : "border-gray-400"
                            }`}
                            style={{
                              backgroundImage:
                                "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                              backgroundSize: "8px 8px",
                              backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
                            }}
                          />
                          {TRUECONEXT_COLORS.map((color) => (
                            <button
                              key={color}
                              onClick={() => updateElement(selectedEl.id, { backgroundColor: color })}
                              className={`w-8 h-8 rounded border-2 ${
                                selectedEl.backgroundColor === color ? "border-white" : "border-transparent"
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <Input
                          type="color"
                          value={
                            selectedEl.backgroundColor === "transparent" || !selectedEl.backgroundColor
                              ? "#000000"
                              : selectedEl.backgroundColor
                          }
                          onChange={(e) => updateElement(selectedEl.id, { backgroundColor: e.target.value })}
                          className="mt-2 bg-white/10 border-white/20"
                        />
                      </div>
                    )}

                    {/* Photo Background Color */}
                    {selectedEl.type === "photo" && (
                      <div>
                        <Label className="text-white">Background Color</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <button
                            onClick={() => updateElement(selectedEl.id, { backgroundColor: "transparent" })}
                            className={`w-8 h-8 rounded border-2 bg-transparent ${
                              selectedEl.backgroundColor === "transparent" ? "border-white" : "border-gray-400"
                            }`}
                            style={{
                              backgroundImage:
                                "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                              backgroundSize: "8px 8px",
                              backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
                            }}
                          />
                          {TRUECONEXT_COLORS.map((color) => (
                            <button
                              key={color}
                              onClick={() => updateElement(selectedEl.id, { backgroundColor: color })}
                              className={`w-8 h-8 rounded border-2 ${
                                selectedEl.backgroundColor === color ? "border-white" : "border-transparent"
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        <Input
                          type="color"
                          value={
                            selectedEl.backgroundColor === "transparent" || !selectedEl.backgroundColor
                              ? "#10ff92"
                              : selectedEl.backgroundColor
                          }
                          onChange={(e) => updateElement(selectedEl.id, { backgroundColor: e.target.value })}
                          className="mt-2 bg-white/10 border-white/20"
                        />
                      </div>
                    )}

                    {/* Border Controls for Social and Photo elements */}
                    {(selectedEl.type === "social" || selectedEl.type === "photo") && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-white">Border</Label>
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={selectedEl.hasBorder || false}
                              onChange={(e) => updateElement(selectedEl.id, { hasBorder: e.target.checked })}
                              className="rounded"
                            />
                            <span className="text-white text-sm">Enable</span>
                          </label>
                        </div>

                        {selectedEl.hasBorder && (
                          <div className="space-y-3">
                            <div>
                              <Label className="text-white text-sm">Border Color</Label>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {TRUECONEXT_COLORS.map((color) => (
                                  <button
                                    key={color}
                                    onClick={() => updateElement(selectedEl.id, { borderColor: color })}
                                    className={`w-6 h-6 rounded border-2 ${
                                      selectedEl.borderColor === color ? "border-white" : "border-transparent"
                                    }`}
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                              <Input
                                type="color"
                                value={selectedEl.borderColor || "#10ff92"}
                                onChange={(e) => updateElement(selectedEl.id, { borderColor: e.target.value })}
                                className="mt-1 bg-white/10 border-white/20"
                              />
                            </div>

                            <div>
                              <Label className="text-white text-sm">Border Width</Label>
                              <Slider
                                value={[selectedEl.borderWidth || 3]}
                                onValueChange={(values) => updateElement(selectedEl.id, { borderWidth: values[0] })}
                                min={1}
                                max={10}
                                step={1}
                                className="mt-1"
                              />
                              <span className="text-gray-400 text-sm">{selectedEl.borderWidth || 3}px</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {selectedEl.type === "photo" && (
                      <>
                        <div>
                          <Label className="text-white">Border Radius</Label>
                          <Slider
                            value={[selectedEl.borderRadius || 0]}
                            onValueChange={(values) => updateElement(selectedEl.id, { borderRadius: values[0] })}
                            min={0}
                            max={100}
                            step={1}
                            className="mt-2"
                          />
                          <span className="text-gray-400 text-sm">{selectedEl.borderRadius}px</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-white">Width</Label>
                            <Input
                              type="number"
                              value={selectedEl.width || 100}
                              onChange={(e) =>
                                updateElement(selectedEl.id, { width: Number.parseInt(e.target.value) || 100 })
                              }
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                          <div>
                            <Label className="text-white">Height</Label>
                            <Input
                              type="number"
                              value={selectedEl.height || 50}
                              onChange={(e) =>
                                updateElement(selectedEl.id, { height: Number.parseInt(e.target.value) || 50 })
                              }
                              className="bg-white/10 border-white/20 text-white"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {(selectedEl.type === "text" || selectedEl.type === "metric" || selectedEl.type === "social") && (
                      <>
                        <div>
                          <Label className="text-white">Font Size</Label>
                          <Slider
                            value={[selectedEl.fontSize || 16]}
                            onValueChange={(values) => updateElement(selectedEl.id, { fontSize: values[0] })}
                            min={10}
                            max={48}
                            step={1}
                            className="mt-2"
                          />
                          <span className="text-gray-400 text-sm">{selectedEl.fontSize}px</span>
                        </div>

                        <div>
                          <Label className="text-white">Font Weight</Label>
                          <Select
                            value={selectedEl.fontWeight || "normal"}
                            onValueChange={(value: "normal" | "bold" | "semibold") =>
                              updateElement(selectedEl.id, { fontWeight: value })
                            }
                          >
                            <SelectTrigger className="bg-white/10 border-white/20 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="normal">Normal</SelectItem>
                              <SelectItem value="semibold">Semibold</SelectItem>
                              <SelectItem value="bold">Bold</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label className="text-white">Border Radius</Label>
                          <Slider
                            value={[selectedEl.borderRadius || 0]}
                            onValueChange={(values) => updateElement(selectedEl.id, { borderRadius: values[0] })}
                            min={0}
                            max={selectedEl.type === "photo" ? 100 : 50}
                            step={1}
                            className="mt-2"
                          />
                          <span className="text-gray-400 text-sm">{selectedEl.borderRadius}px</span>
                        </div>

                        <div>
                          <Label className="text-white">Padding</Label>
                          <Slider
                            value={[selectedEl.padding || 0]}
                            onValueChange={(values) => updateElement(selectedEl.id, { padding: values[0] })}
                            min={0}
                            max={40}
                            step={2}
                            className="mt-2"
                          />
                          <span className="text-gray-400 text-sm">{selectedEl.padding}px</span>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Canvas - Fixed Position */}
          <div className={`${isPreviewMode ? "lg:col-span-4" : "lg:col-span-3"} flex justify-center`}>
            <div className="sticky top-8">
              <div
                ref={canvasRef}
                className="relative rounded-2xl shadow-2xl overflow-hidden transition-all duration-300"
                style={{
                  width: CANVAS_WIDTH,
                  height: canvasHeight,
                  ...(isPreviewMode
                    ? { background: getGradientCSS(backgroundGradient) }
                    : {
                        backgroundImage: `${getGradientCSS(backgroundGradient)}, radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)`,
                        backgroundSize: `auto, ${GRID_SIZE}px ${GRID_SIZE}px`,
                      }),
                }}
              >
                {elements
                  .sort((a, b) => a.zIndex - b.zIndex)
                  .map((element) => {
                    const platformData = element.platform
                      ? socialPlatforms.find((p) => p.id === element.platform)
                      : null
                    const IconComponent = platformData?.icon

                    return (
                      <div
                        key={element.id}
                        onMouseDown={(e) => handleMouseDown(e, element.id)}
                        onTouchStart={(e) => handleTouchStart(e, element.id)}
                        className={`absolute transition-all duration-200 hover:scale-105 ${
                          isPreviewMode ? "cursor-default" : "cursor-move"
                        } ${selectedElement === element.id && !isPreviewMode ? "ring-2 ring-blue-400" : ""} ${
                          element.shadow ? "shadow-lg shadow-black/30" : ""
                        }`}
                        style={{
                          left: element.x,
                          top: element.y,
                          color: element.color,
                          fontSize: element.fontSize,
                          fontWeight: element.fontWeight,
                          zIndex: element.zIndex,
                          borderRadius: element.borderRadius,
                          width: element.width,
                          height: element.height,
                          padding: element.padding,
                          background:
                            element.backgroundColor === "transparent" ? "transparent" : element.backgroundColor,
                          ...(element.hasBorder && element.borderColor && element.borderWidth
                            ? {
                                border: `${element.borderWidth}px solid ${element.borderColor}`,
                              }
                            : {}),
                        }}
                      >
                        {element.type === "photo" ? (
                          <img
                            src={element.value || "/placeholder.svg?height=120&width=120&text=Photo"}
                            alt={element.label}
                            style={{
                              width: "100%",
                              height: "100%",
                              borderRadius: element.borderRadius,
                              objectFit: "cover",
                            }}
                            draggable={false}
                          />
                        ) : element.type === "chart" ? (
                          <div className="w-full h-full">
                            <div className="text-center font-bold mb-3 text-sm">{element.chartTitle || "Chart"}</div>
                            <div className="space-y-1.5">
                              {element.chartData?.map((item, index) => (
                                <div key={index} className="flex items-center text-xs">
                                  <div className="w-16 text-right mr-2 truncate">{item.label}</div>
                                  <div className="flex-1 bg-black/20 rounded-full h-3 overflow-hidden">
                                    <div
                                      className="h-full rounded-full transition-all duration-300"
                                      style={{
                                        width: `${item.value}%`,
                                        backgroundColor: item.color,
                                      }}
                                    />
                                  </div>
                                  <div className="w-10 text-left ml-2 text-xs">{item.value}%</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : element.type === "social" && element.url ? (
                          <a
                            href={isPreviewMode ? element.url : undefined}
                            target={isPreviewMode ? "_blank" : undefined}
                            className="flex items-center justify-center h-full w-full text-decoration-none"
                            onClick={(e) => !isPreviewMode && e.preventDefault()}
                            style={{ textDecoration: "none" }}
                          >
                            {IconComponent && <IconComponent className="w-5 h-5 mr-2" />}
                            {element.value}
                          </a>
                        ) : (
                          <div className="flex items-center justify-center h-full w-full">{element.value}</div>
                        )}
                      </div>
                    )
                  })}

                {/* Footer */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white/60 text-xs font-medium">
                  <a
                    href="https://trueconext.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-white/80 transition-colors"
                  >
                    <img
                      src="https://raw.githubusercontent.com/Trueconext/TrueConextW/refs/heads/main/Icon%20Only%20No%20Background.png"
                      alt="TrueConext Logo"
                      className="w-4 h-4 object-contain"
                    />
                    Powered by TrueConext
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx global>{`
        /* Modern Custom Scrollbars */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #10ff92, #7822ff);
          border-radius: 10px;
          transition: all 0.3s ease;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #0de07a, #6b1fd9);
          box-shadow: 0 0 10px rgba(16, 255, 146, 0.3);
        }
        
        ::-webkit-scrollbar-corner {
          background: transparent;
        }
        
        /* Firefox Scrollbars */
        * {
          scrollbar-width: thin;
          scrollbar-color: #10ff92 rgba(255, 255, 255, 0.05);
        }
        
        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
        
        /* Custom scrollbar for sidebar */
        .sidebar::-webkit-scrollbar {
          width: 4px;
        }
        
        .sidebar::-webkit-scrollbar-thumb {
          background: rgba(16, 255, 146, 0.6);
          border-radius: 6px;
        }
        
        .sidebar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 255, 146, 0.8);
        }
      `}</style>
    </div>
  )
}
