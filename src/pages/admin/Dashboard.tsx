import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Truck
} from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { formatNPR } from '@/lib/currency';
import { DashboardSkeleton } from '@/components/admin/DashboardSkeleton';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminDashboard() {
  const { stats, fetchStats, loading } = useAdminStore();

  useEffect(() => {
    fetchStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  if (!stats || loading) return <DashboardSkeleton />;

  const financialCards = [
    {
      title: 'Gross Revenue',
      value: formatNPR(stats.totalRevenue),
      icon: DollarSign,
      color: 'bg-emerald-500/10 text-emerald-500',
      description: 'Total sales + delivery',
      trend: '+14.2%',
      isUp: true
    },
    {
      title: 'Total Expenses',
      value: formatNPR(stats.totalExpenses),
      icon: Activity,
      color: 'bg-rose-500/10 text-rose-500',
      description: 'Operational costs',
      trend: '+2.4%',
      isUp: false
    },
    {
      title: 'Net Profit',
      value: formatNPR(stats.netProfit),
      icon: TrendingUp,
      color: 'bg-primary/10 text-primary',
      description: 'Bottom line earnings',
      trend: '+18.5%',
      isUp: true
    },
    {
      title: 'Delivery Revenue',
      value: formatNPR(stats.deliveryRevenue),
      icon: Truck,
      color: 'bg-blue-500/10 text-blue-500',
      description: 'Shipping fees collected',
      trend: '+5.1%',
      isUp: true
    }
  ];

  const operationalStats = [
    { label: 'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color: 'text-indigo-500' },
    { label: 'Pending', value: stats.pendingOrders, icon: Clock, color: 'text-amber-500' },
    { label: 'Completed', value: stats.completedOrders, icon: CheckCircle, color: 'text-emerald-500' },
    { label: 'Customers', value: stats.totalUsers, icon: Users, color: 'text-blue-500' },
  ];

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-black text-foreground tracking-tight">Store Performance Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-lg">Real-time store tracking and financial insights</p>
        </div>
        <div className="flex gap-3">
          <div className="px-4 py-2 bg-muted rounded-xl border flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-medium">System Live</span>
          </div>
        </div>
      </motion.div>

      {/* Financial Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {financialCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="card-elevated p-6 relative overflow-hidden group hover:border-primary/50 transition-all cursor-default"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${card.color} opacity-5 blur-3xl -mr-16 -mt-16 rounded-full group-hover:opacity-10 transition-opacity`} />
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-1 text-sm font-bold ${card.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                {card.trend}
                {card.isUp ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-3xl font-black text-foreground tracking-tight">{card.value}</p>
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{card.title}</h3>
              <p className="text-xs text-muted-foreground/60">{card.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Revenue Trend Area Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2 card-elevated p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-foreground">Revenue Dynamics</h2>
              <p className="text-sm text-muted-foreground">Comparative daily growth analysis</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">Last 7 Days</span>
            </div>
          </div>

          <div className="h-[400px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.dailyAnalytics}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#888', fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#888', fontSize: 12 }}
                  tickFormatter={(val) => `Rs ${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#18181b',
                    borderRadius: '16px',
                    border: '1px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)'
                  }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#6366f1"
                  strokeWidth={4}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Operational Overview */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="card-elevated p-8"
          >
            <h2 className="text-2xl font-black text-foreground mb-6">Operations</h2>
            <div className="grid grid-cols-2 gap-4">
              {operationalStats.map((stat) => (
                <div key={stat.label} className="p-4 bg-muted/30 rounded-2xl border border-border/50">
                  <stat.icon className={`w-5 h-5 ${stat.color} mb-2`} />
                  <p className="text-2xl font-black text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-bold uppercase">{stat.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="card-elevated p-8 border-rose-500/20 bg-rose-500/5"
          >
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-rose-500" />
              <h2 className="text-2xl font-black text-foreground">Stock Alerts</h2>
            </div>

            <div className="space-y-4">
              {stats.lowStockProducts?.length === 0 ? (
                <div className="text-center py-4">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-20" />
                  <p className="text-sm text-muted-foreground font-medium">All systems green. Stock levels stable.</p>
                </div>
              ) : (
                stats.lowStockProducts?.map((product: any) => (
                  <div key={product._id} className="flex items-center justify-between p-3 bg-background/50 rounded-xl border border-rose-500/10">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{product.name}</p>
                      <p className="text-xs text-rose-500 font-medium">{product.stock} units remaining</p>
                    </div>
                    <div className="w-10 h-10 rounded-lg p-1 bg-white/5">
                      <img src={product.image} className="w-full h-full object-cover rounded-md" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-8">
        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="card-elevated p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Market Share</h2>
            <Package className="w-5 h-5 text-indigo-500" />
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                >
                  {stats.categoryDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Order Mix */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="card-elevated p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Order Lifecycle</h2>
            <ShoppingCart className="w-5 h-5 text-amber-500" />
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.orderDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                >
                  {stats.orderDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 3) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Payment Preferences */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="card-elevated p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-foreground uppercase tracking-tight">Fintech Adoption</h2>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>

          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.paymentDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                  nameKey="name"
                  stroke="none"
                >
                  {stats.paymentDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[(index + 1) % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
