import { useQuery } from '@tanstack/react-query';
import { alertsApi } from '../api/alerts';
import { useAlertStore } from '../store/alertStore';
import { useEffect } from 'react';

export function useAlerts(status?: string, priority?: string) {
  const { addAlert } = useAlertStore();

  const query = useQuery({
    queryKey: ['alerts', status, priority],
    queryFn: () => alertsApi.list({ status, priority, limit: 50 }),
    refetchInterval: 10000,
  });

  useEffect(() => {
    if (query.data) {
      query.data.forEach((a) => addAlert(a));
    }
  }, [query.data, addAlert]);

  return query;
}
