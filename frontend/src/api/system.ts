import { apiClient } from "./client";

export interface WorkerStatusItem {
  id: string;
  name: string;
  status: string;
  last_run: string | null;
  success_count: number;
  failure_count: number;
  last_error: string | null;
}

export interface BackgroundSystemStatus {
  status: string;
  timestamp: string;
  redis_connected: boolean;
  celery_workers_online: number;
  active_ai_camera_limit: number;
  active_ai_cameras_count: number;
  queues: Record<string, number>;
  workers: WorkerStatusItem[];
  recent_tasks: any[];
}

export const systemApi = {
  getBackgroundStatus: (): Promise<BackgroundSystemStatus> =>
    apiClient<BackgroundSystemStatus>("/system/background-status"),

  triggerWorker: (worker_id: string, params?: Record<string, any>) =>
    apiClient<{ dispatched: boolean; task_id: string; worker_id: string; message: string }>(
      "/system/trigger-worker",
      {
        method: "POST",
        body: JSON.stringify({ worker_id, params }),
      }
    ),
};
