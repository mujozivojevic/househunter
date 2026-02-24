import { logger } from '../utils/logger';

export interface LogEntry {
  id: string;
  timestamp: Date;
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
    newCount?: number;
    updatedCount?: number;
    page?: number;
    type?: string;
    priceChanges?: number;
    alreadyExisted?: number;
  };
}

class LogService {
  private logs: LogEntry[] = [];
  private maxLogs = 500; // Keep last 500 logs

  /**
   * Add a log entry
   */
  addLog(type: LogEntry['type'], message: string, details?: LogEntry['details']): void {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      message,
      details,
    };

    this.logs.unshift(entry); // Add to beginning
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs); // Keep only last maxLogs
    }

    // Also log to console
    logger.info(`[LOG] ${message}`, details);
  }

  /**
   * Get recent logs
   */
  getLogs(limit: number = 100): LogEntry[] {
    return this.logs.slice(0, limit);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    logger.info('Logs cleared');
  }

  /**
   * Get logs count
   */
  getLogCount(): number {
    return this.logs.length;
  }
}

export const logService = new LogService();

