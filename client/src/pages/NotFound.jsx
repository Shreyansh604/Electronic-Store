import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-dark-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gradient mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-200 mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/" className="btn-primary">
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
