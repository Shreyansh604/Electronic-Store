import React from 'react';
import { useApp } from '../contexts/AppContext';

const Cart = () => {
  const { state } = useApp();

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gradient mb-6">Shopping Cart</h1>
        <div className="card p-6">
          <p className="text-gray-400">Cart items: {state.cart.count}</p>
          <p className="text-gray-400 mt-2">This page will show cart contents.</p>
        </div>
      </div>
    </div>
  );
};

export default Cart;
