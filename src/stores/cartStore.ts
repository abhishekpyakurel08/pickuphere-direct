import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Product {
  _id?: string;
  id?: string;
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

export type OrderStatus = 'CREATED' | 'CONFIRMED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  orderType: 'DELIVERY';
  deliveryLocation: { address: string; lat: number; lng: number; area?: string };
  status: OrderStatus;
  createdAt: Date;
}

interface CartStore {
  items: CartItem[];
  orders: Order[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  deliveryLocation: { address: string; lat: number; lng: number; area?: string } | null;
  deliveryCharge: number;
  setDeliveryLocation: (location: { address: string; lat: number; lng: number; area?: string } | null) => void;
  setDeliveryCharge: (charge: number) => void;
  getTotal: () => number;
  getItemCount: () => number;
  placeOrder: () => Promise<Order | null>;
  cancelOrder: (orderId: string) => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      deliveryLocation: null,
      deliveryCharge: 0,
      orders: [],

      addItem: (product) => {
        set((state) => {
          const productId = product._id || product.id;
          const existingItem = state.items.find((item) => (item.product._id || item.product.id) === productId);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                (item.product._id || item.product.id) === productId
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
          items: state.items.filter((item) => (item.product._id || item.product.id) !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            (item.product._id || item.product.id) === productId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [], deliveryLocation: null, deliveryCharge: 0 }),

      setDeliveryLocation: (location) => set({ deliveryLocation: location }),

      setDeliveryCharge: (charge: number) => set({ deliveryCharge: charge }),

      getTotal: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },

      placeOrder: async () => {
        const { items, deliveryLocation } = get();
        if (items.length === 0 || !deliveryLocation) return null;

        try {
          const { default: api } = await import('@/services/api');

          const orderPayload = {
            items: items.map(item => ({
              product: item.product._id || item.product.id,
              quantity: item.quantity
            })),
            deliveryLocation,
          };

          const response = await api.post('/orders', orderPayload);
          const newOrders = Array.isArray(response.data) ? response.data : [response.data];

          set((state) => ({
            orders: [...newOrders, ...state.orders],
            items: [],
            deliveryLocation: null,
            deliveryCharge: 0,
          }));

          return newOrders[0];
        } catch (error) {
          console.error("Failed to place order", error);
          return null;
        }
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
