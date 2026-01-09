import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapLayer, LayerType, Coordinate } from '../types';
import { MAP_CENTER, ZOOM_LEVEL } from '../constants';

// Define marker icons using direct CDN URLs to avoid module resolution issues
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LeafletMapProps {
  layers: MapLayer[];
}

const MapController: React.FC<{ center: Coordinate }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo([center.lat, center.lng], map.getZoom());
  }, [center, map]);
  return null;
};

const LeafletMap: React.FC<LeafletMapProps> = ({ layers }) => {
  return (
    <div className="h-full w-full z-0 relative">
      <MapContainer 
        center={[MAP_CENTER.lat, MAP_CENTER.lng]} 
        zoom={ZOOM_LEVEL} 
        style={{ height: '100%', width: '100%' }}
        className="bg-slate-900"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {layers.filter(l => l.visible).map((layer) => {
          if (layer.type === LayerType.POLYGON) {
            const positions = (layer.data as Coordinate[]).map(c => [c.lat, c.lng] as [number, number]);
            return (
              <Polygon 
                key={layer.id} 
                positions={positions} 
                pathOptions={{ color: layer.color, fillColor: layer.color, fillOpacity: 0.4, weight: 2 }}
              >
                <Popup className="custom-popup">
                  <div className="p-1">
                    <h3 className="font-bold text-gray-900">{layer.details?.title || layer.name}</h3>
                    <p className="text-gray-700 text-sm mt-1">{layer.details?.content || layer.description}</p>
                  </div>
                </Popup>
              </Polygon>
            );
          } else if (layer.type === LayerType.MARKER) {
             const pos = layer.data as Coordinate;
             return (
               <Marker key={layer.id} position={[pos.lat, pos.lng]}>
                 <Popup className="custom-popup">
                  <div className="p-1">
                    <h3 className="font-bold text-gray-900">{layer.details?.title || layer.name}</h3>
                    <p className="text-gray-700 text-sm mt-1">{layer.details?.content || layer.description}</p>
                  </div>
                 </Popup>
               </Marker>
             )
          }
          return null;
        })}
        <MapController center={MAP_CENTER} />
      </MapContainer>
    </div>
  );
};

export default LeafletMap;