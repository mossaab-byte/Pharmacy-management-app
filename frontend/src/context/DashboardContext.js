import React, { createContext, useContext, useState, useEffect } from 'react';
import dashboardService from '../services/dashboardService';

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

      const [kpis, topProducts, revenueTrend, sales, inventory] = await Promise.all([
        dashboardService.getKpis(),
        dashboardService.getTopProducts(),
        dashboardService.getRevenueTrend(),
        dashboardService.getSales(),
        dashboardService.getInventory(),
      ]);

      setDashboardData({
        kpis,
        topProducts,
        revenueTrend,
        sales,
        inventory,
      });
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Dashboard data fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const refreshData = () => {
    fetchDashboardData(true);
  };

  const value = {
    dashboardData,
    loading,
    error,
    refreshing,
    refreshData
  };

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}