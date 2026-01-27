import { SEO } from '@/components/SEO';
import { LocationSearch } from '@/components/LocationSearch';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Clock, ShoppingBag, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { ProductSkeleton } from '@/components/ProductSkeleton';

// AnimatedText component: word-by-word animation
const AnimatedText = ({ text }: { text: string }) => {
  return (
    <motion.div
      className="inline-flex flex-wrap"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.1 } },
      }}
    >
      {text.split(' ').map((word, index) => (
        <motion.span
          key={index}
          className="inline-block mr-1"
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.5 }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

// Animated Product Card with hover scale + shadow
const AnimatedProductCard = ({ product, index }: any) => {
  return (
    <motion.div
      className="bg-card rounded-2xl overflow-hidden shadow-md cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{
        scale: 1.05,
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        transition: { type: 'spring', stiffness: 300, damping: 20 },
      }}
    >
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="font-bold text-lg text-foreground">{product.name}</h3>
        <p className="text-muted-foreground mt-1">{product.description}</p>
        <p className="font-semibold text-primary mt-2">Rs {product.price}</p>
      </div>
    </motion.div>
  );
};

const Index = () => {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/products');
      return res.data.map((p: any) => ({
        id: p._id,
        name: p.name,
        description: p.description,
        price: p.price,
        image: p.image,
        category: p.category,
        stock: p.stock
      }));
    }
  });

  const featuredProducts = products.slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Daru Hunting | Premium Spirits & Adventure Delivered"
        description="Experience elite liquor delivery in Kathmandu. Premium whiskeys, wines, and local treasures delivered safely to your doorstep in 30 minutes. Join the hunt for perfection."
        keywords="daru delivery kathmandu, online liquor store nepal, whiskey home delivery, wine shop kathmandu, rapid alcohol delivery"
      />
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
                <Truck className="w-4 h-4" />
                Rapid Doorstep Delivery
              </span>

              {/* Hero Title */}
              <h1 className="hero-title text-foreground mb-6 text-4xl lg:text-5xl font-bold">
                <AnimatedText text="Premium Spirits Hunted & Delivered To You" />
              </h1>

              {/* Hero Subtitle */}
              <motion.p
                className="hero-subtitle mb-8 text-lg text-muted-foreground max-w-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
              >
                The hunt for perfection ends here. Discover elite whiskeys, wines, and local treasures from our curated cellar, delivered safely to Kathmandu's finest homes.
              </motion.p>

              {/* Buttons */}
              <motion.div
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
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
              </motion.div>

              <motion.div
                className="mt-8 max-w-md"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.6 }}
              >
                <p className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  Check delivery availability
                </p>
                <LocationSearch
                  onSelect={(lat, lng, address) => {
                    localStorage.setItem('userLocation', JSON.stringify({ lat, lng, address }));
                    window.dispatchEvent(new CustomEvent('location-changed', {
                      detail: { lat, lng, address }
                    }));
                  }}
                  placeholder="Where should we deliver?"
                />
              </motion.div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1000&h=800&fit=crop"
                  alt="Elite spirits selection"
                  className="w-full h-[450px] lg:h-[600px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
              </div>

              {/* Floating card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute -bottom-6 -left-6 bg-card p-4 rounded-2xl shadow-elevated border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground">Delivery in 30 min</p>
                    <p className="text-sm text-muted-foreground">Across Kathmandu Valley</p>
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
            <motion.h2
              className="text-3xl lg:text-4xl font-bold text-foreground mb-4"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              How It Works
            </motion.h2>
            <motion.p
              className="text-muted-foreground text-lg max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Three simple steps to get your order
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: ShoppingBag,
                title: 'Curate Your Order',
                description: 'Explore our curated catalog of elite beverages and add them to your cart.',
              },
              {
                icon: MapPin,
                title: 'Set Delivery Point',
                description: 'Pin your exact location on our map so our riders can find you quickly.',
              },
              {
                icon: Truck,
                title: 'Real-time Tracking',
                description: 'Sit back and relax. Track your order live as it makes its way to you.',
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
                Premium selections for discerning tastes
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
            {isLoading ? (
              [...Array(4)].map((_, i) => <ProductSkeleton key={i} />)
            ) : featuredProducts.map((product: any, index: number) => (
              <AnimatedProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
