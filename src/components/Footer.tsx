import { Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-auto">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand + Tagline */}
          <div className="md:col-span-2 flex flex-col items-start gap-4 mb-4">
            <Link to="/" className="inline-block group">
              <div className="bg-background/10 p-2 rounded-2xl backdrop-blur-sm transition-all duration-500 group-hover:bg-background/20">
                <img
                  src="/logo.png"
                  alt="Daru Hunting"
                  className="w-48 md:w-56 lg:w-64 h-auto object-contain"
                />
              </div>
            </Link>
            <p className="text-background/70 max-w-sm mt-3 leading-relaxed">
              The hunt for elite spirits ends at your door. Certified premium selection delivered across Kathmandu Valley within 30 minutes.
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
                <span>service@spiritliquor.com.np</span>
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
          <p>&copy; {new Date().getFullYear()} Daru Hunting. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
