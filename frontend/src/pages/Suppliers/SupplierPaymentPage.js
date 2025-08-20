import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ErrorBoundary from '../../components/ErrorBoundary';
import { Card, Input, Button, LoadingSpinner, ErrorMessage, Modal } from '../../components/UI';
import { useNotification } from '../../context/NotificationContext';
import supplierService from '../../services/supplierService';
import { ArrowLeft, DollarSign, CreditCard, Calendar, User, Plus, Minus, History, AlertTriangle } from 'lucide-react';

const SupplierPaymentPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  // State
  const [supplier, setSupplier] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Payment form state
  const [paymentData, setPaymentData] = useState({
    amount: '',
    reference: '',
    notes: ''
  });

  useEffect(() => {
    if (id) {
      fetchSupplierData();
      fetchTransactions();
    }
  }, [id]);

  const fetchSupplierData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supplierService.getById(id);
      setSupplier(data);
    } catch (error) {
      console.error('Error fetching supplier:', error);
      setError('Failed to load supplier data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const data = await supplierService.getTransactions(id);
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setTransactions([]);
    }
  };

  const handleRecordPayment = async (e) => {
    e.preventDefault();
    
    if (!paymentData.amount || parseFloat(paymentData.amount) <= 0) {
      addNotification({
        type: 'error',
        message: 'Please enter a valid payment amount'
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        amount: parseFloat(paymentData.amount),
        reference: paymentData.reference || `Payment-${Date.now()}`,
        notes: paymentData.notes
      };

      await supplierService.recordPayment(id, payload);
      
      // Refresh data
      await Promise.all([fetchSupplierData(), fetchTransactions()]);
      
      // Reset form
      setPaymentData({ amount: '', reference: '', notes: '' });
      setShowPaymentModal(false);
      
      addNotification({
        type: 'success',
        message: 'Payment recorded successfully'
      });
    } catch (error) {
      console.error('Error recording payment:', error);
      addNotification({
        type: 'error',
        message: `Failed to record payment: ${error.message}`
      });
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '0.00 DH';
    return `${amount.toFixed(2)} DH`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'purchase':
        return <Plus className="w-4 h-4 text-red-500" />;
      case 'payment':
        return <Minus className="w-4 h-4 text-green-500" />;
      default:
        return <History className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTransactionStyle = (type) => {
    switch (type) {
      case 'purchase':
        return 'text-red-600';
      case 'payment':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getCreditUtilization = () => {
    if (!supplier || !supplier.credit_limit || supplier.credit_limit === 0) return 0;
    return (supplier.current_balance / supplier.credit_limit) * 100;
  };

  const getCreditStatus = () => {
    const utilization = getCreditUtilization();
    if (utilization >= 90) return { color: 'text-red-600', status: 'Critical' };
    if (utilization >= 70) return { color: 'text-yellow-600', status: 'Warning' };
    return { color: 'text-green-600', status: 'Good' };
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

  if (!supplier) {
    return (
      <ErrorBoundary>
        <div className="p-6 max-w-4xl mx-auto">
          <Card className="p-12 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Supplier Not Found</h2>
            <p className="text-gray-600 mb-4">The requested supplier could not be found.</p>
            <Button onClick={() => navigate('/suppliers')}>
              Back to Suppliers
            </Button>
          </Card>
        </div>
      </ErrorBoundary>
    );
  }

  const creditStatus = getCreditStatus();

  return (
    <ErrorBoundary>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/suppliers')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Suppliers
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Supplier Payment Management</h1>
              <p className="text-gray-600">{supplier.name}</p>
            </div>
          </div>
          <Button
            onClick={() => setShowPaymentModal(true)}
            className="flex items-center gap-2"
          >
            <DollarSign className="w-4 h-4" />
            Record Payment
          </Button>
        </div>

        {error && (
          <ErrorMessage message={error} onClose={() => setError(null)} />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Financial Overview */}
          <div className="lg:col-span-1 space-y-6">
            {/* Current Balance */}
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold">Financial Overview</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Balance
                  </label>
                  <div className={`text-2xl font-bold ${
                    supplier.current_balance > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {formatCurrency(supplier.current_balance || 0)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credit Limit
                  </label>
                  <div className="text-lg font-medium text-blue-600">
                    {formatCurrency(supplier.credit_limit || 0)}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Available Credit
                  </label>
                  <div className="text-lg font-medium text-green-600">
                    {formatCurrency((supplier.credit_limit || 0) - (supplier.current_balance || 0))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Credit Utilization
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          getCreditUtilization() >= 90 ? 'bg-red-500' :
                          getCreditUtilization() >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(getCreditUtilization(), 100)}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium ${creditStatus.color}`}>
                      {getCreditUtilization().toFixed(1)}%
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${creditStatus.color}`}>
                    Status: {creditStatus.status}
                  </p>
                </div>

                {supplier.payment_terms && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Terms
                    </label>
                    <p className="text-gray-600">{supplier.payment_terms}</p>
                  </div>
                )}
              </div>

              {getCreditUtilization() >= 90 && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">Credit Limit Warning</span>
                  </div>
                  <p className="text-xs text-red-600 mt-1">
                    This supplier is close to their credit limit. Consider recording a payment.
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Transaction History */}
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <History className="w-5 h-5 text-purple-500" />
                <h2 className="text-lg font-semibold">Transaction History</h2>
              </div>
              
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No transactions found</p>
                  <p className="text-sm">Transaction history will appear here</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border p-3 text-left">Date</th>
                        <th className="border p-3 text-left">Type</th>
                        <th className="border p-3 text-center">Amount</th>
                        <th className="border p-3 text-left">Reference</th>
                        <th className="border p-3 text-center">Balance</th>
                        <th className="border p-3 text-left">Created By</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction, index) => (
                        <tr key={transaction.id || index} className="hover:bg-gray-50">
                          <td className="border p-3">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-gray-400" />
                              <span className="text-sm">{formatDate(transaction.date)}</span>
                            </div>
                          </td>
                          <td className="border p-3">
                            <div className="flex items-center gap-2">
                              {getTransactionIcon(transaction.type)}
                              <span className={`text-sm font-medium capitalize ${getTransactionStyle(transaction.type)}`}>
                                {transaction.type}
                              </span>
                            </div>
                          </td>
                          <td className="border p-3 text-center">
                            <span className={`font-medium ${getTransactionStyle(transaction.type)}`}>
                              {transaction.type === 'purchase' ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </span>
                          </td>
                          <td className="border p-3">
                            <span className="text-sm text-gray-600">
                              {transaction.reference || 'N/A'}
                            </span>
                          </td>
                          <td className="border p-3 text-center font-medium">
                            {formatCurrency(transaction.running_balance || 0)}
                          </td>
                          <td className="border p-3">
                            <div className="flex items-center gap-2">
                              <User className="w-3 h-3 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {transaction.created_by?.username || 'System'}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Payment Modal */}
        <Modal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title="Record Payment"
        >
          <form onSubmit={handleRecordPayment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Balance: <span className="text-red-600 font-semibold">{formatCurrency(supplier.current_balance || 0)}</span>
              </label>
            </div>
            
            <Input
              label="Payment Amount (DH) *"
              type="number"
              step="0.01"
              value={paymentData.amount}
              onChange={(e) => setPaymentData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="0.00"
              min="0.01"
              max={supplier.current_balance || undefined}
              required
            />
            
            <Input
              label="Reference Number"
              value={paymentData.reference}
              onChange={(e) => setPaymentData(prev => ({ ...prev, reference: e.target.value }))}
              placeholder="e.g., CHECK-001, TRANSFER-123"
            />
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={paymentData.notes}
                onChange={(e) => setPaymentData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes about this payment..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {paymentData.amount && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-700">
                  <strong>New Balance After Payment:</strong> {formatCurrency((supplier.current_balance || 0) - parseFloat(paymentData.amount || 0))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={submitting || !paymentData.amount || parseFloat(paymentData.amount) <= 0}
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    Recording...
                  </>
                ) : (
                  'Record Payment'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPaymentModal(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </ErrorBoundary>
  );
};

export default SupplierPaymentPage;
