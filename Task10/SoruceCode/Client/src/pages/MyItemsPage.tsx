import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Package, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { itemsApi } from '../lib/barterApi';
import { Item } from '../types';
import ItemCard from '../components/ItemCard';

export default function MyItemsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'available' | 'unavailable'>('all');

  useEffect(() => {
    if (user) {
      fetchMyItems();
    } else {
      navigate('/login');
    }
  }, [user, navigate]);

  const fetchMyItems = async () => {
    try {
      setLoading(true);
      const data = await itemsApi.getMyItems();
      setItems(data);
    } catch (error) {
      console.error('Error fetching my items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (id: string) => {
    try {
      const updatedItem = await itemsApi.toggleAvailability(id);
      setItems((prev) =>
        prev.map((item) => (item._id === id ? updatedItem : item))
      );
    } catch (error) {
      console.error('Error toggling availability:', error);
      alert('Failed to update item availability');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      await itemsApi.delete(id);
      setItems((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const filteredItems = items.filter((item) => {
    if (filter === 'available') return item.isAvailable;
    if (filter === 'unavailable') return !item.isAvailable;
    return true;
  });

  const stats = {
    total: items.length,
    available: items.filter((i) => i.isAvailable).length,
    unavailable: items.filter((i) => !i.isAvailable).length,
    totalViews: items.reduce((sum, i) => sum + i.viewCount, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-neutral-900 via-stone-800 to-amber-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Items</h1>
              <p className="text-amber-100 mt-2">
                Manage your listed items for barter and rental
              </p>
            </div>
            <Link
              to="/items/new"
              className="mt-4 md:mt-0 inline-flex items-center gap-2 px-6 py-3 bg-white text-amber-700 rounded-xl hover:bg-amber-50 transition-colors font-semibold"
            >
              <Plus className="w-5 h-5" />
              List New Item
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Package className="w-8 h-8 text-white/80" />
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-amber-100">Total Items</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <ToggleRight className="w-8 h-8 text-green-300" />
                <div>
                  <p className="text-2xl font-bold">{stats.available}</p>
                  <p className="text-sm text-amber-100">Available</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <ToggleLeft className="w-8 h-8 text-yellow-300" />
                <div>
                  <p className="text-2xl font-bold">{stats.unavailable}</p>
                  <p className="text-sm text-amber-100">Unavailable</p>
                </div>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Eye className="w-8 h-8 text-white/80" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalViews}</p>
                  <p className="text-sm text-amber-100">Total Views</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { value: 'all', label: 'All Items', count: stats.total },
            { value: 'available', label: 'Available', count: stats.available },
            { value: 'unavailable', label: 'Unavailable', count: stats.unavailable },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as typeof filter)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === tab.value
                  ? 'bg-amber-700 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Items Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md animate-pulse">
                <div className="aspect-[4/3] bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <ItemCard
                key={item._id}
                item={item}
                showActions
                onToggleAvailability={handleToggleAvailability}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {filter === 'all'
                ? "You haven't listed any items yet"
                : filter === 'available'
                ? 'No available items'
                : 'No unavailable items'}
            </h3>
            <p className="text-gray-500 mb-6">
              {filter === 'all'
                ? 'Start sharing items with your community'
                : 'Adjust your filters to see more items'}
            </p>
            {filter === 'all' && (
              <Link
                to="/items/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-amber-700 text-white rounded-xl hover:bg-amber-800 transition-colors font-semibold"
              >
                <Plus className="w-5 h-5" />
                List Your First Item
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
