import { apiClient } from "./client";
import { AuditLogEntry } from "../types";

export const auditApi = {
  list: (params: {
    action?: string;
    user?: string;
    limit?: number;
  } = {}) => {
    const query = new URLSearchParams();
    if (params.action) query.append("action", params.action);
    if (params.user) query.append("user", params.user);
    if (params.limit) query.append("limit", params.limit.toString());
    return apiClient<AuditLogEntry[]>(`/audit?${query.toString()}`);
  },
};
