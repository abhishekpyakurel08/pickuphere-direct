import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart,  Menu, X, Settings } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const location = useLocation();
  const itemCount = useCartStore((state) => state.getItemCount());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/products', label: 'Products' },
    { to: '/orders', label: 'My Orders' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <nav className="section-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
<Link to="/" className="flex items-center gap-2">
  <img
    src="/logo.png"
    className="w-[clamp(80px,12vw,200px)] max-w-full h-auto object-contain transition-all duration-300"
    alt="Logo"
  />
</Link>
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={isActive(link.to) ? 'nav-link-active' : 'nav-link'}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Admin Link */}
            <Link
              to="/admin"
              className="hidden sm:flex p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              title="Admin Panel"
            >
              <Settings className="w-5 h-5" />
            </Link>

            <Link
              to="/cart"
              className="relative p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <ShoppingCart className="w-6 h-6 text-foreground" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-secondary-foreground text-xs font-bold rounded-full flex items-center justify-center"
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-muted transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block px-4 py-2 rounded-lg ${
                      isActive(link.to)
                        ? 'bg-primary/10 text-primary font-semibold'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-foreground hover:bg-muted"
                >
                  <Settings className="w-4 h-4" />
                  Admin Panel
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
