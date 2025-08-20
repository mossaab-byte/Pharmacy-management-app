import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const PharmacyCheck = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [hasPharmacy, setHasPharmacy] = useState(false);

  useEffect(() => {
    const checkPharmacy = async () => {
      try {
        const token = localStorage.getItem('access_token') || localStorage.getItem('token');
        if (!token) {
          setLoading(false);
          return;
        }

        // Try to get user's pharmacies through the standard pharmacy API
        const response = await fetch('http://localhost:8000/api/pharmacy/pharmacies/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          const pharmacies = Array.isArray(data) ? data : data.results || [];
          setHasPharmacy(pharmacies.length > 0);
        } else if (response.status === 401) {
          // Token expired, redirect to login
          localStorage.clear();
          window.location.href = '/login';
          return;
        } else {
          console.error('Error checking pharmacy:', response.status);
          setHasPharmacy(false);
        }
      } catch (error) {
        console.error('Error checking pharmacy:', error);
        setHasPharmacy(false);
      } finally {
        setLoading(false);
      }
    };

    checkPharmacy();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div style={{ 
          width: '40px', 
          height: '40px', 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '20px'
        }}></div>
        <p>Checking your pharmacy setup...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!hasPharmacy) {
    return <Navigate to="/register-pharmacy" replace />;
  }

  return children;
};

export default PharmacyCheck;
