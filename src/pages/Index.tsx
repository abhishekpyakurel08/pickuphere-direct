import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Clock, ShoppingBag, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { products, pickupLocations } from '@/data/mockData';

const Index = () => {
  const featuredProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="section-container py-20 lg:py-32 relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6">
                <MapPin className="w-4 h-4" />
                Self-pickup made simple
              </span>
              <h1 className="hero-title text-foreground mb-6">
                Order Online,{' '}
                <span className="text-gradient-primary">Pick Up</span> Your Way
              </h1>
              <p className="hero-subtitle mb-8">
                Skip the delivery wait. Order fresh products from local vendors and pick them up at your convenience from our network of locations.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products">
                  <Button className="btn-gradient-primary h-12 px-8 text-lg rounded-xl">
                    Browse Products
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
                <Link to="/orders">
                  <Button variant="outline" className="h-12 px-8 text-lg rounded-xl border-2">
                    Track Order
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&h=600&fit=crop"
                  alt="Fresh groceries"
                  className="w-full h-[400px] lg:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
              </div>
              
              {/* Floating card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="absolute -bottom-6 -left-6 bg-card p-4 rounded-2xl shadow-elevated border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Clock className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Ready in 30 min</p>
                    <p className="text-sm text-muted-foreground">Average prep time</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Three simple steps to get your order
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShoppingBag,
                title: 'Browse & Order',
                description: 'Choose from our selection of fresh products and add them to your cart.',
              },
              {
                icon: MapPin,
                title: 'Select Location',
                description: 'Pick your nearest pickup point from our interactive map.',
              },
              {
                icon: Truck,
                title: 'Pick Up',
                description: 'Collect your order when ready. No waiting, no delivery fees.',
              },
            ].map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground font-bold flex items-center justify-center mx-auto -mt-12 mb-4 text-sm border-4 border-background">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-10"
          >
            <div>
              <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                Featured Products
              </h2>
              <p className="text-muted-foreground text-lg">
                Fresh picks from local vendors
              </p>
            </div>
            <Link to="/products">
              <Button variant="ghost" className="text-primary hover:text-primary/80">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Pickup Locations Preview */}
      <section className="py-20 bg-muted/30">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Pickup Locations
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
              {pickupLocations.length} convenient locations across the city
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {pickupLocations.slice(0, 3).map((location, index) => (
              <motion.div
                key={location.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-elevated p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground mb-1">{location.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{location.address}</p>
                    <div className="flex items-center gap-1 text-sm text-primary">
                      <Clock className="w-3 h-3" />
                      <span>{location.hours}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-8"
          >
            <Link to="/cart">
              <Button className="btn-gradient-primary rounded-xl">
                View All Locations in Cart
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
