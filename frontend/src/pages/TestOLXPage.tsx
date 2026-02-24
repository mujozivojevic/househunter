import { useState } from 'react';
import { testApi } from '../api/test';

export default function TestOLXPage() {
  const [url, setUrl] = useState('https://api.olx.ba/search');
  const [method, setMethod] = useState<'GET' | 'POST'>('GET');
  const [params, setParams] = useState(JSON.stringify({
    category_id: 23,
    page: 1,
    per_page: 40,
    attr: '3130322836302d3736293a3130372854726f736f62616e20283329293a37343032285374616e29',
    attr_encoded: '1',
    canton: 9,
    cities: ''
  }, null, 2));
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      let parsedParams = null;
      let parsedBody = null;

      if (params.trim()) {
        try {
          parsedParams = JSON.parse(params);
        } catch (e) {
          throw new Error('Invalid JSON in params field');
        }
      }

      if (body.trim() && method === 'POST') {
        try {
          parsedBody = JSON.parse(body);
        } catch (e) {
          throw new Error('Invalid JSON in body field');
        }
      }

      const result = await testApi.testOLX({
        url,
        method,
        params: parsedParams,
        body: parsedBody,
      });

      setResponse(result);
    } catch (err: any) {
      setError(err.message || 'Request failed');
      setResponse(err.response?.data || null);
    } finally {
      setLoading(false);
    }
  };

  const handleFlushDB = async () => {
    if (!confirm('Are you sure you want to delete ALL listings from the database?')) {
      return;
    }

    try {
      const response = await fetch('/api/listings/flush', {
        method: 'DELETE',
      });
      const data = await response.json();
      alert(`Successfully deleted ${data.count} listings`);
    } catch (err: any) {
      alert('Error flushing database: ' + err.message);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">OLX API Tester</h2>
          <p className="mt-2 text-sm text-gray-600">
            Test OLX API endpoints and verify response structure
          </p>
        </div>
        <button
          onClick={handleFlushDB}
          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Flush Database
        </button>
      </div>

      <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Quick Examples (attr is hex-encoded):</h3>
        <div className="space-y-2 text-xs text-blue-800">
          <button
            onClick={() => setParams(JSON.stringify({
              category_id: 23,
              page: 1,
              per_page: 40,
              attr: '37343032285374616e29',
              attr_encoded: '1'
            }, null, 2))}
            className="block w-full text-left hover:bg-blue-100 p-2 rounded"
          >
            <span className="font-medium">1. Apartment only:</span>
            <code className="ml-2 bg-blue-100 px-2 py-1 rounded text-xs">attr: "37343032285374616e29"</code>
          </button>
          <button
            onClick={() => setParams(JSON.stringify({
              category_id: 23,
              page: 1,
              per_page: 40,
              attr: '3130322836302d3736293a37343032285374616e29',
              attr_encoded: '1'
            }, null, 2))}
            className="block w-full text-left hover:bg-blue-100 p-2 rounded"
          >
            <span className="font-medium">2. Apartment + 60-76 sqm:</span>
            <code className="ml-2 bg-blue-100 px-2 py-1 rounded text-xs">attr: "3130322836302d3736293a37343032285374616e29"</code>
          </button>
          <button
            onClick={() => setParams(JSON.stringify({
              category_id: 23,
              page: 1,
              per_page: 40,
              attr: '3130322836302d3736293a3130372854726f736f62616e20283329293a37343032285374616e29',
              attr_encoded: '1',
              canton: 9,
              cities: ''
            }, null, 2))}
            className="block w-full text-left hover:bg-blue-100 p-2 rounded"
          >
            <span className="font-medium">3. Apartment + 60-76 sqm + 3 rooms + Kanton Sarajevo:</span>
            <code className="ml-2 bg-blue-100 px-2 py-1 rounded text-xs">attr: "3130322836302d3736293a3130372854726f736f62616e20283329293a37343032285374616e29", canton: 9</code>
          </button>
        </div>
        <p className="mt-3 text-xs text-blue-700">
          <strong>Note:</strong> The <code>attr</code> parameter is hex-encoded. Format: <code>{'{attribute_id}({value})'}</code> separated by <code>:</code> (3a in hex)
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Method
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as 'GET' | 'POST')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://api.olx.ba/listings"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Query Parameters (JSON)
              </label>
              <textarea
                value={params}
                onChange={(e) => setParams(e.target.value)}
                rows={6}
                placeholder='{"category_id": 23, "page": 1, "per_page": 40}'
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
            </div>

            {method === 'POST' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Request Body (JSON)
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={6}
                  placeholder='{"key": "value"}'
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Testing...' : 'Test API'}
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
          <p className="text-red-700 mb-4">{error}</p>
          {response && (
            <div className="bg-white rounded p-4">
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify(response, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      {response && !error && (
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Response</h3>
            <span className="text-sm text-gray-600">
              Status: {response.status} {response.statusText}
            </span>
          </div>
          
          {response.data?.meta && (
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <p className="text-sm text-gray-700">
                <span className="font-medium">Total:</span> {response.data.meta.total} listings | 
                <span className="font-medium"> Page:</span> {response.data.meta.current_page} of {response.data.meta.last_page} | 
                <span className="font-medium"> Per page:</span> {response.data.meta.per_page}
              </p>
            </div>
          )}

          {response.data?.data && response.data.data.length > 0 ? (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">
                Listings ({response.data.data.length} items)
              </h4>
              <div className="grid grid-cols-1 gap-4 max-h-96 overflow-y-auto">
                {response.data.data.map((listing: any, index: number) => (
                  <div key={listing.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                    <h5 className="font-semibold text-gray-900 mb-2">
                      {listing.title || 'No title'}
                    </h5>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>
                        <span className="font-medium">ID:</span> {listing.id}
                      </p>
                      <p>
                        <span className="font-medium">Price:</span> {listing.price ? `${listing.price.toLocaleString()} KM` : 'N/A'}
                        {listing.discounted_price && listing.discounted_price !== listing.display_price && (
                          <span className="ml-2 text-green-600">
                            (Discounted: {listing.discounted_price})
                          </span>
                        )}
                      </p>
                      {listing.location && (
                        <p>
                          <span className="font-medium">Location:</span> {
                            typeof listing.location === 'object' 
                              ? `${listing.location.lat?.toFixed(4)}, ${listing.location.lon?.toFixed(4)}`
                              : listing.location
                          }
                        </p>
                      )}
                      {listing.city_id && (
                        <p>
                          <span className="font-medium">City ID:</span> {listing.city_id}
                        </p>
                      )}
                      {listing.listing_type && (
                        <p>
                          <span className="font-medium">Type:</span> {listing.listing_type}
                        </p>
                      )}
                      {listing.images && listing.images.length > 0 && (
                        <p>
                          <span className="font-medium">Images:</span> {listing.images.length}
                        </p>
                      )}
                      {listing.date && (
                        <p>
                          <span className="font-medium">Date:</span> {new Date(listing.date * 1000).toLocaleString()}
                        </p>
                      )}
                      {listing.labels && listing.labels.length > 0 && (
                        <p>
                          <span className="font-medium">Labels:</span> {listing.labels.join(', ')}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No listings found in response
            </div>
          )}
        </div>
      )}
    </div>
  );
}

