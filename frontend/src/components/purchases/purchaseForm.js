import React, { useState, useEffect } from 'react';
import { Button, Input, Select } from '../../components/UI';
import MedicineSearchWithBarcode from '../common/MedicineSearchWithBarcode';
import supplierService from '../../services/supplierService';
import medicineService from '../../services/medicineService';
import purchaseService from '../../services/purchaseService';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import ErrorBoundary from '../ErrorBoundary';

const PurchaseForm = () => {
  const [supplierId, setSupplierId] = useState('');
  const [suppliers, setSuppliers] = useState([]);
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
      const [suppliersData, medicinesData] = await Promise.all([
        supplierService.getAll(),
        medicineService.getAll()
      ]);
      setSuppliers(suppliersData || []);
      setMedicines(medicinesData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please try again.');
      showNotification('Failed to load data. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { medicine: '', quantity: 1 }]);
  
  const removeItem = (index) => {
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

  const total = items.reduce((sum, i) => {
    const med = medicines.find(m => m.id === i.medicine);
    return sum + (med ? (med.unit_price || med.prix_public || 0) * i.quantity : 0);
  }, 0);

  const handleSubmit = async () => {
    if (!supplierId) {
      addNotification('Please select a supplier', 'error');
      return;
    }
    if (items.some(i => !i.medicine || i.quantity <= 0)) {
      addNotification('Please fill all items with valid medicine and quantity', 'error');
      return;
    }

    try {
      await purchaseService.create({
        supplier_id: supplierId,
        items: items.map(i => ({ medicine_id: i.medicine, quantity: i.quantity })),
      });
      addNotification('Purchase created', 'success');
      navigate('/purchases');
    } catch {
      addNotification('Error creating purchase', 'error');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">New Purchase</h2>

      <Select
        label="Supplier"
        value={supplierId}
        onChange={e => setSupplierId(e.target.value)}
        className="mb-6"
      >
        <option value="">Select a supplier...</option>
        {suppliers.map(s => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </Select>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Medicine (Search or Scan Barcode)
        </label>
        <MedicineSearchWithBarcode 
          onMedicineSelect={handleMedicineSelect}
          placeholder="Search medicine by name or scan barcode..."
        />
      </div>

      {items.map((item, idx) => {
        const selectedMedicine = medicines.find(m => m.id === item.medicine);
        
        return (
          <div key={idx} className="mb-5 p-4 border rounded-lg bg-gray-50">
            <div className="flex gap-3 items-center">
              <div className="flex-grow">
                <div className="font-medium text-gray-700">
                  {selectedMedicine ? selectedMedicine.name : 'No medicine selected'}
                </div>
                {selectedMedicine && (
                  <div className="text-sm text-gray-500">
                    Coût Unitaire: {selectedMedicine.unit_cost?.toFixed(2) || '0.00'} DH
                  </div>
                )}
              </div>
              <Input
                type="number"
                min="1"
                value={item.quantity}
                onChange={e => handleItemChange(idx, 'quantity', +e.target.value)}
                className="w-24"
                placeholder="Qty"
              />
              <Button
                variant="danger"
                size="sm"
                onClick={() => removeItem(idx)}
                className="h-10 px-3"
              >
                Remove
              </Button>
            </div>
          </div>
        );
      })}

      <Button onClick={addItem} className="mb-6" variant="outline">
        + Add Item
      </Button>

      <div className="text-right font-semibold text-lg text-gray-700 mb-6">
        Total: {total.toFixed(2)} DH
      </div>

      <div className="flex justify-end gap-3">
        <Button onClick={handleSubmit} className="px-6">
          Create Purchase
        </Button>
        <Button variant="outline" onClick={() => navigate('/purchases')} className="px-6">
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default PurchaseForm;
