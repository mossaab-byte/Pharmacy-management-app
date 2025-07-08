import React from 'react';
import { useNotification } from '../../context/NotificationContext';

const Notification = ({ notification }) => {
  const { removeNotification } = useNotification();

  // Map notification types to Tailwind color classes
  const typeStyles = {
    success: 'bg-green-100 text-green-800 border-green-400',
    error: 'bg-red-100 text-red-800 border-red-400',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-400',
    info: 'bg-blue-100 text-blue-800 border-blue-400',
  };

  return (
    <div
      className={`notification flex items-center justify-between px-4 py-2 border-l-4 rounded shadow-sm mb-3
        ${typeStyles[notification.type] || typeStyles.info}`}
      role="alert"
    >
      <span className="flex-grow">{notification.message}</span>
      <button
        onClick={() => removeNotification(notification.id)}
        className="ml-4 text-xl font-bold focus:outline-none hover:text-gray-700"
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
};

export default Notification;
