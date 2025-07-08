import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ message, className = '', onRetry }) => {
  if (!message) return null; // Optional: don't render if no message

  return (
    <div className={`bg-red-50 border-l-4 border-red-500 p-4 ${className}`} role="alert">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="text-red-500 mr-2 h-5 w-5" aria-hidden="true" />
          <span className="text-red-700 font-medium">{message}</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorMessage;
