import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import Notification from './Notification';

const NotificationContainer = () => {
  const { notifications } = useNotification();

  return (
    <div 
      className="fixed top-5 right-5 w-96 max-w-full z-50 space-y-2"
      aria-live="assertive"
      aria-atomic="true"
    >
      {notifications.map((notification) => (
        <Notification key={notification.id} notification={notification} />
      ))}
    </div>
  );
};

export default NotificationContainer;
