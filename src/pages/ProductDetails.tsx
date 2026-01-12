import { useParams, Link, useNavigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Minus, ShoppingBag, Package, Clock, MapPin, Star, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { products } from '@/data/mockData';
import { useCartStore } from '@/stores/cartStore';
import { formatNPR } from '@/lib/currency';
import { toast } from 'sonner';

// Lazy load ProductReviews for better performance
const ProductReviews = lazy(() => import('@/components/ProductReviews'));

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items, addItem, updateQuantity } = useCartStore();
  
  const product = products.find((p) => p.id === id);
  const cartItem = items.find((item) => item.product.id === id);
  const quantity = cartItem?.quantity || 0;

  // Get related products (same category, excluding current)
  const relatedProducts = products
    .filter((p) => p.category === product?.category && p.id !== id)
    .slice(0, 4);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold text-foreground mb-2">Product Not Found</h1>
            <p className="text-muted-foreground mb-6">The product you're looking for doesn't exist.</p>
            <Link to="/products">
              <Button className="btn-gradient-primary rounded-xl">
                Browse Products
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product.name,
        text: product.description,
        url: window.location.href,
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="section-container py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <span>/</span>
            <Link to="/products" className="hover:text-foreground transition-colors">Products</Link>
            <span>/</span>
            <span className="text-foreground">{product.name}</span>
          </nav>
        </div>

        {/* Product Details */}
        <section className="section-container pb-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Product Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="px-4 py-2 bg-background/90 backdrop-blur-sm rounded-full text-sm font-medium text-foreground">
                    {product.category}
                  </span>
                </div>
                {product.stock < 10 && (
                  <div className="absolute top-4 right-4">
                    <span className="px-4 py-2 bg-secondary/90 backdrop-blur-sm rounded-full text-sm font-medium text-secondary-foreground">
                      Only {product.stock} left
                    </span>
                  </div>
                )}
              </div>

              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="absolute top-4 left-4 lg:-left-16 w-10 h-10 rounded-full bg-background shadow-md flex items-center justify-center hover:bg-muted transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            </motion.div>

            {/* Product Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-accent text-accent" />
                    <span>4.8 (120 reviews)</span>
                  </div>
                  <span>•</span>
                  <span>{product.category}</span>
                </div>
              </div>

              <div className="text-3xl font-bold text-primary">
                {formatNPR(product.price)}
              </div>

              <p className="text-muted-foreground text-lg leading-relaxed">
                {product.description}
              </p>

              {/* Stock Status */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                <Package className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-foreground">
                    {product.stock > 20 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {product.stock} units available
                  </p>
                </div>
              </div>

              {/* Features */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <Clock className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Ready in 30 min</p>
                    <p className="text-sm text-muted-foreground">After order confirmation</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-muted/50">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">6 Pickup Locations</p>
                    <p className="text-sm text-muted-foreground">Kathmandu Valley</p>
                  </div>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                {quantity === 0 ? (
                  <Button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="btn-gradient-primary h-14 px-8 text-lg rounded-xl flex-1"
                  >
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Add to Cart
                  </Button>
                ) : (
                  <div className="flex items-center gap-4 bg-muted rounded-xl p-2 flex-1">
                    <button
                      onClick={() => updateQuantity(product.id, quantity - 1)}
                      className="w-12 h-12 rounded-lg bg-background flex items-center justify-center hover:bg-primary/10 transition-colors"
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="flex-1 text-center text-xl font-bold">{quantity} in cart</span>
                    <button
                      onClick={() => updateQuantity(product.id, quantity + 1)}
                      className="w-12 h-12 rounded-lg bg-background flex items-center justify-center hover:bg-primary/10 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                )}
                <Button
                  onClick={handleShare}
                  variant="outline"
                  className="h-14 px-6 rounded-xl"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              {quantity > 0 && (
                <Link to="/cart">
                  <Button variant="outline" className="w-full h-12 rounded-xl border-2">
                    View Cart ({quantity} {quantity === 1 ? 'item' : 'items'})
                  </Button>
                </Link>
              )}
            </motion.div>
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section className="py-12 border-t">
          <div className="section-container">
            <Suspense fallback={
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded w-1/4" />
                <div className="h-4 bg-muted rounded w-1/6" />
              </div>
            }>
              <ProductReviews productId={product.id} productName={product.name} />
            </Suspense>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-12 bg-muted/30">
            <div className="section-container">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8"
              >
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Related Products
                </h2>
                <p className="text-muted-foreground">
                  More from {product.category}
                </p>
              </motion.div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct, index) => (
                  <motion.div
                    key={relatedProduct.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link to={`/product/${relatedProduct.id}`}>
                      <div className="card-product overflow-hidden group cursor-pointer">
                        <div className="relative aspect-square overflow-hidden">
                          <img
                            src={relatedProduct.image}
                            alt={relatedProduct.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-foreground mb-1 line-clamp-1">
                            {relatedProduct.name}
                          </h3>
                          <p className="text-lg font-bold text-primary">
                            {formatNPR(relatedProduct.price)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
