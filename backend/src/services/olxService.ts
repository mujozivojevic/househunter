import axios from 'axios';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export interface OLXListing {
  id: string;
  title: string;
  description?: string;
  price: number;
  url: string;
  location?: string;
  images?: string[];
  type?: 'apartment' | 'house'; // Type of listing
}

export interface OLXApiResponse {
  data: OLXListing[];
  total: number;
  page: number;
  limit: number;
  per_page: number;
  last_page?: number;
  current_page?: number;
}

export class OLXService {
  private baseUrl: string;
  private accessToken: string | null = null;

  constructor() {
    this.baseUrl = config.olxApiBaseUrl;
    // Get access token from config
    this.accessToken = config.olxAccessToken || null;
  }

  /**
   * Set the access token for API requests
   */
  setAccessToken(token: string) {
    this.accessToken = token;
  }

  /**
   * Get authorization headers
   */
  private getAuthHeaders() {
    const headers: any = {
      'Accept': 'application/json',
    };
    
    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }
    
    return headers;
  }

  /**
   * Transform raw OLX API listing to our OLXListing interface
   */
  private transformListing(item: any, type?: 'apartment' | 'house'): OLXListing {
    // Ensure ID is always a string (OLX API returns numbers)
    const listingId = String(item.id || '');
    
    // Handle location - OLX API returns object with lat/lon
    let locationString: string | null = null;
    if (item.location && typeof item.location === 'object') {
      // Format as coordinates since we don't have city name
      if (item.location.lat && item.location.lon) {
        locationString = `${item.location.lat.toFixed(6)},${item.location.lon.toFixed(6)}`;
      }
    }
    
    // Construct URL - OLX listing URLs follow pattern: https://olx.ba/artikal/{id}
    const listingUrl = item.url || `https://olx.ba/artikal/${listingId}`;
    
    return {
      id: listingId,
      title: item.title || 'No title',
      description: item.description || undefined,
      price: item.price || item.discounted_price_float || 0,
      url: listingUrl,
      location: locationString || undefined,
      images: item.images || [],
      ...(type && { type }), // Include type if provided
    };
  }

  /**
   * Get request parameters based on listing type
   */
  private getParamsByType(type: 'apartment' | 'house', page: number, limit: number): any {
    const baseParams = {
      page: page + 1, // OLX API uses 1-based pagination
      per_page: limit,
      attr_encoded: '1',
      canton: 9, // Kanton Sarajevo
      created_get: "-24 hours",
      price_from: 200000, // Minimum price: 200,000 KM
      price_to: 330000, // Maximum price: 330,000 KM
      sort_by: 'date',
      sort_order: 'desc',
    };

    if (type === 'apartment') {
      return {
        ...baseParams,
        category_id: 23,
        attr: '3130322835302d3830293a3130372854726f736f62616e202833292c44766f736f62616e20283229293a35303028312c322c332c362c352c342c372c382c392c31302c31312c31322c31332c31342c31352c31362c31372c31382c31392c32302b293a373031322850726f64616a61293a37343032285374616e29',
        cities: ['133', '132', '131', '130'], // Sarajevo, Ilidža, Novi Grad
      };
    } else {
      return {
        ...baseParams,
        category_id: 24,
        attr: '373032312850726f64616a6129',
        cities: '',
      };
    }
  }

  /**
   * Fetch listings from OLX API with pagination
   * @param type - 'apartment' or 'house'
   * @param page - Page number (0-based)
   * @param limit - Number of items per page
   */
  async fetchListings(type: 'apartment' | 'house' = 'apartment', page: number = 0, limit: number = 50): Promise<OLXApiResponse> {
    try {
      const url = `${this.baseUrl}/search`;
      const params = this.getParamsByType(type, page, limit);

      logger.info(`Fetching OLX ${type} listings: page=${page + 1}, per_page=${limit}`);

      const response = await axios.get(url, { 
        params,
        headers: this.getAuthHeaders(),
      });

      return this.transformApiResponse(response.data, type, page, limit);
    } catch (error: any) {
      logger.error(`Error fetching OLX ${type} listings:`, error.message);
      if (error.response) {
        logger.error('Response status:', error.response.status);
        logger.error('Response data:', JSON.stringify(error.response.data, null, 2));
      }
      // Return empty response on error
      return {
        data: [],
        total: 0,
        page,
        limit,
        per_page: limit,
      };
    }
  }

  /**
   * Transform OLX API response to our interface
   */
  private transformApiResponse(data: any, type: 'apartment' | 'house', page: number, limit: number): OLXApiResponse {
    // OLX API response structure: { data: [...], meta: {...}, filters: [...], aggregations: {...} }
    const rawListings = data.data || [];
    const meta = data.meta || {};

    // Transform response to match our interface
    const listings: OLXListing[] = rawListings.map((item: any) => 
      this.transformListing(item, type)
    );

    return {
      data: listings,
      total: meta.total || listings.length,
      page: meta.current_page ? meta.current_page - 1 : page, // Convert back to 0-based
      limit: meta.per_page || limit,
      per_page: meta.per_page || limit,
      last_page: meta.last_page,
      current_page: meta.current_page,
    };
  }

  /**
   * Fetch a single listing by ID
   */
  async fetchListingById(id: string): Promise<OLXListing | null> {
    try {
      const url = `${this.baseUrl}/listings/${id}`;
      const response = await axios.get(url, {
        headers: this.getAuthHeaders(),
      });

      const item = response.data.data || response.data;
      return this.transformListing(item);
    } catch (error: any) {
      logger.error(`Error fetching listing ${id}:`, error.message);
      return null;
    }
  }
}

export const olxService = new OLXService();

