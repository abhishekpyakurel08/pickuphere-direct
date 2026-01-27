import { motion } from 'framer-motion';
import { Package, ArrowRight, Truck, Clock, CheckCircle, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { OrderCard } from '@/components/OrderCard';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';

export default function Orders() {
  const { orders } = useCartStore();

  // Find most recent active order
  const activeOrder = orders.find(o => ['CREATED', 'CONFIRMED', 'OUT_FOR_DELIVERY'].includes(o.status));

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8 lg:py-12">
        <div className="section-container max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-10 text-center md:text-left"
          >
            <h1 className="text-4xl font-black text-foreground tracking-tight mb-2">
              Order Tracking
            </h1>
            <p className="text-muted-foreground text-lg italic">
              Real-time updates on your premium deliveries
            </p>
          </motion.div>

          {activeOrder && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-12 p-6 rounded-3xl bg-primary/5 border border-primary/20 shadow-xl overflow-hidden relative"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[80px] -mr-32 -mt-32 rounded-full" />
              <div className="relative flex flex-col md:flex-row items-center gap-6 justify-between">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 animate-pulse">
                    <Truck className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-foreground uppercase tracking-wider">Active Delivery</h2>
                    <p className="text-primary font-bold">Order #{activeOrder.id.slice(-6).toUpperCase()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-12 w-full md:w-auto px-4 md:px-0">
                  <div className="flex-1 text-center md:text-right">
                    <p className="text-xs font-black text-muted-foreground uppercase mb-1">Current Status</p>
                    <p className="text-lg font-black text-foreground tracking-tight flex items-center justify-center md:justify-end gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                      {activeOrder.status.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {orders.length > 0 ? (
            <div className="space-y-8">
              <h3 className="text-xl font-bold text-foreground border-b pb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order History
              </h3>
              <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
                {orders.map((order, index) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <OrderCard order={order} />
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-24 bg-muted/20 rounded-[40px] border border-dashed border-muted-foreground/30"
            >
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-8">
                <Package className="w-12 h-12 text-muted-foreground opacity-30" />
              </div>
              <h2 className="text-3xl font-black text-foreground mb-3 uppercase tracking-tighter">Your Bag is Empty</h2>
              <p className="text-muted-foreground mb-10 max-w-sm mx-auto font-medium">
                Savor the moment. Start by selecting your favorite spirits from our collection.
              </p>
              <Link to="/products">
                <Button className="btn-gradient-primary h-14 px-10 text-lg rounded-2xl font-black shadow-lg shadow-primary/20">
                  Curate My Order
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
