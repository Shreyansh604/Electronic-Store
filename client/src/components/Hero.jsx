import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Truck, Shield, Headphones, Sparkles, Zap } from 'lucide-react';

const Hero = () => {
  return (
    <section className="relative min-h-screen bg-dark-900 text-white overflow-hidden pt-16">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-dark-gradient"></div>
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary-800/30 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10 container mx-auto px-4 py-20">
        <div className="grid lg:grid-cols-[2fr_1fr] gap-12 items-center">
          {/* Left content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-flex items-center space-x-2 bg-primary-600/20 backdrop-blur-sm border border-primary-500/30 text-primary-300 px-4 py-2 rounded-full text-sm font-semibold">
              <Sparkles className="w-4 h-4" />
              <span>Welcome to the Future of Shopping</span>
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
              Discover Amazing
              <br />
              <span className="text-gradient inline-block transform hover:scale-105 transition-transform">
                Products
              </span>
              <br />
              <span className="text-gray-300 text-3xl lg:text-4xl font-normal">
                at Unbeatable Prices
              </span>
            </h1>

            <p className="text-xl text-gray-300 leading-relaxed max-w-2xl">
              Explore our curated collection of premium products with cutting-edge technology,
              exceptional quality, and unmatched value. Experience shopping like never before.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/products"
                className="btn-primary px-8 py-4 text-lg flex items-center justify-center group hover:animate-glow"
              >
                <span>Shop Now</span>
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                to="/categories"
                className="btn-secondary px-8 py-4 text-lg flex items-center justify-center group"
              >
                <Zap className="mr-2 w-5 h-5" />
                <span>Explore Categories</span>
              </Link>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-6 pt-8">
              <div className="text-center group">
                <div className="bg-dark-800 p-3 rounded-xl mb-3 group-hover:bg-primary-600/20 transition-colors">
                  <Truck className="w-8 h-8 mx-auto text-primary-400" />
                </div>
                <p className="text-sm text-gray-300 font-medium">Free Shipping</p>
                <p className="text-xs text-gray-500">On orders over $50</p>
              </div>
              <div className="text-center group">
                <div className="bg-dark-800 p-3 rounded-xl mb-3 group-hover:bg-primary-600/20 transition-colors">
                  <Shield className="w-8 h-8 mx-auto text-primary-400" />
                </div>
                <p className="text-sm text-gray-300 font-medium">Secure Payment</p>
                <p className="text-xs text-gray-500">100% Protected</p>
              </div>
              <div className="text-center group">
                <div className="bg-dark-800 p-3 rounded-xl mb-3 group-hover:bg-primary-600/20 transition-colors">
                  <Headphones className="w-8 h-8 mx-auto text-primary-400" />
                </div>
                <p className="text-sm text-gray-300 font-medium">24/7 Support</p>
                <p className="text-xs text-gray-500">Always here to help</p>
              </div>
            </div>
          </div>

          {/* Right content - Hero Image */}
          <div className="relative animate-fade-in delay-300">
            <div className="glass-effect rounded-3xl p-4 border-primary-500/20 hover:border-primary-400/40 transition-all duration-300 group overflow-hidden">
              <img
                src="72b53342236bbfe66fd3f3b599baf829.jpg"
                alt="Premium Shopping Experience"
                className="w-full h-96 object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white p-3 rounded-full shadow-2xl animate-bounce">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white p-3 rounded-full shadow-2xl animate-pulse">
              <Zap className="w-5 h-5" />
            </div>

            {/* Additional decorative elements */}
            <div className="absolute top-1/2 -left-2 w-4 h-4 bg-primary-400 rounded-full animate-ping"></div>
            <div className="absolute top-1/4 -right-2 w-3 h-3 bg-pink-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 pt-16 border-t border-primary-500/20">
        <div className="text-center group">
          <div className="text-4xl font-bold text-gradient mb-2 group-hover:animate-pulse">50K+</div>
          <p className="text-gray-300 font-medium">Happy Customers</p>
          <p className="text-gray-500 text-sm mt-1">Worldwide</p>
        </div>
        <div className="text-center group">
          <div className="text-4xl font-bold text-gradient mb-2 group-hover:animate-pulse">2K+</div>
          <p className="text-gray-300 font-medium">Premium Products</p>
          <p className="text-gray-500 text-sm mt-1">Curated Collection</p>
        </div>
        <div className="text-center group">
          <div className="text-4xl font-bold text-gradient mb-2 group-hover:animate-pulse">99.9%</div>
          <p className="text-gray-300 font-medium">Satisfaction Rate</p>
          <p className="text-gray-500 text-sm mt-1">Customer Reviews</p>
        </div>
        <div className="text-center group">
          <div className="text-4xl font-bold text-gradient mb-2 group-hover:animate-pulse">24/7</div>
          <p className="text-gray-300 font-medium">Expert Support</p>
          <p className="text-gray-500 text-sm mt-1">Always Available</p>
        </div>
      </div>
    </section>
  );
};

export default Hero;
