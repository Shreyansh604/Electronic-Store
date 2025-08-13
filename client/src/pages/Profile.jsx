import React from 'react';
import { useApp } from '../contexts/AppContext';

const Profile = () => {
  const { state } = useApp();

  return (
    <div className="min-h-screen bg-dark-900 pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gradient mb-6">Profile</h1>
        <div className="card p-6">
          {state.user ? (
            <div>
              <p className="text-gray-100">Name: {state.user.firstName} {state.user.lastName}</p>
              <p className="text-gray-100 mt-2">Email: {state.user.email}</p>
            </div>
          ) : (
            <p className="text-gray-400">Please log in to view your profile.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
