import { apiClient } from './client';
import {
  SummaryAnalytics,
  ActivityDataPoint,
  TopPlateRecord,
  CameraHeatmapData,
  ConfidenceBucket,
} from '../types';

export const analyticsApi = {
  getSummary: () => apiClient<SummaryAnalytics>('/analytics/summary'),
  getActivity: (period: '24h' | '7d' | '30d' = '24h') =>
    apiClient<ActivityDataPoint[]>(`/analytics/activity?period=${period}`),
  getTopPlates: () => apiClient<TopPlateRecord[]>('/analytics/top-plates'),
  getHeatmap: () => apiClient<CameraHeatmapData[]>('/analytics/camera-heatmap'),
  getConfidenceDistribution: () =>
    apiClient<ConfidenceBucket[]>('/analytics/confidence-distribution'),
};
