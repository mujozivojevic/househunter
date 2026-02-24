import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ListingsPage from './pages/ListingsPage';
import FiltersPage from './pages/FiltersPage';
import StatusPage from './pages/StatusPage';
import LoginPage from './pages/LoginPage';
// Login removed - no login page needed
import TestOLXPage from './pages/TestOLXPage';
import TelegramPage from './pages/TelegramPage';
import LogsPage from './pages/LogsPage';
import ProtectedRoute from './components/ProtectedRoute';
import { adminApi } from './api/admin';

function NavBar() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const data = await adminApi.check();
      setIsAuthenticated(data.authenticated);
      setUsername(data.username);
    } catch {
      setIsAuthenticated(false);
    }
  };

  const handleLogout = async () => {
    try {
      await adminApi.logout();
      setIsAuthenticated(false);
      setUsername(null);
      // Login removed - no redirect needed
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">🏠 House Hunter</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Listings
              </Link>
              <Link
                to="/filters"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Filters
              </Link>
              <Link
                to="/status"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Status
              </Link>
              <Link
                to="/login"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/test"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Test OLX
              </Link>
              <Link
                to="/telegram"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Telegram
              </Link>
              <Link
                to="/logs"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Logs
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">Welcome, {username}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm text-red-600 hover:text-red-700"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/"
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700"
              >
                Admin Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            {/* Login removed - no login route needed */}
            <Route path="/" element={<ProtectedRoute><ListingsPage /></ProtectedRoute>} />
            <Route path="/filters" element={<ProtectedRoute><FiltersPage /></ProtectedRoute>} />
            <Route path="/status" element={<ProtectedRoute><StatusPage /></ProtectedRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/test" element={<ProtectedRoute><TestOLXPage /></ProtectedRoute>} />
            <Route path="/telegram" element={<ProtectedRoute><TelegramPage /></ProtectedRoute>} />
            <Route path="/logs" element={<ProtectedRoute><LogsPage /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

