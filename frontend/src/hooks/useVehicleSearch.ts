import { useQuery } from '@tanstack/react-query';
import { vehiclesApi } from '../api/vehicles';

export function useVehicleSearch(plate?: string, from?: string, to?: string, limit = 50) {
  return useQuery({
    queryKey: ['vehicleSearch', plate, from, to, limit],
    queryFn: () => vehiclesApi.search({ plate, from, to, limit }),
    enabled: !!plate,
  });
}
