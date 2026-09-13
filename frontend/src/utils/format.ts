import { format, parseISO } from 'date-fns';

export function formatPlate(raw: string): string {
  if (!raw) return '';
  return raw.replace(/\s/g, '').toUpperCase();
}

export function isIndianPlate(plate: string): boolean {
  return /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/.test(plate);
}

export function formatTimestamp(iso?: string): string {
  if (!iso) return 'N/A';
  try {
    return format(parseISO(iso), 'dd MMM yyyy HH:mm:ss');
  } catch {
    return iso;
  }
}

export function formatShortTime(iso?: string): string {
  if (!iso) return '';
  try {
    return format(parseISO(iso), 'HH:mm:ss');
  } catch {
    return iso;
  }
}

export function formatConfidence(conf?: number): string {
  if (conf === undefined || conf === null) return 'N/A';
  return `${(conf * 100).toFixed(1)}%`;
}

export function truncateHash(hash?: string): string {
  if (!hash) return 'N/A';
  if (hash.length <= 16) return hash;
  return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
}
