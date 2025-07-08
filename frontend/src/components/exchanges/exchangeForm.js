import React, { useState, useEffect } from 'react';
import  exchangeService  from '../../services/exchangeService';
import  pharmacyService  from '../../services/pharmacyService';
import  medicineService  from '../../services/medicineService';
import { useNotification } from '../../contexts/NotificationContext';
import MedicineSearchWithBarcode from '../common/MedicineSearchWithBarcode';
import Button from '../UI/Button';
import Select from '../UI/Select';
import Input from '../UI/Input';

const ExchangeForm = ({ onSubmitSuccess }) => {
  const [sourcePharmacy, setSourcePharmacy] = useState('');
  const [destPharmacy, setDestPharmacy] = useState('');
  const [items, setItems] = useState([{ medicine: '', quantity: 1 }]);
  const [pharmacies, setPharmacies] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const { addNotification } = useNotification();

  useEffect(() => {
    pharmacyService.getAll().then(setPharmacies);
    medicineService.getAll().then(setMedicines);
  }, []);

  const handleAddItem = () => setItems([...items, { medicine: '', quantity: 1 }]);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
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

  const handleSubmit = async () => {
    if (!sourcePharmacy || !destPharmacy) {
      addNotification('Please select both source and destination pharmacies', 'error');
      return;
    }

    if (items.some(item => !item.medicine || item.quantity <= 0)) {
      addNotification('Please fill all medicine items with valid quantities', 'error');
      return;
    }

    try {
      const payload = {
        direction: 'OUT',
        source_pharmacy: sourcePharmacy,
        dest_pharmacy: destPharmacy,
        items,
      };
      await exchangeService.create(payload);
      addNotification('Exchange request sent successfully', 'success');
      onSubmitSuccess?.();
      // Optionally reset form
      setSourcePharmacy('');
      setDestPharmacy('');
      setItems([{ medicine: '', quantity: 1 }]);
    } catch {
      addNotification('Error sending exchange', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800">Send Exchange Request</h2>

      <Select
        label="Source Pharmacy"
        value={sourcePharmacy}
        onChange={e => setSourcePharmacy(e.target.value)}
        options={pharmacies.map(p => ({ label: p.name, value: p.id }))}
        className="mb-4"
      />

      <Select
        label="Destination Pharmacy"
        value={destPharmacy}
        onChange={e => setDestPharmacy(e.target.value)}
        options={pharmacies.map(p => ({ label: p.name, value: p.id }))}
        className="mb-6"
      />

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Medicine (Search or Scan Barcode)
        </label>
        <MedicineSearchWithBarcode 
          onMedicineSelect={handleMedicineSelect}
          placeholder="Search medicine by name or scan barcode..."
        />
      </div>

      <div className="space-y-4">
        {items.map((item, index) => {
          const selectedMedicine = medicines.find(m => m.id === item.medicine);
          
          return (
            <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end p-4 border rounded-lg bg-gray-50">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Medicine</label>
                <div className="text-sm text-gray-600">
                  {selectedMedicine ? selectedMedicine.name : 'No medicine selected'}
                </div>
              </div>
              <Input
                label="Quantity"
                type="number"
                min="1"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', +e.target.value)}
              />
            </div>
          );
        })}
      </div>

      <div className="flex space-x-4">
        <Button onClick={handleAddItem} variant="outline" type="button">
          Add Item
        </Button>
        <Button onClick={handleSubmit} type="button">
          Submit Request
        </Button>
      </div>
    </div>
  );
};

export default ExchangeForm;