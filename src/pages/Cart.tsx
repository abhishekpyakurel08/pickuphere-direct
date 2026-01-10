import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft, MapPin } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import { LocationMap, LocationList } from '@/components/LocationMap';
import { pickupLocations } from '@/data/mockData';
import { useState } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const Cart = () => {
  const navigate = useNavigate();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getTotal,
    selectedLocation,
    setSelectedLocation,
    placeOrder,
  } = useCartStore();
  const [step, setStep] = useState<'cart' | 'location' | 'confirm'>('cart');

  const handlePlaceOrder = () => {
    const order = placeOrder();
    if (order) {
      toast.success('Order placed successfully!', {
        description: `Order ${order.id} confirmed`,
      });
      navigate('/orders');
    }
  };

  if (items.length === 0 && step === 'cart') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">
              Add some products to get started
            </p>
            <Link to="/products">
              <Button className="btn-gradient-primary rounded-xl">
                Browse Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 py-8">
        <div className="section-container">
          {/* Progress Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            {['Cart', 'Location', 'Confirm'].map((label, index) => {
              const stepNames = ['cart', 'location', 'confirm'] as const;
              const currentStepIndex = stepNames.indexOf(step);
              const isActive = index <= currentStepIndex;

              return (
                <div key={label} className="flex items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className={`hidden sm:inline font-medium ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {label}
                    </span>
                  </div>
                  {index < 2 && (
                    <div className={`w-12 h-1 mx-2 rounded ${index < currentStepIndex ? 'bg-primary' : 'bg-muted'}`} />
                  )}
                </div>
              );
            })}
          </motion.div>

          {/* Step: Cart */}
          {step === 'cart' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid lg:grid-cols-3 gap-8"
            >
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h1 className="text-2xl font-bold text-foreground">Your Cart</h1>
                  <Button variant="ghost" onClick={clearCart} className="text-destructive hover:text-destructive/80">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </div>

                {items.map((item) => (
                  <motion.div
                    key={item.product.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="card-elevated p-4 flex items-center gap-4"
                  >
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground">{item.product.name}</h3>
                      <p className="text-primary font-bold">${item.product.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2 bg-muted rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-lg bg-background flex items-center justify-center hover:bg-primary/10"
                      >
                        -
                      </button>
                      <span className="w-8 text-center font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-lg bg-background flex items-center justify-center hover:bg-primary/10"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </motion.div>
                ))}
              </div>

              {/* Summary */}
              <div className="lg:col-span-1">
                <div className="card-elevated p-6 sticky top-24">
                  <h2 className="text-lg font-bold text-foreground mb-4">Order Summary</h2>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span>${getTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Pickup Fee</span>
                      <span className="text-primary font-medium">Free</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">${getTotal().toFixed(2)}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => setStep('location')}
                    className="w-full btn-gradient-primary h-12 rounded-xl"
                  >
                    Choose Pickup Location
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step: Location */}
          {step === 'location' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={() => setStep('cart')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-2xl font-bold text-foreground">Choose Pickup Location</h1>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <LocationMap
                    locations={pickupLocations}
                    selectedLocationId={selectedLocation?.id}
                    onSelectLocation={setSelectedLocation}
                    height="500px"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Available Locations</h3>
                  <LocationList
                    locations={pickupLocations}
                    selectedLocationId={selectedLocation?.id}
                    onSelectLocation={setSelectedLocation}
                  />

                  <Button
                    onClick={() => setStep('confirm')}
                    disabled={!selectedLocation}
                    className="w-full btn-gradient-primary h-12 rounded-xl mt-6"
                  >
                    Continue to Confirm
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && selectedLocation && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={() => setStep('location')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-2xl font-bold text-foreground">Confirm Order</h1>
              </div>

              <div className="card-elevated p-6 space-y-6">
                {/* Items Summary */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Order Items</h3>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex items-center gap-3">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{item.product.name}</p>
                          <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                        </div>
                        <span className="font-semibold">
                          ${(item.product.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-border" />

                {/* Pickup Location */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Pickup Location</h3>
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">{selectedLocation.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedLocation.address}</p>
                      <p className="text-sm text-primary mt-1">Open: {selectedLocation.hours}</p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-border" />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-foreground">Total</span>
                  <span className="text-2xl font-bold text-primary">${getTotal().toFixed(2)}</span>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  className="w-full btn-gradient-secondary h-14 rounded-xl text-lg"
                >
                  Place Order
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
