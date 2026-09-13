import { apiClient } from './client';
import { WatchlistEntry, Alert } from '../types';

export const watchlistApi = {
  list: (activeOnly = false) =>
    apiClient<WatchlistEntry[]>(`/watchlist?active_only=${activeOnly}`),
  create: (data: Partial<WatchlistEntry>) =>
    apiClient<WatchlistEntry>('/watchlist', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<WatchlistEntry>) =>
    apiClient<WatchlistEntry>(`/watchlist/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiClient<{ message: string }>(`/watchlist/${id}`, {
      method: 'DELETE',
    }),
  getAlerts: (id: string) => apiClient<Alert[]>(`/watchlist/${id}/alerts`),
};
