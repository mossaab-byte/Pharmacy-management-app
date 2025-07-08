import React, { useState, useEffect } from 'react';
import { Select, Input, Button } from '../UI';
import SaleItemRow from './SaleItemRow';
import MedicineSearchWithBarcode from '../common/MedicineSearchWithBarcode';
import  customerService  from '../../services/customerService';
import  medicineService  from '../../services/medicineService';
import  saleService  from '../../services/salesServices';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

const SalesForm = () => {
  const [customerId, setCustomerId] = useState('');
  const [customers, setCustomers] = useState([]);
  const [items, setItems] = useState([{ medicine: '', quantity: 1 }]);
  const [medicines, setMedicines] = useState([]);
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    customerService.getAll().then(setCustomers);
    medicineService.getAllAvailable().then(setMedicines);
  }, []);

  const changeItem = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const addItemRow = () => setItems([...items, { medicine: '', quantity: 1 }]);
  const removeItemRow = (index) => setItems(items.filter((_, i) => i !== index));

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
    return sum + (med ? med.unit_price * item.quantity : 0);
  }, 0);

  const handleSubmit = async () => {
    try {
      await saleService.create({
        customer_id: customerId,
        items: items.map(i => ({ medicine_id: i.medicine, quantity: i.quantity }))
      });
      addNotification('Sale recorded', 'success');
      navigate('/sales');
    } catch {
      addNotification('Failed to record sale', 'error');
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-xl mb-4">New Sale</h2>

      <Select label="Customer" value={customerId} onChange={e => setCustomerId(e.target.value)}>
        <option value="">Select...</option>
        {customers.map(c => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Medicine (Search or Scan Barcode)
        </label>
        <MedicineSearchWithBarcode 
          onMedicineSelect={handleMedicineSelect}
          placeholder="Search medicine by name or scan barcode..."
        />
      </div>

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

      <Button onClick={addItemRow} className="mb-4">
        + Add Item
      </Button>

      <div className="mt-4 font-semibold">Total: ${total.toFixed(2)}</div>

      <div className="mt-4 space-x-2">
        <Button onClick={handleSubmit}>Create Sale</Button>
        <Button variant="outline" onClick={() => navigate('/sales')}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default SalesForm;
