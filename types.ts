export interface Coordinate {
  lat: number;
  lng: number;
}

export enum LayerType {
  POLYGON = 'POLYGON',
  MARKER = 'MARKER',
  HEATMAP = 'HEATMAP',
  POLYLINE = 'POLYLINE'
}

export interface MapFeature {
  type: LayerType;
  data: Coordinate | Coordinate[] | Coordinate[][]; // Coordinate (Marker), Coordinate[] (Polygon), Coordinate[][] (MultiPolygon or Polygon with holes)
}

export interface MapLayer {
  id: string;
  name: string;
  description: string;
  type: LayerType;
  visible: boolean;
  color: string;
  data?: Coordinate[] | Coordinate; // Kept for backward compatibility with initial layers
  features?: MapFeature[]; // New way to store multiple features
  details?: {
    title: string;
    content: string;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
}
