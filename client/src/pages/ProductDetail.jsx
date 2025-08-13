import React from 'react';
import { useParams } from 'react-router-dom';

const ProductDetail = () => {
  const { id } = useParams();

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gradient">Product Detail</h1>
        <p className="text-gray-400 mt-4">Product ID: {id}</p>
        <p className="text-gray-400">This page will show product details.</p>
      </div>
    </div>
  );
};

export default ProductDetail;
