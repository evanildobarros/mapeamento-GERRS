import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import LeafletMap from './components/LeafletMap';
import { INITIAL_LAYERS } from './constants';
import { MapLayer } from './types';
import { Menu, X } from 'lucide-react';

const App: React.FC = () => {
  const [layers, setLayers] = useState<MapLayer[]>(INITIAL_LAYERS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleLayer = (id: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const handleAddLayer = (newLayer: MapLayer) => {
    setLayers(prev => [...prev, newLayer]);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950">
      
      {/* Mobile Sidebar Toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="bg-slate-800 p-2 rounded-md shadow-lg border border-slate-700 text-white"
        >
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar - Conditional rendering/transform for mobile */}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar layers={layers} toggleLayer={toggleLayer} onAddLayer={handleAddLayer} />
      </div>

      {/* Main Map Area */}
      <main className="flex-1 relative z-0">
        <LeafletMap layers={layers} />
        
        {/* Overlay Info (Bottom Right) */}
        <div className="absolute bottom-6 right-6 z-[400] bg-slate-900/80 backdrop-blur-md p-4 rounded-lg border border-slate-700 shadow-xl max-w-xs hidden md:block">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Status da Poligonal</h4>
          <div className="flex items-center gap-2 mb-1">
             <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-xs text-slate-200">Operações Normais</span>
          </div>
          <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
             <span className="text-xs text-slate-200">Monitoramento Ambiental Ativo</span>
          </div>
        </div>
      </main>

      {/* Mobile Overlay Backdrop */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;