import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Calendar,
    Plus,
    Search,
    Filter,
    ArrowUpRight,
    ArrowDownRight,
    PieChart as PieChartIcon,
    Activity
} from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { formatNPR } from '@/lib/currency';
import api from '@/services/api';
import { toast } from 'sonner';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

const CATEGORIES = ['FUEL', 'PACKAGING', 'PREPARATION', 'MARKETING', 'SALARY', 'OTHERS'];
const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminFinancials() {
    const { stats, fetchStats } = useAdminStore();
    const [expenses, setExpenses] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        amount: '',
        category: 'OTHERS',
        description: '',
    });

    const fetchExpenses = async () => {
        try {
            setLoading(true);
            const res = await api.get('/admin/expenses');
            setExpenses(res.data);
        } catch (e) {
            toast.error('Failed to load expenses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchExpenses();
    }, []);

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/admin/expenses', {
                ...formData,
                amount: parseFloat(formData.amount)
            });
            toast.success('Expense recorded successfully');
            setIsDialogOpen(false);
            setFormData({ title: '', amount: '', category: 'OTHERS', description: '' });
            fetchExpenses();
            fetchStats();
        } catch (e) {
            toast.error('Failed to record expense');
        }
    };

    const filteredExpenses = expenses.filter(e =>
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.category.toLowerCase().includes(search.toLowerCase())
    );

    const expenseByCategory = CATEGORIES.map(cat => ({
        name: cat,
        value: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
    })).filter(c => c.value > 0);

    if (!stats) return null;

    return (
        <div className="p-4 lg:p-8 space-y-8 max-w-[1600px] mx-auto">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
                <div>
                    <h1 className="text-4xl font-black text-foreground tracking-tight">Financial Ledger</h1>
                    <p className="text-muted-foreground mt-1 text-lg">Balance sheet & operational expenditure</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="btn-gradient-primary h-12 px-8 rounded-2xl font-bold shadow-lg shadow-primary/20">
                            <Plus className="w-5 h-5 mr-2" />
                            Record Expense
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                        <DialogHeader><DialogTitle>Mark New Operating Expense</DialogTitle></DialogHeader>
                        <form onSubmit={handleAddExpense} className="space-y-4 mt-4">
                            <div>
                                <label className="text-sm font-bold mb-1.5 block">Expense Title</label>
                                <input
                                    required
                                    className="input-field"
                                    value={formData.title}
                                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                                    placeholder="e.g. Fuel for Delivery Bike"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-bold mb-1.5 block">Amount (Rs)</label>
                                    <input
                                        required
                                        type="number"
                                        className="input-field"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-bold mb-1.5 block">Category</label>
                                    <select
                                        className="input-field"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        {CATEGORIES.map(cat => (
                                            <option key={cat} value={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-bold mb-1.5 block">Description (Optional)</label>
                                <textarea
                                    className="input-field min-h-[80px]"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Additional details..."
                                />
                            </div>
                            <Button type="submit" className="w-full btn-gradient-primary h-12 rounded-xl font-bold">
                                Confirm Entry
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </motion.div>

            {/* Financial Summary */}
            <div className="grid sm:grid-cols-3 gap-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="card-elevated p-8 bg-emerald-500/5 border-emerald-500/20"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full uppercase">Income</span>
                    </div>
                    <p className="text-4xl font-black text-foreground">{formatNPR(stats.totalRevenue)}</p>
                    <p className="text-sm font-bold text-muted-foreground mt-1 uppercase tracking-wider">Gross Revenue</p>
                    <div className="mt-4 flex items-center gap-1 text-emerald-600 font-bold text-sm">
                        <ArrowUpRight className="w-4 h-4" />
                        <span>Inclusive of delivery charges</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="card-elevated p-8 bg-rose-500/5 border-rose-500/20"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-500">
                            <TrendingDown className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black text-rose-500 bg-rose-500/10 px-2 py-1 rounded-full uppercase">Expense</span>
                    </div>
                    <p className="text-4xl font-black text-foreground">{formatNPR(stats.totalExpenses)}</p>
                    <p className="text-sm font-bold text-muted-foreground mt-1 uppercase tracking-wider">Total Expenditure</p>
                    <div className="mt-4 flex items-center gap-1 text-rose-600 font-bold text-sm">
                        <ArrowDownRight className="w-4 h-4" />
                        <span>Operational overheads</span>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="card-elevated p-8 bg-primary/5 border-primary/20"
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                            <Activity className="w-6 h-6" />
                        </div>
                        <span className="text-xs font-black text-primary bg-primary/10 px-2 py-1 rounded-full uppercase">Profit</span>
                    </div>
                    <p className="text-4xl font-black text-foreground">{formatNPR(stats.netProfit)}</p>
                    <p className="text-sm font-bold text-muted-foreground mt-1 uppercase tracking-wider">Net Profit</p>
                    <div className="mt-4 flex items-center gap-1 text-primary font-bold text-sm">
                        <Activity className="w-4 h-4 animate-pulse" />
                        <span>Margin: {((stats.netProfit / stats.totalRevenue) * 100).toFixed(1)}%</span>
                    </div>
                </motion.div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Expense Breakdown Chart */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card-elevated p-8"
                >
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-foreground">Spending Analysis</h2>
                        <PieChartIcon className="w-6 h-6 text-rose-500" />
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={expenseByCategory}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={80}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {expenseByCategory.map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: number) => formatNPR(value)}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                {/* Expense List */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card-elevated p-8 flex flex-col"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-foreground">Recent Transactions</h2>
                        <div className="relative max-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search logs..."
                                className="input-field !h-10 pl-9 text-sm"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3 pr-2 scrollbar-thin">
                        {filteredExpenses.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground italic">No expense records found.</div>
                        ) : (
                            filteredExpenses.map((expense) => (
                                <div key={expense._id} className="group p-4 bg-muted/30 rounded-2xl border border-transparent hover:border-border transition-all flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-background border flex items-center justify-center font-bold text-rose-500">
                                            Rs
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground group-hover:text-primary transition-colors">{expense.title}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium uppercase tracking-tighter">
                                                <span className="px-2 py-0.5 bg-muted rounded-md">{expense.category}</span>
                                                <span>•</span>
                                                <span>{new Date(expense.date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-foreground">-{formatNPR(expense.amount)}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
