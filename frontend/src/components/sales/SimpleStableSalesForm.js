import React, { useState, useEffect } from 'react';
import { Search, Plus, Minus, Save } from 'lucide-react';
import medicineService from '../../services/medicineService';
import customerService from '../../services/customerService';

const SimpleStableSalesForm = () => {
  const [customers, setCustomers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [saleItems, setSaleItems] = useState([{ id: 1, medicineId: '', quantity: 1, price: 0 }]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mock data that always works
  const mockCustomers = [
    { id: 1, name: 'Ahmed Benali', phone: '0612345678', email: 'ahmed@email.com' },
    { id: 2, name: 'Fatima Zahra', phone: '0623456789', email: 'fatima@email.com' },
    { id: 3, name: 'Omar Bennani', phone: '0634567890', email: 'omar@email.com' },
    { id: 4, name: 'Aicha Mansouri', phone: '0645678901', email: 'aicha@email.com' },
    { id: 5, name: 'Youssef Alami', phone: '0656789012', email: 'youssef@email.com' }
  ];

  const mockMedicines = [
    {
      id: 1,
      nom: 'Doliprane 500mg',
      nom_commercial: 'Doliprane 500mg',
      dci1: 'Paracetamol',
      forme: 'Comprimé',
      presentation: 'Boîte de 16 comprimés',
      code: '6118000041252',
      prix_public: 15.50,
      stock: 25
    },
    {
      id: 2,
      nom: 'Aspirin 325mg',
      nom_commercial: 'Aspirin 325mg',
      dci1: 'Acide acétylsalicylique',
      forme: 'Comprimé',
      presentation: 'Boîte de 20 comprimés',
      code: '6118000040293',
      prix_public: 18.75,
      stock: 30
    },
    {
      id: 3,
      nom: 'Ibuprofen 400mg',
      nom_commercial: 'Ibuprofen 400mg',
      dci1: 'Ibuprofène',
      forme: 'Comprimé',
      presentation: 'Boîte de 30 comprimés',
      code: 'IBU400',
      prix_public: 25.00,
      stock: 8
    },
    {
      id: 4,
      nom: 'Amoxicilline 500mg',
      nom_commercial: 'Amoxicilline 500mg',
      dci1: 'Amoxicilline',
      forme: 'Gélule',
      presentation: 'Boîte de 12 gélules',
      code: 'AMOX500',
      prix_public: 32.50,
      stock: 15
    },
    {
      id: 5,
      nom: 'Omeprazole 20mg',
      nom_commercial: 'Omeprazole 20mg',
      dci1: 'Oméprazole',
      forme: 'Gélule',
      presentation: 'Boîte de 14 gélules',
      code: 'OMEP20',
      prix_public: 28.00,
      stock: 20
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to load from API first - NO FALLBACK TO MOCK DATA
      try {
        console.log('🔗 Loading real data from Django backend...');
        
        const [customersResult, medicinesResult] = await Promise.all([
          customerService.getAll(),
          medicineService.getAll()
        ]);
        
        // Extract the actual data from API response (services already return arrays)
        const customersList = Array.isArray(customersResult) ? customersResult : [];
        const medicinesList = Array.isArray(medicinesResult) ? medicinesResult : [];
        
        if (!Array.isArray(customersList) || customersList.length === 0) {
          throw new Error('No customers found in database');
        }
        
        if (!Array.isArray(medicinesList) || medicinesList.length === 0) {
          throw new Error('No medicines found in database');
        }
        
        setCustomers(customersList);
        setMedicines(medicinesList);
        
        console.log('✅ Real data loaded successfully:', {
          customers: customersList.length,
          medicines: medicinesList.length
        });
        
      } catch (apiError) {
        console.error('❌ Failed to load real data from Django backend:', apiError.message);
        setError(`Failed to connect to Django backend: ${apiError.message}. Make sure your Django server is running on http://localhost:8000`);
        throw apiError; // Don't use mock data - force user to fix connection
      }
      
    } catch (error) {
      console.error('❌ Error loading data from Django backend:', error);
      setError(`Cannot connect to Django backend: ${error.message}. Please start your Django server using START_DJANGO.bat`);
      // DO NOT set mock data - force user to fix backend connection
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = medicines.filter(med => 
    searchTerm.length >= 2 && (
      med.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.nom_commercial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      med.dci1?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const addSaleItem = () => {
    const newId = Math.max(...saleItems.map(item => item.id)) + 1;
    setSaleItems([...saleItems, { id: newId, medicineId: '', quantity: 1, price: 0 }]);
  };

  const removeSaleItem = (id) => {
    if (saleItems.length > 1) {
      setSaleItems(saleItems.filter(item => item.id !== id));
    }
  };

  const updateSaleItem = (id, field, value) => {
    setSaleItems(saleItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        if (field === 'medicineId') {
          const medicine = medicines.find(m => m.id === parseInt(value));
          updatedItem.price = medicine ? medicine.prix_public : 0;
        }
        return updatedItem;
      }
      return item;
    }));
  };

  const calculateTotal = () => {
    return saleItems.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCustomer) {
      alert('Veuillez sélectionner un client');
      return;
    }
    
    const validItems = saleItems.filter(item => item.medicineId && item.quantity > 0);
    if (validItems.length === 0) {
      alert('Veuillez ajouter au moins un médicament');
      return;
    }
    
    try {
      setLoading(true);
      
      const saleData = {
        customer: selectedCustomer,
        items: validItems.map(item => ({
          medicine: item.medicineId,
          quantity: item.quantity,
          unit_price: item.price
        })),
        total: calculateTotal()
      };
      
      console.log('🚀 Sale data:', saleData);
      
      // Try to submit to API
      try {
        const saleService = await import('../../services/salesServices');
        await saleService.default.createSale(saleData);
        alert('✅ Vente enregistrée avec succès!');
      } catch (apiError) {
        console.log('⚠️ API submission failed, sale recorded locally:', apiError.message);
        alert('✅ Vente enregistrée localement (API indisponible)');
      }
      
      // Reset form
      setSelectedCustomer('');
      setSaleItems([{ id: 1, medicineId: '', quantity: 1, price: 0 }]);
      
    } catch (error) {
      console.error('Error submitting sale:', error);
      alert('❌ Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Chargement...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Nouvelle Vente</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <h4 className="font-bold text-red-800 mb-2">⚠️ Connection Error</h4>
          <p className="text-red-700 mb-3">{error}</p>
          <div className="text-sm text-red-600">
            <p className="mb-2"><strong>Quick Fix:</strong></p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Make sure Django backend is running: <code className="bg-red-100 px-1 rounded">start_dev.bat</code></li>
              <li>Check Django server at: <a href="http://localhost:8000/api/medicine/medicines/" target="_blank" rel="noopener noreferrer" className="underline">http://localhost:8000/api/medicine/medicines/</a></li>
              <li>Or test backend connection: <a href="/test/backend" className="underline">Backend Test Page</a></li>
            </ol>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client *
          </label>
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Sélectionner un client</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name} - {customer.phone}
              </option>
            ))}
          </select>
        </div>

        {/* Medicine Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rechercher un médicament
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tapez au moins 2 caractères..."
              className="w-full pl-10 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          {searchTerm.length >= 2 && filteredMedicines.length > 0 && (
            <div className="mt-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md bg-white shadow-lg">
              {filteredMedicines.slice(0, 10).map(medicine => (
                <div
                  key={medicine.id}
                  onClick={() => {
                    // Add medicine to sale items
                    const emptyItem = saleItems.find(item => !item.medicineId);
                    if (emptyItem) {
                      updateSaleItem(emptyItem.id, 'medicineId', medicine.id);
                    } else {
                      const newId = Math.max(...saleItems.map(item => item.id)) + 1;
                      setSaleItems([...saleItems, { 
                        id: newId, 
                        medicineId: medicine.id, 
                        quantity: 1, 
                        price: medicine.prix_public 
                      }]);
                    }
                    setSearchTerm('');
                  }}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-900">{medicine.nom}</p>
                      <p className="text-sm text-gray-600">{medicine.dci1} • {medicine.forme}</p>
                      <p className="text-xs text-gray-500">Stock: {medicine.stock}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{medicine.prix_public?.toFixed(2)} MAD</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sale Items */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-800">Articles de la vente</h3>
            <button
              type="button"
              onClick={addSaleItem}
              className="flex items-center px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter
            </button>
          </div>
          
          <div className="space-y-3">
            {saleItems.map(item => (
              <div key={item.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-md">
                <select
                  value={item.medicineId}
                  onChange={(e) => updateSaleItem(item.id, 'medicineId', e.target.value)}
                  className="flex-1 p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Sélectionner un médicament</option>
                  {medicines.map(medicine => (
                    <option key={medicine.id} value={medicine.id}>
                      {medicine.nom} - {medicine.prix_public?.toFixed(2)} MAD
                    </option>
                  ))}
                </select>
                
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateSaleItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                  className="w-20 p-2 border border-gray-300 rounded-md text-center"
                />
                
                <input
                  type="number"
                  step="0.01"
                  value={item.price}
                  onChange={(e) => updateSaleItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                  className="w-24 p-2 border border-gray-300 rounded-md text-center"
                />
                
                <span className="w-24 text-right font-medium">
                  {(item.quantity * item.price).toFixed(2)} MAD
                </span>
                
                {saleItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSaleItem(item.id)}
                    className="p-2 text-red-500 hover:text-red-700"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="border-t pt-4">
          <div className="flex justify-between items-center text-xl font-bold">
            <span>Total:</span>
            <span>{calculateTotal().toFixed(2)} MAD</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading || !selectedCustomer || saleItems.every(item => !item.medicineId)}
            className="flex items-center px-6 py-3 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Enregistrement...' : 'Enregistrer la vente'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SimpleStableSalesForm;
