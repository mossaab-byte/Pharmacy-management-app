import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Minus, Save, ShoppingBag, Building } from 'lucide-react';
import { Button } from '../UI';
import MedicineSearchWithBarcode from '../common/MedicineSearchWithBarcode';
import SimpleMedicineAutocomplete from '../common/SimpleMedicineAutocomplete';
import supplierService from '../../services/supplierService';
import purchaseService from '../../services/purchaseService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const WorkingPurchaseForm = () => {
  const navigate = useNavigate();
  const { id: purchaseId } = useParams(); // Get purchase ID for edit mode
  const isEditMode = Boolean(purchaseId);
  
  console.log('🔍 WorkingPurchaseForm loaded:');
  console.log('  - purchaseId:', purchaseId);
  console.log('  - isEditMode:', isEditMode);
  console.log('  - URL params:', useParams());
  
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [purchaseItems, setPurchaseItems] = useState([{ 
    id: 1, 
    medicine: null, 
    quantity: 1, 
    unitCost: 0, 
    total: 0 
  }]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  
  // Scanner automatique states
  const [scannedCode, setScannedCode] = useState('');
  const scanTimeoutRef = useRef(null);

  // Load real suppliers from API
  const loadSuppliers = async () => {
    try {
      console.log('🔍 Loading suppliers from API...');
      const apiResponse = await supplierService.getAll();
      console.log('✅ Loaded suppliers response:', apiResponse);
      
      // Extract suppliers array from paginated response
      const suppliersArray = apiResponse.results || apiResponse || [];
      console.log('✅ Extracted suppliers array:', suppliersArray);
      console.log('🔍 Suppliers array length:', suppliersArray.length);
      console.log('🔍 Is array?', Array.isArray(suppliersArray));
      
      // Format suppliers for the dropdown
      const formattedSuppliers = suppliersArray.map(supplier => ({
        id: supplier.id,
        name: supplier.name,
        contact_person: supplier.contact_person || 'N/A',
        contact_phone: supplier.contact_phone || 'N/A',
        contact_email: supplier.contact_email || 'N/A'
      }));
      
      setSuppliers(formattedSuppliers);
      console.log('✅ Formatted suppliers for dropdown:', formattedSuppliers);
    } catch (error) {
      console.error('❌ Error loading suppliers:', error);
      // Fallback to empty suppliers list
      setSuppliers([]);
    }
  };

  // Function to load existing purchase data for editing
  const loadExistingPurchase = async () => {
    try {
      setLoading(true);
      console.log(`🔍 Loading existing purchase: ${purchaseId}`);
      
      const purchaseData = await purchaseService.getById(purchaseId);
      console.log('✅ Loaded purchase data:', purchaseData);
      
      // Set supplier
      if (purchaseData.supplier) {
        console.log('🔍 Setting supplier:', purchaseData.supplier);
        setSelectedSupplier(purchaseData.supplier.id || purchaseData.supplier_id);
      }
      
      // Set purchase items
      if (purchaseData.items && purchaseData.items.length > 0) {
        console.log('🔍 Processing purchase items:', purchaseData.items);
        const formattedItems = purchaseData.items.map((item, index) => ({
          id: index + 1,
          medicine: item.medicine || item.pharmacy_medicine,
          quantity: item.quantity,
          unitCost: parseFloat(item.unit_cost || item.unit_price || item.cost_price || item.ph || 0),
          total: parseFloat(item.total || (item.quantity * (item.unit_cost || item.unit_price || item.cost_price || item.ph || 0)))
        }));
        console.log('✅ Formatted items for edit:', formattedItems);
        setPurchaseItems(formattedItems);
      }
      
      setMessage({ type: 'success', text: '✅ Données de commande chargées' });
    } catch (error) {
      console.error('❌ Error loading existing purchase:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des données: ' + error.message });
    } finally {
      setLoading(false);
    }
  };

  // ✨ AUTO-SCAN GLOBAL LISTENER
  useEffect(() => {
    // Load data on component mount
    loadSuppliers();
    
    if (isEditMode) {
      loadExistingPurchase();
    }

    // Global keypress listener for automatic barcode scanning
    const handleAutoScan = (e) => {
      // Ignorer les événements si on est dans un input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        return;
      }

      // Si on a accumulé assez de caractères (probablement un scan complet)
      if (scannedCode.length >= 8 && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
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
  }, [isEditMode, purchaseId, scannedCode]);

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
        
        setMessage({
          type: 'success',
          text: `✅ ${medicine.name || medicine.nom_commercial} ajouté à la commande par scan!`
        });
      } else {
        console.log('❌ Aucun médicament trouvé pour:', barcode);
        setMessage({
          type: 'error',
          text: `❌ Aucun médicament trouvé pour le code: ${barcode}`
        });
      }
    } catch (error) {
      console.error('Erreur scan automatique:', error);
      setMessage({
        type: 'error',
        text: 'Erreur lors du scan automatique'
      });
    }
  };

  // Fonction pour ajouter ou mettre à jour un médicament
  const addOrUpdateMedicine = (medicine) => {
    console.log('🔄 Ajout/Mise à jour médicament:', medicine.nom_commercial || medicine.nom);
    
    // Vérifier si le médicament existe déjà
    const existingItemIndex = purchaseItems.findIndex(item => 
      item.medicine && item.medicine.id === medicine.id
    );
    
    console.log('📋 Index existant:', existingItemIndex);
    
    if (existingItemIndex !== -1) {
      // Augmenter la quantité de 1
      const updatedItems = [...purchaseItems];
      updatedItems[existingItemIndex].quantity += 1;
      updatedItems[existingItemIndex].total = 
        updatedItems[existingItemIndex].quantity * updatedItems[existingItemIndex].unitCost;
      setPurchaseItems(updatedItems);
      console.log('✅ Quantité incrémentée vers:', updatedItems[existingItemIndex].quantity);
      return 'incremented';
    } else {
      // Ajouter une nouvelle ligne ou utiliser une ligne vide
      const emptyItemIndex = purchaseItems.findIndex(item => !item.medicine);
      
      // Extract cost from medicine data - try multiple field names
      const cost = parseFloat(
        medicine.cost_price ||    // From serializer
        medicine.ph ||            // Direct from model
        medicine.prix_br ||       // Public price as fallback
        medicine.ppv ||           // Alternative price field
        0
      );
      
      console.log(`💰 Coût extrait pour ${medicine.nom_commercial || medicine.nom || medicine.name}:`, {
        'cost_price': medicine.cost_price,
        'ph': medicine.ph,
        'prix_br': medicine.prix_br,
        'ppv': medicine.ppv,
        'final_cost': cost
      });
      
      const newItem = {
        id: emptyItemIndex !== -1 ? purchaseItems[emptyItemIndex].id : purchaseItems.length + 1,
        medicine: medicine,
        quantity: 1,
        unitCost: cost,
        total: cost
      };
      
      if (emptyItemIndex !== -1) {
        // Remplacer la ligne vide
        const updatedItems = [...purchaseItems];
        updatedItems[emptyItemIndex] = newItem;
        setPurchaseItems(updatedItems);
        console.log('✅ Ligne vide remplacée');
      } else {
        // Ajouter une nouvelle ligne
        setPurchaseItems(prev => [...prev, newItem]);
        console.log('✅ Nouvelle ligne ajoutée');
      }
      return 'added';
    }
  };

  // Gestion d'ajout de médicament via recherche
  const handleMedicineSelect = (medicine) => {
    console.log('🎯 Médicament sélectionné via recherche:', medicine);
    const action = addOrUpdateMedicine(medicine);
    
    if (action === 'incremented') {
      setMessage({
        type: 'info',
        text: `📈 Quantité incrémentée pour ${medicine.nom_commercial || medicine.nom}`
      });
    } else {
      setMessage({
        type: 'success',
        text: `✅ ${medicine.nom_commercial || medicine.nom} ajouté à la commande`
      });
    }
    
    // Effacer le message après 3 secondes
    setTimeout(() => setMessage(''), 3000);
  };

  // Gestion des changements de quantité
  const handleQuantityChange = (itemId, newQuantity) => {
    const quantity = Math.max(1, parseInt(newQuantity) || 1);
    
    const updatedItems = purchaseItems.map(item => {
      if (item.id === itemId) {
        const total = quantity * item.unitCost;
        return { ...item, quantity, total };
      }
      return item;
    });
    
    setPurchaseItems(updatedItems);
  };

  // Gestion des changements de coût unitaire
  const handleUnitCostChange = (itemId, newCost) => {
    const cost = Math.max(0, parseFloat(newCost) || 0);
    
    const updatedItems = purchaseItems.map(item => {
      if (item.id === itemId) {
        const total = item.quantity * cost;
        return { ...item, unitCost: cost, total };
      }
      return item;
    });
    
    setPurchaseItems(updatedItems);
  };

  // Supprimer un item
  const removeItem = (itemId) => {
    if (purchaseItems.length > 1) {
      setPurchaseItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      // Si c'est le dernier item, le réinitialiser
      setPurchaseItems([{ id: 1, medicine: null, quantity: 1, unitCost: 0, total: 0 }]);
    }
  };

  // Ajouter une nouvelle ligne
  const addNewItem = () => {
    const newId = Math.max(...purchaseItems.map(item => item.id)) + 1;
    setPurchaseItems(prev => [...prev, { 
      id: newId, 
      medicine: null, 
      quantity: 1, 
      unitCost: 0, 
      total: 0 
    }]);
  };

  // Calculer le total général
  const calculateTotal = () => {
    return purchaseItems.reduce((sum, item) => sum + (item.total || 0), 0);
  };

  // Sauvegarder la commande
  const handleSave = async () => {
    // Validation
    if (!selectedSupplier) {
      setMessage({ type: 'error', text: '❌ Veuillez sélectionner un fournisseur' });
      return;
    }

    const validItems = purchaseItems.filter(item => item.medicine && item.quantity > 0);
    if (validItems.length === 0) {
      setMessage({ type: 'error', text: '❌ Veuillez ajouter au moins un médicament' });
      return;
    }

    try {
      setLoading(true);
      
      const purchaseData = {
        supplier_id: selectedSupplier,
        items: validItems.map(item => ({
          medicine_id: item.medicine.id,
          quantity: item.quantity,
          unit_cost: item.unitCost,
          total: item.total
        })),
        total_amount: calculateTotal(),
        status: 'pending'
      };

      console.log('💾 Données de commande à envoyer:', purchaseData);
      console.log('🔍 Supplier ID type and value:', {
        type: typeof selectedSupplier,
        value: selectedSupplier,
        isString: typeof selectedSupplier === 'string'
      });

      let result;
      if (isEditMode) {
        result = await purchaseService.update(purchaseId, purchaseData);
        setMessage({ type: 'success', text: '✅ Commande mise à jour avec succès!' });
      } else {
        result = await purchaseService.create(purchaseData);
        setMessage({ type: 'success', text: '✅ Commande créée avec succès!' });
      }

      console.log('✅ Commande sauvegardée:', result);
      
      // Rediriger vers la liste des commandes après un délai
      setTimeout(() => {
        navigate('/purchases');
      }, 2000);

    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde:', error);
      setMessage({ 
        type: 'error', 
        text: `❌ Erreur: ${error.message || 'Impossible de sauvegarder la commande'}` 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShoppingBag className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEditMode ? 'Modifier la Commande' : 'Nouvelle Commande d\'Achat'}
                </h1>
                <p className="text-gray-600">
                  {isEditMode ? 'Modifiez les détails de votre commande' : 'Créez une nouvelle commande d\'achat fournisseur'}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-gray-500">Total</div>
              <div className="text-3xl font-bold text-blue-600">
                {calculateTotal().toFixed(2)} DH
              </div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
            message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-blue-50 text-blue-800 border border-blue-200'
          }`}>
            {message.text || message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Informations fournisseur */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="h-5 w-5" />
                Fournisseur
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sélectionner le fournisseur *
                  </label>
                  <select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={loading}
                  >
                    <option value="">Choisir un fournisseur...</option>
                    {suppliers.map(supplier => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedSupplier && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    {suppliers.find(s => s.id === selectedSupplier) && (
                      <div className="space-y-2 text-sm">
                        <div><strong>Contact:</strong> {suppliers.find(s => s.id === selectedSupplier).contact_person}</div>
                        <div><strong>Téléphone:</strong> {suppliers.find(s => s.id === selectedSupplier).contact_phone}</div>
                        <div><strong>Email:</strong> {suppliers.find(s => s.id === selectedSupplier).contact_email}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Recherche de médicament */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🔍 Recherche rapide (ou scan)
                  </label>
                  <SimpleMedicineAutocomplete
                    onMedicineSelect={handleMedicineSelect}
                    placeholder="Rechercher par nom ou scanner..."
                    className="w-full"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    💡 Scannez directement sans cliquer sur le champ
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des articles */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Articles de la commande</h2>
                <Button
                  onClick={addNewItem}
                  className="flex items-center gap-2"
                  variant="outline"
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un article
                </Button>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {purchaseItems.map((item, index) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        {item.medicine ? (
                          <div>
                            <div className="font-medium text-gray-900">
                              {item.medicine.nom_commercial || item.medicine.nom || item.medicine.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Code: {item.medicine.code} | DCI: {item.medicine.dci || 'N/A'}
                            </div>
                          </div>
                        ) : (
                          <div className="text-gray-500 italic">
                            Aucun médicament sélectionné
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Quantité</div>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                            className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="text-right">
                          <div className="text-xs text-gray-500">Coût unitaire</div>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={item.unitCost}
                            onChange={(e) => handleUnitCostChange(item.id, e.target.value)}
                            className="w-20 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          />
                        </div>

                        <div className="text-right min-w-[80px]">
                          <div className="text-xs text-gray-500">Total</div>
                          <div className="font-semibold text-gray-900">
                            {item.total.toFixed(2)} DH
                          </div>
                        </div>

                        <Button
                          onClick={() => removeItem(item.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:bg-red-50"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
                <div className="text-lg font-semibold text-gray-900">
                  Total de la commande: {calculateTotal().toFixed(2)} DH
                </div>
                
                <div className="flex gap-3">
                  <Button
                    onClick={() => navigate('/purchases')}
                    variant="outline"
                    disabled={loading}
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="flex items-center gap-2"
                    disabled={loading || !selectedSupplier}
                  >
                    <Save className="h-4 w-4" />
                    {loading ? 'Sauvegarde...' : (isEditMode ? 'Mettre à jour' : 'Créer la commande')}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkingPurchaseForm;
