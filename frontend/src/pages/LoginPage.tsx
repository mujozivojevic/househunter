import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [useClientCredentials, setUseClientCredentials] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Call backend to login and fetch API key
      const requestBody = useClientCredentials 
        ? { clientId, clientSecret }
        : { username, password };
        
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Log the API key to console
      if (data.apiKey) {
        console.log('='.repeat(60));
        console.log('OLX API ACCESS TOKEN RECEIVED:');
        console.log('='.repeat(60));
        console.log(data.apiKey);
        console.log('='.repeat(60));
        console.log('Token Type:', data.tokenType || 'Bearer');
        if (data.expiresIn) {
          console.log('Expires In:', data.expiresIn, 'seconds');
        }
        console.log('='.repeat(60));
        console.log('Add this to your .env file:');
        console.log('OLX_ACCESS_TOKEN=' + data.apiKey);
        console.log('='.repeat(60));
        console.log('Or use in Authorization header:');
        console.log('Authorization: Bearer ' + data.apiKey);
        console.log('='.repeat(60));
      }

      // Store token if provided
      if (data.token) {
        localStorage.setItem('authToken', data.token);
      }

      alert('Login successful! Check the browser console for the API key.');
      
      // Navigate to home page
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            OLX API Authentication
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Get your OLX API access token
          </p>
          <p className="mt-1 text-center text-xs text-gray-500">
            Register your app at{' '}
            <a href="https://developer.olx.ba/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              developer.olx.ba
            </a>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="flex items-center mb-4">
            <input
              id="auth-method"
              type="checkbox"
              checked={useClientCredentials}
              onChange={(e) => setUseClientCredentials(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="auth-method" className="ml-2 block text-sm text-gray-900">
              Use Client ID/Secret (recommended for server-to-server)
            </label>
          </div>

          {useClientCredentials ? (
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="clientId" className="sr-only">
                  Client ID
                </label>
                <input
                  id="clientId"
                  name="clientId"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Client ID"
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="clientSecret" className="sr-only">
                  Client Secret
                </label>
                <input
                  id="clientSecret"
                  name="clientSecret"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Client Secret"
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="OLX Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="OLX Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-sm text-gray-600 text-center">
            <p>After authentication, check the browser console (F12) for your access token</p>
            <p className="text-xs text-gray-500 mt-1">
              The token will be displayed with instructions on how to add it to your .env file
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}

