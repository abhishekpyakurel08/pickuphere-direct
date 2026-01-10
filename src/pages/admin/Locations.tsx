import { useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, MapPin, Clock, Loader2 } from 'lucide-react';
import { useAdminStore } from '@/stores/adminStore';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { PickupLocation } from '@/stores/cartStore';

const AdminMapView = lazy(() => import('@/components/admin/AdminMapView'));

export default function AdminLocations() {
  const { locations, orders, addLocation, updateLocation, deleteLocation } = useAdminStore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<PickupLocation | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: '',
    lng: '',
    hours: '',
  });

  // Calculate orders per location
  const locationStats = locations.map(loc => ({
    ...loc,
    orderCount: orders.filter(o => o.pickupLocation.id === loc.id).length,
    revenue: orders
      .filter(o => o.pickupLocation.id === loc.id && o.status === 'COMPLETED')
      .reduce((sum, o) => sum + o.total, 0),
  }));

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      lat: '',
      lng: '',
      hours: '',
    });
    setEditingLocation(null);
  };

  const openAddDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (location: PickupLocation) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      address: location.address,
      lat: location.lat.toString(),
      lng: location.lng.toString(),
      hours: location.hours,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const locationData = {
      name: formData.name,
      address: formData.address,
      lat: parseFloat(formData.lat),
      lng: parseFloat(formData.lng),
      hours: formData.hours,
    };

    if (editingLocation) {
      updateLocation(editingLocation.id, locationData);
      toast.success('Location updated!');
    } else {
      addLocation(locationData);
      toast.success('Location added!');
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this location?')) {
      deleteLocation(id);
      toast.success('Location deleted!');
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Pickup Locations</h1>
          <p className="text-muted-foreground">Manage pickup points for customers</p>
        </div>
        <Button onClick={openAddDialog} className="btn-gradient-primary rounded-xl">
          <Plus className="w-5 h-5 mr-2" />
          Add Location
        </Button>
      </motion.div>

      {/* Map */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-elevated overflow-hidden rounded-2xl"
        style={{ height: '350px' }}
      >
        <Suspense fallback={
          <div className="flex items-center justify-center h-full bg-muted/30">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }>
          <AdminMapView locations={locations} />
        </Suspense>
      </motion.div>

      {/* Locations Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {locationStats.map((location) => (
          <div key={location.id} className="card-elevated p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEditDialog(location)}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Pencil className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleDelete(location.id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </div>
            
            <h3 className="font-bold text-foreground mb-1">{location.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">{location.address}</p>
            
            <div className="flex items-center gap-1 text-sm text-primary mb-4">
              <Clock className="w-4 h-4" />
              <span>{location.hours}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border">
              <div className="text-center">
                <p className="text-lg font-bold text-foreground">{location.orderCount}</p>
                <p className="text-xs text-muted-foreground">Total Orders</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-primary">${location.revenue.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Revenue</p>
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? 'Edit Location' : 'Add New Location'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Location Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="input-field"
                placeholder="Downtown Store"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Address
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input-field"
                placeholder="123 Main Street"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Latitude
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  value={formData.lat}
                  onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
                  className="input-field"
                  placeholder="40.7128"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Longitude
                </label>
                <input
                  type="number"
                  required
                  step="any"
                  value={formData.lng}
                  onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
                  className="input-field"
                  placeholder="-74.006"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Operating Hours
              </label>
              <input
                type="text"
                required
                value={formData.hours}
                onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                className="input-field"
                placeholder="8AM - 8PM"
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1 btn-gradient-primary">
                {editingLocation ? 'Save Changes' : 'Add Location'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
