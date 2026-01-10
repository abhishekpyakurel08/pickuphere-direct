import { motion } from 'framer-motion';
import { Package, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { OrderCard } from '@/components/OrderCard';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';

const Orders = () => {
  const { orders } = useCartStore();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              My Orders
            </h1>
            <p className="text-muted-foreground text-lg">
              Track and manage your orders
            </p>
          </motion.div>

          {orders.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {orders.map((order, index) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <OrderCard order={order} />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">No orders yet</h2>
              <p className="text-muted-foreground mb-6">
                Start shopping to place your first order
              </p>
              <Link to="/products">
                <Button className="btn-gradient-primary rounded-xl">
                  Browse Products
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Orders;
