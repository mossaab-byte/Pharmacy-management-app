import React, { useState, useEffect } from 'react';
import supplierService from '../../services/supplierService';
import SupplierTable from './SupplierTable';
import SupplierForm from './supplierForm';
import SupplierDetails from './supplierDetails';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const data = await supplierService.getAll();
      setSuppliers(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err) {
      console.error('Error loading suppliers:', err);
      setError('Failed to load suppliers');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = () => {
    setSelectedSupplier(null);
    setShowForm(true);
    setShowDetails(false);
  };

  const handleEditSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setShowForm(true);
    setShowDetails(false);
  };

  const handleViewSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setShowDetails(true);
    setShowForm(false);
  };

  const handleDeleteSupplier = async (supplierId) => {
    if (window.confirm('Are you sure you want to delete this supplier?')) {
      try {
        await supplierService.delete(supplierId);
        await loadSuppliers();
      } catch (err) {
        console.error('Error deleting supplier:', err);
        setError('Failed to delete supplier');
      }
    }
  };

  const handleFormSubmit = async (supplierData) => {
    try {
      if (selectedSupplier) {
        await supplierService.update(selectedSupplier.id, supplierData);
      } else {
        await supplierService.create(supplierData);
      }
      await loadSuppliers();
      setShowForm(false);
      setSelectedSupplier(null);
    } catch (err) {
      console.error('Error saving supplier:', err);
      setError('Failed to save supplier');
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setShowDetails(false);
    setSelectedSupplier(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Supplier Management</h1>
        <p className="text-gray-600">Manage your suppliers and their information</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {showForm ? (
        <SupplierForm
          supplier={selectedSupplier}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
        />
      ) : showDetails ? (
        <SupplierDetails
          supplier={selectedSupplier}
          onEdit={() => handleEditSupplier(selectedSupplier)}
          onClose={handleFormCancel}
        />
      ) : (
        <SupplierTable
          suppliers={suppliers}
          onAdd={handleAddSupplier}
          onEdit={handleEditSupplier}
          onView={handleViewSupplier}
          onDelete={handleDeleteSupplier}
          onRefresh={loadSuppliers}
        />
      )}
    </div>
  );
};

export default SupplierManagement;
