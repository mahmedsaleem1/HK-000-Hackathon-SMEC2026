import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Plus, 
  MapPin,
  DollarSign,
  Tag,
  RefreshCw,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { itemsApi, CreateItemData } from '../lib/barterApi';
import { ItemCategory, ItemCondition, ListingType, RentalPeriod } from '../types';

const categories: { value: ItemCategory; label: string }[] = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'sports', label: 'Sports & Fitness' },
  { value: 'tools', label: 'Tools & Equipment' },
  { value: 'clothing', label: 'Clothing & Accessories' },
  { value: 'books', label: 'Books & Media' },
  { value: 'vehicles', label: 'Vehicles' },
  { value: 'home-appliances', label: 'Home Appliances' },
  { value: 'musical-instruments', label: 'Musical Instruments' },
  { value: 'outdoor-gear', label: 'Outdoor & Camping' },
  { value: 'baby-kids', label: 'Baby & Kids' },
  { value: 'other', label: 'Other' },
];

const conditions: { value: ItemCondition; label: string; description: string }[] = [
  { value: 'new', label: 'New', description: 'Brand new, never used' },
  { value: 'like-new', label: 'Like New', description: 'Barely used, excellent condition' },
  { value: 'good', label: 'Good', description: 'Minor wear, fully functional' },
  { value: 'fair', label: 'Fair', description: 'Visible wear, works well' },
  { value: 'poor', label: 'Poor', description: 'Heavy wear, may need repairs' },
];

const rentalPeriods: { value: RentalPeriod; label: string }[] = [
  { value: 'hourly', label: 'Per Hour' },
  { value: 'daily', label: 'Per Day' },
  { value: 'weekly', label: 'Per Week' },
  { value: 'monthly', label: 'Per Month' },
];

export default function CreateItemPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [formData, setFormData] = useState<CreateItemData>({
    title: '',
    description: '',
    category: 'other',
    condition: 'good',
    estimatedValue: 0,
    listingType: 'both',
    rentalPrice: undefined,
    rentalPeriod: 'daily',
    preferredSwapCategories: [],
    location: {
      city: '',
      area: '',
    },
    tags: [],
  });

  const [tagInput, setTagInput] = useState('');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      alert('You can upload a maximum of 5 images');
      return;
    }

    const newImages = [...images, ...files].slice(0, 5);
    setImages(newImages);

    // Generate previews
    const newPreviews = newImages.map((file) => URL.createObjectURL(file));
    setImagePreviews(newPreviews);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...(prev.tags || []), tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: (prev.tags || []).filter((t) => t !== tag),
    }));
  };

  const togglePreferredCategory = (category: ItemCategory) => {
    setFormData((prev) => ({
      ...prev,
      preferredSwapCategories: prev.preferredSwapCategories?.includes(category)
        ? prev.preferredSwapCategories.filter((c) => c !== category)
        : [...(prev.preferredSwapCategories || []), category],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Please sign in to list an item');
      return;
    }

    if (images.length === 0) {
      alert('Please add at least one image');
      return;
    }

    try {
      setLoading(true);
      const item = await itemsApi.create(formData, images);
      navigate(`/items/${item._id}`);
    } catch (error: any) {
      console.error('Error creating item:', error);
      alert(error.userMessage || 'Failed to create item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-neutral-900 via-stone-800 to-amber-900 px-6 py-8 text-white">
            <h1 className="text-2xl font-bold">List Your Item</h1>
            <p className="text-amber-100 mt-1">
              Share your item with the community for barter or rental
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Photos <span className="text-red-500">*</span>
              </label>
              <p className="text-sm text-gray-500 mb-4">
                Add up to 5 photos. The first image will be the cover photo.
              </p>

              <div className="flex flex-wrap gap-4">
                {imagePreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-gray-200"
                  >
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded">
                        Cover
                      </span>
                    )}
                  </div>
                ))}

                {images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:border-amber-600 hover:text-amber-600 transition-colors"
                  >
                    <Plus className="w-6 h-6" />
                    <span className="text-xs mt-1">Add Photo</span>
                  </button>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Sony PlayStation 5 Console"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your item in detail..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none"
                required
              />
            </div>

            {/* Category & Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value as ItemCategory }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Condition <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => setFormData((prev) => ({ ...prev, condition: e.target.value as ItemCondition }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  required
                >
                  {conditions.map((cond) => (
                    <option key={cond.value} value={cond.value}>{cond.label} - {cond.description}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Listing Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Listing Type <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'barter', label: 'Barter Only', icon: <RefreshCw className="w-5 h-5" />, color: 'purple' },
                  { value: 'rental', label: 'Rental Only', icon: <Clock className="w-5 h-5" />, color: 'blue' },
                  { value: 'both', label: 'Both', icon: <Tag className="w-5 h-5" />, color: 'amber' },
                ].map((type) => (
                  <label
                    key={type.value}
                    className={`flex flex-col items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData.listingType === type.value
                        ? `border-${type.color}-500 bg-${type.color}-50`
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="listingType"
                      value={type.value}
                      checked={formData.listingType === type.value}
                      onChange={(e) => setFormData((prev) => ({ ...prev, listingType: e.target.value as ListingType }))}
                      className="sr-only"
                    />
                    <div className={`p-2 rounded-full mb-2 ${
                      formData.listingType === type.value
                        ? `bg-${type.color}-100 text-${type.color}-600`
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {type.icon}
                    </div>
                    <span className="font-medium text-sm">{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Value & Rental Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estimated Value ($) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.estimatedValue || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, estimatedValue: Number(e.target.value) }))}
                    placeholder="0"
                    min="0"
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {(formData.listingType === 'rental' || formData.listingType === 'both') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rental Price ($) <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="number"
                        value={formData.rentalPrice || ''}
                        onChange={(e) => setFormData((prev) => ({ ...prev, rentalPrice: Number(e.target.value) }))}
                        placeholder="0"
                        min="0"
                        className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        // required={formData.listingType !== 'barter'}
                      />
                    </div>
                    <select
                      value={formData.rentalPeriod}
                      onChange={(e) => setFormData((prev) => ({ ...prev, rentalPeriod: e.target.value }))}
                      className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      {rentalPeriods.map((period) => (
                        <option key={period.value} value={period.value}>{period.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Preferred Swap Categories */}
            {(formData.listingType === 'barter' || formData.listingType === 'both') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preferred Swap Categories
                </label>
                <p className="text-sm text-gray-500 mb-3">
                  Select categories you're interested in swapping for
                </p>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => togglePreferredCategory(cat.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                        formData.preferredSwapCategories?.includes(cat.value)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={formData.location.city}
                    onChange={(e) => setFormData((prev) => ({
                      ...prev,
                      location: { ...prev.location, city: e.target.value },
                    }))}
                    placeholder="e.g., Karachi"
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Area (Optional)
                </label>
                <input
                  type="text"
                  value={formData.location.area || ''}
                  onChange={(e) => setFormData((prev) => ({
                    ...prev,
                    location: { ...prev.location, area: e.target.value },
                  }))}
                  placeholder="e.g., DHA Phase 5"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (Optional)
              </label>
              <p className="text-sm text-gray-500 mb-3">
                Add tags to help people find your item
              </p>

              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Type a tag and press Enter"
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Add
                </button>
              </div>

              {formData.tags && formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-amber-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-amber-700 text-white rounded-xl hover:bg-amber-800 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Listing...' : 'List Item'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
