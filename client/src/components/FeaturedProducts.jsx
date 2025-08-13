import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Eye } from 'lucide-react';

const FeaturedProducts = () => {
  const products = [
    {
      id: 1,
      name: 'iPhone 15 Pro Max',
      category: 'Smartphones',
      price: 1199,
      originalPrice: 1299,
      rating: 4.8,
      reviews: 1250,
      image: '📱',
      badge: 'New',
      badgeColor: 'bg-green-500'
    },
    {
      id: 2,
      name: 'MacBook Pro M3',
      category: 'Laptops',
      price: 1999,
      originalPrice: 2299,
      rating: 4.9,
      reviews: 850,
      image: '💻',
      badge: 'Hot',
      badgeColor: 'bg-red-500'
    },
    {
      id: 3,
      name: 'Sony WH-1000XM5',
      category: 'Audio',
      price: 299,
      originalPrice: 399,
      rating: 4.7,
      reviews: 2100,
      image: '🎧',
      badge: '25% OFF',
      badgeColor: 'bg-orange-500'
    },
    {
      id: 4,
      name: 'iPad Air M2',
      category: 'Tablets',
      price: 599,
      originalPrice: 699,
      rating: 4.6,
      reviews: 680,
      image: '📟',
      badge: 'Sale',
      badgeColor: 'bg-purple-500'
    },
    {
      id: 5,
      name: 'Apple Watch Series 9',
      category: 'Wearables',
      price: 399,
      originalPrice: 449,
      rating: 4.5,
      reviews: 920,
      image: '⌚',
      badge: 'Popular',
      badgeColor: 'bg-blue-500'
    },
    {
      id: 6,
      name: 'Samsung Galaxy S24 Ultra',
      category: 'Smartphones',
      price: 1299,
      originalPrice: 1399,
      rating: 4.8,
      reviews: 1100,
      image: '📱',
      badge: 'Featured',
      badgeColor: 'bg-yellow-500'
    },
    {
      id: 7,
      name: 'AirPods Pro (2nd gen)',
      category: 'Audio',
      price: 249,
      originalPrice: 279,
      rating: 4.9,
      reviews: 3200,
      image: '🎵',
      badge: 'Bestseller',
      badgeColor: 'bg-green-600'
    },
    {
      id: 8,
      name: 'Dell XPS 13 Plus',
      category: 'Laptops',
      price: 1299,
      originalPrice: 1499,
      rating: 4.4,
      reviews: 450,
      image: '💻',
      badge: '13% OFF',
      badgeColor: 'bg-red-500'
    }
  ];

  return (
    <section className="py-20 bg-dark-900">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary-600/20 backdrop-blur-sm border border-primary-500/30 text-primary-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <span>✨</span>
            <span>Handpicked Collection</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
            Featured Products
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Discover our carefully curated selection of premium products with cutting-edge technology and unmatched quality
          </p>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="card hover:scale-105 hover:border-primary-400/40 transition-all duration-300 group overflow-hidden animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Product image */}
              <div className="relative p-6 bg-gradient-to-br from-dark-800 to-dark-700 rounded-t-xl">
                {/* Badge */}
                <div className={`absolute top-4 left-4 ${product.badgeColor} text-white px-3 py-1 rounded-full text-xs font-semibold z-10 animate-pulse`}>
                  {product.badge}
                </div>

                {/* Wishlist button */}
                <button className="absolute top-4 right-4 p-2 bg-dark-800 rounded-full shadow-lg hover:shadow-xl hover:bg-dark-700 transition-all opacity-0 group-hover:opacity-100 z-10">
                  <Heart className="w-4 h-4 text-gray-400 hover:text-red-400 hover:fill-red-400 transition-colors" />
                </button>

                {/* Product image placeholder */}
                <div className="aspect-square flex items-center justify-center text-7xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {product.image}
                </div>

                {/* Quick view button */}
                <button className="absolute inset-x-6 bottom-4 bg-primary-600 hover:bg-primary-500 text-white py-2 px-4 rounded-lg font-semibold opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 flex items-center justify-center hover:animate-glow">
                  <Eye className="w-4 h-4 mr-2" />
                  Quick View
                </button>
              </div>

              {/* Product info */}
              <div className="p-6">
                <div className="text-sm text-primary-400 font-semibold mb-2 uppercase tracking-wider">
                  {product.category}
                </div>

                <Link
                  to={`/products/${product.id}`}
                  className="block hover:text-primary-400 transition-colors group"
                >
                  <h3 className="text-lg font-bold text-gray-100 mb-3 line-clamp-2 group-hover:text-gradient">
                    {product.name}
                  </h3>
                </Link>

                {/* Rating */}
                <div className="flex items-center mb-4">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < Math.floor(product.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-600'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-400 ml-2">
                    {product.rating} • {product.reviews.toLocaleString()} reviews
                  </span>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-primary-400">
                      ${product.price.toLocaleString()}
                    </span>
                    {product.originalPrice > product.price && (
                      <span className="text-sm text-gray-500 line-through">
                        ${product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {product.originalPrice > product.price && (
                    <div className="text-sm font-semibold text-green-400">
                      Save ${(product.originalPrice - product.price).toLocaleString()}
                    </div>
                  )}
                </div>

                {/* Add to cart button */}
                <button className="w-full btn-primary py-3 text-sm font-semibold flex items-center justify-center group hover:animate-glow">
                  <ShoppingCart className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* View all products button */}
        <div className="text-center">
          <Link
            to="/products"
            className="inline-flex items-center btn-primary text-lg px-12 py-4 group hover:animate-glow"
          >
            <span>Explore All Products</span>
            <svg className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <p className="text-gray-400 mt-4 text-sm">
            Discover thousands of products in our complete collection
          </p>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
