import api from './api';
import {
  Item,
  MatchingItem,
  SwapRequest,
  Review,
  ReviewStats,
  ItemCategory,
  ItemCondition,
  ListingType,
} from '../types';

// API Response type
interface ApiResponse<T> {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
}

// Items response with pagination
interface ItemsApiResponse {
  items: Item[];
  pagination: {
    total: number;
    page: number;
    pages: number;
    limit: number;
  };
}

// ========== Items API ==========

export interface CreateItemData {
  title: string;
  description: string;
  category: ItemCategory;
  condition: ItemCondition;
  estimatedValue: number;
  listingType: ListingType;
  rentalPrice?: number;
  rentalPeriod?: string;
  preferredSwapCategories?: ItemCategory[];
  location: {
    city: string;
    area?: string;
  };
  tags?: string[];
}

export interface ItemFilters {
  category?: ItemCategory;
  listingType?: ListingType;
  condition?: ItemCondition;
  city?: string;
  minValue?: number;
  maxValue?: number;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ItemsResponse {
  items: Item[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const itemsApi = {
  // Create a new item with images
  create: async (data: CreateItemData, images: File[]): Promise<Item> => {
    const formData = new FormData();
    
    // Append all text fields
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    // Append images
    images.forEach((image) => {
      formData.append('images', image);
    });
    
    const response = await api.post<ApiResponse<Item>>('/items', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Get all items with filters
  getAll: async (filters: ItemFilters = {}): Promise<ItemsResponse> => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    
    const response = await api.get<ApiResponse<ItemsApiResponse>>(`/items?${params.toString()}`);
    const apiData = response.data.data;
    
    // Transform backend pagination to frontend format
    return {
      items: apiData.items,
      pagination: {
        currentPage: apiData.pagination.page,
        totalPages: apiData.pagination.pages,
        totalItems: apiData.pagination.total,
        itemsPerPage: apiData.pagination.limit,
        hasNextPage: apiData.pagination.page < apiData.pagination.pages,
        hasPrevPage: apiData.pagination.page > 1,
      },
    };
  },

  // Get single item by ID
  getById: async (id: string): Promise<Item> => {
    const response = await api.get<ApiResponse<Item>>(`/items/${id}`);
    return response.data.data;
  },

  // Get items owned by current user
  getMyItems: async (): Promise<Item[]> => {
    const response = await api.get<ApiResponse<Item[]>>('/items/user/my-items');
    return response.data.data;
  },

  // Get items by user ID
  getByUser: async (userId: string): Promise<Item[]> => {
    const response = await api.get<ApiResponse<Item[]>>(`/items/user/${userId}`);
    return response.data.data;
  },

  // Get matching items for smart swap suggestions
  getMatching: async (itemId: string): Promise<MatchingItem[]> => {
    const response = await api.get<ApiResponse<Array<{ item: Item; matchScore: number }>>>(`/items/${itemId}/matching`);
    // Transform the response to match frontend type
    return response.data.data.map(match => ({
      ...match.item,
      matchScore: match.matchScore,
      matchReasons: [],
    }));
  },

  // Update an item
  update: async (id: string, data: Partial<CreateItemData>, newImages?: File[]): Promise<Item> => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (typeof value === 'object') {
          formData.append(key, JSON.stringify(value));
        } else {
          formData.append(key, String(value));
        }
      }
    });
    
    if (newImages) {
      newImages.forEach((image) => {
        formData.append('images', image);
      });
    }
    
    const response = await api.patch<ApiResponse<Item>>(`/items/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  // Delete an item
  delete: async (id: string): Promise<void> => {
    await api.delete(`/items/${id}`);
  },

  // Toggle item availability
  toggleAvailability: async (id: string): Promise<Item> => {
    const response = await api.patch<ApiResponse<Item>>(`/items/${id}/toggle-availability`);
    return response.data.data;
  },
};

// ========== Swap Requests API ==========

export interface CreateSwapRequestData {
  requestedItemId: string;
  offeredItemId?: string;
  requestType: 'barter' | 'rental';
  rentalDetails?: {
    startDate: string;
    endDate: string;
  };
  message?: string;
}

export const swapRequestsApi = {
  // Create a new swap request
  create: async (data: CreateSwapRequestData): Promise<SwapRequest> => {
    const response = await api.post<ApiResponse<SwapRequest>>('/swap-requests', data);
    return response.data.data;
  },

  // Get swap requests received (as item owner)
  getReceived: async (): Promise<SwapRequest[]> => {
    const response = await api.get<ApiResponse<SwapRequest[]>>('/swap-requests/received');
    return response.data.data;
  },

  // Get swap requests sent (as requester)
  getSent: async (): Promise<SwapRequest[]> => {
    const response = await api.get<ApiResponse<SwapRequest[]>>('/swap-requests/sent');
    return response.data.data;
  },

  // Get single swap request by ID
  getById: async (id: string): Promise<SwapRequest> => {
    const response = await api.get<ApiResponse<SwapRequest>>(`/swap-requests/${id}`);
    return response.data.data;
  },

  // Respond to a swap request (accept/reject)
  respond: async (id: string, status: 'accepted' | 'rejected', message?: string): Promise<SwapRequest> => {
    // Backend expects 'action' with values 'accept' or 'reject' (not 'accepted'/'rejected')
    const action = status === 'accepted' ? 'accept' : 'reject';
    const response = await api.patch<ApiResponse<SwapRequest>>(`/swap-requests/${id}/respond`, {
      action,
      message,
    });
    return response.data.data;
  },

  // Mark a swap request as completed
  complete: async (id: string): Promise<SwapRequest> => {
    const response = await api.patch<ApiResponse<SwapRequest>>(`/swap-requests/${id}/complete`);
    return response.data.data;
  },

  // Cancel a swap request
  cancel: async (id: string): Promise<SwapRequest> => {
    const response = await api.patch<ApiResponse<SwapRequest>>(`/swap-requests/${id}/cancel`);
    return response.data.data;
  },
};

// ========== Reviews API ==========

export interface CreateReviewData {
  swapRequestId: string;
  rating: number;
  detailedRatings?: {
    itemCondition?: number;
    communication?: number;
    punctuality?: number;
  };
  title?: string;
  comment: string;
}

interface ReviewsWithStats {
  reviews: Review[];
  stats: ReviewStats;
}

export const reviewsApi = {
  // Create a new review
  create: async (data: CreateReviewData): Promise<Review> => {
    const response = await api.post<ApiResponse<Review>>('/reviews', data);
    return response.data.data;
  },

  // Get reviews for a user
  getUserReviews: async (userId: string): Promise<ReviewsWithStats> => {
    const response = await api.get<ApiResponse<ReviewsWithStats>>(`/reviews/user/${userId}`);
    return response.data.data;
  },

  // Get reviews for an item
  getItemReviews: async (itemId: string): Promise<ReviewsWithStats> => {
    const response = await api.get<ApiResponse<ReviewsWithStats>>(`/reviews/item/${itemId}`);
    return response.data.data;
  },

  // Respond to a review (as the reviewed user)
  respond: async (id: string, text: string): Promise<Review> => {
    const response = await api.patch<ApiResponse<Review>>(`/reviews/${id}/respond`, { text });
    return response.data.data;
  },

  // Check if user can review a swap request
  canReview: async (swapRequestId: string): Promise<{ canReview: boolean; reason?: string }> => {
    const response = await api.get<ApiResponse<{ canReview: boolean; reason?: string }>>(`/reviews/can-review/${swapRequestId}`);
    return response.data.data;
  },
};

export default {
  items: itemsApi,
  swapRequests: swapRequestsApi,
  reviews: reviewsApi,
};
