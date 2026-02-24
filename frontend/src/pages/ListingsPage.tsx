import { useState, useEffect } from 'react';
import { listingsApi, Listing } from '../api/listings';

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    loadListings();
  }, [page]);

  const loadListings = async () => {
    setLoading(true);
    try {
      const response = await listingsApi.getAll(page, limit);
      setListings(response.listings);
      setTotal(response.total);
    } catch (error) {
      console.error('Error loading listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US').format(price) + ' BAM';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">All Listings</h2>
        <p className="mt-2 text-sm text-gray-600">
          Total: {total} listings
        </p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading listings...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No listings found.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                {listing.images && listing.images.length > 0 && (
                  <div className="h-48 bg-gray-200 flex items-center justify-center">
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {listing.title}
                  </h3>
                  <p className="text-2xl font-bold text-blue-600 mb-2">
                    {formatPrice(listing.price)}
                  </p>
                  {listing.location && (
                    <p className="text-sm text-gray-600 mb-2">
                      📍 {listing.location}
                    </p>
                  )}
                  {listing.description && (
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                      {listing.description}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400">
                      {formatDate(listing.createdAt)}
                    </span>
                    <a
                      href={listing.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-center items-center space-x-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-gray-600">
              Page {page + 1} of {Math.ceil(total / limit)}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={(page + 1) * limit >= total}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

