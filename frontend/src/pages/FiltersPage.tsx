import { useState, useEffect } from 'react';
import { filtersApi, UserFilter, CreateFilterInput } from '../api/filters';

export default function FiltersPage() {
  const [filters, setFilters] = useState<UserFilter[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<CreateFilterInput>({
    userId: 1, // Default user ID - in production, get from auth
    minPrice: undefined,
    maxPrice: undefined,
    location: '',
    type: '',
  });

  useEffect(() => {
    loadFilters();
  }, []);

  const loadFilters = async () => {
    setLoading(true);
    try {
      const filters = await filtersApi.getByUserId(formData.userId);
      setFilters(filters);
    } catch (error) {
      console.error('Error loading filters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await filtersApi.create(formData);
      setShowForm(false);
      setFormData({
        userId: formData.userId,
        minPrice: undefined,
        maxPrice: undefined,
        location: '',
        type: '',
      });
      loadFilters();
    } catch (error) {
      console.error('Error creating filter:', error);
      alert('Failed to create filter');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this filter?')) return;

    try {
      await filtersApi.delete(id);
      loadFilters();
    } catch (error) {
      console.error('Error deleting filter:', error);
      alert('Failed to delete filter');
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">User Filters</h2>
          <p className="mt-2 text-sm text-gray-600">
            Manage your listing filters to receive notifications
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {showForm ? 'Cancel' : '+ New Filter'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-xl font-semibold mb-4">Create New Filter</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Price (BAM)
                </label>
                <input
                  type="number"
                  value={formData.minPrice || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      minPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Price (BAM)
                </label>
                <input
                  type="number"
                  value={formData.maxPrice || ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      maxPrice: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="e.g., Sarajevo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Any</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Create Filter
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading filters...</p>
        </div>
      ) : filters.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-600">No filters found. Create one to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filters.map((filter) => (
            <div
              key={filter.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Filter #{filter.id}
                </h3>
                <button
                  onClick={() => handleDelete(filter.id)}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Delete
                </button>
              </div>
              <div className="space-y-2 text-sm">
                {filter.minPrice && (
                  <p className="text-gray-600">
                    <span className="font-medium">Min Price:</span> {filter.minPrice.toLocaleString()} BAM
                  </p>
                )}
                {filter.maxPrice && (
                  <p className="text-gray-600">
                    <span className="font-medium">Max Price:</span> {filter.maxPrice.toLocaleString()} BAM
                  </p>
                )}
                {filter.location && (
                  <p className="text-gray-600">
                    <span className="font-medium">Location:</span> {filter.location}
                  </p>
                )}
                {filter.type && (
                  <p className="text-gray-600">
                    <span className="font-medium">Type:</span> {filter.type}
                  </p>
                )}
                {!filter.minPrice &&
                  !filter.maxPrice &&
                  !filter.location &&
                  !filter.type && (
                    <p className="text-gray-500 italic">No specific filters (matches all)</p>
                  )}
              </div>
              <p className="mt-4 text-xs text-gray-400">
                Created: {new Date(filter.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

