import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, Polygon, MarkerF, InfoWindowF, Polyline } from '@react-google-maps/api';
import { MapLayer, LayerType, Coordinate } from '../types';
import { MAP_CENTER, ZOOM_LEVEL } from '../constants';

const containerStyle = {
    width: '100%',
    height: '100%',
    backgroundColor: '#0f172a'
};

interface GoogleMapsViewProps {
    layers: MapLayer[];
}

// Dark mode styles for Google Maps
const mapStyles = [
    { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
    { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
    {
        featureType: "administrative.locality",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi",
        elementType: "labels.text.fill",
        stylers: [{ color: "#d59563" }],
    },
    {
        featureType: "poi.park",
        elementType: "geometry",
        stylers: [{ color: "#263c3f" }],
    },
    {
        featureType: "poi.park",
        elementType: "labels.text.fill",
        stylers: [{ color: "#6b9a76" }],
    },
    {
        featureType: "road",
        elementType: "geometry",
        stylers: [{ color: "#38414e" }],
    },
    {
        featureType: "road",
        elementType: "geometry.stroke",
        stylers: [{ color: "#212a37" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry",
        stylers: [{ color: "#746855" }],
    },
    {
        featureType: "road.highway",
        elementType: "geometry.stroke",
        stylers: [{ color: "#1f2835" }],
    },
    {
        featureType: "water",
        elementType: "geometry",
        stylers: [{ color: "#17263c" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.fill",
        stylers: [{ color: "#515c6d" }],
    },
    {
        featureType: "water",
        elementType: "labels.text.stroke",
        stylers: [{ color: "#17263c" }],
    },
];

const libraries: ("places" | "geometry")[] = ['places', 'geometry'];

const GoogleMapsView: React.FC<GoogleMapsViewProps> = ({ layers }) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || (process.env.GOOGLE_MAPS_API_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY) || "";
    console.log("GOOGLE_MAPS_API_KEY:", apiKey ? "Present" : "Missing");

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: apiKey,
        libraries: libraries
    });

    const [selectedLayer, setSelectedLayer] = useState<MapLayer | null>(null);

    if (!isLoaded) {
        return (
            <div className="h-full w-full bg-slate-900 flex items-center justify-center text-slate-400 font-medium">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p>Carregando Google Maps...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full w-full z-0 relative">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={MAP_CENTER}
                zoom={ZOOM_LEVEL}
                options={{
                    styles: mapStyles,
                    disableDefaultUI: false,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    clickableIcons: false, // Adicionado para desativar POIs nativos
                }}
            >
                {layers.filter(l => l.visible).map((layer) => {
                    const renderFeature = (feature: any, index: number) => {
                        if (feature.type === LayerType.POLYGON) {
                            return (
                                <Polygon
                                    key={`${layer.id}-f-${index}`}
                                    paths={feature.data}
                                    options={{
                                        fillColor: layer.color,
                                        fillOpacity: 0.4,
                                        strokeColor: layer.color,
                                        strokeWeight: 2,
                                    }}
                                    onClick={() => setSelectedLayer(layer)}
                                />
                            );
                        } else if (feature.type === LayerType.POLYLINE) {
                            return (
                                <Polyline
                                    key={`${layer.id}-f-${index}`}
                                    path={feature.data}
                                    options={{
                                        strokeColor: layer.color,
                                        strokeWeight: 3,
                                    }}
                                    onClick={() => setSelectedLayer(layer)}
                                />
                            );
                        } else if (feature.type === LayerType.MARKER) {
                            return (
                                <MarkerF
                                    key={`${layer.id}-f-${index}`}
                                    position={feature.data as Coordinate}
                                    onClick={() => setSelectedLayer(layer)}
                                />
                            );
                        }
                        return null;
                    };

                    if (layer.features && layer.features.length > 0) {
                        return (
                            <React.Fragment key={layer.id}>
                                {layer.features.map((f, i) => renderFeature(f, i))}
                            </React.Fragment>
                        );
                    }

                    // Fallback to old 'data' property
                    if (layer.type === LayerType.POLYGON && layer.data) {
                        return (
                            <Polygon
                                key={layer.id}
                                paths={layer.data as Coordinate[]}
                                options={{
                                    fillColor: layer.color,
                                    fillOpacity: 0.4,
                                    strokeColor: layer.color,
                                    strokeWeight: 2,
                                }}
                                onClick={() => setSelectedLayer(layer)}
                            />
                        );
                    } else if (layer.type === LayerType.POLYLINE && layer.data) {
                        return (
                            <Polyline
                                key={layer.id}
                                path={layer.data as Coordinate[]}
                                options={{
                                    strokeColor: layer.color,
                                    strokeWeight: 3,
                                }}
                                onClick={() => setSelectedLayer(layer)}
                            />
                        );
                    } else if (layer.type === LayerType.MARKER && layer.data) {
                        return (
                            <MarkerF
                                key={layer.id}
                                position={layer.data as Coordinate}
                                onClick={() => setSelectedLayer(layer)}
                            />
                        );
                    }
                    return null;
                })}

                {selectedLayer && (
                    <InfoWindowF
                        position={
                            selectedLayer.type === LayerType.MARKER
                                ? ((selectedLayer.features?.[0]?.data || selectedLayer.data) as Coordinate)
                                : (((selectedLayer.features?.[0]?.data as any)?.[0] || (selectedLayer.data as Coordinate[])?.[0]) as Coordinate)
                        }
                        onCloseClick={() => setSelectedLayer(null)}
                        options={{
                            maxWidth: 280,
                        }}
                    >
                        <div className="p-2 min-w-[200px] text-slate-900 bg-white">
                            <h3 className="font-bold border-b border-slate-200 pb-2 mb-2 text-lg">
                                {selectedLayer.details?.title || selectedLayer.name}
                            </h3>
                            <p className="text-sm leading-relaxed text-slate-700">
                                {selectedLayer.details?.content || selectedLayer.description}
                            </p>
                        </div>
                    </InfoWindowF>
                )}
            </GoogleMap>
        </div>
    );
};

export default GoogleMapsView;
