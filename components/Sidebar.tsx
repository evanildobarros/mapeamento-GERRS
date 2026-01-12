import React, { useState } from 'react';
import { MapLayer, LayerType, Coordinate, MapFeature } from '../types';
import { Layers, Eye, EyeOff, Upload, FileUp, Database, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import * as toGeoJSON from '@mapbox/togeojson';
import shp from 'shpjs';

interface SidebarProps {
  layers: MapLayer[];
  toggleLayer: (id: string) => void;
  onAddLayer: (layer: MapLayer) => void;
  onRemoveLayer: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ layers, toggleLayer, onAddLayer, onRemoveLayer }) => {
  const [activeTab, setActiveTab] = useState<'layers' | 'upload'>('layers');

  // Upload State
  const [file, setFile] = useState<File | null>(null);
  const [layerName, setLayerName] = useState('');
  const [layerDescription, setLayerDescription] = useState('');
  const [layerColor, setLayerColor] = useState('#3b82f6');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatusMessage(null);
      // Auto-fill name if empty
      if (!layerName) {
        setLayerName(e.target.files[0].name.split('.')[0]);
      }
    }
  };

  const processGeoJSON = (geojson: any): MapFeature[] => {
    // shpjs can return an array of FeatureCollections if multiple .shp files are in the zip
    const collections = Array.isArray(geojson) ? geojson : [geojson];
    const results: MapFeature[] = [];

    collections.forEach(collection => {
      const features = collection.features || (collection.type === 'Feature' ? [collection] : []);

      features.forEach((feature: any) => {
        if (!feature.geometry) return;

        if (feature.geometry.type === 'Polygon') {
          // GeoJSON coords are [lng, lat], Google Maps wants {lat, lng}
          // We take all rings (outer + holes)
          const paths = feature.geometry.coordinates.map((ring: any[]) =>
            ring.map((c: any[]) => ({ lat: c[1], lng: c[0] }))
          );
          results.push({ type: LayerType.POLYGON, data: paths });
        } else if (feature.geometry.type === 'MultiPolygon') {
          feature.geometry.coordinates.forEach((polygon: any[][]) => {
            const paths = polygon.map((ring: any[]) =>
              ring.map((c: any[]) => ({ lat: c[1], lng: c[0] }))
            );
            results.push({ type: LayerType.POLYGON, data: paths });
          });
        } else if (feature.geometry.type === 'Point') {
          results.push({
            type: LayerType.MARKER,
            data: { lat: feature.geometry.coordinates[1], lng: feature.geometry.coordinates[0] }
          });
        } else if (feature.geometry.type === 'LineString') {
          const path = feature.geometry.coordinates.map((c: any[]) => ({ lat: c[1], lng: c[0] }));
          results.push({ type: LayerType.POLYLINE, data: path });
        }
      });
    });

    return results;
  };

  const handleUpload = async () => {
    if (!file || !layerName) {
      setStatusMessage({ type: 'error', text: 'Selecione um arquivo e dê um nome para a camada.' });
      return;
    }

    setIsProcessing(true);
    setStatusMessage(null);

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();
      let foundFeatures: MapFeature[] = [];

      if (extension === 'kml') {
        const text = await file.text();
        const parser = new DOMParser();
        const kmlDoc = parser.parseFromString(text, 'text/xml');
        const geojson = toGeoJSON.kml(kmlDoc);
        foundFeatures = processGeoJSON(geojson);
      } else if (extension === 'zip') {
        const arrayBuffer = await file.arrayBuffer();
        const geojson = await shp(arrayBuffer);
        foundFeatures = processGeoJSON(geojson);
      } else if (extension === 'json' || extension === 'geojson') {
        const text = await file.text();
        const geojson = JSON.parse(text);
        foundFeatures = processGeoJSON(geojson);
      } else {
        throw new Error("Para Shapefiles, por favor envie um arquivo .zip contendo .shp e .dbf. Suportamos também .kml e .geojson");
      }

      if (foundFeatures && foundFeatures.length > 0) {
        const primaryType = foundFeatures[0].type;

        const newLayer: MapLayer = {
          id: `custom-${Date.now()}`,
          name: layerName,
          description: layerDescription || 'Camada importada pelo usuário',
          type: primaryType,
          visible: true,
          color: layerColor,
          features: foundFeatures,
          details: {
            title: layerName,
            content: `Importado de ${file.name} (${foundFeatures.length} vetores)`
          }
        };

        onAddLayer(newLayer);
        setStatusMessage({ type: 'success', text: `Camada adicionada com ${foundFeatures.length} vetores!` });
        setFile(null);
        setLayerName('');
        setLayerDescription('');
        // Switch back to layers tab after short delay
        setTimeout(() => setActiveTab('layers'), 1500);
      } else {
        throw new Error("Nenhuma geometria válida encontrada no arquivo.");
      }

    } catch (error: any) {
      console.error(error);
      setStatusMessage({ type: 'error', text: error.message || 'Erro ao processar arquivo.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-700 w-full md:w-96 shadow-2xl z-20">
      {/* Header */}
      <div className="p-5 border-b border-slate-700 bg-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <Database className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-white">Gerenciador de Dados</h1>
            <p className="text-xs text-slate-400">Porto do Itaqui</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700 bg-slate-900">
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'layers'
            ? 'text-blue-400 border-b-2 border-blue-400 bg-slate-800/50'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
        >
          <Layers size={16} />
          Camadas
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${activeTab === 'upload'
            ? 'text-green-400 border-b-2 border-green-400 bg-slate-800/50'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
            }`}
        >
          <Upload size={16} />
          Importar
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {activeTab === 'layers' ? (
          <div className="h-full overflow-y-auto p-4 space-y-4">
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                <Layers size={16} /> Camadas Ativas
              </h3>
              <div className="space-y-3">
                {layers.map((layer) => (
                  <div
                    key={layer.id}
                    className={`flex items-start justify-between p-3 rounded-md transition-all border ${layer.visible
                      ? 'bg-slate-800 border-slate-600'
                      : 'bg-slate-900/50 border-slate-800 opacity-70'
                      }`}
                  >
                    <div className="flex-1 mr-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="w-3 h-3 rounded-full shadow-sm"
                          style={{ backgroundColor: layer.color }}
                        />
                        <span className="font-medium text-sm text-slate-200">{layer.name}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{layer.description}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => toggleLayer(layer.id)}
                        className={`p-2 rounded-full transition-colors ${layer.visible
                          ? 'text-blue-400 bg-blue-400/10 hover:bg-blue-400/20'
                          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700'
                          }`}
                        title={layer.visible ? "Ocultar camada" : "Mostrar camada"}
                      >
                        {layer.visible ? <Eye size={18} /> : <EyeOff size={18} />}
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Tem certeza que deseja excluir a camada "${layer.name}"?`)) {
                            onRemoveLayer(layer.id);
                          }
                        }}
                        className="p-2 rounded-full text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                        title="Excluir camada"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full overflow-y-auto p-4 space-y-6">
            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
              <h3 className="text-sm font-bold text-slate-200 mb-4 flex items-center gap-2">
                <FileUp size={18} className="text-green-400" /> Novo Upload
              </h3>

              {/* File Input */}
              <div className="mb-4">
                <label className="block text-xs font-medium text-slate-400 mb-1">Arquivo (.kml, .zip, .json)</label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".kml,.zip,.json,.geojson"
                    onChange={handleFileChange}
                    className="w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-slate-700 file:text-blue-400 hover:file:bg-slate-600 cursor-pointer border border-slate-600 rounded-lg bg-slate-900"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Para Shapefiles (.shp, .dbf), envie um arquivo .zip contendo ambos.
                  </p>
                </div>
              </div>

              {/* Layer Config */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Nome da Camada</label>
                  <input
                    type="text"
                    value={layerName}
                    onChange={(e) => setLayerName(e.target.value)}
                    placeholder="Ex: Área de Expansão"
                    className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Descrição</label>
                  <input
                    type="text"
                    value={layerDescription}
                    onChange={(e) => setLayerDescription(e.target.value)}
                    placeholder="Opcional"
                    className="w-full bg-slate-900 border border-slate-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Cor de Exibição</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={layerColor}
                      onChange={(e) => setLayerColor(e.target.value)}
                      className="h-8 w-12 bg-transparent border-0 cursor-pointer rounded"
                    />
                    <span className="text-xs text-slate-500 font-mono">{layerColor}</span>
                  </div>
                </div>
              </div>

              {/* Status & Action */}
              <div className="mt-6">
                {statusMessage && (
                  <div className={`mb-4 p-3 rounded-md text-xs flex items-center gap-2 ${statusMessage.type === 'error' ? 'bg-red-900/30 text-red-200 border border-red-800' : 'bg-green-900/30 text-green-200 border border-green-800'
                    }`}>
                    {statusMessage.type === 'error' ? <AlertCircle size={14} /> : <CheckCircle size={14} />}
                    {statusMessage.text}
                  </div>
                )}

                <button
                  onClick={handleUpload}
                  disabled={isProcessing || !file || !layerName}
                  className={`w-full py-2 px-4 rounded-md font-semibold text-sm transition-all flex items-center justify-center gap-2 ${isProcessing || !file || !layerName
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'
                    }`}
                >
                  {isProcessing ? 'Processando...' : 'Adicionar Camada'}
                </button>
              </div>
            </div>

            <div className="bg-slate-800/30 p-3 rounded-lg border border-slate-700/50">
              <h4 className="text-xs font-bold text-slate-400 mb-1">Formatos Suportados</h4>
              <ul className="text-[10px] text-slate-500 list-disc list-inside space-y-1">
                <li><span className="text-slate-300 font-mono">.kml</span> (Keyhole Markup Language)</li>
                <li><span className="text-slate-300 font-mono">.zip</span> (Contendo .shp, .shx, .dbf)</li>
                <li><span className="text-slate-300 font-mono">.geojson / .json</span></li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;