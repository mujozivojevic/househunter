import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

interface User {
  id: number;
  telegramId: string;
  username?: string;
  filters: any[];
  createdAt: string;
}

export default function TelegramPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterForm, setShowRegisterForm] = useState(false);
  const [registerData, setRegisterData] = useState({ telegramId: '', username: '' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE}/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/users/register`, registerData);
      setShowRegisterForm(false);
      setRegisterData({ telegramId: '', username: '' });
      loadUsers();
      alert('User registered successfully!');
    } catch (error: any) {
      console.error('Error registering user:', error);
      alert('Failed to register user: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Telegram Users</h2>
          <p className="mt-2 text-sm text-gray-600">
            Manage registered Telegram users
          </p>
        </div>
        <button
          onClick={() => setShowRegisterForm(!showRegisterForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {showRegisterForm ? 'Cancel' : '+ Register User'}
        </button>
      </div>

      {showRegisterForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Register Telegram User</h3>
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Telegram ID (Chat ID) *
              </label>
              <input
                type="text"
                required
                value={registerData.telegramId}
                onChange={(e) => setRegisterData({ ...registerData, telegramId: e.target.value })}
                placeholder="e.g., 7324783899"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-1 text-xs text-gray-500">
                Get your Telegram ID from @userinfobot on Telegram
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username (optional)
              </label>
              <input
                type="text"
                value={registerData.username}
                onChange={(e) => setRegisterData({ ...registerData, username: e.target.value })}
                placeholder="e.g., @username"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Register User
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">No users registered yet. Register a user to start receiving notifications!</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">Registered Users ({users.length})</h3>
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">
                      User #{user.id} {user.username && `(@${user.username})`}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      Telegram ID: <code className="bg-gray-100 px-2 py-1 rounded">{user.telegramId}</code>
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Filters: {user.filters.length} | Registered: {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

