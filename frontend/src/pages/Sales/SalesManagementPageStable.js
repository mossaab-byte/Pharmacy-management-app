import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../../components/ErrorBoundary';
import { LoadingSpinner } from '../../components/UI';
import { Button } from '../../components/UI';
import { Plus, ArrowLeft, RefreshCw, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react';
import salesService from '../../services/salesServices';

const SalesManagementPageStable = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await salesService.getAll();
      // Ensure we always have an array
      let salesData = [];
      if (Array.isArray(response)) {
        salesData = response;
      } else if (response && Array.isArray(response.data)) {
        salesData = response.data;
      } else if (response && Array.isArray(response.results)) {
        salesData = response.results;
      }
      setSales(salesData);
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError('Failed to load sales. Please try again.');
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this sale?')) return;
    
    setDeletingId(id);
    try {
      await salesService.remove(id);
      setSales(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Error deleting sale:', err);
      setError('Failed to delete sale. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (id) => {
    if (id) {
      navigate(`/sales/${id}`);
    }
  };

  const handleEdit = (id) => {
    if (id) {
      navigate(`/sales/edit/${id}`);
    }
  };

  const filteredSales = sales.filter(sale => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      (sale?.customer_name || '').toLowerCase().includes(search) ||
      (sale?.date || '').toLowerCase().includes(search) ||
      (sale?.status || '').toLowerCase().includes(search) ||
      (sale?.reference || '').toLowerCase().includes(search)
    );
  });

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

  const getStatusStyle = (status) => {
    const statusStyles = {
      completed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800'
    };
    return statusStyles[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <ErrorBoundary>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">Sales Management</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={fetchSales}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => navigate('/sales/new')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Sale
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search sales..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
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
          /* Sales Table */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reference
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSales.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                        {sales.length === 0 ? 'No sales found' : 'No sales match your search'}
                      </td>
                    </tr>
                  ) : (
                    filteredSales.map((sale) => (
                      <tr key={sale?.id || Math.random()} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(sale?.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {sale?.reference || `SALE-${sale?.id || 'N/A'}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {sale?.customer_name || sale?.customer || 'Walk-in Customer'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {formatCurrency(sale?.total || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusStyle(sale?.status || 'pending')}`}>
                            {sale?.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {sale?.items_count || 0} items
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(sale?.id)}
                              disabled={!sale?.id}
                              className="flex items-center gap-1"
                            >
                              <Eye className="w-3 h-3" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(sale?.id)}
                              disabled={!sale?.id}
                              className="flex items-center gap-1"
                            >
                              <Edit className="w-3 h-3" />
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(sale?.id)}
                              disabled={deletingId === sale?.id || !sale?.id}
                              className="flex items-center gap-1"
                            >
                              <Trash2 className="w-3 h-3" />
                              {deletingId === sale?.id ? 'Deleting...' : 'Delete'}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Summary */}
        {filteredSales.length > 0 && (
          <div className="mt-6 flex justify-between items-center text-sm text-gray-600">
            <div>
              Showing {filteredSales.length} of {sales.length} sales
            </div>
            <div>
              Total value: {formatCurrency(filteredSales.reduce((sum, s) => sum + (s?.total || 0), 0))}
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default SalesManagementPageStable;
