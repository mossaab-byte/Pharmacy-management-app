import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';

const ErrorMessage = ({ message, className = '' }) => {
  if (!message) return null; // Optional: don't render if no message

  return (
    <div className={`bg-red-50 border-l-4 border-red-500 p-4 ${className}`} role="alert">
      <div className="flex items-center">
        <FaExclamationTriangle className="text-red-500 mr-2" aria-hidden="true" />
        <span className="text-red-700 font-medium">{message}</span>
      </div>
    </div>
  );
};

export default ErrorMessage;
