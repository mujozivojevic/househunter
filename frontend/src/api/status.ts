import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

export interface SyncStatus {
  apartmentOffset: number;
  houseOffset: number;
  lastBackfillTime: string | null;
  lastNewListingCheckTime: string | null;
  notificationStartTime: string | null;
  realTimeNotificationsEnabled: boolean;
}

export interface StatusResponse {
  sync: SyncStatus;
  stats: {
    totalListings: number;
    totalUsers: number;
    totalFilters: number;
  };
  timestamp: string;
}

export const statusApi = {
  get: async (): Promise<StatusResponse> => {
    const response = await axios.get(`${API_BASE}/status`);
    return response.data;
  },
};

