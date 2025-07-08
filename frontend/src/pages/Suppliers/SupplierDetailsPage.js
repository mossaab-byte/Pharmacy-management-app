import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SupplierDetails from '../../components/suppliers/supplierDetails';
import  supplierService  from '../../services/supplierService';
import { useNotification } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const SupplierDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const [supplier, setSupplier] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSupplier = () => {
    setLoading(true);
    supplierService.getById(id)
      .then(data => setSupplier(data))
      .catch(() => {
        addNotification({ type: 'error', message: 'Failed to load supplier details' });
        navigate('/suppliers');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSupplier();
  }, [id]);

  const handleClose = () => navigate('/suppliers');

  const handleEdit = () => navigate(`/suppliers/${id}/edit`);

  return (
    <div className="page px-6 py-4 max-w-4xl mx-auto">
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <LoadingSpinner />
        </div>
      ) : (
        supplier && (
          <SupplierDetails
            supplier={supplier}
            onClose={handleClose}
            onEdit={handleEdit}
            onUpdated={fetchSupplier}
          />
        )
      )}
    </div>
  );
};

export default SupplierDetailsPage;
