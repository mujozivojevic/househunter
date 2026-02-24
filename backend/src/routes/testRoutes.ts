import { Router } from 'express';
import axios from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /api/test/olx
 * Test OLX API endpoint with custom URL and params
 */
router.post('/olx', async (req, res) => {
  try {
    const { url, method = 'GET', body, params } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    logger.info(`Testing OLX API: ${method} ${url}`);

    const headers: any = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };

    // Add auth token if available
    if (config.olxAccessToken) {
      headers['Authorization'] = `Bearer ${config.olxAccessToken}`;
    }

    let response;
    const axiosConfig: any = {
      headers,
      timeout: 30000,
    };

    if (params) {
      axiosConfig.params = params;
    }

    if (method === 'GET') {
      response = await axios.get(url, axiosConfig);
    } else if (method === 'POST') {
      axiosConfig.data = body || {};
      response = await axios.post(url, body || {}, axiosConfig);
    } else {
      return res.status(400).json({ error: 'Method must be GET or POST' });
    }

    res.json({
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
    });
  } catch (error: any) {
    logger.error('Test OLX API error:', error.message);
    res.status(500).json({
      error: error.message,
      response: error.response?.data || null,
      status: error.response?.status || null,
    });
  }
});

export default router;

