import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SupplierForm from '../../components/Suppliers/SupplierForm';
import  supplierService  from '../../services/supplierService';
import { useNotification } from '../../context/NotificationContext';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const SupplierFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      supplierService.getById(id)
        .then(data => setInitialData(data))
        .catch(() => {
          addNotification({ type: 'error', message: 'Failed to load supplier data' });
          navigate('/suppliers');
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, addNotification, navigate]);

  const handleSubmit = async (formData) => {
    try {
      if (isEdit) {
        await supplierService.update(id, formData);
      } else {
        await supplierService.create(formData);
      }
      addNotification({ type: 'success', message: `Supplier ${isEdit ? 'updated' : 'created'}` });
      navigate('/suppliers');
    } catch {
      addNotification({ type: 'error', message: 'Error saving supplier' });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-48">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="page px-6 py-4 max-w-xl mx-auto">
      <SupplierForm initialData={initialData} onSubmit={handleSubmit} />
    </div>
  );
};

export default SupplierFormPage;
