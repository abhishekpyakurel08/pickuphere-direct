import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, Plus, DollarSign, TrendingUp, ShoppingBag, AlertCircle, CheckCircle, Clock, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { vendorApi, productsApi, ProductData } from '@/services/api';
import { initSocket, subscribeToVendorUpdates, onProductStatusUpdate, onVendorOrder } from '@/services/socket';
import { formatNPR } from '@/lib/currency';
import VendorProductForm from '@/components/VendorProductForm';
import { getAuthToken } from '@/services/api';

interface VendorStats {
  totalProducts: number;
  activeProducts: number;
  pendingProducts: number;
  totalSales: number;
  totalRevenue: number;
  commission: number;
}

export default function VendorDashboard() {
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [products, setProducts] = useState<ProductData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const { toast } = useToast();

  // Fetch vendor data
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statsData, productsData] = await Promise.all([
        vendorApi.getStats(),
        vendorApi.getProducts(),
      ]);
      setStats(statsData);
      setProducts(productsData.products || []);
    } catch (error: any) {
      toast({
        title: 'Failed to load dashboard',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Initialize socket for real-time updates
    const token = getAuthToken();
    if (token) {
      initSocket(token);
      subscribeToVendorUpdates('current');

      const unsubStatus = onProductStatusUpdate((data) => {
        setProducts((prev) =>
          prev.map((p) => (p.id === data.productId ? { ...p, status: data.status as any } : p))
        );
        toast({
          title: 'Product status updated',
          description: `Your product is now ${data.status}`,
        });
      });

      const unsubOrder = onVendorOrder((order) => {
        toast({
          title: 'New order received!',
          description: `Order #${order.id} - ${formatNPR(order.total)}`,
        });
        fetchData(); // Refresh stats
      });

      return () => {
        unsubStatus();
        unsubOrder();
      };
    }
  }, []);

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await productsApi.delete(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast({
        title: 'Product deleted',
        description: 'Your product has been removed',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to delete',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  if (showAddProduct || editingProduct) {
    return (
      <div className="p-6">
        <VendorProductForm
          product={editingProduct || undefined}
          onSuccess={() => {
            setShowAddProduct(false);
            setEditingProduct(null);
            fetchData();
          }}
          onCancel={() => {
            setShowAddProduct(false);
            setEditingProduct(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Vendor Dashboard</h1>
          <p className="text-muted-foreground">Manage your products and track sales</p>
        </div>
        <Button onClick={() => setShowAddProduct(true)} className="w-fit">
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </div>

      {/* Stats Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                <Package className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeProducts} active, {stats.pendingProducts} pending
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <ShoppingBag className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSales}</div>
                <p className="text-xs text-muted-foreground">Orders completed</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatNPR(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">Before commission</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Commission</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.commission}%</div>
                <p className="text-xs text-muted-foreground">After 1 day of sale</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Products Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Products</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        {['all', 'active', 'pending'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            {isLoading ? (
              <div className="grid gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : (
              <div className="grid gap-4">
                {products
                  .filter((p) => tab === 'all' || p.status === tab)
                  .map((product) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <img
                        src={product.image || '/placeholder.svg'}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{product.name}</h3>
                          {getStatusBadge(product.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {product.category} • Stock: {product.stock}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary">{formatNPR(product.price)}</p>
                        <p className="text-xs text-muted-foreground">
                          {product.averageRating ? `★ ${product.averageRating.toFixed(1)}` : 'No reviews'}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id!)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}

                {products.filter((p) => tab === 'all' || p.status === tab).length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No products found</p>
                    <Button
                      variant="link"
                      onClick={() => setShowAddProduct(true)}
                      className="mt-2"
                    >
                      Add your first product
                    </Button>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Commission Notice */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <h3 className="font-semibold">Commission Structure</h3>
              <p className="text-sm text-muted-foreground mt-1">
                A 3% commission is applied to each sale after the product has been sold for 1 day.
                This helps maintain the platform and provides support services.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
