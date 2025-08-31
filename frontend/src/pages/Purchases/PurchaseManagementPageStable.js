import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../../components/ErrorBoundary';
import { LoadingSpinner } from '../../components/UI';
import { Button } from '../../components/UI';
import { Plus, ArrowLeft, RefreshCw, Search, Filter } from 'lucide-react';
import purchaseService from '../../services/purchaseService';

const PurchaseManagementPageStable = () => {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState('desc');
  const [status, setStatus] = useState('');
  const [supplier, setSupplier] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [total, setTotal] = useState(0);
  const [deletingId, setDeletingId] = useState(null);

  const fetchPurchases = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = {
        search: searchTerm,
        sort_by: sortBy,
        sort_dir: sortDir,
        status: status,
        supplier: supplier,
        page: page,
        page_size: pageSize,
        ...params
      };
      
      const response = await purchaseService.getAll(queryParams);
      
      console.log('🔍 Purchase API Response:', response);
      
      if (response && response.results) {
        console.log('🔍 Purchase Results:', response.results);
        // Debug the first purchase
        if (response.results.length > 0) {
          const firstPurchase = response.results[0];
          console.log('🔍 First Purchase Debug:', {
            id: firstPurchase.id,
            total: firstPurchase.total,
            total_amount: firstPurchase.total_amount,
            supplier_name: firstPurchase.supplier_name,
            items_count: firstPurchase.items_count,
            status: firstPurchase.status,
            date: firstPurchase.date,
            created_at: firstPurchase.created_at
          });
        }
        
        setPurchases(response.results);
        setTotal(response.total || 0);
        setPage(response.page || 1);
        setPageSize(response.page_size || 25);
      } else {
        console.log('🔍 No results in response');
        setPurchases([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('Error fetching purchases:', err);
      setError('Failed to load purchases. Please try again.');
      setPurchases([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [searchTerm, sortBy, sortDir, status, supplier, page, pageSize]);

  const handleSearch = (value) => {
    setSearchTerm(value);
    setPage(1); // Reset to first page when searching
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handleFilterChange = (filterType, value) => {
    if (filterType === 'status') {
      setStatus(value);
    } else if (filterType === 'supplier') {
      setSupplier(value);
    }
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm('Are you sure you want to delete this purchase?')) return;
    
    setDeletingId(id);
    try {
      await purchaseService.remove(id);
      // Refresh the list after deletion
      fetchPurchases();
    } catch (err) {
      console.error('Error deleting purchase:', err);
      setError('Failed to delete purchase. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleView = (id) => {
    if (id) {
      navigate(`/purchases/${id}`);
    }
  };

  const handleEdit = (id) => {
    if (id) {
      console.log('🔍 Direct edit button clicked with ID:', id);
      console.log('🔍 Navigating to:', `/purchases/${id}/edit`);
      navigate(`/purchases/${id}/edit`);
    }
  };

  // Remove frontend filtering since we now use backend filtering
  const displayedPurchases = purchases;

  const formatCurrency = (amount) => {
    console.log('🔍 FormatCurrency input:', { amount, type: typeof amount });
    
    // Handle string numbers from API
    if (typeof amount === 'string') {
      const numericAmount = parseFloat(amount);
      if (!isNaN(numericAmount)) {
        console.log('🔍 FormatCurrency converted string:', numericAmount);
        return `${numericAmount.toFixed(2)} DH`;
      }
    }
    
    // Handle numeric values
    if (typeof amount === 'number' && !isNaN(amount)) {
      console.log('🔍 FormatCurrency using number:', amount);
      return `${amount.toFixed(2)} DH`;
    }
    
    console.log('🔍 FormatCurrency fallback to 0.00');
    return '0.00 DH';
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
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Purchase Management</h1>
              <p className="text-gray-600">Manage your inventory purchases and supplier orders</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/suppliers')}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Manage Suppliers
            </Button>
            <Button
              variant="outline"
              onClick={fetchPurchases}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={() => navigate('/purchases/new')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Purchase
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search purchases by supplier name..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          
          {/* Results summary */}
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Showing {purchases.length} of {total} purchases
              {searchTerm && ` matching "${searchTerm}"`}
              {status && ` with status "${status}"`}
            </span>
            <div className="flex items-center gap-2">
              <span>Sort by:</span>
              <select
                value={`${sortBy}-${sortDir}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-');
                  setSortBy(field);
                  setSortDir(direction);
                  setPage(1);
                }}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="created_at-desc">Date (Newest)</option>
                <option value="created_at-asc">Date (Oldest)</option>
                <option value="total_amount-desc">Amount (High to Low)</option>
                <option value="total_amount-asc">Amount (Low to High)</option>
                <option value="supplier__name-asc">Supplier (A-Z)</option>
                <option value="supplier__name-desc">Supplier (Z-A)</option>
              </select>
            </div>
          </div>
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
          /* Purchases Table */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supplier
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
                  {displayedPurchases.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                        {total === 0 ? 'No purchases found' : 'No purchases match your filters'}
                      </td>
                    </tr>
                  ) : (
                    displayedPurchases.map((purchase) => (
                      <tr key={purchase?.id || Math.random()} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(purchase?.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {purchase?.supplier_name || purchase?.supplier?.name || 'Unknown Supplier'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {formatCurrency(purchase?.total || purchase?.total_amount || 0)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full capitalize ${getStatusStyle(purchase?.status || 'pending')}`}>
                            {purchase?.status || 'pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {purchase?.items_count || 0} items
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleView(purchase?.id)}
                              disabled={!purchase?.id}
                            >
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(purchase?.id)}
                              disabled={!purchase?.id}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDelete(purchase?.id)}
                              disabled={deletingId === purchase?.id || !purchase?.id}
                            >
                              {deletingId === purchase?.id ? 'Deleting...' : 'Delete'}
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

        {/* Pagination and Summary */}
        {displayedPurchases.length > 0 && (
          <div className="mt-6 space-y-4">
            {/* Summary */}
            <div className="flex justify-between items-center text-sm text-gray-600">
              <div>
                Total value: {formatCurrency(displayedPurchases.reduce((sum, p) => {
                  const amount = p?.total || p?.total_amount || 0;
                  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
                  return sum + (isNaN(numericAmount) ? 0 : numericAmount);
                }, 0))}
              </div>
              <div>
                Page {page} of {Math.ceil(total / pageSize)} • {total} total purchases
              </div>
            </div>

            {/* Pagination Controls */}
            {Math.ceil(total / pageSize) > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page <= 1}
                >
                  Previous
                </Button>
                
                {/* Page numbers */}
                <div className="flex gap-1">
                  {Array.from({ length: Math.min(5, Math.ceil(total / pageSize)) }, (_, i) => {
                    const pageNum = Math.max(1, page - 2) + i;
                    if (pageNum > Math.ceil(total / pageSize)) return null;
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pageNum === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= Math.ceil(total / pageSize)}
                >
                  Next
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default PurchaseManagementPageStable;
