import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Check, X, AlertCircle, Map, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore, Order, OrderStatus } from '@/stores/cartStore';
import { formatNPR } from '@/lib/currency';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LocationMap } from '@/components/LocationMap';

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
  OUT_FOR_DELIVERY: {
    label: 'Out for Delivery',
    icon: <Truck className="w-4 h-4" />,
    className: 'status-ready',
  },
  DELIVERED: {
    label: 'Delivered',
    icon: <Check className="w-4 h-4" />,
    className: 'status-completed',
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
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | undefined>();
  const status = statusConfig[order.status];
  const canCancel = order.status === 'CREATED';

  const handleTrack = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated p-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-lg text-foreground">Order #{order.id.slice(-6).toUpperCase()}</h3>
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
        <div className="flex flex-col items-end gap-2">
          <span className={`status-badge ${status.className}`}>
            {status.icon}
            <span className="ml-1">{status.label}</span>
          </span>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleTrack} className="h-8 gap-2">
                <Map className="w-3.5 h-3.5" />
                Track on Map
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl h-[80vh] flex flex-col p-4">
              <DialogHeader>
                <DialogTitle>Track Order: {order.id}</DialogTitle>
              </DialogHeader>
              <div className="flex-1 w-full rounded-xl overflow-hidden min-h-0 border mt-4">
                <LocationMap
                  userLocation={userLoc || order.deliveryLocation}
                  height="100%"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Delivery Address</p>
                  <p className="text-sm font-medium">{order.deliveryLocation?.address}</p>
                </div>
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  <p className="text-sm font-medium text-primary">{status.label}</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Items */}
      <div className="space-y-2 mb-4">
        {order.items.map((item) => {
          const productId = item.product._id || item.product.id;
          return (
            <div key={productId} className="flex items-center gap-3">
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
                {formatNPR(item.product.price * item.quantity)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Delivery Location */}
      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-xl mb-4">
        <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground leading-snug">{order.deliveryLocation?.address}</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <div>
          <span className="text-sm text-muted-foreground">Total</span>
          <p className="text-xl font-bold text-primary">{formatNPR(order.total)}</p>
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
  const steps: OrderStatus[] = ['CREATED', 'CONFIRMED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'COMPLETED'];
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
                className={`w-10 h-10 rounded-full flex items-center justify-center ${isCompleted
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
                className={`h-1 w-16 sm:w-24 mx-2 rounded ${index < currentIndex ? 'bg-primary' : 'bg-muted'
                  }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
