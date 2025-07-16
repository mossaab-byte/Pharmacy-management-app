import React, { useEffect, useState } from 'react';
import salesService from '../../services/salesServices';
import { LoadingSpinner, Button } from '../../components/UI';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../../components/ErrorBoundary';

const SalesTable = ({ sales = [], onView, onDelete, deletingId }) => {
  const safeSales = Array.isArray(sales) ? sales : [];

  if (safeSales.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>No sales found.</p>
      </div>
    );
  }

  return (
    <table className="w-full border border-gray-200 text-left border-collapse">
      <thead>
        <tr className="bg-gray-100">
          <th className="p-3 border border-gray-200">Date</th>
          <th className="p-3 border border-gray-200">Customer</th>
          <th className="p-3 border border-gray-200">Total</th>
          <th className="p-3 border border-gray-200">Status</th>
          <th className="p-3 border border-gray-200">Actions</th>
        </tr>
      </thead>
      <tbody>
        {safeSales.map(sale => (
          <tr key={sale.id || `sale-${Math.random()}`} className="hover:bg-gray-50">
            <td className="p-3 border border-gray-200">
              {sale.date ? new Date(sale.date).toLocaleDateString() : 'N/A'}
            </td>
            <td className="p-3 border border-gray-200">
              {sale.customer_name || sale.customer || 'Walk-in Customer'}
            </td>
            <td className="p-3 border border-gray-200">
              {sale.total_amount ? 
                `${sale.total_amount.toFixed(2)} DH` : 
                '0.00 DH'
              }
            </td>
            <td className="p-3 border border-gray-200 capitalize">
              <span className="text-green-700 bg-green-100 px-2 py-1 rounded">
                {sale.status || 'completed'}
              </span>
            </td>
            <td className="p-3 border border-gray-200 space-x-2">
              {onView && (
                <Button
                  size="sm"
                  onClick={() => onView(sale.id)}
                  aria-label={`View sale ${sale.id}`}
                >
                  View
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => onDelete(sale.id)}
                  disabled={deletingId === sale.id}
                  aria-label={`Delete sale ${sale.id}`}
                >
                  {deletingId === sale.id ? 'Deleting...' : 'Delete'}
                </Button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

const SalesManagementPageNew = () => {
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchSales = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await salesService.getSales();
      let salesData = [];
      if (Array.isArray(response)) {
        salesData = response;
      } else if (response && response.data) {
        salesData = Array.isArray(response.data) ? response.data : [];
      } else if (response && response.results) {
        salesData = Array.isArray(response.results) ? response.results : [];
      }
      
      setSales(salesData);
    } catch (err) {
      setError('Failed to load sales');
      console.error('Sales fetch error:', err);
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete sale?')) return;
    setDeletingId(id);
    setError(null);
    try {
      await salesService.deleteSale(id);
      fetchSales();
    } catch (err) {
      setError('Failed to delete sale');
      console.error('Delete error:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="page px-6 py-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Sales Management</h1>
          <Button 
            onClick={() => navigate('/sales/new')}
            variant="primary"
          >
            Add New Sale
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button 
              onClick={fetchSales}
              className="ml-4 text-sm underline"
            >
              Try again
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <SalesTable 
            sales={sales} 
            onView={(id) => navigate(`/sales/${id}`)}
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SalesManagementPageNew;
