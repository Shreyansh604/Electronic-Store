import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const Login = () => {
  const { actions } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await actions.login(formData);
      navigate('/');
    } catch (error) {
      // Error is handled by the context
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 pt-20 flex items-center justify-center">
      <div className="max-w-md w-full card p-8">
        <h1 className="text-3xl font-bold text-gradient text-center mb-6">Sign In</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input-field w-full"
              placeholder="Enter your email"
            />
          </div>
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input-field w-full"
              placeholder="Enter your password"
            />
          </div>
          
          <button type="submit" className="w-full btn-primary py-3">
            Sign In
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-400 hover:text-primary-300">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
