import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import purchaseService from '../../services/purchaseService';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import ErrorMessage from '../../components/UI/ErrorMessage';

const PurchaseDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [purchase, setPurchase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPurchase = async () => {
      try {
        setLoading(true);
        const data = await purchaseService.getById(id);
        setPurchase(data);
        setError(null);
      } catch (err) {
        setError('Failed to load purchase details');
        console.error('Error fetching purchase:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPurchase();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this purchase?')) return;

    try {
      await purchaseService.remove(id);
      navigate('/purchases');
    } catch (err) {
      setError('Failed to delete purchase');
      console.error('Error deleting purchase:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!purchase) {
    return (
      <div className="page px-6 py-4">
        <ErrorMessage message={error || "Purchase not found"} />
      </div>
    );
  }

  return (
    <div className="page px-6 py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Purchase Details</h1>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={() => navigate('/purchases')}>
            Back to Purchases
          </Button>
          <Button onClick={() => navigate(`/purchases/${id}/edit`)}>
            Edit Purchase
          </Button>
          <Button
            variant="danger"
            onClick={handleDelete}
            aria-label="Delete purchase"
          >
            Delete Purchase
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} className="mb-4" />}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Purchase ID</h3>
            <p className="text-lg font-semibold">#{purchase.id}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Date</h3>
            <p className="text-lg font-semibold">
              {new Date(purchase.date).toLocaleDateString()}{' '}
              <span className="text-sm text-gray-500 ml-2">
                {new Date(purchase.date).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Status</h3>
            <p className="text-lg font-semibold">
              <span
                className={`px-2 py-1 rounded ${
                  purchase.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : purchase.status === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
              </span>
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Supplier</h3>
            <p className="text-lg font-semibold">{purchase.supplier?.name || 'N/A'}</p>
            {purchase.supplier?.contact_info && (
              <p className="text-gray-600">{purchase.supplier.contact_info}</p>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Invoice Number</h3>
            <p className="text-lg font-semibold">{purchase.invoice_number || 'N/A'}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-500">Total Cost</h3>
            <p className="text-2xl font-bold text-blue-600">{purchase.total.toFixed(2)}</p>
          </div>
        </div>

        {purchase.notes && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Notes</h3>
            <p className="bg-gray-50 p-4 rounded">{purchase.notes}</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Purchase Items</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Medicine
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Quantity
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Unit Price
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Total Price
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {purchase.items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900">{item.medicine.name}</div>
                    <div className="text-sm text-gray-500">{item.medicine.code}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.unit_price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.total_price.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 font-semibold">
              <tr>
                <td colSpan="2" className="px-6 py-3 text-right text-sm">
                  Subtotal:
                </td>
                <td className="px-6 py-3 text-sm"></td>
                <td className="px-6 py-3 text-sm font-medium">
                  {purchase.subtotal?.toFixed(2) || purchase.total.toFixed(2)}
                </td>
              </tr>
              {purchase.tax_amount > 0 && (
                <tr>
                  <td colSpan="2" className="px-6 py-3 text-right text-sm">
                    Tax ({purchase.tax_percentage || 0}%):
                  </td>
                  <td className="px-6 py-3 text-sm"></td>
                  <td className="px-6 py-3 text-sm font-medium">{purchase.tax_amount.toFixed(2)}</td>
                </tr>
              )}
              <tr>
                <td colSpan="2" className="px-6 py-3 text-right text-sm">
                  Total:
                </td>
                <td className="px-6 py-3 text-sm"></td>
                <td className="px-6 py-3 text-sm font-bold text-blue-600">{purchase.total.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PurchaseDetailPage;
