import { motion } from 'framer-motion';
import { 
  DollarSign, 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Package,
  MapPin
} from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function AdminDashboard() {
  const { orders, products, locations, getStats } = useAdminStore();
  const stats = getStats();

  // Pie chart data for order status
  const orderStatusData = [
    { name: 'Pending', value: orders.filter(o => o.status === 'CREATED').length, color: '#94a3b8' },
    { name: 'Confirmed', value: orders.filter(o => o.status === 'CONFIRMED').length, color: '#3b82f6' },
    { name: 'Ready', value: orders.filter(o => o.status === 'READY_FOR_PICKUP').length, color: '#f59e0b' },
    { name: 'Completed', value: orders.filter(o => o.status === 'COMPLETED').length, color: '#22c55e' },
    { name: 'Cancelled', value: orders.filter(o => o.status === 'CANCELLED').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Pie chart data for orders by location
  const locationOrderData = locations.map(loc => ({
    name: loc.name.split(' ')[0],
    value: orders.filter(o => o.pickupLocation.id === loc.id).length,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`,
  })).filter(d => d.value > 0);

  // Revenue by location
  const revenueByLocation = locations.map(loc => {
    const locationOrders = orders.filter(o => o.pickupLocation.id === loc.id && o.status === 'COMPLETED');
    return {
      name: loc.name,
      revenue: locationOrders.reduce((sum, o) => sum + o.total, 0),
      orders: locationOrders.length,
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const statCards = [
    {
      title: 'Total Revenue',
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-success/10 text-success',
      change: '+12%',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: 'bg-primary/10 text-primary',
      change: '+8%',
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: Clock,
      color: 'bg-warning/10 text-warning',
    },
    {
      title: 'Completed',
      value: stats.completedOrders,
      icon: CheckCircle,
      color: 'bg-success/10 text-success',
    },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store performance</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-elevated p-6"
          >
            <div className="flex items-start justify-between">
              <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                <stat.icon className="w-6 h-6" />
              </div>
              {stat.change && (
                <span className="flex items-center text-sm text-success font-medium">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold text-foreground mt-4">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Order Status Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-elevated p-6"
        >
          <h3 className="text-lg font-bold text-foreground mb-4">Orders by Status</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Orders by Location Pie Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-elevated p-6"
        >
          <h3 className="text-lg font-bold text-foreground mb-4">Orders by Location</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={locationOrderData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {locationOrderData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`hsl(${162 + index * 30}, 70%, ${45 + index * 5}%)`} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Revenue by Location */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="card-elevated p-6"
      >
        <h3 className="text-lg font-bold text-foreground mb-4">Revenue by Location</h3>
        <div className="space-y-4">
          {revenueByLocation.map((loc, index) => (
            <div key={loc.name} className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{loc.name}</p>
                <p className="text-sm text-muted-foreground">{loc.orders} orders</p>
              </div>
              <span className="font-bold text-primary">${loc.revenue.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card-elevated p-6 text-center"
        >
          <Package className="w-8 h-8 text-primary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{products.length}</p>
          <p className="text-sm text-muted-foreground">Total Products</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="card-elevated p-6 text-center"
        >
          <MapPin className="w-8 h-8 text-secondary mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{locations.length}</p>
          <p className="text-sm text-muted-foreground">Pickup Locations</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card-elevated p-6 text-center"
        >
          <XCircle className="w-8 h-8 text-destructive mx-auto mb-2" />
          <p className="text-2xl font-bold text-foreground">{stats.cancelledOrders}</p>
          <p className="text-sm text-muted-foreground">Cancelled Orders</p>
        </motion.div>
      </div>
    </div>
  );
}
