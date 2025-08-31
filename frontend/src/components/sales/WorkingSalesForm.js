import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Minus, Save, ShoppingCart, UserPlus } from 'lucide-react';
import { Button } from '../UI';
import MedicineSearchWithBarcode from '../common/MedicineSearchWithBarcode';
import SimpleMedicineAutocomplete from '../common/SimpleMedicineAutocomplete';
import SimpleCustomerCreateModal from '../Customers/SimpleCustomerCreateModal';
import * as salesServiceModule from '../../services/salesServiceNew';
import customerService from '../../services/customerService';
import { useDashboard } from '../../context/SimpleDashboardContext';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
const salesService = salesServiceModule.default || salesServiceModule;

const WorkingSalesForm = () => {
  const navigate = useNavigate();
  const { id: saleId } = useParams(); // Get sale ID for edit mode
  const isEditMode = Boolean(saleId);
  const { refreshData } = useDashboard(); // Get refresh function from dashboard context
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [saleItems, setSaleItems] = useState([{ 
    id: 1, 
    medicine: null, 
    quantity: 1, 
    unitPrice: 0, 
    total: 0 
  }]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  
  // Scanner automatique states
  const [scannedCode, setScannedCode] = useState('');
  const scanTimeoutRef = useRef(null);

  // Load real customers from API
  const loadCustomers = async () => {
    try {
      console.log('🔍 Loading customers from API...');
      const apiCustomers = await customerService.getAll();
      console.log('✅ Loaded customers:', apiCustomers);
      
      // Format customers for dropdown
      const formattedCustomers = apiCustomers.map(customer => ({
        id: customer.id,
        name: `${customer.user.first_name} ${customer.user.last_name}`.trim() || customer.user.username,
        email: customer.user.email,
        phone: customer.phone || '',
        address: customer.address || '',
        credit_limit: customer.credit_limit || 0
      }));
      
      // Add "Client de passage" option at the beginning
      const allCustomers = [
        { id: 'passage', name: 'Client de passage' },
        ...formattedCustomers
      ];
      
      setCustomers(allCustomers);
      console.log('✅ Formatted customers for dropdown:', allCustomers);
      
      // Select "Client de passage" by default if not in edit mode
      if (!isEditMode) {
        setSelectedCustomer('passage');
      }
    } catch (error) {
      console.error('❌ Error loading customers:', error);
      setCustomers([{ id: 'passage', name: 'Client de passage' }]);
      setSelectedCustomer('passage');
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadCustomers();
    
    // Load existing sale data if in edit mode
    if (isEditMode && saleId) {
      loadExistingSale();
    }
  }, [isEditMode, saleId]);

  // Handle customer creation
  const handleCustomerCreated = (newCustomer) => {
    console.log('✅ New customer created:', newCustomer);
    
    // Add to customers list
    const formattedCustomer = {
      id: newCustomer.id,
      name: `${newCustomer.user.first_name} ${newCustomer.user.last_name}`.trim() || newCustomer.user.username,
      email: newCustomer.user.email,
      phone: newCustomer.phone || '',
      address: newCustomer.address || '',
      credit_limit: newCustomer.credit_limit || 0
    };
    
    setCustomers(prev => [...prev, formattedCustomer]);
    
    // Auto-select the new customer
    setSelectedCustomer(newCustomer.id);
    
    setMessage(`✅ Nouveau client créé: ${formattedCustomer.name}`);
    setTimeout(() => setMessage(''), 3000);
  };

  // Function to load existing sale data for editing
  const loadExistingSale = async () => {
    try {
      setLoading(true);
      console.log(`🔍 Loading existing sale: ${saleId}`);
      
      const saleData = await salesService.getSaleDetails(saleId);
      console.log('✅ Loaded sale data:', saleData);
      
      // Set customer
      if (saleData.customer) {
        setSelectedCustomer(saleData.customer);
      } else {
        setSelectedCustomer('passage');
      }
      
      // Convert sale items to form format
      if (saleData.items && saleData.items.length > 0) {
        const formattedItems = saleData.items.map((item, index) => ({
          id: index + 1,
          medicine: {
            id: item.medicine_id,  // Use the actual medicine_id from the backend
            nom: item.medicine_name,
            nom_commercial: item.medicine_name,
            prix: item.unit_price,
            prix_public: item.unit_price,
            ppv: item.unit_price
          },
          quantity: item.quantity,
          unitPrice: parseFloat(item.unit_price),
          total: parseFloat(item.subtotal)
        }));
        
        setSaleItems(formattedItems);
        console.log('✅ Loaded sale items:', formattedItems);
      }
      
      setMessage(`Editing sale: ${saleData.reference || 'SALE-' + saleId.substring(0, 8)}`);
      
    } catch (error) {
      console.error('❌ Error loading sale:', error);
      setMessage('Error loading sale data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✨ SCANNER AUTOMATIQUE - Détecte les scans sans cliquer dans un champ
  useEffect(() => {
    const handleAutoScan = (e) => {
      // Ignorer si on est en train de taper dans un input ou textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      // Détecter une séquence rapide de caractères (typique d'un scanner)
      if (e.key === 'Enter' && scannedCode.length >= 5) {
        console.log('🔍 Auto-scan détecté:', scannedCode);
        handleBarcodeAutoScan(scannedCode);
        setScannedCode('');
        return;
      }

      // Accumuler les caractères du scan
      if (e.key.length === 1) {
        setScannedCode(prev => prev + e.key);
        
        // Reset après 100ms d'inactivité (différence entre scan et frappe manuelle)
        clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = setTimeout(() => {
          setScannedCode('');
        }, 100);
      }
    };

    document.addEventListener('keypress', handleAutoScan);
    
    return () => {
      document.removeEventListener('keypress', handleAutoScan);
      clearTimeout(scanTimeoutRef.current);
    };
  }, [scannedCode]);

  // ✨ GESTION DU SCAN AUTOMATIQUE
  const handleBarcodeAutoScan = async (barcode) => {
    try {
      console.log('🔍 Recherche automatique pour:', barcode);
      
      // Rechercher le médicament par code-barres
      const response = await fetch(
        `${API_URL}/medicine/medicines/quick_search/?q=${encodeURIComponent(barcode)}&limit=1`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error('Erreur lors de la recherche');
      }

      const data = await response.json();
      
      if (data && data.length > 0) {
        const medicine = data[0];
        console.log('✅ Médicament trouvé:', medicine.name || medicine.nom_commercial);
        
        // Ajouter directement au panier
        addOrUpdateMedicine(medicine);
        
        setMessage(`✅ ${medicine.name || medicine.nom_commercial} ajouté au panier par scan!`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        console.log('❌ Aucun médicament trouvé pour:', barcode);
        setMessage(`❌ Aucun médicament trouvé pour le code: ${barcode}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Erreur scan automatique:', error);
      setMessage('Erreur lors du scan automatique');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  // Fonction pour ajouter ou mettre à jour un médicament
  const addOrUpdateMedicine = (medicine) => {
    console.log('🔄 Ajout/Mise à jour médicament:', medicine.nom_commercial || medicine.nom);
    
    // Vérifier si le médicament existe déjà
    const existingItemIndex = saleItems.findIndex(item => 
      item.medicine && item.medicine.id === medicine.id
    );
    
    console.log('📋 Index existant:', existingItemIndex);
    
    if (existingItemIndex !== -1) {
      // Augmenter la quantité de 1
      const updatedItems = [...saleItems];
      updatedItems[existingItemIndex].quantity += 1;
      updatedItems[existingItemIndex].total = 
        updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unitPrice;
      setSaleItems(updatedItems);
      console.log('✅ Quantité incrémentée vers:', updatedItems[existingItemIndex].quantity);
      return 'incremented';
    } else {
      // Ajouter une nouvelle ligne ou utiliser une ligne vide
      const emptyItemIndex = saleItems.findIndex(item => !item.medicine);
      const price = parseFloat(medicine.prix_public || medicine.ppv || medicine.public_price || 0);
      
      console.log(`💰 Prix extrait pour ${medicine.nom_commercial || medicine.nom}:`, {
        prix_public: medicine.prix_public,
        ppv: medicine.ppv,
        public_price: medicine.public_price,
        finalPrice: price
      });
      
      if (emptyItemIndex !== -1) {
        // Utiliser une ligne vide existante
        const updatedItems = [...saleItems];
        updatedItems[emptyItemIndex] = {
          ...updatedItems[emptyItemIndex],
          medicine: medicine,
          unitPrice: price,
          total: price
        };
        setSaleItems(updatedItems);
        console.log('✅ Ligne vide utilisée à l\'index:', emptyItemIndex);
      } else {
        // Créer une nouvelle ligne
        const newId = Math.max(...saleItems.map(item => item.id)) + 1;
        setSaleItems([...saleItems, {
          id: newId,
          medicine: medicine,
          quantity: 1,
          unitPrice: price,
          total: price
        }]);
        console.log('✅ Nouvelle ligne créée avec ID:', newId);
      }
      return 'added';
    }
  };

  const addSaleItem = () => {
    const newId = Math.max(...saleItems.map(item => item.id)) + 1;
    setSaleItems([...saleItems, { 
      id: newId, 
      medicine: null, 
      quantity: 1, 
      unitPrice: 0, 
      total: 0 
    }]);
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
        
        // Auto-calculate total when quantity or unitPrice changes
        if (field === 'quantity' || field === 'unitPrice') {
          updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const handleMedicineSelect = (medicine, itemId) => {
    console.log('🔄 Medicine selected:', medicine);
    
    if (medicine) {
      const price = parseFloat(medicine.prix_public || medicine.ppv || medicine.public_price || 0);
      
      updateSaleItem(itemId, 'medicine', medicine);
      updateSaleItem(itemId, 'unitPrice', price);
      updateSaleItem(itemId, 'total', price);
      
      setMessage(`✅ ${medicine.nom_commercial || medicine.nom} ajouté - Prix: ${price}€`);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const calculateTotal = () => {
    return saleItems.reduce((total, item) => total + (item.total || 0), 0).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (loading) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      console.log('🚀 Submitting sale...');
      
      // Validate sale items
      const validItems = saleItems.filter(item => 
        item.medicine && 
        item.quantity > 0 && 
        item.unitPrice > 0
      );
      
      if (validItems.length === 0) {
        setMessage('❌ Veuillez ajouter au moins un médicament à la vente');
        setLoading(false);
        return;
      }
      
      // Prepare sale data
      const saleData = {
        customer: selectedCustomer === 'passage' ? null : selectedCustomer,
        items: validItems.map(item => ({
          medicine_id: item.medicine.id,  // Use medicine_id as required by backend
          quantity: parseInt(item.quantity),
          unit_price: parseFloat(item.unitPrice)
        }))
      };
      
      console.log('📦 Sale data to submit:', saleData);
      
      let result;
      if (isEditMode) {
        result = await salesService.updateSale(saleId, saleData);
        console.log('✅ Sale updated:', result);
        setMessage('✅ Vente modifiée avec succès!');
      } else {
        result = await salesService.createSale(saleData);
        console.log('✅ Sale created:', result);
        setMessage('✅ Vente créée avec succès!');
      }
      
      // Refresh dashboard data
      if (refreshData) {
        refreshData();
      }
      
      // Navigate back to sales list after a short delay
      setTimeout(() => {
        navigate('/sales');
      }, 1500);
      
    } catch (error) {
      console.error('❌ Error submitting sale:', error);
      
      if (error.response?.data) {
        console.error('Server error details:', error.response.data);
        
        // Handle specific validation errors
        if (error.response.data.items) {
          setMessage(`❌ Erreur validation: ${JSON.stringify(error.response.data.items)}`);
        } else if (error.response.data.detail) {
          setMessage(`❌ Erreur: ${error.response.data.detail}`);
        } else {
          setMessage('❌ Erreur lors de la sauvegarde de la vente');
        }
      } else {
        setMessage('❌ Erreur lors de la sauvegarde de la vente');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <ShoppingCart className="h-6 w-6 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditMode ? 'Modifier Vente' : 'Nouvelle Vente'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-green-600">{calculateTotal()} DH</p>
            </div>
          </div>
        </div>
        
        {message && (
          <div className={`p-3 rounded-md mb-4 ${
            message.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' :
            message.includes('❌') ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-yellow-50 text-yellow-800 border border-yellow-200'
          }`}>
            {message}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Client</h3>
            <Button
              type="button"
              onClick={() => setShowCustomerModal(true)}
              className="inline-flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Nouveau Client
            </Button>
          </div>
          
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sale Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Articles</h3>
            <Button
              type="button"
              onClick={addSaleItem}
              className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter Article
            </Button>
          </div>
          
          <div className="space-y-3">
            {saleItems.map((item, index) => (
              <div key={item.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Médicament {index + 1}
                    </label>
                    <SimpleMedicineAutocomplete
                      value={item.medicine}
                      onChange={(medicine) => handleMedicineSelect(medicine, item.id)}
                      placeholder="Rechercher un médicament..."
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantité
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateSaleItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Prix Unit. (DH)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateSaleItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Total (DH)
                    </label>
                    <input
                      type="text"
                      value={item.total.toFixed(2)}
                      readOnly
                      className="w-full p-2 bg-gray-100 border border-gray-300 rounded-md text-gray-600"
                    />
                  </div>
                  
                  <div className="col-span-1 flex justify-center">
                    {saleItems.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removeSaleItem(item.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            onClick={() => navigate('/sales')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Sauvegarde...' : (isEditMode ? 'Modifier' : 'Créer')} Vente
          </Button>
        </div>
      </form>

      {/* Customer Creation Modal */}
      {showCustomerModal && (
        <SimpleCustomerCreateModal
          isOpen={showCustomerModal}
          onClose={() => setShowCustomerModal(false)}
          onCustomerCreated={handleCustomerCreated}
        />
      )}
    </div>
  );
};

export default WorkingSalesForm;
