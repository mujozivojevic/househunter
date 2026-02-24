import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

export interface Listing {
  id: string;
  title: string;
  description?: string;
  price: number;
  url: string;
  location?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  lastSeen: string;
}

export interface ListingsResponse {
  listings: Listing[];
  total: number;
  page: number;
  limit: number;
}

export const listingsApi = {
  getAll: async (page: number = 0, limit: number = 50): Promise<ListingsResponse> => {
    const response = await axios.get(`${API_BASE}/listings`, {
      params: { page, limit },
    });
    return response.data;
  },

  getById: async (id: string): Promise<Listing> => {
    const response = await axios.get(`${API_BASE}/listings/${id}`);
    return response.data;
  },
};

