import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

export interface UserFilter {
  id: number;
  userId: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  type?: string;
  createdAt: string;
}

export interface CreateFilterInput {
  userId: number;
  minPrice?: number;
  maxPrice?: number;
  location?: string;
  type?: string;
}

export const filtersApi = {
  create: async (input: CreateFilterInput): Promise<UserFilter> => {
    const response = await axios.post(`${API_BASE}/filters/create`, input);
    return response.data.filter;
  },

  getByUserId: async (userId: number): Promise<UserFilter[]> => {
    const response = await axios.get(`${API_BASE}/filters/user/${userId}`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`${API_BASE}/filters/${id}`);
  },
};

