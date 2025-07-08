import React from 'react';
import { DollarSign, Package, TrendingUp, ShoppingCart, RefreshCw } from 'lucide-react';
import KpiCard from '../../components/dashboard/KpiCard';
import RevenueChart from '../../components/dashboard/RevenueChart';
import TopProductsChart from '../../components/dashboard/TopProductsChart';
import InventoryTable from '../../components/dashboard/InventoryTable';
import SalesChart from '../../components/dashboard/SalesChart';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorMessage from '../../components/UI/ErrorMessage';
import { useDashboard } from '../../context/DashboardContext';
import { useAuth } from '../../context/authContext';

const Dashboard = () => {
  const {
    dashboardData: data,
    loading,
    error,
    refreshing,
    refreshData: handleRefresh
  } = useDashboard();

  const { user } = useAuth();

  // Check if user has a pharmacy registered
  if (!user?.pharmacy) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Welcome to Your Pharmacy Dashboard</h1>
            <p className="text-gray-600 mt-2">We're setting up your pharmacy data...</p>
          </div>
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-lg text-gray-700">Preparing your dashboard</p>
            <p className="mt-2 text-gray-500">
              This may take a moment. If this takes too long, try refreshing the page.
            </p>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-2">Welcome back! Here's your pharmacy overview.</p>
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
            title="Total Revenue"
            value={`$${data?.kpis?.totalRevenue?.toLocaleString() || '0'}`}
            icon={DollarSign}
            color="green"
            trend="up"
            trendValue="+12%"
          />
          <KpiCard
            title="Prescriptions Filled"
            value={data?.kpis?.prescriptionsFilled?.toLocaleString() || '0'}
            icon={Package}
            color="blue"
            trend="up"
            trendValue="+8%"
          />
          <KpiCard
            title="Inventory Value"
            value={`$${data?.kpis?.inventoryValue?.toLocaleString() || '0'}`}
            icon={TrendingUp}
            color="purple"
            trend="up"
            trendValue="+5%"
          />
          <KpiCard
            title="Total Sales"
            value={data?.sales?.length?.toLocaleString() || '0'}
            icon={ShoppingCart}
            color="orange"
            trend="up"
            trendValue="+15%"
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {data?.revenueTrend && <RevenueChart data={data.revenueTrend} />}
          {data?.topProducts && <TopProductsChart data={data.topProducts} />}
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {data?.sales && <SalesChart data={data.sales} />}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Sale</span>
                <span className="font-semibold">
                  ${data?.sales?.length ? (data.sales.reduce((sum, sale) => sum + sale.total_amount, 0) / data.sales.length).toFixed(2) : '0'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Low Stock Items</span>
                <span className="font-semibold text-red-600">
                  {data?.inventory?.filter(item => item.stock <= item.minimum_stock_level).length || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Products</span>
                <span className="font-semibold">{data?.inventory?.length || 0}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Inventory Table */}
        {data?.inventory && <InventoryTable data={data.inventory} />}
      </div>
    </div>
  );
};

export default Dashboard;