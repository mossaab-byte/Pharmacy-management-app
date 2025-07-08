import React, { useEffect, useState } from 'react';
import purchaseService from '../../services/purchaseService';
import PurchaseTable from '../../components/purchases/purchaseTable';
import { LoadingSpinner, Button } from '../../components/UI';
import { useNavigate } from 'react-router-dom';

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
      const data = await purchaseService.getAll();
      setPurchases(data);
    } catch (err) {
      setError('Failed to load purchases');
      console.error(err);
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
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="page px-6 py-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Purchases</h1>
        <Button onClick={() => navigate('/purchases/new')}>+ New Purchase</Button>
      </div>
      {error && <p className="mb-4 text-red-600">{error}</p>}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <PurchaseTable
          purchases={purchases}
          onView={(id) => navigate(`/purchases/${id}`)}
          onDelete={handleDelete}
          deletingId={deletingId}
        />
      )}
    </div>
  );
};

export default PurchaseManagementPage;
