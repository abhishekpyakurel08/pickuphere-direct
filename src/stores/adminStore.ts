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

const DEMO_STATS: AdminStats = {
  totalRevenue: 125400,
  deliveryRevenue: 12400,
  totalExpenses: 45000,
  netProfit: 80400,
  totalOrders: 60,
  pendingOrders: 12,
  completedOrders: 40,
  cancelledOrders: 8,
  totalUsers: 15,
  dailyAnalytics: [
    { date: '2024-03-20', income: 12000 },
    { date: '2024-03-21', income: 15000 },
    { date: '2024-03-22', income: 11000 },
    { date: '2024-03-23', income: 18000 },
    { date: '2024-03-24', income: 22000 },
    { date: '2024-03-25', income: 19000 },
    { date: '2024-03-26', income: 25000 }
  ],
  lowStockProducts: [],
  orderDistribution: [
    { name: "COMPLETED", value: 40 },
    { name: "CREATED", value: 8 },
    { name: "CONFIRMED", value: 4 },
    { name: "OUT_FOR_DELIVERY", value: 4 },
    { name: "CANCELLED", value: 4 }
  ],
  categoryDistribution: [
    { name: "Whiskey", value: 55000 },
    { name: "Beer", value: 25000 },
    { name: "Wine", value: 20000 },
    { name: "Rum", value: 15400 },
    { name: "Cider", value: 10000 }
  ],
  paymentDistribution: [
    { name: "STRIPE", value: 25 },
    { name: "KHALTI", value: 20 },
    { name: "ESEWA", value: 15 }
  ]
};

const DEMO_USERS = [
  { _id: '1', name: 'Main Admin', email: 'abhishekpyakurel01@gmail.com', role: 'admin' },
  { _id: '3', name: 'Customer 1', email: 'customer1@gmail.com', role: 'user' },
  { _id: '4', name: 'Customer 2', email: 'customer2@gmail.com', role: 'user' }
];

const DEMO_ORDERS = [
  {
    _id: 'ord1',
    user: { name: 'Customer 1' },
    total: 2850,
    status: 'COMPLETED',
    createdAt: new Date().toISOString(),
    payment: { method: 'STRIPE', status: 'PAID' }
  },
  {
    _id: 'ord2',
    user: { name: 'Customer 2' },
    total: 1450,
    status: 'CONFIRMED',
    createdAt: new Date().toISOString(),
    payment: { method: 'KHALTI', status: 'PAID' }
  }
];

const DEMO_PRODUCTS = [
  { _id: 'p1', name: 'Old Durbar Black Chimney', price: 2850, category: 'Whiskey', stock: 45, approved: true, image: '', description: 'Premium Whiskey' },
  { _id: 'p2', name: 'Signature Premier Whiskey', price: 2100, category: 'Whiskey', stock: 3, approved: true, image: '', description: 'Smooth Whiskey' },
  { _id: 'p3', name: 'Khukuri XXX Rum', price: 1450, category: 'Rum', stock: 55, approved: true, image: '', description: 'Traditional Rum' },
  { _id: 'p4', name: 'Sula Vineyards Red', price: 1800, category: 'Wine', stock: 5, approved: true, image: '', description: 'Fine Red Wine' }
];

export const useAdminStore = create<AdminStore>((set, get) => ({
  products: DEMO_PRODUCTS,
  orders: DEMO_ORDERS,
  users: DEMO_USERS,
  stats: DEMO_STATS,
  loading: false,

  fetchStats: async () => {
    try {
      set({ loading: true });
      const res = await api.get('/admin/stats');
      set({ stats: res.data });
    } catch (error) {
      console.error("Failed to fetch stats, using demo data", error);
      set({ stats: DEMO_STATS });
    } finally {
      set({ loading: false });
    }
  },

  fetchUsers: async () => {
    try {
      const res = await api.get('/admin/users');
      set({ users: res.data });
    } catch (e) {
      console.error("Failed to fetch users, using demo data", e);
      set({ users: DEMO_USERS });
    }
  },

  fetchOrders: async () => {
    try {
      const res = await api.get('/admin/orders');
      set({ orders: res.data });
    } catch (e) {
      console.error("Failed to fetch orders, using demo data", e);
      set({ orders: DEMO_ORDERS });
    }
  },

  fetchProducts: async () => {
    try {
      const res = await api.get('/admin/products');
      set({ products: res.data });
    } catch (e) {
      console.error("Failed to fetch products, using demo data", e);
      set({ products: DEMO_PRODUCTS });
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
