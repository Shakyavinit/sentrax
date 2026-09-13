import { apiClient } from './client';
import { Alert } from '../types';

export const alertsApi = {
  list: (params: {
    status?: string;
    priority?: string;
    camera_id?: string;
    plate?: string;
    page?: number;
    limit?: number;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.status) query.append('status', params.status);
    if (params.priority) query.append('priority', params.priority);
    if (params.camera_id) query.append('camera_id', params.camera_id);
    if (params.plate) query.append('plate', params.plate);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    return apiClient<Alert[]>(`/alerts?${query.toString()}`);
  },
  get: (id: string) => apiClient<Alert>(`/alerts/${id}`),
  acknowledge: (id: string, notes?: string) =>
    apiClient<Alert>(`/alerts/${id}/acknowledge`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    }),
  dismiss: (id: string, notes?: string) =>
    apiClient<Alert>(`/alerts/${id}/dismiss`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    }),
};
