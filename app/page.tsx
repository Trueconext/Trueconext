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

  React.useEffect(() => {
    if (draggedElement) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [draggedElement, handleMouseMove, handleMouseUp])

  const getSocialIconSVG = (platform: string) => {
    const icons: Record<string, string> = {
      instagram:
        '<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>',
      youtube:
        '<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>',
      tiktok:
        '<path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>',
      x: '<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>',
      twitch:
        '<path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>',
      facebook:
        '<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>',
      linkedin:
        '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>',
      snapchat:
        '<path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 16.568l-1.414 1.414L12 13.828l-4.154 4.154-1.414-1.414L10.586 12 6.432 7.846l1.414-1.414L12 10.586l4.154-4.154 1.414 1.414L13.414 12l4.154 4.568z"/>',
      bluesky:
        '<path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"/>',
      website:
        '<path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z"/>',
      paypal:
        '<path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1 17h-2l1-6H8l1-2h2c1 0 2 1 2 2l-1 6z"/>',
      kick: '<path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 18l-6-6 6-6v4h6v4h-6v4z"/>',
      trovo:
        '<path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 18c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z"/>',
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
        if (e.key === "Delete" || e.key === "Backspace") {
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <img
              src="https://raw.githubusercontent.com/Trueconext/TrueConextW/refs/heads/main/Icon%20Only%20No%20Background.png"
              alt="TrueConext Logo"
              className="w-24 h-24 object-contain"
            />
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">TrueConext Media Kit Generator</h1>
              <p className="text-gray-300">Exclusive tool for TrueConext Creators</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10 bg-transparent"
            >
              {isPreviewMode ? <Edit className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
              {isPreviewMode ? "Edit Mode" : "Preview Mode"}
            </Button>
            <Button
              onClick={generateHTML}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download HTML
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
                      Creator Name
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
                              <div key={index} className="flex gap-2 items-center">
                                <Input
                                  value={item.label}
                                  onChange={(e) => {
                                    const newData = [...(selectedEl.chartData || [])]
                                    newData[index].label = e.target.value
                                    updateElement(selectedEl.id, { chartData: newData })
                                  }}
                                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 text-xs"
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
                                <Input
                                  type="color"
                                  value={item.color}
                                  onChange={(e) => {
                                    const newData = [...(selectedEl.chartData || [])]
                                    newData[index].color = e.target.value
                                    updateElement(selectedEl.id, { chartData: newData })
                                  }}
                                  className="w-8 h-8 bg-white/10 border-white/20"
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

                    {selectedEl.type === "photo" && (
                      <>
                        <div>
                          <Label className="text-white">Border Radius</Label>
                          <Slider
                            value={[selectedEl.borderRadius || 0]}
                            onValueChange={([value]) => updateElement(selectedEl.id, { borderRadius: value })}
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
                            onValueChange={([value]) => updateElement(selectedEl.id, { fontSize: value })}
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
                            onValueChange={(value: any) => updateElement(selectedEl.id, { fontWeight: value })}
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
                            onValueChange={([value]) => updateElement(selectedEl.id, { borderRadius: value })}
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
                            onValueChange={([value]) => updateElement(selectedEl.id, { padding: value })}
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
