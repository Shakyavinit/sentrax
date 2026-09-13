export const API_BASE_URL = 
  typeof window !== 'undefined'
    ? ''
    : (import.meta.env.VITE_API_URL || 'http://localhost:8002');

export const WS_BASE_URL = API_BASE_URL ? API_BASE_URL.replace(/^http/, 'ws') : ((typeof window !== 'undefined' && window.location.protocol === 'https:') ? `wss://${window.location.host}` : `ws://${window.location.host}`);

export const DEFAULT_MAP_CENTER: [number, number] = [23.1000, 72.6000]; // Ahmedabad-Gandhinagar centroid
export const DEFAULT_MAP_ZOOM = 12;
