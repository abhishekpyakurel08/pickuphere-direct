// API Service Layer for External Backend Connection
// Connects to Node.js/Express/MongoDB backend

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || 'http://localhost:5000/api';

// Token management
let authToken: string | null = localStorage.getItem('auth_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export const getAuthToken = () => authToken;

// Base fetch wrapper with auth
const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (authToken) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// Multipart form data fetch (for file uploads)
const apiUpload = async (endpoint: string, formData: FormData) => {
  const headers: HeadersInit = {};
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
};

// ============ AUTH API ============
export const authApi = {
  // Google OAuth login
  googleLogin: async (googleCredential: string) => {
    const data = await apiFetch('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential: googleCredential }),
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  // Get current user
  getMe: async () => {
    return apiFetch('/auth/me');
  },

  // Logout
  logout: () => {
    setAuthToken(null);
  },

  // Apply for vendor
  applyVendor: async (shopName: string, description: string) => {
    return apiFetch('/auth/apply-vendor', {
      method: 'POST',
      body: JSON.stringify({ shopName, description }),
    });
  },
};

// ============ PRODUCTS API ============
export interface ProductData {
  id?: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image?: string;
  images?: string[];
  vendor?: {
    id: string;
    shopName: string;
    isVerified: boolean;
  };
  averageRating?: number;
  totalReviews?: number;
  status?: 'pending' | 'active' | 'rejected';
}

export const productsApi = {
  // Get all products (with optional filters)
  getAll: async (params?: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    vendor?: string;
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.append(key, String(value));
      });
    }
    return apiFetch(`/products?${query.toString()}`);
  },

  // Get single product
  getById: async (id: string) => {
    return apiFetch(`/products/${id}`);
  },

  // Create product (vendor/admin)
  create: async (product: Omit<ProductData, 'id'>) => {
    return apiFetch('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  // Create product with image upload
  createWithImage: async (productData: FormData) => {
    return apiUpload('/products', productData);
  },

  // Update product
  update: async (id: string, product: Partial<ProductData>) => {
    return apiFetch(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    });
  },

  // Delete product
  delete: async (id: string) => {
    return apiFetch(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Update stock
  updateStock: async (id: string, stock: number) => {
    return apiFetch(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock }),
    });
  },
};

// ============ REVIEWS API ============
export interface ReviewData {
  id?: string;
  productId: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  user?: {
    id: string;
    name: string;
    picture: string;
  };
  isVerifiedPurchase?: boolean;
  helpfulCount?: number;
  createdAt?: string;
}

export const reviewsApi = {
  // Get reviews for a product
  getByProduct: async (productId: string, params?: {
    sort?: 'recent' | 'helpful' | 'highest' | 'lowest';
    page?: number;
    limit?: number;
  }) => {
    const query = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) query.append(key, String(value));
      });
    }
    return apiFetch(`/reviews/product/${productId}?${query.toString()}`);
  },

  // Create review
  create: async (review: Omit<ReviewData, 'id'>) => {
    return apiFetch('/reviews', {
      method: 'POST',
      body: JSON.stringify(review),
    });
  },

  // Create review with images
  createWithImages: async (formData: FormData) => {
    return apiUpload('/reviews', formData);
  },

  // Update review
  update: async (id: string, review: Partial<ReviewData>) => {
    return apiFetch(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(review),
    });
  },

  // Delete review
  delete: async (id: string) => {
    return apiFetch(`/reviews/${id}`, {
      method: 'DELETE',
    });
  },

  // Mark review helpful
  markHelpful: async (id: string, isHelpful: boolean) => {
    return apiFetch(`/reviews/${id}/helpful`, {
      method: 'POST',
      body: JSON.stringify({ isHelpful }),
    });
  },

  // Get user's reviews
  getMyReviews: async () => {
    return apiFetch('/reviews/my-reviews');
  },
};

// ============ VENDOR API ============
export interface VendorData {
  id: string;
  shopName: string;
  description: string;
  isVerified: boolean;
  commission: number;
  totalSales: number;
  totalRevenue: number;
  products: ProductData[];
}

