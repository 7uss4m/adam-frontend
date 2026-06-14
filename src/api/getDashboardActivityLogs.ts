import axios from "axios";

export type DashboardActivityLog = {
  id: string;
  adminId?: string | null;
  adminEmail?: string | null;
  adminName?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  description: string;
  metadata?: Record<string, unknown> | null;
  ip?: string | null;
  userAgent?: string | null;
  created_at: string;
};

export type DashboardActivityLogsResult = {
  logs: DashboardActivityLog[];
  total: number;
  totalPages: number;
  page: number;
  retentionDays: number;
};

export default function getDashboardActivityLogs(
  token: string,
  params: {
    page?: string;
    search?: string;
    action?: string;
    resource?: string;
    dateFrom?: string;
    dateTo?: string;
  }
) {
  const apiUrl = `${import.meta.env.VITE_API_URL}activity-logs`;
  return axios.get<{ result: DashboardActivityLogsResult }>(apiUrl, {
    params,
    headers: {
      "x-api-key": import.meta.env.VITE_API_KEY,
      Authorization: `Bearer ${token}`,
    },
  });
}
