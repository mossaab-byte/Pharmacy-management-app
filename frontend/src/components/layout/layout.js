import React from 'react';
import Sidebar from './sideBar';
import Header from './header';
import NotificationContainer from '../notifications/NotificationContainer';
import ErrorBoundary from '../ErrorBoundary';

const Layout = ({ children }) => {
  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
            <div className="container mx-auto px-6 py-8">
              {children}
            </div>
          </main>
        </div>
        <NotificationContainer />
      </div>
    </ErrorBoundary>
  );
};

export default Layout;