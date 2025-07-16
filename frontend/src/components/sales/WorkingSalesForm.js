import React, { useState, useEffect, useRef } from 'react';
import { Plus, Minus, Save, ShoppingCart, Scan } from 'lucide-react';
import { Button } from '../UI';
import SimpleMedicineAutocomplete from '../common/SimpleMedicineAutocomplete';
import salesService from '../../services/salesServices';

const WorkingSalesForm = () => {
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
  
  // Référence pour le scanner automatique
  const scannerInputRef = useRef(null);
  const scanTimeoutRef = useRef(null);

  // Mock customers for now - we know this works
  const mockCustomers = [
    { id: 'passage', name: 'Client de passage', phone: 'N/A', isDefault: true },
    { id: 1, name: 'Ahmed Benali', phone: '0612345678' },
    { id: 2, name: 'Fatima Zahra', phone: '0623456789' },
    { id: 3, name: 'Omar Bennani', phone: '0634567890' },
    { id: 4, name: 'Aicha Mansouri', phone: '0645678901' }
  ];

  useEffect(() => {
    setCustomers(mockCustomers);
    // Sélectionner "Client de passage" par défaut
    setSelectedCustomer('passage');
    
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
  }, [scannerActive, scannedCode]);

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
      const price = parseFloat(medicine.prix_public || medicine.ppv || 0);
      
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
    
    try {
      if (!selectedCustomer) {
        setMessage('⚠️ Veuillez sélectionner un client');
        return;
      }

      const validItems = saleItems.filter(item => item.medicine && item.quantity > 0);
      if (validItems.length === 0) {
        setMessage('⚠️ Veuillez ajouter au moins un médicament');
        return;
      }

      setLoading(true);
      setMessage('💾 Enregistrement en cours...');
      
      // Préparer les données pour l'API
      const saleData = {
        customer_id: selectedCustomer === 'passage' ? null : selectedCustomer,
        total_amount: calculateGrandTotal(),
        items: validItems.map(item => ({
          medicine_id: item.medicine.id,
          quantity: item.quantity,
          unit_price: item.unitPrice,
          total_price: item.total
        }))
      };
      
      console.log('💾 Envoi des données vente:', saleData);
      
      // Appel API réel pour créer la vente
      const response = await salesService.createSale(saleData);
      
      setMessage('✅ Vente enregistrée avec succès !');
      console.log('✅ Vente créée:', response);
      
      // Reset form but keep "Client de passage" selected
      setSaleItems([{ id: 1, medicine: null, quantity: 1, unitPrice: 0, total: 0 }]);
      setSelectedCustomer('passage');
      
      // Clear success message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
      
    } catch (error) {
      console.error('❌ Erreur lors de l\'enregistrement:', error);
      
      let errorMessage = 'Erreur lors de l\'enregistrement de la vente';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        if (errorData.detail) {
          errorMessage = errorData.detail;
        } else if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.items) {
          errorMessage = 'Erreur dans les articles de la vente';
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
            <h1 className="text-2xl font-bold text-gray-900">Nouvelle Vente</h1>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Client *
          </label>
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
              </option>
            ))}
          </select>
          
          {/* Indicateur du type de client */}
          <div className="mt-2">
            {selectedCustomer === 'passage' ? (
              <div className="flex items-center space-x-2 text-sm text-blue-600">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>Vente au comptant - Aucune information client requise</span>
              </div>
            ) : selectedCustomer && (
              <div className="flex items-center space-x-2 text-sm text-green-600">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Client régulier - Facture nominative</span>
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
          >
            <Save className="h-4 w-4" />
            <span>{loading ? 'Enregistrement...' : 'Enregistrer la vente'}</span>
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
    </div>
  );
};

export default WorkingSalesForm;
