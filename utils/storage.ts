import type { Polygon, ImageData } from "../types/polygon"

const STORAGE_KEY = "polygon-drawing-app-data"

export interface StorageData {
  polygons: Polygon[]
  backgroundImage: ImageData | null
}

export const saveToLocalStorage = (polygons: Polygon[], backgroundImage: ImageData | null = null) => {
  try {
    const data: StorageData = { polygons, backgroundImage }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error("Failed to save to localStorage:", error)
  }
}

export const loadFromLocalStorage = (): StorageData => {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    if (data) {
      const parsed = JSON.parse(data)
      if (Array.isArray(parsed)) {
        return { polygons: parsed, backgroundImage: null }
      }
      return parsed
    }
    return { polygons: [], backgroundImage: null }
  } catch (error) {
    console.error("Failed to load from localStorage:", error)
    return { polygons: [], backgroundImage: null }
  }
}
