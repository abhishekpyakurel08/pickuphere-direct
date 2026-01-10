import { MapPin, Mail, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-foreground text-background mt-auto">
      <div className="section-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">SelfDrop</span>
            </div>
            <p className="text-background/70 max-w-sm">
              Order online, pick up yourself. Fresh products from local vendors, ready when you are.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="text-background/70 hover:text-background transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-background/70 hover:text-background transition-colors">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/cart" className="text-background/70 hover:text-background transition-colors">
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
                <span>hello@selfdrop.com</span>
              </li>
              <li className="flex items-center gap-2 text-background/70">
                <Phone className="w-4 h-4" />
                <span>+1 (555) 123-4567</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/10 mt-8 pt-8 text-center text-background/50 text-sm">
          <p>&copy; {new Date().getFullYear()} SelfDrop. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
