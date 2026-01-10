import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Check, X, Clock, Package, MapPin, Eye } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Order, OrderStatus } from '@/stores/cartStore';

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string }> = {
  CREATED: { label: 'Pending', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  CONFIRMED: { label: 'Confirmed', color: 'text-info', bgColor: 'bg-info/10' },
  READY_FOR_PICKUP: { label: 'Ready', color: 'text-warning', bgColor: 'bg-warning/10' },
  COMPLETED: { label: 'Completed', color: 'text-success', bgColor: 'bg-success/10' },
  CANCELLED: { label: 'Cancelled', color: 'text-destructive', bgColor: 'bg-destructive/10' },
};

const statusFlow: OrderStatus[] = ['CREATED', 'CONFIRMED', 'READY_FOR_PICKUP', 'COMPLETED'];

export default function AdminOrders() {
  const { orders, updateOrderStatus, cancelOrder } = useAdminStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.pickupLocation.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    updateOrderStatus(orderId, newStatus);
    toast.success(`Order status updated to ${statusConfig[newStatus].label}`);
  };

  const handleCancel = (orderId: string) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      cancelOrder(orderId);
      toast.success('Order cancelled');
    }
  };

  const handleFulfill = (orderId: string) => {
    updateOrderStatus(orderId, 'COMPLETED');
    toast.success('Order fulfilled successfully!');
  };

  const getNextStatus = (currentStatus: OrderStatus): OrderStatus | null => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex >= 0 && currentIndex < statusFlow.length - 1) {
      return statusFlow[currentIndex + 1];
    }
    return null;
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Orders</h1>
        <p className="text-muted-foreground">Manage and fulfill customer orders</p>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-12"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              statusFilter === 'ALL'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            All
          </button>
          {Object.entries(statusConfig).map(([status, config]) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status as OrderStatus)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                statusFilter === status
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              {config.label}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Orders List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {filteredOrders.length === 0 ? (
          <div className="card-elevated p-12 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No orders found</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const status = statusConfig[order.status];
            const nextStatus = getNextStatus(order.status);
            
            return (
              <div key={order.id} className="card-elevated p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  {/* Order Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-foreground">{order.id}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${status.bgColor} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {order.pickupLocation.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        {order.items.length} items
                      </span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">${order.total.toFixed(2)}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrder(order)}
                      className="rounded-lg"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                    
                    {order.status !== 'COMPLETED' && order.status !== 'CANCELLED' && (
                      <>
                        {nextStatus && (
                          <Button
                            size="sm"
                            onClick={() => handleStatusChange(order.id, nextStatus)}
                            className="btn-gradient-primary rounded-lg"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            {nextStatus === 'COMPLETED' ? 'Fulfill' : statusConfig[nextStatus].label}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCancel(order.id)}
                          className="rounded-lg text-destructive border-destructive/30 hover:bg-destructive/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </motion.div>

      {/* Order Details Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 mt-4">
              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusConfig[selectedOrder.status].bgColor} ${statusConfig[selectedOrder.status].color}`}>
                  {statusConfig[selectedOrder.status].label}
                </span>
              </div>

              {/* Items */}
              <div>
                <h4 className="font-semibold text-foreground mb-3">Items</h4>
                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.product.id} className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-10 h-10 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-foreground text-sm">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-sm">${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pickup Location */}
              <div className="p-3 bg-muted/50 rounded-xl">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground">{selectedOrder.pickupLocation.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedOrder.pickupLocation.address}</p>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <span className="font-bold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">${selectedOrder.total.toFixed(2)}</span>
              </div>

              {/* Action Buttons */}
              {selectedOrder.status !== 'COMPLETED' && selectedOrder.status !== 'CANCELLED' && (
                <div className="flex gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleCancel(selectedOrder.id);
                      setSelectedOrder(null);
                    }}
                    className="flex-1 text-destructive border-destructive/30 hover:bg-destructive/10"
                  >
                    Cancel Order
                  </Button>
                  <Button
                    onClick={() => {
                      handleFulfill(selectedOrder.id);
                      setSelectedOrder(null);
                    }}
                    className="flex-1 btn-gradient-primary"
                  >
                    Fulfill Order
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
