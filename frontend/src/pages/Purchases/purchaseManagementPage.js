import React, { useEffect, useState } from 'react';
import purchaseService from '../../services/purchaseService';
import PurchaseTable from '../../components/purchases/purchaseTable';
import { LoadingSpinner, Button } from '../../components/UI';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../../components/ErrorBoundary';

const PurchaseManagementPage = () => {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetch = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await purchaseService.getAll();
      // Handle different response formats
      let purchaseData = [];
      if (Array.isArray(response)) {
        purchaseData = response;
      } else if (response && response.data) {
        purchaseData = Array.isArray(response.data) ? response.data : [];
      } else if (response && response.results) {
        purchaseData = Array.isArray(response.results) ? response.results : [];
      }
      
      setPurchases(purchaseData);
    } catch (err) {
      setError('Failed to load purchases');
      console.error('Purchase fetch error:', err);
      // Set empty array as fallback
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete purchase?')) return;
    setDeletingId(id);
    setError(null);
    try {
      await purchaseService.remove(id);
      fetch();
    } catch (err) {
      setError('Failed to delete purchase');
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
          <h1 className="text-2xl font-semibold">Purchases</h1>
          <Button 
            onClick={() => navigate('/purchases/new')}
            variant="primary"
          >
            Add New Purchase
          </Button>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
            <button 
              onClick={fetch}
              className="ml-4 text-sm underline"
            >
              Try again
            </button>
          </div>
        )}

        <div className="bg-white rounded-lg shadow">
          <PurchaseTable 
            purchases={purchases} 
            onDelete={handleDelete}
            deletingId={deletingId}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default PurchaseManagementPage;
