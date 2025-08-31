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
    contact_email: '',
    contact_phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    credit_limit: 0,
    payment_terms: '',
    minimum_order: 0,
    discount_rate: 0,
    notes: ''
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
    <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        {isEdit ? 'Edit Supplier' : 'Create New Supplier'}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Supplier Name *" 
              value={form.name} 
              onChange={e => handleChange('name', e.target.value)} 
              required 
              placeholder="Enter supplier company name"
            />
            <Input 
              label="Contact Person" 
              value={form.contact_person} 
              onChange={e => handleChange('contact_person', e.target.value)} 
              placeholder="Primary contact person name"
            />
            <Input 
              label="Email" 
              type="email" 
              value={form.contact_email} 
              onChange={e => handleChange('contact_email', e.target.value)} 
              placeholder="contact@supplier.com"
            />
            <Input 
              label="Phone" 
              value={form.contact_phone} 
              onChange={e => handleChange('contact_phone', e.target.value)} 
              placeholder="+212 5XX XXX XXX"
            />
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Address Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input 
                label="Address" 
                value={form.address} 
                onChange={e => handleChange('address', e.target.value)} 
                placeholder="Street address"
              />
            </div>
            <Input 
              label="City" 
              value={form.city} 
              onChange={e => handleChange('city', e.target.value)} 
              placeholder="City"
            />
            <Input 
              label="State/Province" 
              value={form.state} 
              onChange={e => handleChange('state', e.target.value)} 
              placeholder="State or Province"
            />
            <Input 
              label="Postal Code" 
              value={form.postal_code} 
              onChange={e => handleChange('postal_code', e.target.value)} 
              placeholder="Postal/ZIP code"
            />
            <Input 
              label="Country" 
              value={form.country} 
              onChange={e => handleChange('country', e.target.value)} 
              placeholder="Country"
            />
          </div>
        </div>

        {/* Financial Terms */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">Financial Terms</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Credit Limit (DH)"
              type="number"
              min="0"
              step="0.01"
              value={form.credit_limit}
              onChange={e => handleChange('credit_limit', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
            <Input 
              label="Minimum Order (DH)" 
              type="number"
              min="0"
              step="0.01"
              value={form.minimum_order}
              onChange={e => handleChange('minimum_order', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
            <Input 
              label="Discount Rate (%)" 
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.discount_rate}
              onChange={e => handleChange('discount_rate', parseFloat(e.target.value) || 0)}
              placeholder="0.00"
            />
            <Input 
              label="Payment Terms" 
              value={form.payment_terms} 
              onChange={e => handleChange('payment_terms', e.target.value)} 
              placeholder="e.g., Net 30, Cash on delivery"
            />
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
              <textarea
                value={form.notes}
                onChange={e => handleChange('notes', e.target.value)}
                placeholder="Additional notes about supplier"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/suppliers')}
          >
            Cancel
          </Button>
          <Button type="submit">
            {isEdit ? 'Update Supplier' : 'Create Supplier'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SupplierForm;
