import { Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-auto">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand + Tagline */}
          <div className="md:col-span-2 flex flex-col md:flex-row md:items-center md:gap-8 mb-4">
            <Link to="/" className="inline-block w-full md:w-auto">
              <img
                src="/logo.png" // Ensure this is in public/logo.png
                alt="Spirit Liquor Logo"
                className="w-full max-w-[300px] md:max-w-[350px] lg:max-w-[400px] h-auto object-contain transition-all duration-300"
              />
            </Link>
            <p className="text-background/70 max-w-sm mt-3 md:mt-0">
              Order online, pick up yourself. Fresh products from local vendors, ready when you are.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/orders"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  My Orders
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-background/70 hover:text-background transition-colors"
                >
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-background/70">
                <Mail className="w-4 h-4" />
                <span>drinkly@gmail.com</span>
              </li>
              <li className="flex items-center gap-2 text-background/70">
                <Phone className="w-4 h-4" />
                <span>+977 9769919699</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="border-t border-background/10 mt-8 pt-8 text-center text-background/50 text-sm">
          <p>&copy; {new Date().getFullYear()} Spirit Liquor. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
