import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const Categories = () => {
  const categories = [
    {
      id: 1,
      name: 'Smartphones',
      icon: '📱',
      description: 'Latest mobile technology',
      productCount: 150,
      color: 'from-primary-600 to-primary-700',
      bgAccent: 'bg-primary-500/10',
      featured: true
    },
    {
      id: 2,
      name: 'Laptops',
      icon: '💻',
      description: 'High-performance computing',
      productCount: 89,
      color: 'from-blue-600 to-indigo-600',
      bgAccent: 'bg-blue-500/10'
    },
    {
      id: 3,
      name: 'Audio',
      icon: '🎧',
      description: 'Premium sound experience',
      productCount: 76,
      color: 'from-emerald-500 to-green-600',
      bgAccent: 'bg-emerald-500/10'
    },
    {
      id: 4,
      name: 'Smart Home',
      icon: '🏠',
      description: 'Connected living solutions',
      productCount: 45,
      color: 'from-orange-500 to-red-500',
      bgAccent: 'bg-orange-500/10'
    },
    {
      id: 5,
      name: 'Gaming',
      icon: '🎮',
      description: 'Gaming gear & accessories',
      productCount: 92,
      color: 'from-red-500 to-pink-600',
      bgAccent: 'bg-red-500/10'
    },
    {
      id: 6,
      name: 'Wearables',
      icon: '⌚',
      description: 'Smart watches & fitness',
      productCount: 34,
      color: 'from-pink-500 to-purple-600',
      bgAccent: 'bg-pink-500/10'
    },
    {
      id: 7,
      name: 'Cameras',
      icon: '📷',
      description: 'Capture every moment',
      productCount: 28,
      color: 'from-yellow-500 to-orange-500',
      bgAccent: 'bg-yellow-500/10'
    },
    {
      id: 8,
      name: 'Accessories',
      icon: '🔌',
      description: 'Cables, cases & more',
      productCount: 156,
      color: 'from-slate-500 to-gray-600',
      bgAccent: 'bg-slate-500/10'
    }
  ];

  return (
    <section className="py-20 bg-dark-800">
      <div className="container mx-auto px-4">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-primary-600/20 backdrop-blur-sm border border-primary-500/30 text-primary-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
            <span>📋</span>
            <span>Explore Collections</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gradient mb-6">
            Shop by Category
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Discover our perfectly organized collections of premium electronics and tech products.
            Find exactly what you need in our curated categories.
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="group relative overflow-hidden card hover:scale-105 hover:border-primary-400/40 transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Background gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>

              <div className="relative z-10 p-8 text-center">
                {/* Icon container */}
                <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl ${category.bgAccent} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <div className="text-4xl">{category.icon}</div>
                </div>

                <h3 className="text-xl font-bold text-gray-100 mb-3 group-hover:text-gradient transition-colors">
                  {category.name}
                </h3>

                <p className="text-gray-400 mb-4 text-sm leading-relaxed">
                  {category.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-dark-600">
                  <span className="text-primary-400 text-sm font-semibold">
                    {category.productCount}+ products
                  </span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary-500/5 to-primary-600/10"></div>
              </div>

              {/* Featured badge */}
              {category.featured && (
                <div className="absolute top-4 right-4 bg-primary-500 text-white text-xs px-2 py-1 rounded-full font-semibold animate-pulse">
                  Popular
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Call to Action Section */}
        <div className="text-center">
          <div className="glass-effect rounded-3xl p-12 border border-primary-500/20">
            <div className="max-w-2xl mx-auto">
              <div className="inline-flex items-center space-x-2 bg-primary-600/20 backdrop-blur-sm border border-primary-500/30 text-primary-300 px-4 py-2 rounded-full text-sm font-semibold mb-6">
                <span>🎆</span>
                <span>Special Offer</span>
              </div>

              <h3 className="text-3xl md:text-4xl font-bold text-gradient mb-6">
                Can't Find What You're Looking For?
              </h3>

              <p className="text-xl text-gray-300 mb-8 leading-relaxed">
                Explore our complete collection of premium electronics and discover thousands of products across all categories.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/products"
                  className="btn-primary px-8 py-4 text-lg group hover:animate-glow"
                >
                  <span>Browse All Products</span>
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/deals"
                  className="btn-secondary px-8 py-4 text-lg group"
                >
                  <span>🔥 View Special Deals</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;
