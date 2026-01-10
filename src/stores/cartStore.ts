import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: string;
  stock: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  hours: string;
}

export type OrderStatus = 'CREATED' | 'CONFIRMED' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  pickupLocation: PickupLocation;
  status: OrderStatus;
  createdAt: Date;
  estimatedReadyTime?: string;
}

interface CartStore {
  items: CartItem[];
  selectedLocation: PickupLocation | null;
  orders: Order[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setSelectedLocation: (location: PickupLocation | null) => void;
  getTotal: () => number;
  getItemCount: () => number;
  placeOrder: () => Order | null;
  cancelOrder: (orderId: string) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      selectedLocation: null,
      orders: [],

      addItem: (product) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.product.id === product.id);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + 1 }
                  : item
              ),
            };
          }
          return { items: [...state.items, { product, quantity: 1 }] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [], selectedLocation: null }),

      setSelectedLocation: (location) => set({ selectedLocation: location }),

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      placeOrder: () => {
        const { items, selectedLocation, getTotal } = get();
        if (items.length === 0 || !selectedLocation) return null;

        const order: Order = {
          id: `ORD-${Date.now()}`,
          items: [...items],
          total: getTotal(),
          pickupLocation: selectedLocation,
          status: 'CREATED',
          createdAt: new Date(),
          estimatedReadyTime: '30-45 minutes',
        };

        set((state) => ({
          orders: [order, ...state.orders],
          items: [],
          selectedLocation: null,
        }));

        return order;
      },

      cancelOrder: (orderId) => {
        set((state) => ({
          orders: state.orders.map((order) =>
            order.id === orderId && order.status === 'CREATED'
              ? { ...order, status: 'CANCELLED' as OrderStatus }
              : order
          ),
        }));
      },
    }),
    {
      name: 'selfdrop-cart',
    }
  )
);
