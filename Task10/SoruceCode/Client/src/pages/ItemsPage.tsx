import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  Clock, 
  MapPin,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal
} from 'lucide-react';
import ItemCard from '../components/ItemCard';
import { itemsApi, ItemFilters } from '../lib/barterApi';
import { Item, ItemCategory, ItemCondition, ListingType } from '../types';

const categories: { value: ItemCategory; label: string }[] = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'sports', label: 'Sports' },
  { value: 'tools', label: 'Tools' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'books', label: 'Books' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'home-appliances', label: 'Home Appliances' },
  { value: 'musical-instruments', label: 'Musical Instruments' },
  { value: 'outdoor-gear', label: 'Outdoor Gear' },
  { value: 'baby-kids', label: 'Baby & Kids' },
  { value: 'other', label: 'Other' },
];

const conditions: { value: ItemCondition; label: string }[] = [
  { value: 'new', label: 'New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const listingTypes: { value: ListingType | ''; label: string; icon: JSX.Element }[] = [
  { value: '', label: 'All Types', icon: <SlidersHorizontal className="w-4 h-4" /> },
  { value: 'barter', label: 'Barter', icon: <RefreshCw className="w-4 h-4" /> },
  { value: 'rental', label: 'Rental', icon: <Clock className="w-4 h-4" /> },
  { value: 'both', label: 'Both', icon: <Filter className="w-4 h-4" /> },
];

export default function ItemsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Filter state
  const [filters, setFilters] = useState<ItemFilters>({
    search: searchParams.get('search') || '',
    category: (searchParams.get('category') as ItemCategory) || undefined,
    listingType: (searchParams.get('listingType') as ListingType) || undefined,
    condition: (searchParams.get('condition') as ItemCondition) || undefined,
    city: searchParams.get('city') || '',
    minValue: searchParams.get('minValue') ? Number(searchParams.get('minValue')) : undefined,
    maxValue: searchParams.get('maxValue') ? Number(searchParams.get('maxValue')) : undefined,
    page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
  });

  const [searchInput, setSearchInput] = useState(filters.search || '');

  useEffect(() => {
    fetchItems();
  }, [filters]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await itemsApi.getAll(filters);
      setItems(response.items);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Error fetching items:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters: Partial<ItemFilters>) => {
    const updated = { ...filters, ...newFilters, page: 1 };
    setFilters(updated);
    
    // Update URL params
    const params = new URLSearchParams();
    Object.entries(updated).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        params.set(key, String(value));
      }
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ page: 1 });
    setSearchInput('');
    setSearchParams(new URLSearchParams());
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateFilters({ search: searchInput });
  };

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activeFiltersCount = [
    filters.category,
    filters.listingType,
    filters.condition,
    filters.city,
    filters.minValue,
    filters.maxValue,
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-neutral-900 via-stone-800 to-amber-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Swap, Rent, Save
            </h1>
            <p className="text-xl text-amber-100 mb-8 max-w-2xl mx-auto">
              Find items to barter or rent. Save money and reduce waste by sharing resources with your community.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search items..."
                  className="w-full pl-12 pr-32 py-4 rounded-full text-gray-900 placeholder-gray-500 focus:ring-4 focus:ring-white/30 outline-none shadow-lg"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition-colors font-medium"
                >
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Listing Type Tabs */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {listingTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => updateFilters({ listingType: type.value as ListingType || undefined })}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${
                  (filters.listingType || '') === type.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {type.icon}
                {type.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                showFilters || activeFiltersCount > 0
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="bg-indigo-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <Link
              to="/items/new"
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <Plus className="w-4 h-4" />
              List Item
            </Link>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters</h3>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear all
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category || ''}
                  onChange={(e) => updateFilters({ category: e.target.value as ItemCategory || undefined })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Condition</label>
                <select
                  value={filters.condition || ''}
                  onChange={(e) => updateFilters({ condition: e.target.value as ItemCondition || undefined })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Any Condition</option>
                  {conditions.map((cond) => (
                    <option key={cond.value} value={cond.value}>{cond.label}</option>
                  ))}
                </select>
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.city || ''}
                    onChange={(e) => updateFilters({ city: e.target.value })}
                    placeholder="Enter city..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Value Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Value Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={filters.minValue || ''}
                    onChange={(e) => updateFilters({ minValue: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Min"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    value={filters.maxValue || ''}
                    onChange={(e) => updateFilters({ maxValue: e.target.value ? Number(e.target.value) : undefined })}
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600">
            {loading ? 'Loading...' : `${pagination.totalItems} items found`}
          </p>
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <ItemCard key={item._id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your filters or search terms</p>
            <Link
              to="/items/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              List Your First Item
            </Link>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPrevPage}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {[...Array(pagination.totalPages)].map((_, i) => {
              const page = i + 1;
              if (
                page === 1 ||
                page === pagination.totalPages ||
                (page >= pagination.currentPage - 1 && page <= pagination.currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                      page === pagination.currentPage
                        ? 'bg-indigo-600 text-white'
                        : 'border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (
                page === pagination.currentPage - 2 ||
                page === pagination.currentPage + 2
              ) {
                return <span key={page} className="px-2">...</span>;
              }
              return null;
            })}

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
