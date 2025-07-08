import React from 'react';
import { AuthProvider } from './context/authContext';
import { NotificationProvider } from './context/NotificationContext';
import AppRouter from './router';

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppRouter />
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;