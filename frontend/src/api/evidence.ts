import { apiClient } from './client';
import { Evidence, EvidenceVerifyResult, AuditLogEntry } from '../types';

export const evidenceApi = {
  list: (params: { case_id?: string; plate?: string; camera_id?: string; page?: number; limit?: number } = {}) => {
    const query = new URLSearchParams();
    if (params.case_id) query.append('case_id', params.case_id);
    if (params.plate) query.append('plate', params.plate);
    if (params.camera_id) query.append('camera_id', params.camera_id);
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    return apiClient<Evidence[]>(`/evidence?${query.toString()}`);
  },
  preserve: (sighting_id: string, alert_id?: string, case_id?: string) =>
    apiClient<Evidence>('/evidence/preserve', {
      method: 'POST',
      body: JSON.stringify({ sighting_id, alert_id, case_id }),
    }),
  get: (id: string) => apiClient<Evidence>(`/evidence/${id}`),
  verify: (id: string) => apiClient<EvidenceVerifyResult>(`/evidence/${id}/verify`),
  exportZip: async (id: string) => {
    return apiClient<Blob>(`/evidence/${id}/export`, {
      method: 'POST',
    });
  },
  getAudit: (id: string) => apiClient<AuditLogEntry[]>(`/evidence/${id}/audit`),
  bulkExport: (evidence_ids: string[], case_id = 'CASE_EXPORT') =>
    apiClient<Blob>('/evidence/bulk-export', {
      method: 'POST',
      body: JSON.stringify({ evidence_ids, case_id }),
    }),
};
