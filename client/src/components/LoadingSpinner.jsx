import React from 'react';
import { useApp } from '../contexts/AppContext';

const LoadingSpinner = () => {
  const { state } = useApp();

  if (!state.loading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-900/80 backdrop-blur-sm">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
        <div className="animate-ping absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary-500 rounded-full"></div>
      </div>
      <span className="ml-4 text-gray-300 text-lg animate-pulse">Loading...</span>
    </div>
  );
};

export default LoadingSpinner;
