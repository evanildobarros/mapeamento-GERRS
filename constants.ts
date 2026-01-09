import { LayerType, MapLayer } from './types';

export const MAP_CENTER = { lat: -2.570, lng: -44.370 }; // Adjusted closer to terminal operations
export const ZOOM_LEVEL = 14;

export const INITIAL_LAYERS: MapLayer[] = [
  {
    id: 'layer-poligonal',
    name: 'Poligonal do Porto (Oficial)',
    description: 'Área delimitada oficial do Porto do Itaqui.',
    type: LayerType.POLYGON,
    visible: true,
    color: '#ef4444', // Red-500
    data: [
      { lat: -2.550, lng: -44.380 },
      { lat: -2.555, lng: -44.360 },
      { lat: -2.580, lng: -44.355 },
      { lat: -2.590, lng: -44.370 },
      { lat: -2.580, lng: -44.390 },
      { lat: -2.550, lng: -44.380 },
    ],
    details: {
      title: "Poligonal Oficial",
      content: "Limite administrativo e operacional da EMAP (Empresa Maranhense de Administração Portuária)."
    }
  },
  {
    id: 'layer-mangue',
    name: 'Zona de Amortecimento (Manguezal)',
    description: 'Áreas de preservação ambiental no entorno.',
    type: LayerType.POLYGON,
    visible: true,
    color: '#22c55e', // Green-500
    data: [
      { lat: -2.590, lng: -44.370 },
      { lat: -2.600, lng: -44.360 },
      { lat: -2.610, lng: -44.380 },
      { lat: -2.600, lng: -44.395 },
      { lat: -2.590, lng: -44.370 },
    ],
    details: {
      title: "Área de Preservação",
      content: "Ecossistema de manguezal vital para a biodiversidade local e proteção da linha costeira."
    }
  },
  {
    id: 'layer-community',
    name: 'Comunidade Vila Maranhão',
    description: 'Área residencial próxima à zona portuária.',
    type: LayerType.POLYGON,
    visible: true,
    color: '#eab308', // Yellow-500
    data: [
      { lat: -2.580, lng: -44.355 },
      { lat: -2.585, lng: -44.340 },
      { lat: -2.595, lng: -44.345 },
      { lat: -2.590, lng: -44.360 },
    ],
    details: {
      title: "Vila Maranhão",
      content: "Comunidade histórica impactada pela logística portuária. Foco de projetos de responsabilidade social."
    }
  },
  {
    id: 'layer-marker-main',
    name: 'Sede Administrativa EMAP',
    description: 'Centro de controle do porto.',
    type: LayerType.MARKER,
    visible: true,
    color: '#3b82f6', // Blue-500
    data: { lat: -2.570, lng: -44.370 },
    details: {
      title: "Sede EMAP",
      content: "Centro administrativo e operacional do Porto do Itaqui."
    }
  },
  {
    id: 'layer-access',
    name: 'Acesso Ferroviário',
    description: 'Linha férrea de transporte de minério e grãos.',
    type: LayerType.POLYGON,
    visible: false,
    color: '#a855f7', // Purple-500
    data: [
      { lat: -2.585, lng: -44.340 },
      { lat: -2.580, lng: -44.330 },
      { lat: -2.575, lng: -44.335 },
      { lat: -2.580, lng: -44.345 },
    ],
    details: {
      title: "Ramal Ferroviário",
      content: "Conexão crítica para exportação de commodities."
    }
  }
];

export const SYSTEM_INSTRUCTION = `
Você é um assistente especialista em geografia socioeconômica e portuária, focado especificamente no complexo do Porto do Itaqui e suas comunidades vizinhas (como Vila Maranhão).
Seu objetivo é fornecer análises sobre:
1. A Poligonal do Porto: Limites, operações e gestão da EMAP.
2. Relação Porto-Comunidade: Impactos na Vila Maranhão, projetos sociais, emprego e renda.
3. Questões Ambientais: Preservação dos manguezais, monitoramento de qualidade do ar e água.
4. Logística: Importância do corredor de exportação (ferrovia e rodovia).

Ao responder, use tom profissional, educativo e focado em desenvolvimento sustentável.
`;