export const vendorApi = {
  // Get vendor dashboard
  getDashboard: async () => {
    return apiFetch('/vendor/dashboard');
  },

  // Get vendor products
  getProducts: async () => {
    return apiFetch('/vendor/products');
  },

  // Get vendor stats
  getStats: async () => {
    return apiFetch('/vendor/stats');
  },

  // Update shop info
  updateShop: async (data: { shopName?: string; description?: string }) => {
    return apiFetch('/vendor/shop', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ============ ADMIN API ============
export const adminApi = {
  // Get all users
  getUsers: async () => {
    return apiFetch('/admin/users');
  },

  // Update user role
  updateUserRole: async (userId: string, role: 'user' | 'vendor' | 'admin') => {
    return apiFetch(`/admin/users/${userId}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  // Get all vendors
  getVendors: async () => {
    return apiFetch('/admin/vendors');
  },

  // Verify vendor
  verifyVendor: async (vendorId: string, commission?: number) => {
    return apiFetch(`/admin/vendors/${vendorId}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ commission }),
    });
  },

  // Get all products (including pending)
  getProducts: async (status?: 'pending' | 'active' | 'rejected') => {
    const query = status ? `?status=${status}` : '';
    return apiFetch(`/admin/products${query}`);
  },

  // Approve/reject product
  updateProductStatus: async (productId: string, status: 'active' | 'rejected') => {
    return apiFetch(`/admin/products/${productId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Get admin stats
  getStats: async () => {
    return apiFetch('/admin/stats');
  },

  // Get all reviews for moderation
  getReviews: async (status?: 'pending' | 'approved' | 'rejected') => {
    const query = status ? `?status=${status}` : '';
    return apiFetch(`/admin/reviews${query}`);
  },

  // Moderate review
  moderateReview: async (reviewId: string, status: 'approved' | 'rejected') => {
    return apiFetch(`/admin/reviews/${reviewId}/moderate`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// ============ ORDERS API ============
export interface OrderData {
  id?: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  pickupLocation: {
    id: string;
    name: string;
    address: string;
    lat: number;
    lng: number;
  };
  paymentMethod: string;
  status?: 'CREATED' | 'CONFIRMED' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED';
}

export const ordersApi = {
  // Create order
  create: async (order: Omit<OrderData, 'id' | 'status'>) => {
    return apiFetch('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  },

  // Get user's orders
  getMyOrders: async () => {
    return apiFetch('/orders/my-orders');
  },

  // Get order by ID
  getById: async (id: string) => {
    return apiFetch(`/orders/${id}`);
  },

  // Cancel order
  cancel: async (id: string) => {
    return apiFetch(`/orders/${id}/cancel`, {
      method: 'PUT',
    });
  },

  // Admin: Get all orders
  getAll: async (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return apiFetch(`/admin/orders${query}`);
  },

  // Admin: Update order status
  updateStatus: async (id: string, status: OrderData['status']) => {
    return apiFetch(`/admin/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },
};

// ============ LOCATIONS API ============
export interface LocationData {
  id?: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  hours: string;
}

export const locationsApi = {
  // Get all pickup locations
  getAll: async () => {
    return apiFetch('/locations');
  },

  // Reverse geocode (lat,lng → address)
  reverseGeocode: async (lat: number, lng: number) => {
    return apiFetch(`/location/reverse?lat=${lat}&lng=${lng}`);
  },

  // Admin: Create location
  create: async (location: Omit<LocationData, 'id'>) => {
    return apiFetch('/admin/locations', {
      method: 'POST',
      body: JSON.stringify(location),
    });
  },

  // Admin: Update location
  update: async (id: string, location: Partial<LocationData>) => {
    return apiFetch(`/admin/locations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(location),
    });
  },

  // Admin: Delete location
  delete: async (id: string) => {
    return apiFetch(`/admin/locations/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============ UPLOAD API ============
export const uploadApi = {
  // Upload product image
  productImage: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiUpload('/upload/product-image', formData);
  },

  // Upload review images
  reviewImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return apiUpload('/upload/review-images', formData);
  },

  // Delete image
  deleteImage: async (fileId: string) => {
    return apiFetch(`/upload/image/${fileId}`, {
      method: 'DELETE',
    });
  },
};
