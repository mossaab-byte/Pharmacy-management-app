import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import customerService from '../../services/customerService';

import { LoadingSpinner, Button,ErrorMessage } from '../../components/UI';
import { useNotification } from '../../context/NotificationContext';
const CustomerDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const [customer, setCustomer] = useState(null);
  const [sales, setSales] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const customerData = await customerService.getById(id);
        const salesData = await customerService.getSales(id);
        const paymentsData = await customerService.getPayments(id);

        setCustomer(customerData);
        setSales(salesData);
        setPayments(paymentsData);
        setError(null);
      } catch (err) {
        console.error('Error fetching customer:', err);
        setError('Failed to load customer data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      setDeleting(true);
      await customerService.remove(id);
      addNotification({ type: 'success', message: 'Customer deleted successfully' });
      navigate('/customers');
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError('Failed to delete customer');
      addNotification({ type: 'error', message: 'Error deleting customer' });
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '—';
    const options = {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  const formatCurrency = (amount) => {
    return `${(amount || 0).toFixed(2)} DH`;
  };

  if (loading) return <LoadingSpinner />;

  if (!customer) {
    return (
      <div className="page px-6 py-4">
        <ErrorMessage message="Customer not found" />
      </div>
    );
  }

  return (
    <div className="page px-6 py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customer Details</h1>
        <div className="flex space-x-2">
          <Button variant="secondary" onClick={() => navigate('/customers')}>Back</Button>
          <Button onClick={() => navigate(`/customers/edit/${id}`)}>Edit</Button>
          <Button variant="danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>

      {error && <ErrorMessage message={error} className="mb-4" />}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="col-span-1 md:col-span-2">
            <h2 className="text-xl font-semibold mb-2">
              {customer.user?.first_name} {customer.user?.last_name}
            </h2>
            <div className="text-gray-700 mb-1">📞 {customer.phone || 'No phone'}</div>
            <div className="text-gray-700 mb-1">📧 {customer.user?.email || 'No email'}</div>
            {customer.address && (
              <div className="mt-3">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Address</h3>
                <p className="text-gray-700">{customer.address}</p>
              </div>
            )}
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-1">Credit Balance</h3>
            <p className={`text-2xl font-bold ${
              customer.balance > 0 ? 'text-green-600' :
              customer.balance < 0 ? 'text-red-600' : 'text-gray-700'
            }`}>
              {formatCurrency(customer.balance)}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              {customer.balance > 0 ? 'Customer has credit' :
               customer.balance < 0 ? 'Customer owes money' : 'No balance due'}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-1">Total Sales</h3>
            <p className="text-2xl font-bold text-gray-800">{sales.length}</p>
            <p className="text-xs text-gray-600 mt-1">All-time purchases</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales History */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Sales History</h2>
            <Button onClick={() => navigate(`/sales/new?customerId=${id}`)}>New Sale</Button>
          </div>
          {sales.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Served By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sales.map(sale => (
                    <tr key={sale.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDateTime(sale.created_at)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">#{sale.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-sm font-medium">{formatCurrency(sale.total_amount)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {sale.served_by?.first_name} {sale.served_by?.last_name}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <button onClick={() => navigate(`/sales/${sale.id}`)} className="text-blue-600 hover:text-blue-900">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No sales found for this customer</p>
              <Button variant="secondary" className="mt-4" onClick={() => navigate(`/sales/new?customerId=${id}`)}>Create First Sale</Button>
            </div>
          )}
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Payment History</h2>
            <Button onClick={() => navigate(`/payments/new?customerId=${id}`)}>Record Payment</Button>
          </div>
          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map(payment => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(payment.created_at)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">#{payment.id.slice(0, 8)}</td>
                      <td className="px-6 py-4 text-sm font-medium text-green-600">{formatCurrency(payment.amount)}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{payment.method || 'N/A'}</td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <button onClick={() => navigate(`/sales/${payment.sale.id}`)} className="text-blue-600 hover:text-blue-900">View Sale</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No payments found for this customer</p>
              <Button variant="secondary" className="mt-4" onClick={() => navigate(`/payments/new?customerId=${id}`)}>Record First Payment</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailPage;
