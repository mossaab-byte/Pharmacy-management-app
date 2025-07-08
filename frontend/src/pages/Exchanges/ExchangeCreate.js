import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ExchangeService from '../../services/exchangeService';

const ExchangeCreate = () => {
  const [form, setForm] = useState({
    dest_pharmacy: '',
    items: [{ medicine: null, quantity: 1 }],
    notes: '',
  });

  const [partnerPharmacies, setPartnerPharmacies] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [partnersRes, medicinesRes] = await Promise.all([
          ExchangeService.getPartnerPharmacies(),
          ExchangeService.getMedicines(),
        ]);
        setPartnerPharmacies(partnersRes.data);
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
      items: [...prev.items, { medicine: null, quantity: 1 }],
    }));
  };

  const removeItem = index => {
    setForm(prev => {
      const updatedItems = [...prev.items];
      updatedItems.splice(index, 1);
      return { ...prev, items: updatedItems };
    });
  };

  const updateItem = (index, field, value) => {
    setForm(prev => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { ...updatedItems[index], [field]: value };
      return { ...prev, items: updatedItems };
    });
  };

  const calculateItemTotal = item => {
    return item.medicine ? item.quantity * item.medicine.public_price : 0;
  };

  const totalQuantity = form.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const totalValue = form.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        dest_pharmacy: form.dest_pharmacy,
        items: form.items.map(item => ({
          medicine: item.medicine.id,
          quantity: item.quantity,
        })),
        notes: form.notes,
      };

      await ExchangeService.createExchange(payload);
      navigate('/exchanges?status=PENDING');
    } catch (error) {
      console.error('Submission failed:', error);
      alert('Failed to create exchange request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-6">Create Exchange Request</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Destination Pharmacy */}
        <div>
          <label className="block text-sm font-medium mb-1">Destination Pharmacy:</label>
          <select
            value={form.dest_pharmacy}
            onChange={e => setForm({ ...form, dest_pharmacy: e.target.value })}
            className="w-full p-2 border rounded"
            required
          >
            <option value="">Select Pharmacy</option>
            {partnerPharmacies.map(ph => (
              <option key={ph.id} value={ph.id}>
                {ph.name} — {ph.address}
              </option>
            ))}
          </select>
        </div>

        {/* Items to Exchange */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Items to Exchange</h3>
          <div className="overflow-x-auto">
            <table className="w-full border text-sm text-left">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2">Medicine</th>
                  <th className="border p-2">Quantity</th>
                  <th className="border p-2">Price</th>
                  <th className="border p-2">Total</th>
                  <th className="border p-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {form.items.map((item, index) => (
                  <tr key={index} className="bg-white">
                    <td className="border p-2">
                      <select
                        value={item.medicine?.id || ''}
                        onChange={e => {
                          const selected = medicines.find(m => m.id === e.target.value);
                          updateItem(index, 'medicine', selected);
                        }}
                        className="w-full p-1 border rounded"
                        required
                      >
                        <option value="">Select Medicine</option>
                        {medicines.map(m => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="border p-2">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => updateItem(index, 'quantity', parseInt(e.target.value))}
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
          </div>

          <button
            type="button"
            onClick={addItem}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            + Add Item
          </button>
        </div>

        {/* Summary */}
        <div className="bg-gray-50 p-4 rounded">
          <h3 className="text-lg font-semibold mb-2">Exchange Summary</h3>
          <p className="mb-1">Total Items: <strong>{totalQuantity}</strong></p>
          <p>Total Value: <strong>{totalValue.toFixed(2)}</strong></p>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium mb-1">Notes:</label>
          <textarea
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            rows="3"
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Submit */}
        <div>
          <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-2 rounded text-white font-medium ${
              submitting
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {submitting ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ExchangeCreate;
