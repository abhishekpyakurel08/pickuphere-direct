import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

// Core Pages (Eagerly Loaded)
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Auth from "./pages/Auth";

// Accessibility & Contexts
import { AgeVerification } from "./components/AgeVerification";
import { SocketProvider } from "./contexts/SocketContext";

// Lazy Loaded Pages (Performance Optimization)
const Orders = lazy(() => import("./pages/Orders"));
const GoogleCallback = lazy(() => import("./pages/GoogleCallback"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin - Lazy Loaded
const AdminLayout = lazy(() => import("./components/admin/AdminLayout").then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminFinancials = lazy(() => import("./pages/admin/Financials"));
const AdminInventory = lazy(() => import("./pages/admin/Inventory"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));

// Vendor pages
import VendorDashboard from "./pages/vendor/Dashboard";

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="w-12 h-12 text-primary animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SocketProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner position="top-center" />
          <AgeVerification />
          <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/products" element={<Products />} />
                <Route path="/product/:id" element={<ProductDetails />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth/google/callback" element={<GoogleCallback />} />
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />

                {/* Vendor Routes - Protected */}
                <Route
                  path="/vendor"
                  element={
                    <ProtectedRoute>
                      <VendorDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Routes - Protected */}
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute requireAdmin>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="financials" element={<AdminFinancials />} />
                  <Route path="inventory" element={<AdminInventory />} />
                  <Route path="users" element={<AdminUsers />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </SocketProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
