import React, { useState, useEffect } from 'react';
import { Button, Input, Select } from '../UI';
import MedicineAutocomplete from '../common/MedicineAutocomplete';
import supplierService from '../../services/supplierService';
import medicineService from '../../services/medicineService';
import purchaseService from '../../services/purchaseService';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';

const ComprehensivePurchaseForm = () => {
  const [supplierId, setSupplierId] = useState('');
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [suppliersData, medicinesData] = await Promise.all([
        supplierService.getAll(),
        medicineService.getAll()
      ]);
      
      // Ensure we have arrays (services already extract results)
      const suppliersList = Array.isArray(suppliersData) ? suppliersData : [];
      const medicinesList = Array.isArray(medicinesData) ? medicinesData : [];

      setSuppliers(suppliersList);
      setMedicines(medicinesList);
      setSearchResults(medicinesList.slice(0, 50)); // Show first 50 for initial display
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMedicineSearch = (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults(medicines.slice(0, 50));
      return;
    }
    
    const filtered = medicines.filter(medicine => {
      const searchTerm = query.toLowerCase();
      return (
        medicine.nom?.toLowerCase().includes(searchTerm) ||
        medicine.nom_commercial?.toLowerCase().includes(searchTerm) ||
        medicine.dci1?.toLowerCase().includes(searchTerm) ||
        medicine.code?.includes(searchTerm)
      );
    });
    
    setSearchResults(filtered.slice(0, 50));
  };

  const handleMedicineSelect = (medicine) => {
    const existingIndex = items.findIndex(item => item.medicine_id === medicine.id);
    
    if (existingIndex !== -1) {
      // If medicine already exists, increase quantity
      const newItems = [...items];
      newItems[existingIndex].quantity += 1;
      setItems(newItems);
      showNotification(`Increased quantity for ${medicine.nom}`, 'success');
    } else {
      // Add new medicine to purchase
      const newItem = {
        medicine_id: medicine.id,
        medicine: medicine,
        quantity: 1,
        unit_cost: medicine.unit_cost || medicine.prix_public * 0.8 || 0 // Assume 20% margin
      };
      setItems([...items, newItem]);
      showNotification(`Added ${medicine.nom} to purchase`, 'success');
    }
    
    // Clear search
    setSearchQuery('');
    setSearchResults(medicines.slice(0, 50));
  };

  const handleQuantityChange = (index, quantity) => {
    const newItems = [...items];
    newItems[index].quantity = Math.max(1, parseInt(quantity) || 1);
    setItems(newItems);
  };

  const handleUnitCostChange = (index, cost) => {
    const newItems = [...items];
    newItems[index].unit_cost = Math.max(0, parseFloat(cost) || 0);
    setItems(newItems);
  };

  const removeItem = (index) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
    showNotification('Item removed from purchase', 'info');
  };

  const calculateItemTotal = (item) => {
    return (item.unit_cost || 0) * (item.quantity || 0);
  };

  const calculateGrandTotal = () => {
    return items.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  const validateForm = () => {
    if (!supplierId) {
      showNotification('Please select a supplier', 'error');
      return false;
    }
    
    if (items.length === 0) {
      showNotification('Please add at least one medicine to the purchase', 'error');
      return false;
    }
    
    const invalidItems = items.filter(item => 
      !item.medicine_id || 
      !item.quantity || 
      item.quantity <= 0 || 
      !item.unit_cost || 
      item.unit_cost <= 0
    );
    
    if (invalidItems.length > 0) {
      showNotification('Please ensure all items have valid medicine, quantity, and unit cost', 'error');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      
      const purchaseData = {
        supplier_id: supplierId,
        total_amount: calculateGrandTotal(),
        items: items.map(item => ({
          medicine_id: item.medicine_id,
          quantity: item.quantity,
          unit_cost: item.unit_cost,
          total_cost: calculateItemTotal(item)
        }))
      };
      
      await purchaseService.create(purchaseData);
      showNotification('Purchase created successfully!', 'success');
      navigate('/purchases');
      
    } catch (error) {
      console.error('Error creating purchase:', error);
      showNotification('Error creating purchase. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedSupplier = suppliers.find(s => s.id === parseInt(supplierId));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Create New Purchase</h2>
        <Button 
          variant="outline" 
          onClick={() => navigate('/purchases')}
          className="px-4 py-2"
        >
          ← Back to Purchases
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">{error}</p>
          <Button 
            onClick={loadInitialData} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            Retry
          </Button>
        </div>
      )}

      {/* Supplier Selection */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Supplier *
          </label>
          <Select
            value={supplierId}
            onChange={(e) => setSupplierId(e.target.value)}
            className="w-full"
          >
            <option value="">Select a supplier...</option>
            {suppliers.map(supplier => (
              <option key={supplier.id} value={supplier.id}>
                {supplier.name}
              </option>
            ))}
          </Select>
        </div>
        
        {selectedSupplier && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2">Supplier Details</h4>
            <p className="text-sm text-gray-600">Contact: {selectedSupplier.contact_person}</p>
            <p className="text-sm text-gray-600">Phone: {selectedSupplier.phone}</p>
          </div>
        )}
      </div>

      {/* Medicine Search */}
      <div className="mb-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add Medicines to Purchase
        </label>
        <MedicineAutocomplete 
          onSelect={handleMedicineSelect}
          placeholder="Rechercher médicament par nom, DCI, ou scanner code-barres..."
          className="w-full"
          maxResults={8}
          showBarcode={true}
        />
      </div>

      {/* Purchase Items */}
      {items.length > 0 && (
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Purchase Items</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-300 px-4 py-2 text-left">Medicine</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Quantity</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Unit Cost (MAD)</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Total (MAD)</th>
                  <th className="border border-gray-300 px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-4 py-2">
                      <div>
                        <div className="font-medium text-gray-800">
                          {item.medicine?.nom || 'Unknown Medicine'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.medicine?.dci1} - {item.medicine?.forme}
                        </div>
                        <div className="text-xs text-gray-400">
                          Code: {item.medicine?.code}
                        </div>
                      </div>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                        className="w-20 text-center"
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_cost}
                        onChange={(e) => handleUnitCostChange(index, e.target.value)}
                        className="w-24 text-center"
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center font-semibold">
                      {calculateItemTotal(item).toFixed(2)} MAD
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => removeItem(index)}
                        className="px-2 py-1"
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Purchase Summary */}
      {items.length > 0 && (
        <div className="mb-8 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Purchase Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{items.length}</div>
              <div className="text-sm text-gray-600">Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {items.reduce((sum, item) => sum + item.quantity, 0)}
              </div>
              <div className="text-sm text-gray-600">Total Quantity</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-800">
                {calculateGrandTotal().toFixed(2)} MAD
              </div>
              <div className="text-sm text-gray-600">Grand Total</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/purchases')}
          className="px-6 py-2"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={submitting || items.length === 0}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
        >
          {submitting ? 'Creating Purchase...' : 'Create Purchase'}
        </Button>
      </div>
    </div>
  );
};

export default ComprehensivePurchaseForm;
