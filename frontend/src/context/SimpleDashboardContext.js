import React, { createContext, useContext, useState, useEffect } from 'react';

const DashboardContext = createContext();

export function DashboardProvider({ children }) {
  const [dashboardData, setDashboardData] = useState({
    kpis: null,
    topProducts: null,
    revenueTrend: null,
    sales: null,
    inventory: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      // Only fetch KPIs for now since we know this works
      const token = localStorage.getItem('access_token') || localStorage.getItem('token');
      
      const kpisResponse = await fetch('http://localhost:8000/api/dashboard/kpis/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!kpisResponse.ok) {
        throw new Error(`KPIs API failed: ${kpisResponse.status}`);
      }

      const kpis = await kpisResponse.json();

      // Try to fetch other endpoints, but don't fail if they don't work
      let topProducts = [];
      let revenueTrend = [];
      let sales = [];
      let inventory = [];

      try {
        const topProductsResponse = await fetch('http://localhost:8000/api/dashboard/top-products/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (topProductsResponse.ok) {
          topProducts = await topProductsResponse.json();
        }
      } catch (e) {
        console.warn('Top products API not available:', e);
      }

      try {
        const revenueResponse = await fetch('http://localhost:8000/api/dashboard/revenue-trend/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (revenueResponse.ok) {
          revenueTrend = await revenueResponse.json();
        }
      } catch (e) {
        console.warn('Revenue trend API not available:', e);
      }

      setDashboardData({
        kpis,
        topProducts: Array.isArray(topProducts) ? topProducts : topProducts.results || [],
        revenueTrend: Array.isArray(revenueTrend) ? revenueTrend : revenueTrend.results || [],
        sales,
        inventory,
      });

    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const refreshData = () => {
    fetchDashboardData(true);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <DashboardContext.Provider value={{
      dashboardData,
      loading,
      error,
      refreshing,
      refreshData
    }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}

export default DashboardContext;
