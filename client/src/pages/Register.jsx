import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

const Register = () => {
  const { actions } = useApp();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      actions.setError('Passwords do not match');
      return;
    }
    
    try {
      await actions.register(formData);
      navigate('/login');
    } catch (error) {
      // Error is handled by the context
    }
  };

  return (
    <div className="min-h-screen bg-dark-900 pt-20 flex items-center justify-center">
      <div className="max-w-md w-full card p-8">
        <h1 className="text-3xl font-bold text-gradient text-center mb-6">Sign Up</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                First Name
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="input-field w-full"
                placeholder="First name"
              />
            </div>
            
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Last Name
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="input-field w-full"
                placeholder="Last name"
              />
            </div>
          </div>
          
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
          
          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="input-field w-full"
              placeholder="Confirm your password"
            />
          </div>
          
          <button type="submit" className="w-full btn-primary py-3">
            Sign Up
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-400 hover:text-primary-300">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
