import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const header = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div>
      {/* Temporary test component - remove after verification */}
      <div className="p-4 mb-4 bg-green-100 border-l-4 border-green-500">
        <p className="text-green-700">Tailwind is working!</p>
      </div>

      <header className="bg-pharmacy-primary text-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Pharmacy Management System</h1>
          
          <nav className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="font-medium">Welcome, {user.username}</span>
                <button 
                  onClick={logout}
                  className="bg-pharmacy-accent hover:bg-opacity-90 px-4 py-2 rounded transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <a 
                  href="/login" 
                  className="hover:underline px-3 py-2 rounded hover:bg-white hover:bg-opacity-10 transition"
                >
                  Login
                </a>
                <a 
                  href="/register" 
                  className="bg-white text-pharmacy-primary px-4 py-2 rounded hover:bg-opacity-90 transition"
                >
                  Register
                </a>
              </>
            )}
          </nav>
        </div>
      </header>

      {children}
    </div>
  );
};

export default header;
