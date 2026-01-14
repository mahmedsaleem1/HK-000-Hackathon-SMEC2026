export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  sellerId: string | { _id: string; username: string; email: string };
  condition: string;
  images: string[];
  verified: boolean;
  verificationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  _id?: string;
  name: string;
  username?: string;
  email: string;
  role: 'buyer' | 'seller' | 'admin';
  avatar?: string;
}

export interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  product_id: string;
  price: number;
  status: 'pending_payment' | 'pending_shipment' | 'in_transit' | 'delivered' | 'completed' | 'disputed' | 'refunded';
  payment_status: 'pending' | 'processing' | 'escrowed' | 'released' | 'refunded';
  created_at: string;
  updated_at: string;
  product?: Product;
}

export interface EscrowPayment {
  id: string;
  order_id: string;
  amount: number;
  status: 'held' | 'released' | 'refunded';
  stripe_payment_id?: string;
  held_at: string;
  released_at?: string;
}

export interface Dispute {
  id: string;
  order_id: string;
  raised_by: string;
  reason: 'fake' | 'broken' | 'not_verified' | 'other';
  description: string;
  status: 'open' | 'in_review' | 'resolved' | 'refunded';
  created_at: string;
  resolved_at?: string;
  resolved_by?: string;
  resolution?: string;
}

export interface DisputeEvidence {
  id: string;
  dispute_id: string;
  image_url: string;
  uploaded_at: string;
}

export interface OrderVerification {
  id: string;
  order_id: string;
  service_provider: 'PSA' | 'DNA' | 'JSA' | 'other';
  status: 'pending' | 'in_progress' | 'verified' | 'failed';
  certificate_id?: string;
  certificate_url?: string;
  requested_at: string;
  completed_at?: string;
  notes?: string;
}

// ========== Barter/Swap Platform Types ==========

export type ItemCategory = 
  | 'electronics'
  | 'furniture'
  | 'sports'
  | 'tools'
  | 'clothing'
  | 'books'
  | 'vehicles'
  | 'home-appliances'
  | 'musical-instruments'
  | 'outdoor-gear'
  | 'baby-kids'
  | 'other';

export type ItemCondition = 'new' | 'like-new' | 'good' | 'fair' | 'poor';

export type ListingType = 'barter' | 'rental' | 'both';

export type RentalPeriod = 'hourly' | 'daily' | 'weekly' | 'monthly';

export interface ItemLocation {
  city: string;
  area?: string;
}

export interface ItemOwner {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface Item {
  _id: string;
  owner: ItemOwner | string;
  title: string;
  description: string;
  category: ItemCategory;
  condition: ItemCondition;
  images: string[];
  estimatedValue: number;
  listingType: ListingType;
  rentalPrice?: number;
  rentalPeriod?: RentalPeriod;
  preferredSwapCategories: ItemCategory[];
  location: ItemLocation;
  isAvailable: boolean;
  tags: string[];
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export type SwapRequestStatus = 'pending' | 'accepted' | 'rejected' | 'completed' | 'cancelled';

export type SwapRequestType = 'barter' | 'rental';

export interface RentalDetails {
  startDate: string;
  endDate: string;
  totalPrice: number;
}
export interface OwnerResponse{
  message?: string;
  respondedAt?: string;
}

export interface SwapRequest {
  _id: string;
  requester: ItemOwner | string;
  requestedItem: Item | string;
  offeredItem?: Item | string;
  requestType: SwapRequestType;
  rentalDetails?: RentalDetails;
  message?: string;
  status: SwapRequestStatus;
  matchScore?: number;
  ownerResponse?: OwnerResponse;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DetailedRatings {
  itemCondition: number;
  communication: number;
  punctuality: number;
}

export interface ReviewResponse {
  text: string;
  respondedAt: string;
}

export interface Review {
  _id: string;
  swapRequest: SwapRequest | string;
  reviewedUser: ItemOwner | string;
  reviewer: ItemOwner | string;
  item?: Item | string;
  rating: number;
  detailedRatings: DetailedRatings;
  title?: string;
  comment: string;
  response?: ReviewResponse;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
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

export interface MatchingItem extends Item {
  matchScore: number;
  matchReasons: string[];
}
