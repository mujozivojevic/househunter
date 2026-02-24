const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface LogEntry {
  id: string;
  timestamp: string;
  type: 'fetch' | 'notification' | 'error' | 'info';
  message: string;
  details?: {
    fetchedCount?: number;
    totalInDb?: number;
    alertedUsers?: number;
    apartments?: Array<{
      id: string;
      title: string;
      ageMinutes?: number;
      price?: number;
    }>;
    error?: string;
  };
}

export interface LogsResponse {
  logs: LogEntry[];
}

export async function getLogs(limit: number = 100): Promise<LogsResponse> {
  const response = await fetch(`${API_URL}/api/logs?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch logs');
  }
  return response.json();
}

export async function clearLogs(): Promise<void> {
  const response = await fetch(`${API_URL}/api/logs`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to clear logs');
  }
}

