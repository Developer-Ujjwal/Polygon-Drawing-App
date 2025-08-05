export interface Point {
  x: number
  y: number
}

export interface Polygon {
  id: string
  points: Point[]
  label: string
  completed: boolean
  color: string
  labelPosition?: Point
}

export interface ImageData {
  id: string
  src: string
  width: number
  height: number
  name: string
}

export interface AppState {
  polygons: Polygon[]
  activePolygon: Polygon | null
  selectedPolygonId: string | null
  backgroundImage: ImageData | null
}
