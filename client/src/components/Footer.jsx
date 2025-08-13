import { Link } from 'react-router-dom';
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Truck,
  Shield,
  RotateCcw
} from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-blue-600 text-white p-2 rounded-lg">
                <span className="font-bold text-xl">⚡</span>
              </div>
              <span className="text-2xl font-bold text-white">TechStore</span>
            </Link>

            <p className="text-gray-400 leading-relaxed">
              Your trusted destination for the latest electronics and tech gadgets.
              We bring cutting-edge technology to your doorstep with unbeatable prices and exceptional service.
            </p>

            <div className="flex space-x-4">
              <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-blue-600 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-blue-600 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-blue-600 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="bg-gray-800 p-2 rounded-lg hover:bg-blue-600 transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/products" className="hover:text-white transition-colors">All Products</Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-white transition-colors">Categories</Link>
              </li>
              <li>
                <Link to="/deals" className="hover:text-white transition-colors">Special Deals</Link>
              </li>
              <li>
                <Link to="/new-arrivals" className="hover:text-white transition-colors">New Arrivals</Link>
              </li>
              <li>
                <Link to="/brands" className="hover:text-white transition-colors">Top Brands</Link>
              </li>
              <li>
                <Link to="/reviews" className="hover:text-white transition-colors">Reviews</Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-white transition-colors">Help Center</Link>
              </li>
              <li>
                <Link to="/shipping" className="hover:text-white transition-colors">Shipping Info</Link>
              </li>
              <li>
                <Link to="/returns" className="hover:text-white transition-colors">Returns & Exchanges</Link>
              </li>
              <li>
                <Link to="/warranty" className="hover:text-white transition-colors">Warranty</Link>
              </li>
              <li>
                <Link to="/track-order" className="hover:text-white transition-colors">Track Your Order</Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Get in Touch</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-blue-400" />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <span>support@techstore.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-blue-400" />
                <span>123 Tech Street, Digital City, DC 12345</span>
              </div>
            </div>

            {/* Newsletter signup */}
            <div className="bg-gray-800 p-4 rounded-lg">
              <h4 className="text-white font-semibold mb-2">Newsletter</h4>
              <p className="text-sm text-gray-400 mb-3">Get updates on new products and exclusive offers</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-blue-600 px-4 py-2 rounded-r-lg hover:bg-blue-700 transition-colors">
                  <Mail className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-12 pt-8 border-t border-gray-800">
          <div className="flex items-center space-x-3">
            <Truck className="w-8 h-8 text-blue-400" />
            <div>
              <h4 className="font-semibold text-white">Free Shipping</h4>
              <p className="text-sm text-gray-400">On orders over $99</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <RotateCcw className="w-8 h-8 text-green-400" />
            <div>
              <h4 className="font-semibold text-white">Easy Returns</h4>
              <p className="text-sm text-gray-400">30-day return policy</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Shield className="w-8 h-8 text-purple-400" />
            <div>
              <h4 className="font-semibold text-white">Secure Payment</h4>
              <p className="text-sm text-gray-400">SSL protected checkout</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <CreditCard className="w-8 h-8 text-yellow-400" />
            <div>
              <h4 className="font-semibold text-white">Best Price</h4>
              <p className="text-sm text-gray-400">Price match guarantee</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="bg-gray-800 border-td border-gray-700">
        <div className="container mx-auto mb-0 px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm text-gray-400">
              © 2024 TechStore. All rights reserved. |
              <Link to="/privacy" className="hover:text-white ml-1">Privacy Policy</Link> |
              <Link to="/terms" className="hover:text-white ml-1">Terms of Service</Link>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">We Accept:</span>
              <div className="flex space-x-2">
                <div className="bg-white px-2 py-1 rounded text-xs font-bold text-blue-600">VISA</div>
                <div className="bg-white px-2 py-1 rounded text-xs font-bold text-red-600">MC</div>
                <div className="bg-white px-2 py-1 rounded text-xs font-bold text-blue-800">AMEX</div>
                <div className="bg-white px-2 py-1 rounded text-xs font-bold text-yellow-600">PP</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
