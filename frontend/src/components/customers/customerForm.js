import React, { useState, useEffect } from 'react';
import Input from '../UI/Input';
import Button from '../UI/Button';
import customerService  from '../../services/customerService';
import { useNavigate, useParams } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';

const CustomerForm = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [form, setForm] = useState({ name: '', phone: '', email: '', credit_balance: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setLoading(true);
      customerService.getById(id)
        .then(data => setForm({
          name: data.name,
          phone: data.phone,
          email: data.email,
          credit_balance: data.credit_balance,
        }))
        .catch(() => addNotification('Failed to load customer', 'error'))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, addNotification]);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await customerService.update(id, form);
        addNotification('Customer updated', 'success');
      } else {
        await customerService.create(form);
        addNotification('Customer created', 'success');
      }
      navigate('/customers');
    } catch {
      addNotification('Error saving customer', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p className="text-center text-gray-500 mt-10">Loading...</p>;

  return (
    <form
      className="max-w-lg mx-auto p-6 bg-white rounded-lg shadow-md"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">{isEdit ? 'Edit Customer' : 'Add Customer'}</h2>

      <Input
        label="Name"
        value={form.name}
        onChange={e => handleChange('name', e.target.value)}
        required
        className="mb-4"
      />
      <Input
        label="Phone"
        value={form.phone}
        onChange={e => handleChange('phone', e.target.value)}
        className="mb-4"
      />
      <Input
        label="Email"
        type="email"
        value={form.email}
        onChange={e => handleChange('email', e.target.value)}
        className="mb-4"
      />
      <Input
        label="Credit Balance"
        type="number"
        min="0"
        value={form.credit_balance}
        onChange={e => handleChange('credit_balance', e.target.value)}
        className="mb-6"
      />

      <div className="flex space-x-4">
        <Button type="submit" disabled={loading}>
          {isEdit ? 'Update' : 'Create'}
        </Button>
        <Button variant="outline" onClick={() => navigate('/customers')}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default CustomerForm;
