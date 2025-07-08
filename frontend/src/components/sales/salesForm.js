import React, { useState, useEffect } from 'react';
import { Select, Input, Button } from '../UI';
import SaleItemRow from './saleItemRow';
import MedicineSearchWithBarcode from '../common/MedicineSearchWithBarcode';
import customerService from '../../services/customerService';
import medicineService from '../../services/medicineService';
import saleService from '../../services/salesServices';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../ErrorBoundary';

const SalesForm = () => {
  const [customerId, setCustomerId] = useState('');
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([{ medicine: '', quantity: 1 }]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      console.log('Loading customer and medicine data...');
      
      const [customersData, medicinesData] = await Promise.all([
        customerService.getAll(),
        medicineService.getAll()
      ]);
      
      console.log('Customers loaded:', customersData?.length || 0);
      console.log('Medicines loaded:', medicinesData?.length || 0);
      
      setCustomers(customersData || []);
      setMedicines(medicinesData || []);
      
      if (medicinesData && medicinesData.length > 0) {
        console.log('✅ Successfully loaded', medicinesData.length, 'medicines from database');
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setError(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const changeItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItemRow = () => setItems([...items, { medicine: '', quantity: 1 }]);
  
  const removeItemRow = (index) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleMedicineSelect = (medicine) => {
    // Check if medicine already exists in items
    const existingIndex = items.findIndex(item => item.medicine === medicine.id);
    
    if (existingIndex !== -1) {
      // If exists, increase quantity
      const newItems = [...items];
      newItems[existingIndex].quantity += 1;
      setItems(newItems);
    } else {
      // If not exists, add new item
      setItems([...items, { medicine: medicine.id, quantity: 1 }]);
    }
  };

  const total = items.reduce((sum, item) => {
    const med = medicines.find(m => m.id === item.medicine);
    return sum + (med ? (med.unit_price || med.prix_public || 0) * item.quantity : 0);
  }, 0);

  const handleSubmit = async () => {
    if (!customerId) {
      showNotification('Please select a customer', 'error');
      return;
    }

    const validItems = items.filter(item => item.medicine && item.quantity > 0);
    if (validItems.length === 0) {
      showNotification('Please add at least one medicine', 'error');
      return;
    }

    try {
      setLoading(true);
      await saleService.createSale({
        customer_id: customerId,
        items: validItems.map(i => ({ 
          medicine_id: i.medicine, 
          quantity: i.quantity 
        }))
      });
      showNotification('Sale recorded successfully!', 'success');
      navigate('/sales');
    } catch (error) {
      console.error('Error creating sale:', error);
      showNotification('Failed to record sale. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (loading && customers.length === 0) {
    return (
      <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
        <h2 className="text-xl mb-4">New Sale</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer
          </label>
          <Select 
            value={customerId} 
            onChange={e => setCustomerId(e.target.value)}
            className="w-full"
          >
            <option value="">Select Customer...</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Add Medicine (Search or Scan Barcode)
          </label>
          <MedicineSearchWithBarcode 
            onMedicineSelect={handleMedicineSelect}
            placeholder="Search medicine by name or scan barcode..."
          />
        </div>

        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Items</h3>
          {items.map((item, i) => (
            <SaleItemRow
              key={i}
              index={i}
              item={item}
              medicines={medicines}
              onChange={changeItem}
              onRemove={removeItemRow}
            />
          ))}
        </div>

        <Button onClick={addItemRow} className="mb-4" variant="outline">
          + Add Item
        </Button>

        <div className="mt-4 p-3 bg-gray-100 rounded">
          <div className="font-semibold text-lg">Total: ${total.toFixed(2)}</div>
        </div>

        <div className="mt-4 space-x-2">
          <Button 
            onClick={handleSubmit}
            disabled={loading}
            variant="primary"
          >
            {loading ? 'Creating Sale...' : 'Create Sale'}
          </Button>
          <Button 
            variant="outline" 
            onClick={() => navigate('/sales')}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default SalesForm;
