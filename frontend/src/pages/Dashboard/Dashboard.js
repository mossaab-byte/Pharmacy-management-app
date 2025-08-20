import React, { useState, useEffect } from 'react';
import { DollarSign, Package, TrendingUp, ShoppingCart, RefreshCw } from 'lucide-react';
import KpiCard from '../../components/dashboard/KpiCard';
import RevenueChart from '../../components/dashboard/RevenueChart';
import TopProductsChart from '../../components/dashboard/TopProductsChart';
import InventoryTable from '../../components/dashboard/InventoryTable';
import SalesChart from '../../components/dashboard/SalesChart';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorMessage from '../../components/UI/ErrorMessage';
import ErrorBoundary from '../../components/ErrorBoundary';
import { useDashboard } from '../../context/SimpleDashboardContext';


const Dashboard = () => {
  const {
    dashboardData: data,
    loading,
    error,
    refreshing,
    refreshData: handleRefresh
  } = useDashboard();

  // Debug: Always log the KPIs at the very top
  if (data && data.kpis) {
    console.log('Dashboard KPIs (top-level):', data.kpis);
    console.log('Dashboard salesMonthly:', data.kpis.salesMonthly);
  } else {
    console.log('Dashboard KPIs (top-level):', data);
  }

  // Initialize user with default to prevent timing issues
  const [user, setUser] = useState(() => {
    // Immediately try to get user from localStorage on component mount
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Ensure user always has a pharmacy to avoid loading issues
        if (!parsedUser.pharmacy) {
          parsedUser.pharmacy = {
            id: 1,
            name: 'PharmaGestion',
            address: '123 Main St, City'
          };
        }
        return parsedUser;
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
    }
    
    // Default mock user to prevent loading screen
    return {
      id: 1,
      username: 'marouaneTibary',
      email: 'marouane@pharmacy.com',
      pharmacy: {
        id: 1,
        name: 'PharmaGestion',
        address: '123 Main St, City'
      }
    };
  });

  // Load user from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        // Ensure user always has a pharmacy
        if (!parsedUser.pharmacy) {
          parsedUser.pharmacy = {
            id: 1,
            name: 'PharmaGestion',
            address: '123 Main St, City'
          };
          // Update localStorage with pharmacy info
          localStorage.setItem('user', JSON.stringify(parsedUser));
        }
        setUser(parsedUser);
      } else {
        // Set mock user for development
        const mockUser = {
          id: 1,
          username: 'marouaneTibary',
          email: 'marouane@pharmacy.com',
          pharmacy: {
            id: 1,
            name: 'PharmaGestion',
            address: '123 Main St, City'
          }
        };
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      // Set mock user as fallback
      const mockUser = {
        id: 1,
        username: 'marouaneTibary',
        email: 'marouane@pharmacy.com',
        pharmacy: {
          id: 1,
          name: 'PharmaGestion',
          address: '123 Main St, City'
        }
      };
      localStorage.setItem('user', JSON.stringify(mockUser));
      setUser(mockUser);
    }
  }, []);

  // Add debug logging for user state
  console.log('Dashboard user state:', user);
  console.log('User has pharmacy:', !!user?.pharmacy);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back! Here's your pharmacy overview.</p>
          </div>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back! Here's your pharmacy overview.</p>
          </div>
          <ErrorMessage message={error} onRetry={handleRefresh} />
        </div>
      </div>
    );
  }

  // Debug: Log the KPIs received from backend
  console.log('Dashboard KPIs:', data?.kpis);
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back! Here's your pharmacy overview.</p>
            {/* DEBUG: Show the full dashboard data object */}
            <pre style={{background:'#eee',color:'#222',padding:'8px',borderRadius:'6px',fontSize:'12px',maxWidth:'600px',overflow:'auto'}}>
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KpiCard
            title="Total Sales"
            value={`${Array.isArray(data?.salesMonthly) && data.salesMonthly.length > 0
              ? data.salesMonthly.reduce((sum, m) => sum + (typeof m.total === 'number' ? m.total : 0), 0).toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 2 })
              : '0.00'} DH`}
            icon={DollarSign}
            color="green"
            trend="up"
            trendValue="+12%"
          />
          <KpiCard
            title="Clients"
            value={data?.kpis?.totalCustomers?.toLocaleString() || '0'}
            icon={Package}
            color="blue"
            trend="up"
            trendValue="+8%"
          />
          <KpiCard
            title="Total Médicaments (Stock)"
            value={data?.kpis?.totalMedicines?.toLocaleString() || '0'}
            icon={TrendingUp}
            color="purple"
            trend="up"
            trendValue="+5%"
          />
          <KpiCard
            title="Achats Mensuels (DH)"
            value={`${data?.kpis?.purchasesMonthly ? data.kpis.purchasesMonthly.reduce((sum, m) => sum + (m.total || m.total_amount || 0), 0).toLocaleString(undefined, { maximumFractionDigits: 0 }) : '0'} DH`}
            icon={ShoppingCart}
            color="orange"
            trend="up"
            trendValue="+15%"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Use backend monthly sales for the chart */}
          {data?.kpis?.salesMonthly && <RevenueChart data={data.kpis.salesMonthly.map(m => ({ date: m.month, revenue: m.total || m.total_amount || 0 }))} />}
          {data?.topProducts && <TopProductsChart data={data.topProducts} />}
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {data?.sales && <SalesChart data={data.sales} />}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques Rapides</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Vente Moyenne</span>
                <span className="font-semibold">
                  {data?.sales?.length ? (data.sales.reduce((sum, sale) => {
                    // Safely add total_amount if it exists and is a number
                    const amount = Number(sale?.total_amount);
                    return sum + (isNaN(amount) ? 0 : amount);
                  }, 0) / data.sales.length).toFixed(2) : '0'} DH
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Articles Stock Faible</span>
                <span className="font-semibold text-red-600">
                  {data?.inventory?.filter(item => {
                    const stock = Number(item?.stock) || 0;
                    const minLevel = Number(item?.minimum_stock_level) || 0;
                    return stock <= minLevel;
                  }).length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Produits</span>
                <span className="font-semibold">{data?.inventory?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        {data?.inventory && Array.isArray(data.inventory) && (
          <ErrorBoundary showDetail={false}>
            <InventoryTable data={data.inventory} />
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
};

export default Dashboard;