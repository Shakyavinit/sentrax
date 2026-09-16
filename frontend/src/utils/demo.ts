// Demo is an explicit mode, never a fallback for failed production authentication.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true' ||
  (typeof window !== 'undefined' && (
    window.location.hostname === 'shakyavinit.github.io' ||
    window.location.hostname.endsWith('.github.io') ||
    window.location.hostname.includes('surge.sh') ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.search.includes('demo=true') ||
    window.location.search.includes('demo=1') ||
    window.localStorage.getItem('sentrax-mode') === 'demo'
  ));
export const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\.\//, '').replace(/^\//, '')}`;

