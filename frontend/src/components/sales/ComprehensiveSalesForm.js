import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Select } from '../UI';
import MedicineAutocomplete from '../common/MedicineAutocomplete';
import customerService from '../../services/customerService';
import salesService from '../../services/salesServices';
import ErrorBoundary from '../ErrorBoundary';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';

const ComprehensiveSalesForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    customer_id: '',
    payment_method: 'cash',
    notes: '',
    items: [{ medicine: null, quantity: 1, unit_price: 0, total: 0 }]
  });

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const customersData = await customerService.getAll();
      setCustomers(Array.isArray(customersData) ? customersData : []);
    } catch (error) {
      console.error('Error loading customers:', error);
      setError('Failed to load customers');
    }
  };

  const handleMedicineSelect = (medicine, index) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      medicine: medicine,
      unit_price: medicine.ppv || medicine.prix_public || 0,
      total: (medicine.ppv || medicine.prix_public || 0) * updatedItems[index].quantity
    };
    setFormData({ ...formData, items: updatedItems });
  };

  const handleQuantityChange = (index, quantity) => {
    const updatedItems = [...formData.items];
    const qty = Math.max(1, parseInt(quantity) || 1);
    updatedItems[index] = {
      ...updatedItems[index],
      quantity: qty,
      total: updatedItems[index].unit_price * qty
    };
    setFormData({ ...formData, items: updatedItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { medicine: null, quantity: 1, unit_price: 0, total: 0 }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const updatedItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: updatedItems });
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!formData.customer_id) {
        throw new Error('Please select a customer');
      }

      if (formData.items.some(item => !item.medicine)) {
        throw new Error('Please select medicine for all items');
      }

      // Prepare data for submission
      const saleData = {
        customer_id: formData.customer_id,
        payment_method: formData.payment_method,
        notes: formData.notes,
        total_amount: calculateTotal(),
        items: formData.items.map(item => ({
          medicine_id: item.medicine.id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.total
        }))
      };

      await salesService.createSale(saleData);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/sales');
      }, 2000);

    } catch (error) {
      console.error('Error creating sale:', error);
      setError(error.message || 'Failed to create sale');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-green-600 text-lg font-semibold mb-2">
            ✅ Sale Created Successfully!
          </div>
          <p className="text-green-700">Redirecting to sales list...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/sales')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sales
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">New Sale</h1>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-600 text-sm">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer *
                </label>
                <Select
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full"
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name || `${customer.user?.first_name || ''} ${customer.user?.last_name || ''}`.trim() || `Customer ${customer.id}`}
                    </option>
                  ))}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <Select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
                  className="w-full"
                >
                  <option value="cash">Cash</option>
                  <option value="credit_card">Credit Card</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                </Select>
              </div>
            </div>
          </div>

          {/* Medicine Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Medicine Items</h3>
              <Button
                type="button"
                onClick={addItem}
                className="flex items-center gap-2"
                variant="outline"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {formData.items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    {/* Medicine Search */}
                    <div className="md:col-span-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medicine * (Search from 5000+ medicines)
                      </label>
                      <MedicineAutocomplete
                        onSelect={(medicine) => handleMedicineSelect(medicine, index)}
                        placeholder="Rechercher médicaments par nom, DCI, code..."
                        className="w-full"
                        maxResults={8}
                        showBarcode={true}
                      />
                      {item.medicine && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-sm">
                          <div className="font-medium">{item.medicine.nom}</div>
                          <div className="text-gray-600">{item.medicine.dci1} • {item.medicine.forme}</div>
                          <div className="text-gray-600">Prix: {parseFloat(item.medicine.ppv || 0).toFixed(2)} DH</div>
                        </div>
                      )}
                    </div>

                    {/* Quantity */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Unit Price
                      </label>
                      <Input
                        type="number"
                        step="0.01"
                        value={item.unit_price}
                        readOnly
                        className="w-full bg-gray-50"
                      />
                    </div>

                    {/* Total */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Total
                      </label>
                      <Input
                        type="text"
                        value={`${item.total.toFixed(2)} DH`}
                        readOnly
                        className="w-full bg-gray-50 font-medium"
                      />
                    </div>

                    {/* Remove Button */}
                    <div className="md:col-span-1">
                      {formData.items.length > 1 && (
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => removeItem(index)}
                          className="w-full flex items-center justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Amount */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-end">
                <div className="text-right">
                  <div className="text-lg font-semibold">
                    Montant Total: {calculateTotal().toFixed(2)} DH
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Additional Notes</h3>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Enter any additional notes for this sale..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/sales')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || formData.items.some(item => !item.medicine)}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? 'Creating Sale...' : 'Create Sale'}
            </Button>
          </div>
        </form>
      </div>
    </ErrorBoundary>
  );
};

export default ComprehensiveSalesForm;
