import { API_BASE_URL } from '../utils/constants';
import { DEMO_MODE } from '../utils/demo';
import { demoRequest } from './demoClient';

export async function apiClient<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (DEMO_MODE) return demoRequest(endpoint, options) as Promise<T>;
  const token = localStorage.getItem('sentrax_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('sentrax_token');
    localStorage.removeItem('sentrax_user');
    if (!window.location.pathname.includes('/login')) {
      window.location.href = `${import.meta.env.BASE_URL}login`;
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    let errorDetail = 'Network request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch {
      errorDetail = response.statusText;
    }
    throw new Error(errorDetail);
  }

  // Handle blob responses (e.g., ZIP file download)
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/zip')) {
    return (await response.blob()) as unknown as T;
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}
