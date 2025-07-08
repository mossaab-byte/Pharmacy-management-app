import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import  supplierService  from '../../services/supplierService';
import Input from '../UI/Input';
import Button from '../UI/Button';

const SupplierForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [form, setForm] = useState({
    name: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    country: '',
    credit_limit: 0,
    payment_terms: '',
    delivery_schedule: '',
  });

  useEffect(() => {
    if (isEdit) {
      supplierService.getById(id).then(data => {
        setForm(data);
      });
    }
  }, [id, isEdit]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await supplierService.update(id, form);
      } else {
        await supplierService.create(form);
      }
      navigate('/suppliers');
    } catch (error) {
      console.error(error);
      // You may want to show an error notification here
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto p-6 bg-white rounded shadow space-y-4">
      <Input label="Name" value={form.name} onChange={e => handleChange('name', e.target.value)} required />
      <Input label="Contact Person" value={form.contact_person} onChange={e => handleChange('contact_person', e.target.value)} />
      <Input label="Phone" value={form.phone} onChange={e => handleChange('phone', e.target.value)} />
      <Input label="Email" type="email" value={form.email} onChange={e => handleChange('email', e.target.value)} />
      <Input label="Address" value={form.address} onChange={e => handleChange('address', e.target.value)} />
      <Input label="City" value={form.city} onChange={e => handleChange('city', e.target.value)} />
      <Input label="Country" value={form.country} onChange={e => handleChange('country', e.target.value)} />
      <Input
        label="Credit Limit"
        type="number"
        min="0"
        value={form.credit_limit}
        onChange={e => handleChange('credit_limit', parseFloat(e.target.value) || 0)}
      />
      <Input label="Payment Terms" value={form.payment_terms} onChange={e => handleChange('payment_terms', e.target.value)} />
      <Input label="Delivery Schedule" value={form.delivery_schedule} onChange={e => handleChange('delivery_schedule', e.target.value)} />

      <div className="flex justify-end">
        <Button type="submit">{isEdit ? 'Update Supplier' : 'Create Supplier'}</Button>
      </div>
    </form>
  );
};

export default SupplierForm;
