import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../../components/ErrorBoundary';
import { Card, Input, Button, LoadingSpinner, ErrorMessage, Table } from '../../components/UI';
import { useNotification } from '../../context/NotificationContext';
import { ShoppingCart, DollarSign, TrendingUp, Plus, Eye, Calendar } from 'lucide-react';

// Mock service if the real one fails
const mockSalesService = {
  getSales: async () => ({
    data: {
      results: [
        {
          id: 1,
          date: '2024-01-15',
          customer_name: 'John Doe',
          total_amount: 150.00,
          payment_method: 'Credit Card',
          status: 'completed',
          items_count: 3
        },
        {
          id: 2,
          date: '2024-01-14',
          customer_name: 'Jane Smith',
          total_amount: 75.50,
          payment_method: 'Cash',
          status: 'completed',
          items_count: 2
        }
      ],
      count: 2
    }
  }),
  getSalesStats: async () => ({
    data: {
      total_sales: 2,
      total_revenue: 225.50,
      avg_sale_amount: 112.75,
      today_sales: 1
    }
  })
};

const SalesManagementPage = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [salesStats, setSalesStats] = useState({
    total_sales: 0,
    total_revenue: 0,
    avg_sale_amount: 0,
    today_sales: 0
  });
  const [filters, setFilters] = useState({
    date_from: '',
    date_to: '',
    payment_method: '',
    status: ''
  });

  const { addNotification } = useNotification();
  const navigate = useNavigate();
  const itemsPerPage = 20;

  useEffect(() => {
    fetchSales();
    fetchSalesStats();
  }, [currentPage, filters]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let salesService;
      try {
        salesService = (await import('../../services/salesServices')).default;
      } catch (importError) {
        console.warn('Failed to load sales service, using mock:', importError);
        salesService = mockSalesService;
      }

      const params = {
        page: currentPage,
        page_size: itemsPerPage,
        search: searchTerm,
        ...filters
      };
      
      const response = await salesService.getSales(params);
      const data = response.data || response;
      
      setSales(Array.isArray(data.results) ? data.results : []);
      setTotalPages(Math.ceil((data.count || 0) / itemsPerPage));
      
      if (addNotification) {
        addNotification({
          type: 'success',
          message: `Loaded ${data.results?.length || 0} sales records`
        });
      }
    } catch (err) {
      const errorMessage = 'Failed to load sales. Please try again.';
      setError(errorMessage);
      setSales([]);
      console.error('Error fetching sales:', err);
      
      if (addNotification) {
        addNotification({
          type: 'error',
          message: errorMessage
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesStats = async () => {
    try {
      let salesService;
      try {
        salesService = (await import('../../services/salesServices')).default;
      } catch (importError) {
        salesService = mockSalesService;
      }

      const response = await salesService.getSalesStats();
      setSalesStats(response.data || {
        total_sales: 0,
        total_revenue: 0,
        avg_sale_amount: 0,
        today_sales: 0
      });
    } catch (err) {
      console.error('Error fetching sales stats:', err);
      setSalesStats({
        total_sales: 0,
        total_revenue: 0,
        avg_sale_amount: 0,
        today_sales: 0
      });
    }
  };

  const handleRetry = () => {
    fetchSales();
    fetchSalesStats();
  };

  const filteredSales = sales.filter(sale => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      (sale.customer_name && sale.customer_name.toLowerCase().includes(search)) ||
      (sale.id && sale.id.toString().includes(search)) ||
      (sale.payment_method && sale.payment_method.toLowerCase().includes(search))
    );
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'date', label: 'Date', render: (value) => formatDate(value) },
    { key: 'customer_name', label: 'Customer' },
    { key: 'total_amount', label: 'Total', render: (value) => `$${Number(value || 0).toFixed(2)}` },
    { key: 'payment_method', label: 'Payment' },
    { key: 'items_count', label: 'Items' },
    { 
      key: 'status', 
      label: 'Status', 
      render: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(value)}`}>
          {value?.charAt(0).toUpperCase() + value?.slice(1) || 'Unknown'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, sale) => (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/sales/${sale.id}`)}
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <ErrorBoundary>
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
            <p className="text-gray-600">Track and manage your sales</p>
          </div>
          <LoadingSpinner />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
            <p className="text-gray-600">Track and manage your sales</p>
          </div>
          <Button
            onClick={() => navigate('/sales/new')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Sale
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">{salesStats.total_sales}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{Number(salesStats.total_revenue || 0).toFixed(2)} DH</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Sale</p>
                <p className="text-2xl font-bold text-gray-900">{Number(salesStats.avg_sale_amount || 0).toFixed(2)} DH</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Today's Sales</p>
                <p className="text-2xl font-bold text-gray-900">{salesStats.today_sales}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Input
                type="text"
                placeholder="Search sales..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Input
                type="date"
                placeholder="From Date"
                value={filters.date_from}
                onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
              />
            </div>
            <div>
              <Input
                type="date"
                placeholder="To Date"
                value={filters.date_to}
                onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
              />
            </div>
            <div>
              <select
                value={filters.payment_method}
                onChange={(e) => setFilters(prev => ({ ...prev, payment_method: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Payment Methods</option>
                <option value="cash">Cash</option>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="insurance">Insurance</option>
              </select>
            </div>
            <div>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Error Message */}
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onRetry={handleRetry} />
          </div>
        )}

        {/* Sales Table */}
        <Card>
          <Table
            columns={columns}
            data={filteredSales}
            loading={loading}
            emptyMessage="No sales found"
          />
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </ErrorBoundary>
  );
};

export default SalesManagementPage;
