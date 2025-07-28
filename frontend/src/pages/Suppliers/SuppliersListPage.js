import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SupplierTable from '../../components/suppliers/SupplierTable';
import Button from '../../components/UI/Button';
import  supplierService  from '../../services/supplierService';
import { useNotification } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const SupplierListPage = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const fetchSuppliers = (params = {}) => {
    setLoading(true);
    supplierService.getAll({ page, page_size: pageSize, ...params })
      .then(data => {
        setSuppliers(Array.isArray(data.results) ? data.results : []);
        setTotal(data.total || 0);
        setPage(data.page || 1);
        setPageSize(data.page_size || 25);
      })
      .catch(() => addNotification({ type: 'error', message: 'Failed to load suppliers' }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSuppliers();
    // eslint-disable-next-line
  }, [page, pageSize]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier?')) return;
    try {
      await supplierService.remove(id);
      addNotification({ type: 'success', message: 'Supplier deleted' });
      fetchSuppliers();
    } catch {
      addNotification({ type: 'error', message: 'Failed to delete supplier' });
    }
  };

  const handleView = (id) => {
    navigate(`/suppliers/${id}`);
  };

  const handlePay = (id) => {
    // Replace with your payment route if different
    navigate(`/suppliers/${id}/payments`);
  };

  const handleAddNew = () => {
    navigate('/suppliers/new');
  };

  return (
    <div className="page px-6 py-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Suppliers</h1>
        <Button onClick={handleAddNew}>+ New Supplier</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <LoadingSpinner />
        </div>
      ) : (
        <SupplierTable
          suppliers={suppliers}
          onView={handleView}
          onDelete={handleDelete}
          onPay={handlePay}
        />
      )}
    </div>
  );
};

export default SupplierListPage;
