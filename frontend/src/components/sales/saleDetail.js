import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import salesServiceNew from '../../services/salesServiceNew';
import { Card, Button, LoadingSpinner, ErrorMessage } from '../UI';
import { useNotification } from '../../context/NotificationContext';
import { ArrowLeft, Edit, Trash2, User, Calendar, Package, DollarSign } from 'lucide-react';

const SaleDetail = () => {
  const { id } = useParams();
  const [sale, setSale] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    loadSaleDetails();
  }, [id]);

  const loadSaleDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Loading sale details for ID:', id);
      const saleData = await salesServiceNew.getSaleDetails(id);
      console.log('✅ Sale data loaded:', saleData);
      
      // DEBUG: Log the items array specifically
      if (saleData.items) {
        console.log('📦 Items array:', saleData.items);
        saleData.items.forEach((item, index) => {
          console.log(`📦 Item ${index}:`, {
            medicine_name: item.medicine_name,
            unit_price: item.unit_price,
            quantity: item.quantity,
            subtotal: item.subtotal,
            raw_item: item
          });
        });
      } else {
        console.log('❌ No items array found in sale data');
      }
      
      setSale(saleData);
    } catch (err) {
      console.error('❌ Error fetching sale details:', err);
      setError('Failed to load sale details. Please try again.');
      addNotification('Error fetching sale details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/sales/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this sale? This action cannot be undone.')) {
      return;
    }

    setDeleting(true);
    try {
      await salesServiceNew.deleteSale(id);
      addNotification('Sale deleted successfully', 'success');
      navigate('/sales');
    } catch (err) {
      console.error('❌ Error deleting sale:', err);
      addNotification('Failed to delete sale', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const formatCurrency = (amount) => {
    // Convert string to number if needed
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    if (typeof numAmount !== 'number' || isNaN(numAmount)) return '0.00 DH';
    return `${numAmount.toFixed(2)} DH`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleString();
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <ErrorMessage message={error} onClose={() => setError(null)} />
        <div className="mt-4">
          <Button onClick={() => navigate('/sales')} variant="outline">
            Back to Sales
          </Button>
        </div>
      </div>
    );
  }

  if (!sale) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <p className="text-gray-600 text-lg">Sale not found</p>
        <div className="mt-4">
          <Button onClick={() => navigate('/sales')} variant="outline">
            Back to Sales
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
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
            <h1 className="text-2xl font-bold text-gray-900">Sale Details</h1>
            <p className="text-gray-600">
              {sale.reference || `SALE-${sale.id?.substring(0, 8)}`}
            </p>
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

      {/* Sale Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Date</p>
              <p className="font-semibold">{formatDate(sale.created_at)}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="font-semibold text-lg text-green-600">
                {formatCurrency(sale.total || sale.total_amount)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Items</p>
              <p className="font-semibold">{sale.items?.length || 0} items</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Customer Information */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <User className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Customer Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium">
              {sale.customer_name || 'Walk-in Customer'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium">
              {sale.customer_phone || 'N/A'}
            </p>
          </div>
        </div>
      </Card>

      {/* Sale Items */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Package className="w-5 h-5 text-blue-600" />
          <h2 className="text-lg font-semibold">Sale Items</h2>
        </div>
        
        {sale.items && sale.items.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 border border-gray-200 font-medium">Medicine</th>
                  <th className="text-left p-3 border border-gray-200 font-medium">Code</th>
                  <th className="text-right p-3 border border-gray-200 font-medium">Quantity</th>
                  <th className="text-right p-3 border border-gray-200 font-medium">Unit Price</th>
                  <th className="text-right p-3 border border-gray-200 font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {sale.items.map((item, idx) => {
                  // DEBUG: Log each item as it's being rendered
                  console.log(`🎨 Rendering item ${idx}:`, {
                    medicine_name: item.medicine_name,
                    unit_price: item.unit_price,
                    unit_price_type: typeof item.unit_price,
                    quantity: item.quantity,
                    subtotal: item.subtotal,
                    formatted_unit_price: formatCurrency(item.unit_price),
                    formatted_subtotal: formatCurrency(item.subtotal || (item.unit_price * item.quantity))
                  });
                  
                  return (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="p-3 border border-gray-200">
                        {item.medicine_name || 'Unknown Medicine'}
                      </td>
                      <td className="p-3 border border-gray-200 text-sm text-gray-600">
                        {item.medicine_code || 'N/A'}
                      </td>
                      <td className="p-3 border border-gray-200 text-right">
                        {item.quantity}
                      </td>
                      <td className="p-3 border border-gray-200 text-right">
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td className="p-3 border border-gray-200 text-right font-medium">
                        {formatCurrency(item.subtotal || (item.unit_price * item.quantity))}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-gray-50 font-semibold">
                  <td colSpan="4" className="p-3 border border-gray-200 text-right">
                    Total:
                  </td>
                  <td className="p-3 border border-gray-200 text-right text-lg text-green-600">
                    {formatCurrency(sale.total || sale.total_amount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No items found for this sale</p>
        )}
      </Card>

      {/* Additional Information */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Additional Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Status</p>
            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 capitalize">
              {sale.status || 'completed'}
            </span>
          </div>
          <div>
            <p className="text-sm text-gray-600">Served By</p>
            <p className="font-medium">{sale.served_by_name || 'N/A'}</p>
          </div>
          {sale.notes && (
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Notes</p>
              <p className="font-medium">{sale.notes}</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SaleDetail;
