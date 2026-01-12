// Socket.IO Client for Real-time Updates
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_BACKEND_API_URL?.replace('/api', '') || 'http://localhost:5000';

let socket: Socket | null = null;

// Initialize socket connection
export const initSocket = (token?: string) => {
  if (socket?.connected) return socket;

  socket = io(SOCKET_URL, {
    auth: token ? { token } : undefined,
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.log('🔌 Socket connected:', socket?.id);
  });

  socket.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected:', reason);
  });

  socket.on('connect_error', (error) => {
    console.error('🔌 Socket connection error:', error.message);
  });

  return socket;
};

// Get socket instance
export const getSocket = () => socket;

// Disconnect socket
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// ============ PRODUCT SUBSCRIPTIONS ============
export const subscribeToProduct = (productId: string) => {
  if (!socket) return;
  socket.emit('join_product', productId);
};

export const unsubscribeFromProduct = (productId: string) => {
  if (!socket) return;
  socket.emit('leave_product', productId);
};

// Listen for new reviews on a product
export const onNewReview = (callback: (review: any) => void) => {
  if (!socket) return () => {};
  socket.on('new_review', callback);
  return () => socket?.off('new_review', callback);
};

// Listen for rating updates
export const onRatingUpdate = (callback: (data: { productId: string; averageRating: number; totalReviews: number }) => void) => {
  if (!socket) return () => {};
  socket.on('rating_updated', callback);
  return () => socket?.off('rating_updated', callback);
};

// Listen for helpful vote updates
export const onHelpfulUpdate = (callback: (data: { reviewId: string; helpfulCount: number }) => void) => {
  if (!socket) return () => {};
  socket.on('helpful_updated', callback);
  return () => socket?.off('helpful_updated', callback);
};

// ============ ORDER SUBSCRIPTIONS ============
export const subscribeToOrder = (orderId: string) => {
  if (!socket) return;
  socket.emit('join_order', orderId);
};

export const unsubscribeFromOrder = (orderId: string) => {
  if (!socket) return;
  socket.emit('leave_order', orderId);
};

// Listen for order status updates
export const onOrderStatusUpdate = (callback: (data: { orderId: string; status: string; message?: string }) => void) => {
  if (!socket) return () => {};
  socket.on('order_status_updated', callback);
  return () => socket?.off('order_status_updated', callback);
};

// ============ ADMIN SUBSCRIPTIONS ============
export const subscribeToAdminUpdates = () => {
  if (!socket) return;
  socket.emit('join_admin');
};

// Listen for new orders (admin)
export const onNewOrder = (callback: (order: any) => void) => {
  if (!socket) return () => {};
  socket.on('new_order', callback);
  return () => socket?.off('new_order', callback);
};

// Listen for vendor applications (admin)
export const onVendorApplication = (callback: (vendor: any) => void) => {
  if (!socket) return () => {};
  socket.on('vendor_application', callback);
  return () => socket?.off('vendor_application', callback);
};

// ============ VENDOR SUBSCRIPTIONS ============
export const subscribeToVendorUpdates = (vendorId: string) => {
  if (!socket) return;
  socket.emit('join_vendor', vendorId);
};

// Listen for product status updates (vendor)
export const onProductStatusUpdate = (callback: (data: { productId: string; status: string }) => void) => {
  if (!socket) return () => {};
  socket.on('product_status_updated', callback);
  return () => socket?.off('product_status_updated', callback);
};

// Listen for new orders for vendor's products
export const onVendorOrder = (callback: (order: any) => void) => {
  if (!socket) return () => {};
  socket.on('vendor_order', callback);
  return () => socket?.off('vendor_order', callback);
};
