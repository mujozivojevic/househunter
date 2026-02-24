import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

export const telegramApi = {
  test: async (telegramId: string, message?: string): Promise<any> => {
    const response = await axios.post(`${API_BASE}/telegram/test`, {
      telegramId,
      message,
    });
    return response.data;
  },

  testListing: async (telegramId: string): Promise<any> => {
    const response = await axios.post(`${API_BASE}/telegram/test-listing`, {
      telegramId,
    });
    return response.data;
  },

  getBotInfo: async (): Promise<any> => {
    const response = await axios.get(`${API_BASE}/telegram/bot-info`);
    return response.data;
  },
};

