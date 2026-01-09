export interface Coordinate {
  lat: number;
  lng: number;
}

export enum LayerType {
  POLYGON = 'POLYGON',
  MARKER = 'MARKER',
  HEATMAP = 'HEATMAP'
}

export interface MapLayer {
  id: string;
  name: string;
  description: string;
  type: LayerType;
  visible: boolean;
  color: string;
  data: Coordinate[] | Coordinate; // Polygon points or Marker position
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
