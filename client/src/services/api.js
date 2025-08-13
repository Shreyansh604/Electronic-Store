import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies for authentication
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(`${api.defaults.baseURL}/api/users/refresh-token`, {
            refreshToken,
          });

          const { accessToken } = response.data.data;
          localStorage.setItem('accessToken', accessToken);

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  register: (userData) => api.post('/api/users/register', userData),
  login: (credentials) => api.post('/api/users/login', credentials),
  logout: () => api.post('/api/users/logout'),
  refreshToken: (refreshToken) => api.post('/api/users/refresh-token', { refreshToken }),
  getCurrentUser: () => api.get('/api/users/current-user'),
  updateProfile: (userData) => api.patch('/api/users/update-account', userData),
  changePassword: (passwordData) => api.patch('/api/users/change-password', passwordData),
};

export const productAPI = {
  getAllProducts: (params) => api.get('/api/products', { params }),
  getProduct: (id) => api.get(`/api/products/${id}`),
  searchProducts: (query) => api.get(`/api/products/search?q=${query}`),
  getProductsByCategory: (categoryId) => api.get(`/api/products/category/${categoryId}`),
  getFeaturedProducts: () => api.get('/api/products/featured'),
};

export const categoryAPI = {
  getAllCategories: () => api.get('/api/categories'),
  getCategory: (id) => api.get(`/api/categories/${id}`),
  getCategoryProducts: (id) => api.get(`/api/categories/${id}/products`),
};

export const cartAPI = {
  getCart: () => api.get('/api/cart'),
  addToCart: (productId, quantity) => api.post('/api/cart/add', { productId, quantity }),
  updateCartItem: (itemId, quantity) => api.patch(`/api/cart/items/${itemId}`, { quantity }),
  removeFromCart: (itemId) => api.delete(`/api/cart/items/${itemId}`),
  clearCart: () => api.delete('/api/cart/clear'),
};

export const orderAPI = {
  createOrder: (orderData) => api.post('/api/orders', orderData),
  getUserOrders: () => api.get('/api/orders/my-orders'),
  getOrder: (id) => api.get(`/api/orders/${id}`),
  updateOrderStatus: (id, status) => api.patch(`/api/orders/${id}/status`, { status }),
};

export const healthAPI = {
  checkHealth: () => api.get('/health'),
  checkAPIHealth: () => api.get('/api/health'),
};

export default api;
