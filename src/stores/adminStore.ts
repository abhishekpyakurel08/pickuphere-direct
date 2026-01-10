import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product, Order, PickupLocation, OrderStatus } from './cartStore';
import { products as initialProducts, pickupLocations as initialLocations } from '@/data/mockData';

interface AdminStore {
  products: Product[];
  orders: Order[];
  locations: PickupLocation[];
  
  // Product actions
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  
  // Order actions
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  cancelOrder: (orderId: string) => void;
  
  // Location actions
  addLocation: (location: Omit<PickupLocation, 'id'>) => void;
  updateLocation: (id: string, location: Partial<PickupLocation>) => void;
  deleteLocation: (id: string) => void;
  
  // Stats
  getStats: () => {
    totalRevenue: number;
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
  };
}

// Generate some sample orders for demo
const generateSampleOrders = (): Order[] => {
  const statuses: OrderStatus[] = ['CREATED', 'CONFIRMED', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'];
  const sampleOrders: Order[] = [];
  
  for (let i = 0; i < 12; i++) {
    const randomProducts = initialProducts.slice(0, Math.floor(Math.random() * 3) + 1);
    const items = randomProducts.map(p => ({ product: p, quantity: Math.floor(Math.random() * 3) + 1 }));
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    
    sampleOrders.push({
      id: `ORD-${1000 + i}`,
      items,
      total,
      pickupLocation: initialLocations[i % initialLocations.length],
      status: statuses[i % statuses.length],
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
    });
  }
  
  return sampleOrders;
};

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      products: initialProducts,
      orders: generateSampleOrders(),
      locations: initialLocations,
      
      addProduct: (product) => {
        const newProduct: Product = {
          ...product,
          id: `prod-${Date.now()}`,
        };
        set((state) => ({ products: [...state.products, newProduct] }));
      },
      
      updateProduct: (id, updates) => {
        set((state) => ({
          products: state.products.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
      },
      
      deleteProduct: (id) => {
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },
      
      updateOrderStatus: (orderId, status) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status } : o
          ),
        }));
      },
      
      cancelOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.map((o) =>
            o.id === orderId ? { ...o, status: 'CANCELLED' as OrderStatus } : o
          ),
        }));
      },
      
      addLocation: (location) => {
        const newLocation: PickupLocation = {
          ...location,
          id: `loc-${Date.now()}`,
        };
        set((state) => ({ locations: [...state.locations, newLocation] }));
      },
      
      updateLocation: (id, updates) => {
        set((state) => ({
          locations: state.locations.map((l) =>
            l.id === id ? { ...l, ...updates } : l
          ),
        }));
      },
      
      deleteLocation: (id) => {
        set((state) => ({
          locations: state.locations.filter((l) => l.id !== id),
        }));
      },
      
      getStats: () => {
        const orders = get().orders;
        const completedOrders = orders.filter((o) => o.status === 'COMPLETED');
        
        return {
          totalRevenue: completedOrders.reduce((sum, o) => sum + o.total, 0),
          totalOrders: orders.length,
          pendingOrders: orders.filter((o) => ['CREATED', 'CONFIRMED', 'READY_FOR_PICKUP'].includes(o.status)).length,
          completedOrders: completedOrders.length,
          cancelledOrders: orders.filter((o) => o.status === 'CANCELLED').length,
        };
      },
    }),
    {
      name: 'selfdrop-admin',
    }
  )
);
