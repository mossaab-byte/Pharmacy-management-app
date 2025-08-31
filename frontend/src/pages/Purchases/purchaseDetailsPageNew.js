import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorBoundary from '../../components/ErrorBoundary';
import { Card, Button, LoadingSpinner, ErrorMessage } from '../../components/UI';
import { useNotification } from '../../context/NotificationContext';
import purchaseService from '../../services/purchaseService';
import { ArrowLeft, Package, DollarSign, Calendar, User, FileText, Edit, Trash2 } from 'lucide-react';

const PurchaseDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addNotification } = useNotification();

  // State
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPurchaseDetails();
    }
  }, [id]);

  const fetchPurchaseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await purchaseService.getById(id);
      setPurchase(data);
    } catch (error) {
      console.error('Error fetching purchase details:', error);
      setError('Failed to load purchase details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/purchases/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this purchase? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await purchaseService.remove(id);
      addNotification({
        type: 'success',
        message: 'Purchase deleted successfully'
      });
      navigate('/purchases');
    } catch (error) {
      console.error('Error deleting purchase:', error);
      addNotification({
        type: 'error',
        message: 'Failed to delete purchase'
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '0.00 DH';
    return `${amount.toFixed(2)} DH`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
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

  if (loading) {
    return (
      <ErrorBoundary>
        <div className="p-6">
          <LoadingSpinner />
        </div>
      </ErrorBoundary>
    );
  }

  if (!purchase) {
    return (
      <ErrorBoundary>
        <div className="p-6">
          <ErrorMessage message="Purchase not found" />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/purchases')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Purchases
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Purchase Details</h1>
              <p className="text-gray-600">Purchase ID: {purchase.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleEdit}
              className="flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Button>
            <Button
              variant="outline"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>

        {error && (
          <ErrorMessage message={error} onClose={() => setError(null)} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Purchase Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Summary Card */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Package className="w-6 h-6 text-blue-500" />
                <h2 className="text-lg font-semibold">Purchase Summary</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(purchase.total_amount || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Purchase Date</p>
                  <p className="font-medium">{formatDate(purchase.created_at)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Items</p>
                  <p className="font-medium">{purchase.items?.length || 0} items</p>
                </div>
              </div>
            </Card>

            {/* Supplier Info */}
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-6 h-6 text-purple-500" />
                <h2 className="text-lg font-semibold">Supplier</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">{purchase.supplier?.name || 'N/A'}</p>
                </div>
                {purchase.supplier?.contact_email && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{purchase.supplier.contact_email}</p>
                  </div>
                )}
                {purchase.supplier?.contact_phone && (
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{purchase.supplier.contact_phone}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Staff Info */}
            {purchase.received_by && (
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-6 h-6 text-orange-500" />
                  <h2 className="text-lg font-semibold">Received By</h2>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Staff Member</p>
                    <p className="font-medium">
                      {purchase.received_by.first_name && purchase.received_by.last_name
                        ? `${purchase.received_by.first_name} ${purchase.received_by.last_name}`
                        : purchase.received_by.username}
                    </p>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* Purchase Items */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="w-6 h-6 text-green-500" />
                <h2 className="text-lg font-semibold">Purchase Items</h2>
              </div>

              {!purchase.items || purchase.items.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No items found for this purchase</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border p-3 text-left">Medicine</th>
                          <th className="border p-3 text-center">Quantity</th>
                          <th className="border p-3 text-center">Unit Cost</th>
                          <th className="border p-3 text-center">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchase.items.map((item, index) => (
                          <tr key={item.id || index} className="hover:bg-gray-50">
                            <td className="border p-3">
                              <div>
                                <p className="font-medium">
                                  {item.medicine?.nom_commercial || item.medicine?.nom || 'Unknown Medicine'}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {item.medicine?.forme || 'N/A'} • Code: {item.medicine?.code || 'N/A'}
                                </p>
                              </div>
                            </td>
                            <td className="border p-3 text-center">{item.quantity || 0}</td>
                            <td className="border p-3 text-center">{formatCurrency(item.unit_cost || 0)}</td>
                            <td className="border p-3 text-center font-medium">
                              {formatCurrency(item.subtotal || 0)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Total Summary */}
                  <div className="flex justify-end">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-right">
                        <p className="text-sm text-blue-600 mb-1">Grand Total</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {formatCurrency(purchase.total_amount || 0)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default PurchaseDetailPage;
