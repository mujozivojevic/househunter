import { Router } from 'express';
import { logger } from '../utils/logger';
import { config } from '../config/env';
import axios from 'axios';

const router = Router();

/**
 * POST /api/auth/login
 * Login with OLX credentials and fetch access token
 * 
 * OLX API uses OAuth 2.0. You can either:
 * 1. Use username/password (Resource Owner Password Credentials grant)
 * 2. Use Client ID/Client Secret (Client Credentials grant)
 * 
 * This endpoint tries both methods to get an access token
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password, clientId, clientSecret } = req.body;

    // Allow either username/password OR clientId/clientSecret
    if ((!username || !password) && (!clientId || !clientSecret)) {
      return res.status(400).json({ 
        error: 'Either username/password OR clientId/clientSecret are required',
        hint: 'For OLX API, you typically need Client ID and Client Secret from https://developer.olx.ba/'
      });
    }

    logger.info(`Login attempt - username: ${username || 'N/A'}, clientId: ${clientId || 'N/A'}`);

    let accessToken = null;
    let tokenResponse: any = null;
    
    try {
      // OLX API OAuth 2.0 token endpoint
      // Based on documentation: https://api-documentation.olx.ba/
      const tokenEndpoint = `${config.olxApiBaseUrl}/oauth/token`;
      
      // Use Client Credentials grant (recommended for server-to-server)
      // Or Resource Owner Password Credentials if username/password provided
      const useClientId = clientId || config.olxClientId;
      const useClientSecret = clientSecret || config.olxClientSecret;
      
      if (useClientId && useClientSecret) {
        logger.info('Attempting OAuth 2.0 Client Credentials grant...');
        
        try {
          // Client Credentials grant (for server-to-server)
          tokenResponse = await axios.post(
            tokenEndpoint,
            new URLSearchParams({
              grant_type: 'client_credentials',
              client_id: useClientId,
              client_secret: useClientSecret,
            }),
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
              },
              timeout: 15000,
            }
          );

          accessToken = tokenResponse.data?.access_token;
          logger.info('Client Credentials grant successful');
        } catch (clientError: any) {
          logger.warn(`Client Credentials grant failed: ${clientError.response?.status} - ${clientError.message}`);
          if (clientError.response?.data) {
            logger.info('Error response:', JSON.stringify(clientError.response.data, null, 2));
          }
        }
      }

      // If Client Credentials didn't work and we have username/password, try Resource Owner Password Credentials
      if (!accessToken && username && password && useClientId && useClientSecret) {
        logger.info('Attempting OAuth 2.0 Resource Owner Password Credentials grant...');
        
        try {
          tokenResponse = await axios.post(
            tokenEndpoint,
            new URLSearchParams({
              grant_type: 'password',
              username: username,
              password: password,
              client_id: useClientId,
              client_secret: useClientSecret,
            }),
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': 'application/json',
              },
              timeout: 15000,
            }
          );

          accessToken = tokenResponse.data?.access_token;
          logger.info('Password grant successful');
        } catch (passwordError: any) {
          logger.warn(`Password grant failed: ${passwordError.response?.status} - ${passwordError.message}`);
          if (passwordError.response?.data) {
            logger.info('Error response:', JSON.stringify(passwordError.response.data, null, 2));
          }
        }
      }

      // If we got a token, verify it works by calling /me endpoint
      if (accessToken) {
        try {
          const verifyResponse = await axios.get(`${config.olxApiBaseUrl}/me`, {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/json',
            },
            timeout: 10000,
          });
          logger.info('Token verified successfully with /me endpoint');
          logger.info('User info:', JSON.stringify(verifyResponse.data, null, 2));
        } catch (verifyError: any) {
          logger.warn(`Token verification failed: ${verifyError.message}`);
          // Token might still be valid, just log the warning
        }
      }

      // Log full response for debugging
      if (tokenResponse) {
        logger.info('Full token response:', JSON.stringify(tokenResponse.data, null, 2));
      }

      if (!accessToken) {
        return res.status(401).json({ 
          error: 'Failed to obtain access token from OLX API',
          hint: 'Make sure you have registered your app at https://developer.olx.ba/ and have valid Client ID and Client Secret',
          details: tokenResponse?.data || 'No token response received'
        });
      }
      
      logger.info('Access token obtained successfully');
    } catch (error: any) {
      logger.error('Error during OLX authentication:', error.message);
      
      if (error.response) {
        logger.error('Error status:', error.response.status);
        logger.error('Error data:', JSON.stringify(error.response.data, null, 2));
        logger.error('Error headers:', JSON.stringify(error.response.headers, null, 2));
      }
      
      return res.status(401).json({ 
        error: 'Authentication failed with OLX API',
        details: error.response?.data || error.message,
        hint: 'Check server logs for full error details. Make sure you have valid credentials from https://developer.olx.ba/'
      });
    }

    // Return the access token (it will be logged in console by frontend)
    res.json({
      message: 'Login successful - OLX API access token obtained',
      apiKey: accessToken, // This is the Bearer token for OLX API
      token: accessToken, // Same token
      tokenType: tokenResponse?.data?.token_type || 'Bearer',
      expiresIn: tokenResponse?.data?.expires_in || null,
      hint: 'Add this to your .env file as OLX_ACCESS_TOKEN or use it in Authorization header as: Bearer ' + accessToken
    });
  } catch (error: any) {
    logger.error('Login error:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

