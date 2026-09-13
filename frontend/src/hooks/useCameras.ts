import { useQuery } from '@tanstack/react-query';
import { camerasApi } from '../api/cameras';

export function useCameras() {
  return useQuery({
    queryKey: ['cameras'],
    queryFn: () => camerasApi.list(),
    refetchInterval: 15000,
  });
}
