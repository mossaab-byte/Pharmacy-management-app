import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Minus, Save, ShoppingCart, Scan, UserPlus } from 'lucide-react';
import { Button } from '../UI';
import SimpleMedicineAutocomplete from '../common/SimpleMedicineAutocomplete';
import SimpleCustomerCreateModal from '../Customers/SimpleCustomerCreateModal';
import * as salesServiceModule from '../../services/salesServiceNew';
import customerService from '../../services/customerService';

const salesService = salesServiceModule.default || salesServiceModule;

const WorkingSalesForm = () => {
  const navigate = useNavigate();
  const { id: saleId } = useParams(); // Get sale ID for edit mode
  const isEditMode = Boolean(saleId);
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
  const [scannerActive, setScannerActive] = useState(true);
  const [scannedCode, setScannedCode] = useState('');
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  
  // Référence pour le scanner automatique
  const scannerInputRef = useRef(null);
  const scanTimeoutRef = useRef(null);

  // Load real customers from API
  const loadCustomers = async () => {
    try {
      console.log('🔍 Loading customers from API...');
      const apiCustomers = await customerService.getAll();
      console.log('✅ Loaded customers:', apiCustomers);
      
      // Format customers for the dropdown
      const formattedCustomers = [
        { id: 'passage', name: 'Client de passage', phone: 'N/A', isDefault: true },
        ...apiCustomers.map(customer => ({
          id: customer.id,
          name: customer.full_name || (customer.user ? `${customer.user.first_name} ${customer.user.last_name}`.trim() : 'Unknown Customer'),
          phone: customer.phone || 'N/A',
          balance: Number(customer.balance) || 0,
          credit_limit: Number(customer.credit_limit) || 0
        }))
      ];
      
      setCustomers(formattedCustomers);
      console.log('✅ Formatted customers for dropdown:', formattedCustomers);
    } catch (error) {
      console.error('❌ Error loading customers:', error);
      // Fallback to default customer only
      setCustomers([
        { id: 'passage', name: 'Client de passage', phone: 'N/A', isDefault: true }
      ]);
    }
  };

  // Handle customer creation from modal
  const handleCustomerCreated = (newCustomer) => {
    console.log('✅ New customer created:', newCustomer);
    
    // Add the new customer to the list
    const formattedCustomer = {
      id: newCustomer.id,
      name: newCustomer.full_name || `${newCustomer.user?.first_name || ''} ${newCustomer.user?.last_name || ''}`.trim(),
      phone: newCustomer.phone || 'N/A',
      balance: newCustomer.balance || 0,
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
            id: item.pharmacy_medicine || item.medicine_id,
            nom: item.medicine_name,
            prix: item.unit_price
          },
          quantity: item.quantity,
          unitPrice: item.unit_price,
          total: item.quantity * item.unit_price
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

  useEffect(() => {
    loadCustomers();
    
    if (isEditMode && saleId) {
      loadExistingSale();
    } else {
      // Sélectionner "Client de passage" par défaut pour nouvelle vente
      setSelectedCustomer('passage');
    }
    
    // Setup barcode scanner listener
    const handleKeyPress = (e) => {
      if (!scannerActive) return;
      
      // Les scanners de code-barres tapent très rapidement
      // Nous détectons une séquence rapide de caractères suivie d'Enter
      if (e.key === 'Enter' && scannedCode.length > 5) {
        handleBarcodeScanned(scannedCode);
        setScannedCode('');
        return;
      }
      
      // Accumuler les caractères du code-barres
      if (e.key.length === 1) { // caractère normal (pas une touche de contrôle)
        setScannedCode(prev => prev + e.key);
        
        // Reset après 100ms d'inactivité (typing normal vs scanner)
        clearTimeout(scanTimeoutRef.current);
        scanTimeoutRef.current = setTimeout(() => {
          setScannedCode('');
        }, 100);
      }
    };
    
    document.addEventListener('keypress', handleKeyPress);
    
    return () => {
      document.removeEventListener('keypress', handleKeyPress);
      clearTimeout(scanTimeoutRef.current);
    };
  }, [isEditMode, saleId, scannerActive, scannedCode]);

  // Fonction pour gérer le scan de code-barres
  const handleBarcodeScanned = async (barcode) => {
    console.log('🔍 Code-barres scanné:', barcode);
    
    try {
      // Rechercher le médicament par code-barres
      const response = await fetch(`http://localhost:8000/api/medicine/medicines/search_all/?limit=6000`);
      
      if (response.ok) {
        const data = await response.json();
        let medicines = Array.isArray(data) ? data : data.results || [];
        
        // Chercher le médicament avec ce code
        const foundMedicine = medicines.find(med => 
          med.code === barcode || 
          med.code_barre === barcode ||
          med.code?.toString() === barcode
        );
        
        if (foundMedicine) {
          addOrUpdateMedicine(foundMedicine);
          setMessage(`✅ Médicament ajouté: ${foundMedicine.nom_commercial || foundMedicine.nom}`);
        } else {
          setMessage(`⚠️ Aucun médicament trouvé pour le code: ${barcode}`);
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      setMessage(`❌ Erreur lors de la recherche du code: ${barcode}`);
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

  const handleMedicineSelect = (itemId, medicine) => {
    if (!medicine) return;
    
    console.log('🎯 Médicament sélectionné:', medicine.nom_commercial || medicine.nom);
    console.log('🔍 Données médicament reçues:', {
      id: medicine.id,
      nom: medicine.nom || medicine.nom_commercial,
      prix_public: medicine.prix_public,
      ppv: medicine.ppv,
      public_price: medicine.public_price
    });
    
    // Vérifier si existe déjà AVANT modification
    const existingItem = saleItems.find(item => 
      item.medicine && item.medicine.id === medicine.id
    );
    
    // Utiliser la logique intelligente d'ajout/incrémentation
    addOrUpdateMedicine(medicine);
    
    // Message basé sur l'état AVANT modification
    if (existingItem) {
      setMessage(`✅ Quantité augmentée: ${medicine.nom_commercial || medicine.nom} (${existingItem.quantity} → ${existingItem.quantity + 1})`);
    } else {
      setMessage(`✅ Médicament ajouté: ${medicine.nom_commercial || medicine.nom}`);
    }
    
    // Effacer le message après 3 secondes
    setTimeout(() => setMessage(''), 3000);
    
    console.log(`✅ Médicament traité : ${medicine.nom_commercial || medicine.nom}`);
  };

  const calculateGrandTotal = () => {
    return saleItems.reduce((total, item) => total + item.total, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(`🚀 HandleSubmit called! Mode: ${isEditMode ? 'EDIT' : 'CREATE'}`);
    
    // Check token before submission
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    console.log('🔐 Token check:', token ? 'Token exists' : 'No token found');
    
    // First, let's validate the basic requirements and show alerts
    if (!selectedCustomer) {
      alert('⚠️ Veuillez sélectionner un client');
      setMessage('⚠️ Veuillez sélectionner un client');
      return;
    }

    const validItems = saleItems.filter(item => item.medicine && item.quantity > 0);
    if (validItems.length === 0) {
      alert('⚠️ Veuillez ajouter au moins un médicament');
      setMessage('⚠️ Veuillez ajouter au moins un médicament');
      return;
    }

    // Validate that all items have valid prices
    const itemsWithZeroPrice = validItems.filter(item => !item.unitPrice || item.unitPrice <= 0);
    if (itemsWithZeroPrice.length > 0) {
      const medicineNames = itemsWithZeroPrice.map(item => item.medicine?.nom_commercial || item.medicine?.nom || 'Unknown').join(', ');
      alert(`⚠️ Prix manquant pour: ${medicineNames}`);
      setMessage(`⚠️ Prix manquant pour: ${medicineNames}`);
      return;
    }

    console.log('✅ Validation passed, proceeding with sale operation...');
    console.log('Customer:', selectedCustomer);
    console.log('Valid items:', validItems);
    
    try {
      setLoading(true);
      setMessage(isEditMode ? '💾 Mise à jour en cours...' : '💾 Enregistrement en cours...');
      
      // Préparer les données pour l'API
      const saleData = {
        customer: selectedCustomer === 'passage' ? null : selectedCustomer,
        items: validItems.map(item => ({
          medicine_id: item.medicine.id,  // Send medicine_id, backend will convert to pharmacy_medicine
          quantity: item.quantity,
          unit_price: item.unitPrice
        }))
      };
      
      console.log('💾 Envoi des données vente:', saleData);
      
      // TEST: Try to call the API
      try {
        let response;
        
        if (isEditMode) {
          // Update existing sale
          console.log('✅ Updating existing sale:', saleId);
          if (salesService && salesService.updateSale) {
            response = await salesService.updateSale(saleId, saleData);
          } else {
            // Fallback: Direct API call for update
            const { apiClient } = await import('../../services/apiClient');
            response = await apiClient.put(`/sales/sales/${saleId}/`, saleData);
            response = response.data;
          }
          setMessage('✅ Vente mise à jour avec succès !');
        } else {
          // Create new sale  
          if (salesService && salesService.createSale) {
            console.log('✅ Using salesService.createSale');
            response = await salesService.createSale(saleData);
          } else {
            console.log('⚠️ salesService.createSale not available, using direct API call');
            // Fallback: Direct API call
            const { apiClient } = await import('../../services/apiClient');
            response = await apiClient.post('/sales/sales/', saleData);
            response = response.data;
          }
          setMessage('✅ Vente enregistrée avec succès !');
        }
        
        console.log('✅ Vente opération réussie:', response);
        
        if (!isEditMode) {
          // Reset form only for new sales
          setSaleItems([{ id: 1, medicine: null, quantity: 1, unitPrice: 0, total: 0 }]);
          setSelectedCustomer('passage');
        }
        
        // Redirect based on mode
        setTimeout(() => {
          if (isEditMode) {
            navigate(`/sales/${saleId}`); // Go back to sale detail view
          } else {
            navigate('/dashboard'); // Go to dashboard for new sales
          }
        }, 1500);
        
      } catch (apiError) {
        console.error('❌ API Error:', apiError);
        console.log('🔍 Error response data:', apiError.response?.data);
        console.log('🔍 Error response status:', apiError.response?.status);
        console.log('🔍 Error response headers:', apiError.response?.headers);
        
        // Handle authentication errors specifically
        if (apiError.response?.status === 401) {
          console.error('🔐 Authentication error - redirecting to login');
          setMessage('❌ Session expirée. Redirection vers la connexion...');
          setTimeout(() => {
            window.location.href = '/login?session_expired=true';
          }, 1500);
          return;
        }
        
        // Handle specific stock validation errors
        if (apiError.response?.data?.stock_error) {
          setMessage(`❌ ${apiError.response.data.stock_error}`);
        } else if (apiError.response?.data?.items) {
          // Handle item validation errors
          const itemErrors = apiError.response.data.items;
          console.log('🔍 Item errors:', itemErrors);
          if (itemErrors[0]?.stock_error) {
            setMessage(`❌ ${itemErrors[0].stock_error}`);
          } else {
            setMessage(`❌ Erreur de validation: ${JSON.stringify(itemErrors)}`);
          }
        } else if (apiError.response?.data?.details) {
          console.log('🔍 Validation details:', apiError.response.data.details);
          console.log('🔍 Items in details:', apiError.response.data.details.items);
          
          // Check if items array has validation errors
          if (apiError.response.data.details.items && apiError.response.data.details.items.length > 0) {
            const itemError = apiError.response.data.details.items[0];
            console.log('🔍 First item error:', itemError);
            
            // Look for stock_error in the item
            if (itemError.stock_error) {
              setMessage(`❌ ${itemError.stock_error}`);
            } else if (typeof itemError === 'string') {
              setMessage(`❌ ${itemError}`);
            } else {
              setMessage(`❌ Erreur de validation: ${JSON.stringify(itemError)}`);
            }
          } else {
            setMessage(`❌ Erreur de validation: ${JSON.stringify(apiError.response.data.details)}`);
          }
        } else {
          setMessage(`❌ Erreur API: ${apiError.message}`);
        }
      }
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement:', error);
      
      // Handle authentication errors
      if (error.response?.status === 401) {
        console.error('🔐 Authentication error in outer catch - redirecting to login');
        setMessage('❌ Session expirée. Redirection vers la connexion...');
        setTimeout(() => {
          window.location.href = '/login?session_expired=true';
        }, 1500);
        return;
      }
      
      let errorMessage = 'Erreur lors de l\'enregistrement de la vente';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.stock_error) {
          errorMessage = errorData.stock_error;
        } else if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.items) {
          // Check if any item has stock error
          const stockError = errorData.items.find(item => item.stock_error);
          if (stockError) {
            errorMessage = stockError.stock_error;
          } else {
            errorMessage = 'Erreur dans les articles de la vente';
          }
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setMessage('❌ ' + errorMessage);
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
          
          {/* Scanner Status */}
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
              scannerActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-600'
            }`}>
              <Scan className={`h-4 w-4 ${scannerActive ? 'text-green-600' : 'text-gray-400'}`} />
              <span>{scannerActive ? 'Scanner Actif' : 'Scanner Inactif'}</span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setScannerActive(!scannerActive)}
            >
              {scannerActive ? 'Désactiver' : 'Activer'} Scanner
            </Button>
          </div>
        </div>
        
        {message && (
          <div className={`p-3 rounded-md ${
            message.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' :
            message.includes('❌') ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-yellow-50 text-yellow-800 border border-yellow-200'
          }`}>
            {message}
          </div>
        )}
        
        {/* Scanner Guide */}
        {scannerActive && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="flex items-center space-x-2">
              <Scan className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-blue-800">
                Scanner prêt - Scannez un code-barres pour ajouter automatiquement un médicament
              </span>
            </div>
            {scannedCode && (
              <div className="mt-2 text-xs text-blue-600">
                Lecture en cours: {scannedCode}...
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Selection */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Client *
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCustomerModal(true)}
              className="flex items-center space-x-1"
            >
              <UserPlus className="h-4 w-4" />
              <span>Nouveau Client</span>
            </Button>
          </div>
          
          <select
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            {customers.map(customer => (
              <option 
                key={customer.id} 
                value={customer.id}
                className={customer.id === 'passage' ? 'font-semibold bg-blue-50' : ''}
              >
                {customer.id === 'passage' ? '👤 ' : ''}
                {customer.name} 
                {customer.phone !== 'N/A' && ` - ${customer.phone}`}
                {customer.id === 'passage' ? ' (Par défaut)' : ''}
                {Number(customer.balance || 0) > 0 && ` - Solde: ${Number(customer.balance || 0).toFixed(2)} MAD`}
              </option>
            ))}
          </select>
          
          {/* Customer Information Display */}
          <div className="mt-2">
            {selectedCustomer === 'passage' ? (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Vente au comptant - Aucune information client requise</span>
              </div>
            ) : selectedCustomer && (
              <div className="space-y-1">
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                  <span>Client régulier - Facture nominative</span>
                </div>
                {(() => {
                  const customer = customers.find(c => c.id === selectedCustomer);
                  if (customer && customer.balance > 0) {
                    return (
                      <div className="text-sm text-orange-600">
                        <span className="font-medium">Solde en cours: {customer.balance.toFixed(2)} MAD</span>
                        {Number(customer.credit_limit || 0) > 0 && (
                          <span className="ml-2">
                            (Limite: {Number(customer.credit_limit || 0).toFixed(2)} MAD)
                          </span>
                        )}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}
          </div>
        </div>

        {/* Sale Items */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Articles de la vente</h3>
            <Button
              type="button"
              onClick={addSaleItem}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Ajouter un article</span>
            </Button>
          </div>

          {saleItems.map((item, index) => (
            <div key={item.id} className="bg-gray-50 p-4 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                {/* Medicine Selection */}
                <div className="md:col-span-5">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Médicament *
                  </label>
                  <SimpleMedicineAutocomplete
                    onSelect={(medicine) => handleMedicineSelect(item.id, medicine)}
                    selectedMedicine={item.medicine}
                    placeholder="Rechercher un médicament..."
                  />
                </div>

                {/* Quantity */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantité
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateSaleItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Unit Price */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prix unitaire (MAD)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => updateSaleItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Total */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total (DH)
                  </label>
                  <div className="p-3 bg-gray-100 rounded-lg text-lg font-semibold text-gray-900">
                    {item.total.toFixed(2)}
                  </div>
                </div>

                {/* Remove Button */}
                <div className="md:col-span-1">
                  {saleItems.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => removeSaleItem(item.id)}
                      className="w-full flex items-center justify-center"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Grand Total */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-gray-900">Total de la vente:</span>
            <span className="text-2xl font-bold text-blue-600">
              {calculateGrandTotal().toFixed(2)} MAD
            </span>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex space-x-4">
          <Button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2"
            onClick={(e) => {
              console.log('🖱️ Submit button clicked!', e);
              console.log('Current form state:');
              console.log('- Selected customer:', selectedCustomer);
              console.log('- Sale items:', saleItems);
              console.log('- Loading:', loading);
              
              // Check if form is valid
              const validItems = saleItems.filter(item => item.medicine && item.quantity > 0);
              console.log('- Valid items:', validItems);
              
              if (!selectedCustomer) {
                console.log('❌ Validation failed: No customer selected');
                alert('Aucun client sélectionné!');
                e.preventDefault();
                return false;
              }
              
              if (validItems.length === 0) {
                console.log('❌ Validation failed: No valid items');
                alert('Aucun médicament valide!');
                e.preventDefault();
                return false;
              }
              
              console.log('✅ Basic validation passed, form should submit');
            }}
          >
            <Save className="h-4 w-4" />
            <span>
              {loading 
                ? (isEditMode ? 'Mise à jour...' : 'Enregistrement...') 
                : (isEditMode ? 'Mettre à jour la vente' : 'Enregistrer la vente')
              }
            </span>
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSaleItems([{ id: 1, medicine: null, quantity: 1, unitPrice: 0, total: 0 }]);
              setSelectedCustomer('passage'); // Garder "Client de passage" sélectionné
              setMessage('');
            }}
          >
            Annuler
          </Button>
        </div>
      </form>

      {/* Customer Creation Modal */}
      <SimpleCustomerCreateModal
        isOpen={showCustomerModal}
        onClose={() => setShowCustomerModal(false)}
        onCustomerCreated={handleCustomerCreated}
      />
    </div>
  );
};

export default WorkingSalesForm;
