import React from 'react';
import { useApp } from '../contexts/AppContext';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';

const Notification = () => {
  const { state, actions } = useApp();

  if (!state.notification && !state.error) return null;

  const notification = state.notification || { type: 'error', message: state.error };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-900/20 border-green-500/50';
      case 'error':
        return 'bg-red-900/20 border-red-500/50';
      case 'warning':
        return 'bg-yellow-900/20 border-yellow-500/50';
      case 'info':
      default:
        return 'bg-blue-900/20 border-blue-500/50';
    }
  };

  const handleClose = () => {
    if (state.notification) {
      actions.clearNotification();
    } else {
      actions.clearError();
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-up">
      <div className={`
        glass-effect rounded-lg border p-4 pr-8 max-w-md shadow-xl
        ${getBgColor(notification.type)}
      `}>
        <div className="flex items-start space-x-3">
          {getIcon(notification.type)}
          <p className="text-gray-100 text-sm font-medium flex-1">
            {notification.message}
          </p>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
