import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X, Settings } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserMenu } from './UserMenu';
import { useAuth } from '@/contexts/AuthContext';

export function Navbar() {
  const { isAdmin } = useAuth();
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
          <Link to="/" className="flex items-center gap-2 group shrink-0">
            <div className="relative overflow-hidden transition-all duration-500 group-hover:scale-105 rounded-full border-2 border-primary/20 p-0.5 bg-background shadow-sm">
              <img
                src="/logo.png"
                className="h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 object-cover rounded-full"
                alt="Daru Hunting Logo"
              />
            </div>
            <div className="hidden lg:flex flex-col leading-none">
              <span className="text-xl font-black tracking-tighter text-foreground">DARU</span>
              <span className="text-[10px] font-bold tracking-[0.2em] text-primary">HUNTING</span>
            </div>
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
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Admin Link - Only show if user is admin */}
            {isAdmin && (
              <Link
                to="/admin"
                className="hidden sm:flex p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                title="Admin Panel"
              >
                <Settings className="w-5 h-5" />
              </Link>
            )}

            <Link
              to="/cart"
              className="relative p-2 rounded-xl hover:bg-muted transition-colors"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-foreground" />
              {itemCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5 bg-secondary text-secondary-foreground text-[10px] sm:text-xs font-bold rounded-full flex items-center justify-center translate-x-1 -translate-y-1"
                >
                  {itemCount}
                </motion.span>
              )}
            </Link>

            {/* User Menu */}
            <UserMenu />

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
                    className={`block px-4 py-2 rounded-lg ${isActive(link.to)
                      ? 'bg-primary/10 text-primary font-semibold'
                      : 'text-foreground hover:bg-muted'
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-foreground hover:bg-muted"
                  >
                    <Settings className="w-4 h-4" />
                    Admin Panel
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
