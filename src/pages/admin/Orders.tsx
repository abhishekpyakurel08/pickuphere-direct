import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Check, Clock, Package, Eye, Truck } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

const statusConfig: any = {
  CREATED: { label: 'Pending', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  CONFIRMED: { label: 'Confirmed', color: 'text-info', bgColor: 'bg-info/10' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: 'text-warning', bgColor: 'bg-warning/10' },
  DELIVERED: { label: 'Delivered', color: 'text-success', bgColor: 'bg-success/10' },
  COMPLETED: { label: 'Completed', color: 'text-success', bgColor: 'bg-success/10' },
  CANCELLED: { label: 'Cancelled', color: 'text-destructive', bgColor: 'bg-destructive/10' },
};

const statusFlow = ['CREATED', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED', 'CANCELLED'];

export default function AdminOrders() {
  const { orders, fetchOrders, updateOrderStatus } = useAdminStore();
  const [search, setSearch] = useState('');
  const [statusFilter] = useState<string | 'ALL'>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch = order._id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Order status updated to ${statusConfig[newStatus].label}`);
    } catch (e) {
      toast.error('Failed to update status');
    }
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex >= 0 && currentIndex < statusFlow.length - 1 && currentStatus !== 'CANCELLED' && currentStatus !== 'COMPLETED') {
      return statusFlow[currentIndex + 1];
    }
    return null;
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-foreground mb-2">Global Orders</h1>
        <p className="text-muted-foreground">Manage and track all orders in the system</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-12"
          />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="card-elevated p-12 text-center text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>No orders found in database</p>
          </div>
        ) : (
          filteredOrders.map((order: any) => {
            const status = statusConfig[order.status] || statusConfig.CREATED;
            const nextStatus = getNextStatus(order.status);

            return (
              <div key={order._id} className="card-elevated p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-foreground text-sm">#{order._id.slice(-6).toUpperCase()}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${status.bgColor} ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">Rs {order.total.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)} className="rounded-lg h-8 text-xs">
                      <Eye className="w-3 h-3 mr-1" /> View
                    </Button>
                    {nextStatus && (
                      <Button size="sm" onClick={() => handleStatusChange(order._id, nextStatus)} className="btn-gradient-primary rounded-lg h-8 text-xs">
                        <Check className="w-3 h-3 mr-1" /> {statusConfig[nextStatus].label}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </motion.div>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Order Details</DialogTitle></DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 mt-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-bold">{selectedOrder.user?.name || 'Guest'}</span>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Items</h4>
                {selectedOrder.items.map((item: any) => (
                  <div key={item._id} className="flex justify-between text-sm p-2 bg-muted/50 rounded-lg">
                    <span>{item.product?.name} x {item.quantity}</span>
                    <span className="font-bold">Rs {item.price * item.quantity}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t mt-4">
                <span className="text-muted-foreground text-sm">Delivery Address</span>
                <span className="font-medium text-sm flex items-center gap-2 text-primary">
                  {selectedOrder.deliveryLocation?.address}
                </span>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <span className="font-bold">Total</span>
                <span className="text-xl font-bold text-primary">Rs {selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
