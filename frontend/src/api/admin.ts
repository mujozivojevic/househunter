import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

export interface LoginResponse {
  success: boolean;
  message: string;
  username: string;
}

export interface AuthCheckResponse {
  authenticated: boolean;
  username: string | null;
}

export const adminApi = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await axios.post(`${API_BASE}/admin/login`, {
      username,
      password,
    }, {
      withCredentials: true, // Important for sessions
    });
    return response.data;
  },

  logout: async (): Promise<void> => {
    await axios.post(`${API_BASE}/admin/logout`, {}, {
      withCredentials: true,
    });
  },

  check: async (): Promise<AuthCheckResponse> => {
    const response = await axios.get(`${API_BASE}/admin/check`, {
      withCredentials: true,
    });
    return response.data;
  },

  getMe: async (): Promise<AuthCheckResponse> => {
    const response = await axios.get(`${API_BASE}/admin/me`, {
      withCredentials: true,
    });
    return response.data;
  },
};

