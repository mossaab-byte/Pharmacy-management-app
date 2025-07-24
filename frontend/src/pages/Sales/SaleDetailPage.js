import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, User, Package, Edit, Trash2, CreditCard } from 'lucide-react';
import { Button } from '../../components/UI';
import { LoadingSpinner } from '../../components/UI';
import ErrorBoundary from '../../components/ErrorBoundary';
import salesService from '../../services/salesServiceNew';

const SaleDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchSaleDetails();
  }, [id]);

  const fetchSaleDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log(`🔍 Fetching details for sale ID: ${id}`);
      const saleData = await salesService.getSaleDetails(id);
      setSale(saleData);
      console.log('✅ Sale details loaded:', saleData);
    } catch (err) {
      console.error('❌ Error loading sale details:', err);
      setError('Failed to load sale details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this sale? This action cannot be undone.')) {
      return;
    }
    
    try {
      setDeleting(true);
      await salesService.deleteSale(id);
      console.log(`✅ Sale ${id} deleted successfully`);
      navigate('/sales', { replace: true });
    } catch (err) {
      console.error('❌ Error deleting sale:', err);
      setError('Failed to delete sale. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return '0.00 DH';
    return `${amount.toFixed(2)} DH`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const getStatusStyle = (status) => {
    const statusStyles = {
      completed: 'bg-green-100 text-green-800 border-green-200',
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
      draft: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return statusStyles[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-600 mb-4">{error}</div>
          <div className="flex gap-2">
            <Button onClick={fetchSaleDetails} variant="outline">
              Retry
            </Button>
            <Button onClick={() => navigate('/sales')} variant="outline">
              Back to Sales
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-yellow-600 mb-4">Sale not found</div>
          <Button onClick={() => navigate('/sales')} variant="outline">
            Back to Sales
          </Button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/sales')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sales
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Sale Details
              </h1>
              <p className="text-gray-600">
                {sale.reference || `SALE-${sale.id?.substring(0, 8)}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => navigate(`/sales/edit/${id}`)}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Sale
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>

        {/* Sale Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Date & Time</h3>
            </div>
            <p className="text-gray-600">{formatDate(sale.date)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-3 mb-2">
              <User className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-gray-900">Customer</h3>
            </div>
            <p className="text-gray-600">
              {sale.customer_name || sale.customer || 'Walk-in Customer'}
            </p>
            {sale.customer_phone && (
              <p className="text-sm text-gray-500">
                Phone: {sale.customer_phone}
              </p>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Total Amount</h3>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getStatusStyle(sale.status)}`}>
                {sale.status || 'pending'}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(sale.total)}
            </p>
            {sale.payment_method && (
              <p className="text-sm text-gray-500">
                Payment: {sale.payment_method}
              </p>
            )}
          </div>
        </div>

        {/* Sale Items */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">Items</h3>
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
                {sale.items?.length || 0} items
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Medicine
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sale.items && sale.items.length > 0 ? (
                  sale.items.map((item, index) => (
                    <tr key={item.id || index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-gray-900">
                            {item.medicine_name || item.pharmacy_medicine_name || 'Unknown Medicine'}
                          </div>
                          {item.medicine_description && (
                            <div className="text-sm text-gray-500">
                              {item.medicine_description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {item.quantity || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right text-sm text-gray-900">
                        {formatCurrency(item.unit_price || 0)}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-medium text-gray-900">
                        {formatCurrency((item.quantity || 0) * (item.unit_price || 0))}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      No items found for this sale
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          {sale.items && sale.items.length > 0 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Total Items: {sale.items.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  Total: {formatCurrency(sale.total)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Additional Information */}
        {(sale.notes || sale.created_at) && (
          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Additional Information
            </h3>
            {sale.notes && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <p className="text-gray-600">{sale.notes}</p>
              </div>
            )}
            {sale.created_at && (
              <div className="text-sm text-gray-500">
                Created: {formatDate(sale.created_at)}
              </div>
            )}
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default SaleDetailPage;
