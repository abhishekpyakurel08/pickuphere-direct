import { Order, OrderStatus } from '@/stores/cartStore';
import { motion } from 'framer-motion';
import { Package, MapPin, Clock, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';

interface OrderCardProps {
  order: Order;
}

const statusConfig: Record<OrderStatus, { label: string; icon: React.ReactNode; className: string }> = {
  CREATED: {
    label: 'Order Placed',
    icon: <Clock className="w-4 h-4" />,
    className: 'status-created',
  },
  CONFIRMED: {
    label: 'Confirmed',
    icon: <Check className="w-4 h-4" />,
    className: 'status-confirmed',
  },
  READY_FOR_PICKUP: {
    label: 'Ready for Pickup',
    icon: <Package className="w-4 h-4" />,
    className: 'status-ready',
  },
  COMPLETED: {
    label: 'Completed',
    icon: <Check className="w-4 h-4" />,
    className: 'status-completed',
  },
  CANCELLED: {
    label: 'Cancelled',
    icon: <X className="w-4 h-4" />,
    className: 'status-cancelled',
  },
};

export function OrderCard({ order }: OrderCardProps) {
  const { cancelOrder } = useCartStore();
  const status = statusConfig[order.status];
  const canCancel = order.status === 'CREATED';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-foreground">{order.id}</h3>
          <p className="text-sm text-muted-foreground">
            {new Date(order.createdAt).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
            })}
          </p>
        </div>
        <span className={`status-badge ${status.className}`}>
          {status.icon}
          <span className="ml-1">{status.label}</span>
        </span>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4">
        {order.items.map((item) => (
          <div key={item.product.id} className="flex items-center gap-3">
            <img
              src={item.product.image}
              alt={item.product.name}
              className="w-12 h-12 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground line-clamp-1">{item.product.name}</p>
              <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
            </div>
            <span className="font-semibold text-foreground">
              ${(item.product.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Pickup Location */}
      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl mb-4">
        <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-foreground">{order.pickupLocation.name}</p>
          <p className="text-sm text-muted-foreground">{order.pickupLocation.address}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          <span className="text-sm text-muted-foreground">Total</span>
          <p className="text-xl font-bold text-primary">${order.total.toFixed(2)}</p>
        </div>
        {canCancel && (
          <Button
            variant="outline"
            onClick={() => cancelOrder(order.id)}
            className="text-destructive border-destructive/30 hover:bg-destructive/10"
          >
            Cancel Order
          </Button>
        )}
      </div>
    </motion.div>
  );
}

export function OrderStatusTracker({ status }: { status: OrderStatus }) {
  const steps: OrderStatus[] = ['CREATED', 'CONFIRMED', 'READY_FOR_PICKUP', 'COMPLETED'];
  const currentIndex = steps.indexOf(status);
  const isCancelled = status === 'CANCELLED';

  if (isCancelled) {
    return (
      <div className="flex items-center justify-center gap-2 p-4 bg-destructive/10 rounded-xl">
        <AlertCircle className="w-5 h-5 text-destructive" />
        <span className="font-medium text-destructive">Order Cancelled</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const config = statusConfig[step];

        return (
          <div key={step} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                } ${isCurrent ? 'ring-4 ring-primary/20' : ''}`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : config.icon}
              </div>
              <span className={`text-xs mt-2 ${isCompleted ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                {config.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`h-1 w-16 sm:w-24 mx-2 rounded ${
                  index < currentIndex ? 'bg-primary' : 'bg-muted'
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
