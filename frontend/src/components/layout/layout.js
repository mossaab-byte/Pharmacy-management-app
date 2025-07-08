import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './sideBar';
import Header from './header';
import NotificationContainer from '../notifications/NotificationContainer';


const Layout = () => {
  return (
    <div className="layout">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="content">
          <Outlet />
        </div>
      </div>
      <NotificationContainer />
    </div>
  );
};

export default Layout;