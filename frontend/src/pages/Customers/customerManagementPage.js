import React, { useState, useEffect } from 'react';
import customerService from '../../services/customerService';

import CustomerTable from '../../components/customers/customerTable';
import { LoadingSpinner, Button,ErrorMessage } from '../../components/UI';
import { useNavigate } from 'react-router-dom';

const CustomerManagementPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await customerService.getAll();
      setCustomers(data);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
      setError('Failed to load customer list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await customerService.remove(id);
      fetchCustomers();
    } catch (err) {
      console.error('Error deleting customer:', err);
      setError('Failed to delete customer.');
    }
  };

  return (
    <div className="page px-6 py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Customers</h1>
        <Button onClick={() => navigate('/customers/new')}>+ New Customer</Button>
      </div>

      {error && <ErrorMessage message={error} className="mb-4" />}
      {loading ? (
        <LoadingSpinner />
      ) : (
        <CustomerTable 
          customers={customers} 
          onView={(id) => navigate(`/customers/${id}`)} 
          onEdit={(id) => navigate(`/customers/edit/${id}`)} 
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default CustomerManagementPage;
