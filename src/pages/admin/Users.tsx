import { motion } from 'framer-motion';
import { Shield, User, ShieldCheck, Search, History, Package, Clock, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAdminStore } from '@/stores/adminStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatNPR } from '@/lib/currency';
import api from '@/services/api';
import { toast } from 'sonner';

export default function AdminUsers() {
    const { users, fetchUsers, updateUserRole } = useAdminStore();
    const [search, setSearch] = useState('');
    const [selectedUserOrders, setSelectedUserOrders] = useState<any[] | null>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [loadingHistory, setLoadingHistory] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const handlePromote = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'user' ? 'admin' : 'user';
        try {
            await updateUserRole(userId, { role: newRole });
            toast.success(`User role updated to ${newRole}`);
        } catch (e) {
            toast.error('Failed to update role');
        }
    };

    const fetchUserHistory = async (userId: string) => {
        setLoadingHistory(true);
        setIsHistoryOpen(true);
        try {
            const res = await api.get(`/admin/users/${userId}/orders`);
            setSelectedUserOrders(res.data);
        } catch (e) {
            toast.error('Failed to load user history');
            setIsHistoryOpen(false);
        } finally {
            setLoadingHistory(false);
        }
    };

    return (
        <div className="p-6 lg:p-8 space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <h1 className="text-3xl font-bold text-foreground mb-2">User Management</h1>
                <p className="text-muted-foreground">Manage all users and their respective roles</p>
            </motion.div>

            <div className="relative max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="input-field pl-12"
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="card-elevated overflow-hidden"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50 text-left">
                            <tr>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">User</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">Role</th>
                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-muted/10 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-bold text-foreground">{user.name}</p>
                                                <p className="text-xs text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {user.role === 'admin' ? (
                                                <ShieldCheck className="w-4 h-4 text-primary" />
                                            ) : (
                                                <User className="w-4 h-4 text-muted-foreground" />
                                            )}
                                            <span className="text-sm font-medium uppercase">{user.role}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs font-bold text-primary gap-1.5"
                                                onClick={() => fetchUserHistory(user._id)}
                                            >
                                                <History className="w-3.5 h-3.5" />
                                                View History
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-xs font-bold text-muted-foreground hover:text-primary"
                                                onClick={() => handlePromote(user._id, user.role)}
                                            >
                                                Change Role
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* History Dialog */}
            <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <History className="w-5 h-5 text-primary" />
                            Order History
                        </DialogTitle>
                    </DialogHeader>
                    {loadingHistory ? (
                        <div className="py-20 text-center animate-pulse text-muted-foreground">
                            Retrieving historical data...
                        </div>
                    ) : selectedUserOrders && selectedUserOrders.length > 0 ? (
                        <div className="space-y-4 mt-4">
                            {selectedUserOrders.map((order) => (
                                <div key={order._id} className="p-4 bg-muted/30 rounded-2xl border border-border flex items-center justify-between">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm">#{order._id.slice(-6).toUpperCase()}</span>
                                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${order.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' :
                                                    order.status === 'CANCELLED' ? 'bg-rose-500/10 text-rose-500' :
                                                        'bg-primary/10 text-primary'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Package className="w-3 h-3" />
                                                {order.items.length} items
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-primary">{formatNPR(order.total)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center text-muted-foreground italic">
                            No orders found for this user.
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
