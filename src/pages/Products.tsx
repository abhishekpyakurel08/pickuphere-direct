import { SEO } from '@/components/SEO';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, PackageOpen } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProductCard } from '@/components/ProductCard';
import { categories } from '@/data/mockData';
import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import { ProductGridSkeleton } from '@/components/ProductSkeleton';

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/products');
      // Ensure backend products match frontend Product shape
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

  const filteredProducts = products.filter((product: any) => {
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title={selectedCategory === 'All' ? "Premium Collection | Elite Spirits & Snacks" : `${selectedCategory} Collection | Premium Selection`}
        description={selectedCategory === 'All'
          ? "Browse our curated selection of international whiskeys, local spirits, and savory snacks. All items are authorized and available for rapid home delivery."
          : `Explore the finest ${selectedCategory.toLowerCase()} selection at Daru Hunting. Premium quality products delivered over Kathmandu in 30 minutes.`
        }
        url="https://daruhunting.com.np/products"
      />
      <Navbar />

      <main className="flex-1 py-8">
        <div className="section-container">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">
              All Products
            </h1>
            <p className="text-muted-foreground text-lg">
              Authorized premium selection ready for you
            </p>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 space-y-4"
          >
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12"
              />
            </div>

            {/* Categories */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${selectedCategory === category
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Products Grid */}
          {isLoading ? (
            <ProductGridSkeleton />
          ) : filteredProducts.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product: any, index: number) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 bg-muted/20 rounded-3xl border-2 border-dashed border-border/50"
            >
              <PackageOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-bold text-foreground mb-2">No products found</h3>
              <p className="text-muted-foreground text-lg">
                Try a different search or category to continue your hunt.
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Products;
