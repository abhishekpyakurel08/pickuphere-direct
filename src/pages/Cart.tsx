import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Trash2, ArrowRight, ArrowLeft, MapPin, Truck } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import { LocationPicker } from '@/components/LocationPicker';
import { PaymentSelector, PaymentMethod } from '@/components/PaymentSelector';
import { formatNPR } from '@/lib/currency';
import api from '@/services/api';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    getTotal,
    placeOrder,
    deliveryLocation,
    setDeliveryLocation,
    deliveryCharge,
    setDeliveryCharge,
  } = useCartStore();
  const [step, setStep] = useState<'cart' | 'location' | 'payment' | 'confirm'>('cart');
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);

  // Auto-select location on mount if not set
  useEffect(() => {
    if (!deliveryLocation && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Trigger reverse geocoding via LocationPicker logic indirectly or set simple coords
          // We set coords, and LocationPicker will handle the address fetch when it mounts or we can do it here
          setDeliveryLocation({
            address: "Locating...",
            lat: latitude,
            lng: longitude
          });
        },
        (error) => {
          console.warn("Geolocation permission denied or failed", error);
        }
      );
    }
  }, []);

  // When user returns from authentication, restore their progress
  useEffect(() => {
    if (user && !authLoading && items.length > 0 && deliveryLocation) {
      const wasRedirectedForAuth = location.state?.from?.pathname === '/cart';
      if (wasRedirectedForAuth && step === 'cart') {
        setStep('payment');
      }
    }
  }, [user, authLoading, items.length, deliveryLocation, location.state, step]);

  // Fetch delivery estimate when delivery location changes
  useEffect(() => {
    if (deliveryLocation?.lat && deliveryLocation?.lng) {
      const fetchEstimate = async () => {
        try {
          const adminRes = await api.get('/admin/users');
          const admin = adminRes.data.find((u: any) => u.role === 'admin');

          if (admin) {
            const res = await api.post('/orders/delivery-estimate', {
              vendorId: admin._id,
              deliveryLocation
            });

            const subtotal = getTotal();
            if (subtotal >= 2000) {
              setDeliveryCharge(0);
            } else {
              setDeliveryCharge(res.data.deliveryCharge);
            }
          } else {
            setDeliveryCharge(100);
          }
        } catch (e) {
          console.error("Failed to fetch delivery estimate", e);
          setDeliveryCharge(150);
        }
      };
      fetchEstimate();
    } else {
      setDeliveryCharge(0);
    }
  }, [deliveryLocation, setDeliveryCharge, items]); // Added items to recalculate if cart changes

  // Check authentication when trying to access payment or confirm step
  useEffect(() => {
    if (!authLoading && (step === 'payment' || step === 'confirm')) {
      if (!user) {
        toast.error('Please sign in to continue with payment');
        navigate('/auth', { state: { from: location, resumeStep: step } });
      }
    }
  }, [step, user, authLoading, navigate, location]);

  const handlePlaceOrder = async () => {
    if (!selectedPayment) {
      toast.error('Please select a payment method');
      return;
    }

    const order = await placeOrder();
    if (order) {
      toast.success('Orders placed successfully!', {
        description: `Order confirmed via ${selectedPayment.toUpperCase()}`,
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
            className="flex items-center justify-center gap-2 sm:gap-4 mb-8"
          >
            {['Cart', 'Location', 'Payment', 'Confirm'].map((label, index) => {
              const stepNames = ['cart', 'location', 'payment', 'confirm'] as const;
              const currentStepIndex = stepNames.indexOf(step);
              const isActive = index <= currentStepIndex;

              return (
                <div key={label} className="flex items-center">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                        }`}
                    >
                      {index + 1}
                    </div>
                    <span className={`hidden sm:inline font-medium text-sm ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {label}
                    </span>
                  </div>
                  {index < 3 && (
                    <div className={`w-6 sm:w-12 h-1 mx-1 sm:mx-2 rounded ${index < currentStepIndex ? 'bg-primary' : 'bg-muted'}`} />
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
                      <p className="text-primary font-bold">{formatNPR(item.product.price)}</p>
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
                      <span>{formatNPR(getTotal())}</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span className="text-primary">{formatNPR(getTotal())}</span>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      if (!user) {
                        toast.error('Please sign in to continue with checkout');
                        navigate('/auth', { state: { from: location } });
                        return;
                      }
                      setStep('location');
                    }}
                    className="w-full btn-gradient-primary h-12 rounded-xl"
                  >
                    Set Delivery Address
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
              className="max-w-4xl mx-auto"
            >
              <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={() => setStep('cart')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-2xl font-bold text-foreground">Choose Location</h1>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-lg text-center">Pin Your Delivery Address</h3>
                <LocationPicker
                  selectedLocation={deliveryLocation}
                  onLocationSelect={(loc) => setDeliveryLocation(loc)}
                />
              </div>

              <Button
                onClick={() => {
                  if (!user) {
                    toast.error('Please sign in to continue');
                    navigate('/auth', { state: { from: location } });
                    return;
                  }
                  if (!deliveryLocation) {
                    toast.error("Please pin your delivery address on the map");
                    return;
                  }
                  setStep('payment');
                }}
                className="w-full btn-gradient-primary h-14 rounded-xl text-lg font-bold shadow-lg mt-6"
              >
                Continue to Payment
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          )}

          {/* Step: Payment */}
          {step === 'payment' && (
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
                <h1 className="text-2xl font-bold text-foreground">Payment Method</h1>
              </div>

              <div className="card-elevated p-6 space-y-6">
                <PaymentSelector
                  selectedMethod={selectedPayment}
                  onSelectMethod={setSelectedPayment}
                />

                <div className="h-px bg-border" />

                <div className="flex flex-col gap-2 p-4 bg-primary/5 rounded-xl border border-primary/20">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatNPR(getTotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Delivery Charge</span>
                    <span className={getTotal() >= 2000 ? "text-success font-bold" : ""}>
                      {getTotal() >= 2000 ? "FREE" : formatNPR(deliveryCharge)}
                    </span>
                  </div>
                  {getTotal() < 2000 && (
                    <p className="text-[10px] text-muted-foreground mt-1">
                      Free delivery on orders above रु 2,000
                    </p>
                  )}
                  <div className="h-px bg-primary/10 my-1" />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-foreground">Total to Pay</span>
                    <span className="text-2xl font-bold text-primary">{formatNPR(getTotal() + deliveryCharge)}</span>
                  </div>
                </div>

                <Button
                  onClick={() => setStep('confirm')}
                  disabled={!selectedPayment}
                  className="w-full btn-gradient-primary h-12 rounded-xl"
                >
                  Review Order
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step: Confirm */}
          {step === 'confirm' && deliveryLocation && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="max-w-2xl mx-auto"
            >
              <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" onClick={() => setStep('payment')}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <h1 className="text-2xl font-bold text-foreground">Confirm Order</h1>
              </div>

              <div className="card-elevated p-6 space-y-6 border-2 border-primary/20">
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
                          {formatNPR(item.product.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-border" />

                {/* Delivery Location */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Delivery Address</h3>
                  <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground">Your Address</p>
                      <p className="text-sm text-muted-foreground">{deliveryLocation?.address}</p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-border" />

                {/* Payment Method */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3">Payment Method</h3>
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${selectedPayment === 'esewa' ? 'bg-green-500' :
                      selectedPayment === 'khalti' ? 'bg-purple-500' : 'bg-blue-500'
                      }`}>
                      <span className="text-white text-lg">
                        {selectedPayment === 'esewa' ? '🟢' :
                          selectedPayment === 'khalti' ? '🟣' : '💳'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground capitalize">
                        {selectedPayment === 'stripe' ? 'Card Payment' : selectedPayment}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {selectedPayment === 'esewa' ? 'eSewa wallet' :
                          selectedPayment === 'khalti' ? 'Khalti wallet' : 'Visa, Mastercard, etc.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-border" />

                {/* Total */}
                <div className="flex flex-col gap-2 p-4 bg-primary/5 rounded-xl border border-primary/20 mb-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatNPR(getTotal())}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Delivery Charge</span>
                    <span className={getTotal() >= 2000 ? "text-success font-bold" : ""}>
                      {getTotal() >= 2000 ? 'FREE' : formatNPR(deliveryCharge)}
                    </span>
                  </div>
                  <div className="h-px bg-primary/10 my-1" />
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-foreground">Grand Total</span>
                    <span className="text-2xl font-bold text-primary">{formatNPR(getTotal() + (getTotal() >= 2000 ? 0 : deliveryCharge))}</span>
                  </div>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  className="w-full btn-gradient-secondary h-14 rounded-xl text-lg"
                >
                  Pay {formatNPR(getTotal() + deliveryCharge)}
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
