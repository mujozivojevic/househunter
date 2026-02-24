import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

export interface TestOLXRequest {
  url: string;
  method?: 'GET' | 'POST';
  params?: any;
  body?: any;
}

export const testApi = {
  testOLX: async (request: TestOLXRequest): Promise<any> => {
    const response = await axios.post(`${API_BASE}/test/olx`, request);
    return response.data;
  },
};

