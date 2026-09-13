import { apiClient } from './client';
import { VehicleSearchResponse, Sighting, VehicleJourney, VehicleDossier } from '../types';

export const vehiclesApi = {
  search: (params: {
    plate?: string;
    camera_id?: string;
    vehicle_class?: string;
    from?: string;
    to?: string;
    limit?: number;
    offset?: number;
  }) => {
    const query = new URLSearchParams();
    if (params.plate) query.append('plate', params.plate);
    if (params.camera_id) query.append('camera_id', params.camera_id);
    if (params.vehicle_class) query.append('vehicle_class', params.vehicle_class);
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.offset) query.append('offset', params.offset.toString());
    return apiClient<VehicleSearchResponse>(`/vehicles/search?${query.toString()}`);
  },
  getJourney: (plate: string, from?: string, to?: string) => {
    const query = new URLSearchParams();
    if (from) query.append('from', from);
    if (to) query.append('to', to);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return apiClient<VehicleJourney>(`/vehicles/journey/${encodeURIComponent(plate)}${qs}`);
  },
  getDossier: (plate: string) => apiClient<VehicleDossier>(`/vehicles/dossier/${encodeURIComponent(plate)}`),
  getSighting: (id: string) => apiClient<Sighting>(`/vehicles/sightings/${id}`),
};

