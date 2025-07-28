
import React from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../../components/ErrorBoundary';
import { LoadingSpinner } from '../../components/UI';
import { Button } from '../../components/UI';
import { 
  ShoppingCart, 
  Package, 
  Users, 
  TrendingUp, 
  DollarSign, 
  AlertTriangle,
  Eye,
  Plus,
  RefreshCw
} from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';

const DashboardStable = () => {
  const navigate = useNavigate();
  const { dashboardData, loading, error, refreshData } = useDashboard();
  // Fallbacks for stats if not loaded yet
  const stats = {
    totalSales: dashboardData?.totalSales || 0,
    totalPurchases: dashboardData?.totalPurchases || 0,
    totalCustomers: dashboardData?.totalCustomers || 0,
    totalMedicines: dashboardData?.totalMedicines || 0,
    salesMonthly: dashboardData?.salesMonthly || [],
    recentSales: Array.isArray(dashboardData?.recentSales) ? dashboardData.recentSales : [],
    recentPurchases: Array.isArray(dashboardData?.recentPurchases) ? dashboardData.recentPurchases : [],
    lowStockItems: Array.isArray(dashboardData?.lowStockItems) ? dashboardData.lowStockItems : []
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '0.00 DH';
    return `${amount.toFixed(2)} DH`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, onClick }) => (
    <div 
      className={`bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow ${onClick ? 'hover:bg-gray-50' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const QuickActionsCard = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        <Button 
          onClick={() => navigate('/sales/new')}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Sale
        </Button>
        <Button 
          onClick={() => navigate('/purchases/new')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Purchase
        </Button>
        <Button 
          onClick={() => navigate('/medicines/new')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Medicine
        </Button>
        <Button 
          onClick={() => navigate('/customers/new')}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </Button>
      </div>
    </div>
  );

  const RecentActivityCard = ({ title, items, emptyMessage, onViewAll }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onViewAll}
          className="flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          View All
        </Button>
      </div>
      <div className="space-y-3">
        {items.length === 0 ? (
          <p className="text-gray-500 text-center py-4">{emptyMessage}</p>
        ) : (
          items.slice(0, 5).map((item) => (
            <div key={item?.id || Math.random()} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {item?.customer_name || item?.supplier_name || 'Unknown'}
                </div>
                <div className="text-xs text-gray-500">
                  {formatDate(item?.date)}
                </div>
              </div>
              <div className="text-sm font-medium text-gray-900">
                {formatCurrency(item?.total || 0)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  const LowStockCard = () => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Low Stock Items</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/inventory')}
          className="flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          View All
        </Button>
      </div>
      <div className="space-y-3">
        {stats.lowStockItems.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No low stock items</p>
        ) : (
          stats.lowStockItems.slice(0, 5).map((item) => (
            <div key={item?.id || Math.random()} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {item?.nom || item?.name || 'Unknown Medicine'}
                </div>
                <div className="text-xs text-gray-500">
                  {item?.forme || 'N/A'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-red-600">
                  {item?.stock || 0} units
                </span>
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <ErrorBoundary>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Welcome back! Here's what's happening with your pharmacy.</p>
          </div>
          <Button
            variant="outline"
            onClick={refreshData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <div className="text-red-600 text-sm">{error}</div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto"
              >
                Dismiss
              </Button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Sales (Monthly)"
                value={formatCurrency(
                  Array.isArray(stats.salesMonthly) && stats.salesMonthly.length > 0
                    ? stats.salesMonthly.reduce((sum, m) => sum + (typeof m.total === 'number' ? m.total : 0), 0)
                    : 0
                )}
                icon={DollarSign}
                color="bg-green-500"
                onClick={() => navigate('/sales')}
              />
              <StatCard
                title="Total Purchases (Monthly)"
                value={formatCurrency(
                  Array.isArray(stats.purchasesMonthly) && stats.purchasesMonthly.length > 0
                    ? stats.purchasesMonthly.reduce((sum, m) => sum + (typeof m.total === 'number' ? m.total : 0), 0)
                    : 0
                )}
                icon={ShoppingCart}
                color="bg-blue-500"
                onClick={() => navigate('/purchases')}
              />
              <StatCard
                title="Total Customers"
                value={Number.isFinite(stats.totalCustomers) ? stats.totalCustomers.toLocaleString() : '0'}
                icon={Users}
                color="bg-purple-500"
                onClick={() => navigate('/customers')}
              />
              <StatCard
                title="Total Medicines"
                value={Number.isFinite(stats.totalMedicines) ? stats.totalMedicines.toLocaleString() : '0'}
                icon={Package}
                color="bg-orange-500"
                onClick={() => navigate('/medicines')}
              />
            </div>

            {/* Quick Actions */}
            <QuickActionsCard />

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentActivityCard
                title="Recent Sales"
                items={stats.recentSales}
                emptyMessage="No recent sales"
                onViewAll={() => navigate('/sales')}
              />
              <RecentActivityCard
                title="Recent Purchases"
                items={stats.recentPurchases}
                emptyMessage="No recent purchases"
                onViewAll={() => navigate('/purchases')}
              />
            </div>

            {/* Low Stock Items */}
            <LowStockCard />
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default DashboardStable;