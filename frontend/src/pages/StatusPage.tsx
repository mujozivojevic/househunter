import { useState, useEffect } from 'react';
import { statusApi, StatusResponse } from '../api/status';

export default function StatusPage() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStatus();
    const interval = setInterval(loadStatus, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadStatus = async () => {
    try {
      const data = await statusApi.get();
      setStatus(data);
    } catch (error) {
      console.error('Error loading status:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">System Status</h2>
        <p className="mt-2 text-sm text-gray-600">
          Monitor sync jobs and system statistics
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading status...</p>
        </div>
      ) : status ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Sync Status</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Apartment Offset</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(status.sync.apartmentOffset ?? 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">House Offset</p>
                <p className="text-2xl font-bold text-green-600">
                  {(status.sync.houseOffset ?? 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Backfill</p>
                <p className="text-lg text-gray-900">
                  {formatDate(status.sync.lastBackfillTime)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last New Listing Check</p>
                <p className="text-lg text-gray-900">
                  {formatDate(status.sync.lastNewListingCheckTime)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Real-time Notifications</p>
                <p className="text-lg font-semibold text-gray-900">
                  {status.sync.realTimeNotificationsEnabled ? (
                    <span className="text-green-600">Enabled</span>
                  ) : (
                    <span className="text-red-600">Disabled</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Statistics</h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Total Listings</p>
                <p className="text-2xl font-bold text-green-600">
                  {status.stats.totalListings.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-purple-600">
                  {status.stats.totalUsers.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Filters</p>
                <p className="text-2xl font-bold text-orange-600">
                  {status.stats.totalFilters.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 md:col-span-2">
            <h3 className="text-xl font-semibold mb-4 text-gray-900">Job Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border-l-4 border-blue-500 pl-4">
                <h4 className="font-semibold text-gray-900">Backfill Job</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Runs every 2 minutes
                </p>
                <p className="text-sm text-gray-600">
                  Fetches 50 listings and increments offset
                </p>
              </div>
              <div className="border-l-4 border-green-500 pl-4">
                <h4 className="font-semibold text-gray-900">New Listing Check</h4>
                <p className="text-sm text-gray-600 mt-1">
                  Runs every 5 minutes
                </p>
                <p className="text-sm text-gray-600">
                  Checks page 0 for new listings and sends alerts
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 md:col-span-2">
            <p className="text-sm text-gray-600">
              Last updated: {new Date(status.timestamp).toLocaleString()}
            </p>
            <button
              onClick={loadStatus}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600">Failed to load status</p>
        </div>
      )}
    </div>
  );
}

