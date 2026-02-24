import { useEffect, useState } from 'react';
import { getLogs, clearLogs, LogEntry } from '../api/logs';

function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getLogs(200);
      setLogs(response.logs);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch logs');
    } finally {
      setLoading(false);
    }
  };

  const handleClearLogs = async () => {
    if (!confirm('Are you sure you want to clear all logs?')) {
      return;
    }
    try {
      await clearLogs();
      setLogs([]);
    } catch (err: any) {
      setError(err.message || 'Failed to clear logs');
    }
  };

  useEffect(() => {
    fetchLogs();
    // Refresh logs every 5 seconds
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const getLogTypeColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'fetch':
        return 'bg-blue-100 text-blue-800';
      case 'notification':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Activity Logs</h1>
        <div className="flex gap-2">
          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Refresh
          </button>
          <button
            onClick={handleClearLogs}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Clear Logs
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
          {error}
        </div>
      )}

      {loading && logs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">Loading logs...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">No logs yet</div>
      ) : (
        <div className="space-y-4">
          {logs.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${getLogTypeColor(
                        log.type
                      )}`}
                    >
                      {log.type.toUpperCase()}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatTimestamp(log.timestamp)}
                    </span>
                  </div>
                  <p className="text-gray-900 font-medium">{log.message}</p>

                  {log.details && (
                    <div className="mt-3 space-y-2">
                      {log.details.fetchedCount !== undefined && (
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold">Fetched:</span>{' '}
                          {log.details.fetchedCount} apartments
                        </div>
                      )}
                      {log.details.totalInDb !== undefined && (
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold">Total in DB:</span>{' '}
                          {log.details.totalInDb}
                        </div>
                      )}
                      {log.details.alertedUsers !== undefined && (
                        <div className="text-sm text-gray-600">
                          <span className="font-semibold">Users alerted:</span>{' '}
                          {log.details.alertedUsers}
                        </div>
                      )}
                      {log.details.apartments && log.details.apartments.length > 0 && (
                        <div className="mt-2">
                          <div className="text-sm font-semibold text-gray-700 mb-1">
                            Apartments:
                          </div>
                          <ul className="list-disc list-inside space-y-1 ml-4">
                            {log.details.apartments.map((apt, idx) => (
                              <li key={apt.id} className="text-sm text-gray-600">
                                <span className="font-medium">ap {idx + 1}</span> -{' '}
                                {apt.ageMinutes !== undefined
                                  ? `${apt.ageMinutes} minute old ad`
                                  : 'new ad'}{' '}
                                - {apt.title}
                                {apt.price && (
                                  <span className="text-gray-500">
                                    {' '}
                                    - {apt.price.toLocaleString()} KM
                                  </span>
                                )}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {log.details.error && (
                        <div className="text-sm text-red-600">
                          <span className="font-semibold">Error:</span> {log.details.error}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LogsPage;

