import React, { useState } from 'react';
import  inventoryService  from '../../services/inventoryService';
import { useNotification } from '../../contexts/NotificationContext';
import Input from '../../components/UI/Input';
import Button from '../../components/UI/Button';

const StockUpdateForm = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    quantity_change: '',
    type: 'add',
    reason: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const { addNotification } = useNotification();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await inventoryService.updateStock({
        ...formData,
        item_id: item.id
      });
      addNotification({
        type: 'success',
        message: 'Stock updated successfully'
      });
      onSave();
    } catch (error) {
      addNotification({
        type: 'error',
        message: error.response?.data?.message || 'Failed to update stock'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h4 className="text-lg font-semibold">{item?.medicine_name}</h4>
        <p className="text-sm text-gray-600">Current Stock: {item?.quantity}</p>
      </div>
      
      <div>
        <label htmlFor="type" className="block text-sm font-medium mb-1">
          Action Type
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleInputChange}
          className="block w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="add">Add Stock</option>
          <option value="remove">Remove Stock</option>
          <option value="adjust">Adjust Stock</option>
        </select>
      </div>
      
      <Input
        label="Quantity"
        name="quantity_change"
        type="number"
        value={formData.quantity_change}
        onChange={handleInputChange}
        required
      />
      
      <Input
        label="Reason"
        name="reason"
        value={formData.reason}
        onChange={handleInputChange}
        placeholder="e.g., New purchase, Expired, Damaged"
        required
      />
      
      <div>
        <label htmlFor="notes" className="block text-sm font-medium mb-1">
          Notes
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="Additional notes..."
          className="block w-full rounded border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          rows={3}
        />
      </div>
      
      <div className="flex justify-end space-x-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Stock'}
        </Button>
      </div>
    </form>
  );
};

export default StockUpdateForm;
