import { useState } from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, TrendingUp, TrendingDown, Search, Filter } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { Button } from '@/components/ui/button';
import { formatNPR } from '@/lib/currency';

export default function AdminInventory() {
  const { products, updateProduct } = useAdminStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'low' | 'out'>('all');

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());

    if (filter === 'low') return matchesSearch && p.stock > 0 && p.stock <= 20;
    if (filter === 'out') return matchesSearch && p.stock === 0;
    return matchesSearch;
  });

  const stats = {
    totalProducts: products.length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock <= 20).length,
    outOfStock: products.filter((p) => p.stock === 0).length,
    totalValue: products.reduce((sum, p) => sum + p.price * p.stock, 0),
  };

  const handleStockUpdate = (productId: string, newStock: number) => {
    if (newStock >= 0) {
      updateProduct(productId, { stock: newStock });
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Inventory Management</h1>
        <p className="text-muted-foreground">Track and manage your product stock levels</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Products',
            value: stats.totalProducts,
            icon: Package,
            color: 'text-primary',
            bg: 'bg-primary/10',
          },
          {
            label: 'Low Stock Items',
            value: stats.lowStock,
            icon: TrendingDown,
            color: 'text-warning',
            bg: 'bg-warning/10',
          },
          {
            label: 'Out of Stock',
            value: stats.outOfStock,
            icon: AlertTriangle,
            color: 'text-destructive',
            bg: 'bg-destructive/10',
          },
          {
            label: 'Total Inventory Value',
            value: formatNPR(stats.totalValue),
            icon: TrendingUp,
            color: 'text-success',
            bg: 'bg-success/10',
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-elevated p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-12"
          />
        </div>
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'All Products' },
            { value: 'low', label: 'Low Stock' },
            { value: 'out', label: 'Out of Stock' },
          ].map((f) => (
            <Button
              key={f.value}
              variant={filter === f.value ? 'default' : 'outline'}
              onClick={() => setFilter(f.value as typeof filter)}
              className="rounded-xl"
            >
              <Filter className="w-4 h-4 mr-2" />
              {f.label}
            </Button>
          ))}
        </div>
      </motion.div>

      {/* Inventory Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="card-elevated overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Product</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Category</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Price</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Stock</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Status</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">Value</th>
                <th className="text-right px-6 py-4 text-sm font-semibold text-foreground">Quick Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                      <p className="font-medium text-foreground">{product.name}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-muted text-sm font-medium">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-semibold text-primary">
                    {formatNPR(product.price)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`font-medium ${
                        product.stock === 0
                          ? 'text-destructive'
                          : product.stock <= 20
                          ? 'text-warning'
                          : 'text-foreground'
                      }`}
                    >
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {product.stock === 0 ? (
                      <span className="status-badge status-cancelled">Out of Stock</span>
                    ) : product.stock <= 20 ? (
                      <span className="status-badge status-ready">Low Stock</span>
                    ) : (
                      <span className="status-badge status-completed">In Stock</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-foreground">
                    {formatNPR(product.price * product.stock)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleStockUpdate(product.id, product.stock - 1)}
                        className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center font-bold transition-colors"
                        disabled={product.stock === 0}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={product.stock}
                        onChange={(e) => handleStockUpdate(product.id, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-center rounded-lg border border-input bg-background"
                        min="0"
                      />
                      <button
                        onClick={() => handleStockUpdate(product.id, product.stock + 1)}
                        className="w-8 h-8 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 flex items-center justify-center font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No products found matching your criteria</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
