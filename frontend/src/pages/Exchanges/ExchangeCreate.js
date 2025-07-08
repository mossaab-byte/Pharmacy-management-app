import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import ExchangeService from '../../services/exchangeService';

const ExchangeCreate = () => {
  const [form, setForm] = useState({
    dest_pharmacy: '',
    items: [{ medicine: null, quantity: 1 }],
    notes: ''
  });
  const [partnerPharmacies, setPartnerPharmacies] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const partnersRes = await ExchangeService.getPartnerPharmacies();
        setPartnerPharmacies(partnersRes.data);
        
        const medicinesRes = await ExchangeService.getMedicines();
        setMedicines(medicinesRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);
  const addItem = () => {
    setForm(prev => ({
      ...prev,
      items: [...prev.items, { medicine: null, quantity: 1 }]
    }));
  };

  const removeItem = (index) => {
    setForm(prev => {
      const newItems = [...prev.items];
      newItems.splice(index, 1);
      return { ...prev, items: newItems };
    });
  };

  const updateItem = (index, field, value) => {
    setForm(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };

  const calculateItemTotal = (item) => {
    if (!item.medicine) return 0;
    return item.quantity * item.medicine.public_price;
  };

  const totalQuantity = form.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalValue = form.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const payload = {
        dest_pharmacy: form.dest_pharmacy,
        items: form.items.map(item => ({
          medicine: item.medicine.id,
          quantity: item.quantity
        })),
        notes: form.notes
      };
      
      await ExchangeService.createExchange(payload);
      navigate('/exchanges?status=PENDING');

    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to create exchange request');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Create Exchange Request</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="form-group">
          <label className="block text-sm font-medium mb-1">Destination Pharmacy:</label>
          <select 
            value={form.dest_pharmacy} 
            onChange={(e) => setForm(prev => ({ ...prev, dest_pharmacy: e.target.value }))}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Pharmacy</option>
            {partnerPharmacies.map(pharmacy => (
              <option key={pharmacy.id} value={pharmacy.id}>
                {pharmacy.name} - {pharmacy.address}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <h3 className="text-lg font-semibold mb-2">Items to Exchange</h3>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2">Medicine</th>
                <th className="border p-2">Quantity</th>
                <th className="border p-2">Price</th>
                <th className="border p-2">Total</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {form.items.map((item, index) => (
                <tr key={index}>
                  <td className="border p-2">
                    <select
                      value={item.medicine?.id || ''}
                      onChange={(e) => {
                        const medicine = medicines.find(m => m.id === e.target.value);
                        updateItem(index, 'medicine', medicine);
                      }}
                      className="w-full p-1 border rounded"
                      required
                    >
                      <option value="">Select Medicine</option>
                      {medicines.map(med => (
                        <option key={med.id} value={med.id}>{med.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                      className="w-full p-1 border rounded"
                      required
                    />
                  </td>
                  <td className="border p-2">
                    {item.medicine ? item.medicine.public_price.toFixed(2) : '0.00'}
                  </td>
                  <td className="border p-2">
                    {calculateItemTotal(item).toFixed(2)}
                  </td>
                  <td className="border p-2 text-center">
                    <button 
                      type="button" 
                      onClick={() => removeItem(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button 
            type="button" 
            onClick={addItem}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Item
          </button>
        </div>
        
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-semibold mb-2">Exchange Summary</h3>
          <p className="mb-1">Total Items: {totalQuantity}</p>
          <p className="font-bold">Total Value: {totalValue.toFixed(2)}</p>
        </div>
        
        <div className="form-group">
          <label className="block text-sm font-medium mb-1">Notes:</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm(prev => ({ ...prev, notes: e.target.value }))}
            rows="3"
            className="w-full p-2 border rounded"
          />
        </div>
        
        <button 
          type="submit" 
          disabled={submitting}
          className={`px-4 py-2 rounded font-medium ${
            submitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 text-white hover:bg-green-700'
          }`}
        >
          {submitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};

export default ExchangeCreate;