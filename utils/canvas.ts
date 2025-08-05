import type { Point, Polygon } from "../types/polygon"

export const drawPoint = (ctx: CanvasRenderingContext2D, point: Point, isActive = false) => {
  ctx.beginPath()
  ctx.arc(point.x, point.y, isActive ? 6 : 4, 0, 2 * Math.PI)
  ctx.fillStyle = isActive ? "#3b82f6" : "#ef4444"
  ctx.fill()
  ctx.strokeStyle = "#ffffff"
  ctx.lineWidth = 2
  ctx.stroke()
}

export const drawLine = (ctx: CanvasRenderingContext2D, from: Point, to: Point, color = "#3b82f6") => {
  ctx.beginPath()
  ctx.moveTo(from.x, from.y)
  ctx.lineTo(to.x, to.y)
  ctx.strokeStyle = color
  ctx.lineWidth = 2
  ctx.stroke()
}

export const drawPolygon = (ctx: CanvasRenderingContext2D, polygon: Polygon, isActive = false) => {
  if (polygon.points.length === 0) return

  const color = isActive ? "#3b82f6" : polygon.color
  const lineWidth = isActive ? 3 : 2

  if (polygon.points.length > 1) {
    ctx.beginPath()
    ctx.moveTo(polygon.points[0].x, polygon.points[0].y)
    for (let i = 1; i < polygon.points.length; i++) {
      ctx.lineTo(polygon.points[i].x, polygon.points[i].y)
    }

    if (polygon.completed && polygon.points.length > 2) {
      ctx.closePath()
      ctx.fillStyle = color + "30"
      ctx.fill()
    }

    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    ctx.stroke()
  }

  polygon.points.forEach((point, index) => {
    drawPoint(ctx, point, isActive && index === polygon.points.length - 1)
  })

  if (polygon.completed && polygon.label) {
    drawPolygonLabel(ctx, polygon)
  }
}

export const getDistance = (p1: Point, p2: Point): number => {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
}

export const isNearPoint = (clickPoint: Point, targetPoint: Point, threshold = 10): boolean => {
  return getDistance(clickPoint, targetPoint) <= threshold
}

export const drawBackgroundImage = (ctx: CanvasRenderingContext2D, imageData: ImageData, canvas: HTMLCanvasElement) => {
  const img = new Image()
  img.crossOrigin = "anonymous"
  img.onload = () => {
    const scale = Math.min(canvas.width / img.width, canvas.height / img.height)
    const scaledWidth = img.width * scale
    const scaledHeight = img.height * scale
    const x = (canvas.width - scaledWidth) / 2
    const y = (canvas.height - scaledHeight) / 2

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(img, x, y, scaledWidth, scaledHeight)
  }
  img.src = imageData.src
}

export const drawPolygonLabel = (ctx: CanvasRenderingContext2D, polygon: Polygon) => {
  if (!polygon.label || polygon.points.length === 0) return

  const centerX = polygon.points.reduce((sum, p) => sum + p.x, 0) / polygon.points.length
  const centerY = polygon.points.reduce((sum, p) => sum + p.y, 0) / polygon.points.length

  const labelPosition = polygon.labelPosition || { x: centerX, y: centerY }

  ctx.font = "14px Arial"
  const textMetrics = ctx.measureText(polygon.label)
  const padding = 4
  const bgWidth = textMetrics.width + padding * 2
  const bgHeight = 20

  ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
  ctx.fillRect(labelPosition.x - bgWidth / 2, labelPosition.y - bgHeight / 2, bgWidth, bgHeight)

  ctx.strokeStyle = polygon.color
  ctx.lineWidth = 1
  ctx.strokeRect(labelPosition.x - bgWidth / 2, labelPosition.y - bgHeight / 2, bgWidth, bgHeight)

  ctx.fillStyle = "#000000"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(polygon.label, labelPosition.x, labelPosition.y)
}
