import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI, cartAPI } from '../services/api';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  cart: {
    items: [],
    total: 0,
    count: 0,
  },
  theme: 'dark', // Always dark theme
  error: null,
  notification: null,
};

// Action types
export const actionTypes = {
  SET_LOADING: 'SET_LOADING',
  SET_USER: 'SET_USER',
  SET_ERROR: 'SET_ERROR',
  SET_NOTIFICATION: 'SET_NOTIFICATION',
  CLEAR_ERROR: 'CLEAR_ERROR',
  CLEAR_NOTIFICATION: 'CLEAR_NOTIFICATION',
  SET_CART: 'SET_CART',
  ADD_TO_CART: 'ADD_TO_CART',
  UPDATE_CART_ITEM: 'UPDATE_CART_ITEM',
  REMOVE_FROM_CART: 'REMOVE_FROM_CART',
  CLEAR_CART: 'CLEAR_CART',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.SET_LOADING:
      return {
        ...state,
        loading: action.payload,
      };

    case actionTypes.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        loading: false,
      };

    case actionTypes.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        loading: false,
      };

    case actionTypes.SET_NOTIFICATION:
      return {
        ...state,
        notification: action.payload,
      };

    case actionTypes.CLEAR_ERROR:
      return {
        ...state,
        error: null,
      };

    case actionTypes.CLEAR_NOTIFICATION:
      return {
        ...state,
        notification: null,
      };

    case actionTypes.SET_CART:
      return {
        ...state,
        cart: {
          items: action.payload.items || [],
          total: action.payload.total || 0,
          count: action.payload.items?.reduce((sum, item) => sum + item.quantity, 0) || 0,
        },
      };

    case actionTypes.ADD_TO_CART:
      const existingItemIndex = state.cart.items.findIndex(
        item => item.productId === action.payload.productId
      );
      
      let newItems;
      if (existingItemIndex >= 0) {
        newItems = [...state.cart.items];
        newItems[existingItemIndex].quantity += action.payload.quantity;
      } else {
        newItems = [...state.cart.items, action.payload];
      }

      return {
        ...state,
        cart: {
          ...state.cart,
          items: newItems,
          count: newItems.reduce((sum, item) => sum + item.quantity, 0),
        },
      };

    case actionTypes.UPDATE_CART_ITEM:
      const updatedItems = state.cart.items.map(item =>
        item.id === action.payload.itemId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );

      return {
        ...state,
        cart: {
          ...state.cart,
          items: updatedItems,
          count: updatedItems.reduce((sum, item) => sum + item.quantity, 0),
        },
      };

    case actionTypes.REMOVE_FROM_CART:
      const filteredItems = state.cart.items.filter(
        item => item.id !== action.payload
      );

      return {
        ...state,
        cart: {
          ...state.cart,
          items: filteredItems,
          count: filteredItems.reduce((sum, item) => sum + item.quantity, 0),
        },
      };

    case actionTypes.CLEAR_CART:
      return {
        ...state,
        cart: {
          items: [],
          total: 0,
          count: 0,
        },
      };

    case actionTypes.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        loading: false,
      };

    case actionTypes.LOGOUT:
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        cart: {
          items: [],
          total: 0,
          count: 0,
        },
        loading: false,
      };

    default:
      return state;
  }
};

// Create context
const AppContext = createContext();

// Provider component
export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Actions
  const actions = {
    setLoading: (loading) => dispatch({ type: actionTypes.SET_LOADING, payload: loading }),
    
    setError: (error) => dispatch({ type: actionTypes.SET_ERROR, payload: error }),
    
    clearError: () => dispatch({ type: actionTypes.CLEAR_ERROR }),
    
    setNotification: (notification) => dispatch({ type: actionTypes.SET_NOTIFICATION, payload: notification }),
    
    clearNotification: () => dispatch({ type: actionTypes.CLEAR_NOTIFICATION }),

    // Auth actions
    login: async (credentials) => {
      try {
        actions.setLoading(true);
        const response = await authAPI.login(credentials);
        const { user, accessToken, refreshToken } = response.data.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        dispatch({ type: actionTypes.LOGIN_SUCCESS, payload: { user } });
        actions.setNotification({ type: 'success', message: 'Login successful!' });
        
        // Load cart after login
        await actions.loadCart();
        
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Login failed';
        actions.setError(errorMessage);
        throw error;
      } finally {
        actions.setLoading(false);
      }
    },

    register: async (userData) => {
      try {
        actions.setLoading(true);
        const response = await authAPI.register(userData);
        actions.setNotification({ type: 'success', message: 'Registration successful!' });
        return response.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Registration failed';
        actions.setError(errorMessage);
        throw error;
      } finally {
        actions.setLoading(false);
      }
    },

    logout: async () => {
      try {
        await authAPI.logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        dispatch({ type: actionTypes.LOGOUT });
        actions.setNotification({ type: 'info', message: 'Logged out successfully' });
      }
    },

    loadCurrentUser: async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) {
          dispatch({ type: actionTypes.SET_USER, payload: null });
          return;
        }

        const response = await authAPI.getCurrentUser();
        dispatch({ type: actionTypes.SET_USER, payload: response.data.data });
        
        // Load cart for authenticated user
        await actions.loadCart();
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        dispatch({ type: actionTypes.SET_USER, payload: null });
      }
    },

    // Cart actions
    loadCart: async () => {
      try {
        if (state.isAuthenticated) {
          const response = await cartAPI.getCart();
          dispatch({ type: actionTypes.SET_CART, payload: response.data.data });
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    },

    addToCart: async (productId, quantity = 1) => {
      try {
        if (state.isAuthenticated) {
          await cartAPI.addToCart(productId, quantity);
          await actions.loadCart();
        } else {
          // Add to local cart for non-authenticated users
          dispatch({ 
            type: actionTypes.ADD_TO_CART, 
            payload: { productId, quantity }
          });
        }
        actions.setNotification({ type: 'success', message: 'Added to cart!' });
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to add to cart';
        actions.setError(errorMessage);
      }
    },

    updateCartItem: async (itemId, quantity) => {
      try {
        if (state.isAuthenticated) {
          await cartAPI.updateCartItem(itemId, quantity);
          await actions.loadCart();
        } else {
          dispatch({ 
            type: actionTypes.UPDATE_CART_ITEM, 
            payload: { itemId, quantity }
          });
        }
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to update cart';
        actions.setError(errorMessage);
      }
    },

    removeFromCart: async (itemId) => {
      try {
        if (state.isAuthenticated) {
          await cartAPI.removeFromCart(itemId);
          await actions.loadCart();
        } else {
          dispatch({ type: actionTypes.REMOVE_FROM_CART, payload: itemId });
        }
        actions.setNotification({ type: 'info', message: 'Item removed from cart' });
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to remove from cart';
        actions.setError(errorMessage);
      }
    },

    clearCart: async () => {
      try {
        if (state.isAuthenticated) {
          await cartAPI.clearCart();
        }
        dispatch({ type: actionTypes.CLEAR_CART });
        actions.setNotification({ type: 'info', message: 'Cart cleared' });
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Failed to clear cart';
        actions.setError(errorMessage);
      }
    },
  };

  // Load user on app start
  useEffect(() => {
    actions.loadCurrentUser();
  }, []);

  // Auto-clear notifications after 5 seconds
  useEffect(() => {
    if (state.notification) {
      const timer = setTimeout(() => {
        actions.clearNotification();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [state.notification]);

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook
export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export default AppContext;
