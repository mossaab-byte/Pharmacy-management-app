import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: '📊' },
    { path: '/medicines', label: 'Medicines', icon: '💊' },
    { path: '/inventory', label: 'Inventory', icon: '📦' },
    { path: '/sales', label: 'Sales', icon: '💰' },
    { path: '/purchases', label: 'Purchases', icon: '🛒' },
    { path: '/exchanges', label: 'Exchanges', icon: '🔄' },
    { path: '/customers', label: 'Customers', icon: '👥' },
    { path: '/suppliers', label: 'Suppliers', icon: '🏭' },
    { path: '/finance', label: 'Finance', icon: '💳' },
    { path: '/reports', label: 'Reports', icon: '📈' },
    { path: '/users', label: 'Users', icon: '👤' },
    { path: '/pharmacy', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <aside className="w-64 bg-pharmacy-primary text-white min-h-screen flex flex-col">
      <div className="p-6 text-3xl font-extrabold tracking-tight">
        PharmaCare
      </div>
      <nav className="flex flex-col flex-grow px-4 space-y-2">
        {menuItems.map(({ path, label, icon }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md transition 
                ${isActive ? 'bg-pharmacy-accent font-semibold shadow-md' : 'hover:bg-pharmacy-accent/70'}`}
            >
              <span className="text-xl">{icon}</span>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

export default Sidebar;
