import { apiClient } from './client';
import { Camera, VehicleSearchResponse } from '../types';

export const camerasApi = {
  list: () => apiClient<Camera[]>('/cameras'),
  get: (id: string) => apiClient<Camera>(`/cameras/${id}`),
  create: (data: Partial<Camera>) =>
    apiClient<Camera>('/cameras', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<Camera>) =>
    apiClient<Camera>(`/cameras/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  delete: (id: string) =>
    apiClient<{ message: string }>(`/cameras/${id}`, {
      method: 'DELETE',
    }),
  testStream: (id: string) =>
    apiClient<{ reachable: boolean; latency_ms: number; status: string; detail: string }>(
      `/cameras/${id}/test`,
      { method: 'POST' }
    ),
  getSightings: (id: string, limit = 50, offset = 0) =>
    apiClient<VehicleSearchResponse>(`/cameras/${id}/sightings?limit=${limit}&offset=${offset}`),
};
