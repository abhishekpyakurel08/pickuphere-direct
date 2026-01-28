import { create } from 'zustand';
import { Product, Order, OrderStatus } from './cartStore';
import api from '@/services/api';

interface AdminStats {
  totalRevenue: number;
  deliveryRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalUsers: number;
  dailyAnalytics: Array<{ date: string; income: number }>;
  lowStockProducts: any[];
  orderDistribution: Array<{ name: string; value: number }>;
  categoryDistribution: Array<{ name: string; value: number }>;
  paymentDistribution: Array<{ name: string; value: number }>;
}

interface AdminStore {
  products: Product[];
  orders: any[];
  users: any[];
  stats: AdminStats | null;
  loading: boolean;

  // Fetching actions
  fetchStats: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchProducts: () => Promise<void>;

  // Product actions
  addProduct: (product: any) => Promise<void>;
  updateProduct: (id: string, product: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Order actions
  updateOrderStatus: (orderId: string, status: string) => Promise<void>;

  // User actions
  updateUserRole: (userId: string, data: any) => Promise<void>;
}



export const useAdminStore = create<AdminStore>((set, get) => ({
  products: [],
  orders: [],
  users: [],
  stats: null,
  loading: false,

  fetchStats: async () => {
    try {
      set({ loading: true });
      const res = await api.get('/admin/stats');
      set({ stats: res.data });
    } catch (error) {
      console.error("Failed to fetch stats", error);
      set({ stats: null });
    } finally {
      set({ loading: false });
    }
  },

  fetchUsers: async () => {
    try {
      const res = await api.get('/admin/users');
      set({ users: res.data });
    } catch (e) {
      console.error("Failed to fetch users", e);
      set({ users: [] });
    }
  },

  fetchOrders: async () => {
    try {
      const res = await api.get('/admin/orders');
      set({ orders: res.data });
    } catch (e) {
      console.error("Failed to fetch orders", e);
      set({ orders: [] });
    }
  },

  fetchProducts: async () => {
    try {
      const res = await api.get('/admin/products');
      set({ products: res.data });
    } catch (e) {
      console.error("Failed to fetch products", e);
      set({ products: [] });
    }
  },

  addProduct: async (productData) => {
    await api.post('/products', productData);
    get().fetchProducts();
  },

  updateProduct: async (id, productData) => {
    await api.put(`/products/${id}`, productData);
    get().fetchProducts();
  },

  deleteProduct: async (id) => {
    await api.delete(`/products/${id}`);
    get().fetchProducts();
  },

  updateOrderStatus: async (orderId, status) => {
    await api.put(`/orders/${orderId}/status`, { status });
    get().fetchOrders();
    get().fetchStats();
  },

  updateUserRole: async (userId, data) => {
    try {
      await api.put(`/admin/users/${userId}`, data);
      get().fetchUsers();
    } catch (error) {
      console.error("Failed to update user role", error);
    }
  },
}));
