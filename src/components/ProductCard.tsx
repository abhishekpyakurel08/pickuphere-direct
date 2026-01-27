import { Link } from 'react-router-dom';
import { Product } from '@/stores/cartStore';
import { useCartStore } from '@/stores/cartStore';
import { motion } from 'framer-motion';
import { Plus, Minus, ShoppingBag, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { formatNPR } from '@/lib/currency';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const cartItem = items.find((item) => item.product.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    addItem(product);
    toast.success(`${product.name} added to cart!`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="card-product overflow-hidden group"
    >
      {/* Image */}
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-square overflow-hidden cursor-pointer">
          <img
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="px-4 py-2 bg-background/90 backdrop-blur-sm rounded-full text-sm font-medium text-foreground flex items-center gap-2">
              <Eye className="w-4 h-4" />
              View Details
            </span>
          </div>
          <div className="absolute top-3 left-3">
            <span className="px-3 py-1 bg-background/90 backdrop-blur-sm rounded-full text-xs font-medium text-foreground">
              {product.category}
            </span>
          </div>
          {product.stock < 10 && (
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1 bg-secondary/90 backdrop-blur-sm rounded-full text-xs font-medium text-secondary-foreground">
                Only {product.stock} left
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground text-lg mb-1 line-clamp-1">
          {product.name}
        </h3>
        <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            {formatNPR(product.price)}
          </span>

          {quantity === 0 ? (
            <Button
              onClick={handleAddToCart}
              className="btn-gradient-primary rounded-xl px-4 py-2 flex items-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" />
              Add
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-muted rounded-xl p-1">
              <button
                onClick={() => updateQuantity(product.id, quantity - 1)}
                className="w-8 h-8 rounded-lg bg-background flex items-center justify-center hover:bg-primary/10 transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-semibold">{quantity}</span>
              <button
                onClick={() => updateQuantity(product.id, quantity + 1)}
                className="w-8 h-8 rounded-lg bg-background flex items-center justify-center hover:bg-primary/10 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
