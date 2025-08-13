import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, Heart, Bell, LogOut, UserCircle, Package, ChevronDown } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

const Navbar = () => {
  const { state, actions } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserDropdown(false);
      setShowCategoriesDropdown(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  const handleLogout = async () => {
    await actions.logout();
    setShowUserDropdown(false);
    navigate('/');
  };

  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'Products', path: '/products' },
    { name: 'Deals', path: '/deals' },
    { name: 'About', path: '/about' },
    // { name: 'Contact', path: '/contact' }
  ];

  const categories = [
    { id: 1, name: 'Smartphones', icon: '📱' },
    { id: 2, name: 'Laptops', icon: '💻' },
    { id: 3, name: 'Audio', icon: '🎧' },
    { id: 4, name: 'Smart Home', icon: '🏠' },
    { id: 5, name: 'Gaming', icon: '🎮' },
    { id: 6, name: 'Wearables', icon: '⌚' },
    { id: 7, name: 'Cameras', icon: '📷' },
    { id: 8, name: 'Accessories', icon: '🔌' }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
      ? 'glass-effect shadow-2xl border-b border-primary-500/20'
      : 'bg-dark-800 border-b border-dark-700'
      }`}>
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 bg-purple-gradient rounded-lg flex items-center justify-center shadow-lg group-hover:animate-glow">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold text-gradient tracking-wider">ECommerce</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="mx-10 flex items-baseline space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`px-3 py-2 text-sm font-medium transition-all duration-200 relative group ${location.pathname === item.path
                    ? 'text-primary-400'
                    : 'text-gray-300 hover:text-primary-400'
                    }`}
                >
                  {item.name}
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-primary-500 transition-all duration-300 ${location.pathname === item.path ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                </Link>
              ))}

              {/* Categories Dropdown */}
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowCategoriesDropdown(!showCategoriesDropdown);
                  }}
                  className={`px-3 py-2 text-sm font-medium transition-all duration-200 relative group flex items-center space-x-1 ${location.pathname === '/categories'
                    ? 'text-primary-400'
                    : 'text-gray-300 hover:text-primary-400'
                    }`}
                >
                  <span>Categories</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${showCategoriesDropdown ? 'rotate-180' : ''}`} />
                  <span className={`absolute bottom-0 left-0 h-0.5 bg-primary-500 transition-all duration-300 ${location.pathname === '/categories' ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}></span>
                </button>

                {/* Categories Dropdown Menu */}
                {showCategoriesDropdown && (
                  <div className="absolute left-0 mt-4 w-72 glass-effect border border-dark-600 rounded-md shadow-2xl py-3 z-50 animate-slide-down">
                    <div className="px-4 py-2 border-b border-dark-600 mb-2">
                      <p className="text-sm font-medium text-gray-100">Browse Categories</p>
                      <p className="text-xs text-gray-400">Find products by category</p>
                    </div>

                    <div className="grid grid-cols-2 gap-1 px-2">
                      {categories.map((category) => (
                        <Link
                          key={category.id}
                          to={`/products?category=${category.id}`}
                          className="flex items-center space-x-3 px-3 py-2 text-sm text-gray-300 hover:text-primary-400 hover:bg-dark-700/50 rounded-lg transition-colors"
                          onClick={() => setShowCategoriesDropdown(false)}
                        >
                          {/* <span className="text-lg">{category.icon}</span>s */}
                          <span className="truncate">{category.name}</span>
                        </Link>
                      ))}
                    </div>

                    <div className="border-t border-dark-600 mt-3 pt-2">
                      <Link
                        to="/categories"
                        className="flex items-center justify-center px-4 py-2 text-sm text-primary-400 hover:text-primary-300 hover:bg-dark-700/50 rounded-lg transition-colors mx-2"
                        onClick={() => setShowCategoriesDropdown(false)}
                      >
                        View All Categories
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-xs">
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="input-field w-full pl-10 pr-12"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary-400 transition-colors"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-3">

            {/* Mobile Search */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 text-gray-300 hover:text-primary-400 transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Wishlist */}
            {state.isAuthenticated && (
              <Link
                to="/wishlist"
                className="hidden sm:block p-2 text-gray-300 hover:text-red-400 transition-colors relative group"
              >
                <Heart className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center animate-pulse">
                  2
                </span>
                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-dark-800 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  Wishlist
                </span>
              </Link>
            )}

            {/* Shopping Cart */}
            <Link
              to="/cart"
              className="p-2 text-gray-300 hover:text-primary-400 transition-colors relative group"
            >
              <ShoppingCart className="h-5 w-5" />
              {state.cart.count > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium animate-bounce">
                  {state.cart.count}
                </span>
              )}
              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-dark-800 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                Cart ({state.cart.count})
              </span>
            </Link>

            {/* User Account */}
            <div className="relative">
              {state.isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowUserDropdown(!showUserDropdown);
                    }}
                    className="p-2 text-gray-300 hover:text-primary-400 transition-colors group"
                  >
                    <div className="w-8 h-8 bg-purple-gradient rounded-full flex items-center justify-center shadow-lg group-hover:animate-glow">
                      <span className="text-white text-sm font-medium">
                        {state.user?.firstName?.[0] || state.user?.username?.[0] || 'U'}
                      </span>
                    </div>
                  </button>

                  {/* User Dropdown */}
                  {showUserDropdown && (
                    <div className="absolute right-0 mt-2 w-56 glass-effect border border-dark-600 rounded-xl shadow-2xl py-2 z-50 animate-slide-up">
                      <div className="px-4 py-3 border-b border-dark-600">
                        <p className="text-sm font-medium text-gray-100">
                          {state.user?.firstName} {state.user?.lastName}
                        </p>
                        <p className="text-sm text-gray-400 truncate">
                          {state.user?.email}
                        </p>
                      </div>

                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-primary-400 hover:bg-dark-700/50 transition-colors"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <UserCircle className="w-4 h-4 mr-3" />
                        Profile
                      </Link>

                      <Link
                        to="/orders"
                        className="flex items-center px-4 py-2 text-sm text-gray-300 hover:text-primary-400 hover:bg-dark-700/50 transition-colors"
                        onClick={() => setShowUserDropdown(false)}
                      >
                        <Package className="w-4 h-4 mr-3" />
                        Orders
                      </Link>

                      <div className="border-t border-dark-600 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-dark-700/50 transition-colors"
                        >
                          <LogOut className="w-4 h-4 mr-3" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    to="/login"
                    className="hidden sm:flex items-center space-x-2 text-gray-300 hover:text-primary-400 px-3 py-2 text-sm font-medium transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span>Sign In</span>
                  </Link>
                  <Link
                    to="/register"
                    className="hidden sm:flex btn-primary text-sm px-4 py-2"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 text-gray-300 hover:text-primary-400 transition-colors"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`md:hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        } overflow-hidden glass-effect border-t border-dark-600`}>
        <div className="px-4 pt-4 pb-6 space-y-3">

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="relative mb-4">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="input-field w-full pl-10 pr-3"
            />
          </form>

          {/* Mobile Navigation Links */}
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`block px-3 py-2 text-base font-medium rounded-lg transition-colors ${location.pathname === item.path
                ? 'text-primary-400 bg-dark-700/50'
                : 'text-gray-300 hover:text-primary-400 hover:bg-dark-700/50'
                }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}

          {/* Mobile Categories Link */}
          <Link
            to="/categories"
            className={`block px-3 py-2 text-base font-medium rounded-lg transition-colors ${location.pathname === '/categories'
              ? 'text-primary-400 bg-dark-700/50'
              : 'text-gray-300 hover:text-primary-400 hover:bg-dark-700/50'
              }`}
            onClick={() => setIsMenuOpen(false)}
          >
            Categories
          </Link>

          {/* Mobile Cart Link */}
          <Link
            to="/cart"
            className="flex items-center justify-between px-3 py-2 text-base font-medium text-gray-300 hover:text-primary-400 hover:bg-dark-700/50 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(false)}
          >
            <div className="flex items-center space-x-3">
              <ShoppingCart className="h-5 w-5" />
              <span>Cart</span>
            </div>
            {state.cart.count > 0 && (
              <span className="bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                {state.cart.count}
              </span>
            )}
          </Link>

          {/* Mobile Auth Buttons */}
          {!state.isAuthenticated ? (
            <div className="space-y-2 pt-4 border-t border-dark-600">
              <Link
                to="/login"
                className="w-full flex items-center justify-center space-x-2 btn-secondary py-3"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="w-full flex items-center justify-center space-x-2 btn-primary py-3"
                onClick={() => setIsMenuOpen(false)}
              >
                <User className="h-5 w-5" />
                <span>Sign Up</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-2 pt-4 border-t border-dark-600">
              <div className="flex items-center space-x-3 px-3 py-2">
                <div className="w-8 h-8 bg-purple-gradient rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {state.user?.firstName?.[0] || 'U'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-100">
                    {state.user?.firstName} {state.user?.lastName}
                  </p>
                  <p className="text-xs text-gray-400">{state.user?.email}</p>
                </div>
              </div>

              <Link
                to="/profile"
                className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-primary-400 hover:bg-dark-700/50 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <UserCircle className="h-5 w-5" />
                <span>Profile</span>
              </Link>

              <Link
                to="/orders"
                className="flex items-center space-x-3 px-3 py-2 text-gray-300 hover:text-primary-400 hover:bg-dark-700/50 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Package className="h-5 w-5" />
                <span>Orders</span>
              </Link>

              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-dark-700/50 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;