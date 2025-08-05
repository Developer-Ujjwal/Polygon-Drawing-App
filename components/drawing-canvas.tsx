"use client"

import type React from "react"
import { useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from "react"
import type { Point, Polygon, ImageData } from "../types/polygon"
import { drawPolygon } from "../utils/canvas"

interface DrawingCanvasProps {
  polygons: Polygon[]
  activePolygon: Polygon | null
  backgroundImage: ImageData | null
  onCanvasClick: (point: Point) => void
  selectedPolygonId: string | null
}

export const DrawingCanvas = forwardRef<HTMLCanvasElement, DrawingCanvasProps>(
  ({ polygons, activePolygon, backgroundImage, onCanvasClick, selectedPolygonId }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const backgroundImageRef = useRef<HTMLImageElement | null>(null)

    useImperativeHandle(ref, () => canvasRef.current!, [])

    const redrawCanvas = useCallback(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (backgroundImage && backgroundImageRef.current) {
        const img = backgroundImageRef.current
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height)
        const scaledWidth = img.width * scale
        const scaledHeight = img.height * scale
        const x = (canvas.width - scaledWidth) / 2
        const y = (canvas.height - scaledHeight) / 2

        ctx.drawImage(img, x, y, scaledWidth, scaledHeight)
      }

      polygons.forEach((polygon) => {
        const isSelected = polygon.id === selectedPolygonId
        drawPolygon(ctx, polygon, isSelected)
      })

      if (activePolygon && activePolygon.points.length > 0) {
        drawPolygon(ctx, activePolygon, true)
      }
    }, [polygons, activePolygon, backgroundImage, selectedPolygonId])

    useEffect(() => {
      if (backgroundImage) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          backgroundImageRef.current = img
          redrawCanvas()
        }
        img.onerror = () => {
          console.error("Failed to load background image")
          backgroundImageRef.current = null
          redrawCanvas()
        }
        img.src = backgroundImage.src
      } else {
        backgroundImageRef.current = null
        redrawCanvas()
      }
    }, [backgroundImage, redrawCanvas])

    useEffect(() => {
      const canvas = canvasRef.current
      if (!canvas) return

      const resizeCanvas = () => {
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width
        canvas.height = rect.height
        redrawCanvas()
      }

      resizeCanvas()
      window.addEventListener("resize", resizeCanvas)

      return () => window.removeEventListener("resize", resizeCanvas)
    }, [redrawCanvas])

    useEffect(() => {
      redrawCanvas()
    }, [redrawCanvas])

    const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const point: Point = {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      }

      onCanvasClick(point)
    }

    return (
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="w-full h-full border border-gray-300 cursor-crosshair bg-white"
        style={{ minHeight: "400px" }}
      />
    )
  },
)

DrawingCanvas.displayName = "DrawingCanvas"
