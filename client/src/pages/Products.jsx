import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productAPI } from '../services/api';
import { useApp } from '../contexts/AppContext';

const Products = () => {
  const [searchParams] = useSearchParams();
  const { state, actions } = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'name',
    sortOrder: 'asc',
  });

  const searchQuery = searchParams.get('search') || '';

  useEffect(() => {
    loadProducts();
  }, [searchQuery, filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        search: searchQuery,
      };
      const response = await productAPI.getAllProducts(params);
      setProducts(response.data.data || []);
    } catch (error) {
      actions.setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gradient mb-2">
            {searchQuery ? `Search Results for "${searchQuery}"` : 'All Products'}
          </h1>
          <p className="text-gray-400">
            {products.length} {products.length === 1 ? 'product' : 'products'} found
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 p-6 card">
          <h3 className="text-lg font-semibold text-gray-100 mb-4">Filters</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="input-field"
            >
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="clothing">Clothing</option>
              <option value="books">Books</option>
            </select>
            
            <input
              type="number"
              placeholder="Min Price"
              value={filters.minPrice}
              onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
              className="input-field"
            />
            
            <input
              type="number"
              placeholder="Max Price"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
              className="input-field"
            />
            
            <select
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
              className="input-field"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="rating">Sort by Rating</option>
              <option value="createdAt">Sort by Date</option>
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No products found</p>
            <p className="text-gray-500 mt-2">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product._id} className="card hover:scale-105 transition-transform">
                <div className="aspect-w-16 aspect-h-16 mb-4">
                  <img
                    src={product.images?.[0] || '/placeholder-product.jpg'}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
                <h3 className="text-lg font-semibold text-gray-100 mb-2 line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary-400">
                    ${product.price}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-yellow-400">★</span>
                    <span className="text-gray-300">{product.rating || 4.5}</span>
                  </div>
                </div>
                <button
                  onClick={() => actions.addToCart(product._id, 1)}
                  className="w-full btn-primary"
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Products;
