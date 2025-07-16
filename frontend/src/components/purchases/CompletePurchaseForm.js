import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/UI';
import { Button } from '../../components/UI';
import { Search, Plus, Trash2, Building, Truck, Package, Check } from 'lucide-react';
import purchaseService from '../../services/purchaseService';
import supplierService from '../../services/supplierService';
import medicineService from '../../services/medicineService';

const CompletePurchaseForm = () => {
  // States
  const [suppliers, setSuppliers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [medicineSearchTerm, setMedicineSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash', 'credit'
  const [deliveryDate, setDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');

  // Load initial data
  useEffect(() => {
    loadSuppliers();
    loadMedicines();
  }, []);

  const loadSuppliers = async () => {
    try {
      const response = await supplierService.getAll();
      setSuppliers(Array.isArray(response) ? response : response.results || []);
    } catch (error) {
      console.error('Error loading suppliers:', error);
    }
  };

  const loadMedicines = async () => {
    try {
      const response = await medicineService.searchAll({ limit: 1000 });
      setMedicines(Array.isArray(response) ? response : response.results || []);
    } catch (error) {
      console.error('Error loading medicines:', error);
    }
  };

  // Supplier selection
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectSupplier = (supplier) => {
    setSelectedSupplier(supplier);
    setSearchTerm('');
  };

  // Medicine selection
  const filteredMedicines = medicines.filter(medicine =>
    medicine.nom?.toLowerCase().includes(medicineSearchTerm.toLowerCase()) ||
    medicine.code?.toLowerCase().includes(medicineSearchTerm.toLowerCase())
  );

  const addMedicineToPurchase = (medicine) => {
    const existingItem = items.find(item => item.medicine.id === medicine.id);
    if (existingItem) {
      updateItemQuantity(existingItem.id, existingItem.quantity + 1);
    } else {
      const newItem = {
        id: Date.now(),
        medicine: medicine,
        quantity: 1,
        unit_cost: parseFloat(medicine.cost_price || medicine.price || 0),
        subtotal: parseFloat(medicine.cost_price || medicine.price || 0)
      };
      setItems([...items, newItem]);
    }
    setMedicineSearchTerm('');
  };

  const updateItemQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems(items.map(item => {
      if (item.id === itemId) {
        const newSubtotal = newQuantity * item.unit_cost;
        return { ...item, quantity: newQuantity, subtotal: newSubtotal };
      }
      return item;
    }));
  };

  const updateItemCost = (itemId, newCost) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const parsedCost = parseFloat(newCost) || 0;
        const newSubtotal = item.quantity * parsedCost;
        return { ...item, unit_cost: parsedCost, subtotal: newSubtotal };
      }
      return item;
    }));
  };

  const removeItem = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  // Calculations
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  // Submit purchase
  const submitPurchase = async () => {
    if (items.length === 0) {
      alert('Veuillez ajouter au moins un article à l\'achat');
      return;
    }

    if (!selectedSupplier) {
      alert('Veuillez sélectionner un fournisseur');
      return;
    }

    setLoading(true);
    try {
      // Prepare purchase data
      const purchaseData = {
        supplier: selectedSupplier.id,
        items: items.map(item => ({
          medicine: item.medicine.id,
          quantity: item.quantity,
          unit_cost: item.unit_cost
        })),
        payment_method: paymentMethod,
        expected_delivery: deliveryDate || null,
        notes: notes,
        status: 'pending'
      };

      console.log('Submitting purchase:', purchaseData);

      // Create purchase
      const purchase = await purchaseService.create(purchaseData);
      console.log('Purchase created:', purchase);

      // Handle payment for supplier credit
      if (paymentMethod === 'credit') {
        // This will be handled by the backend when finalizing the purchase
        console.log('Purchase added to supplier credit');
      }

      // Success
      setSuccess(true);
      setTimeout(() => {
        resetForm();
        setSuccess(false);
      }, 2000);

    } catch (error) {
      console.error('Error creating purchase:', error);
      alert('Erreur lors de la création de l\'achat: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedSupplier(null);
    setItems([]);
    setSearchTerm('');
    setMedicineSearchTerm('');
    setPaymentMethod('cash');
    setDeliveryDate('');
    setNotes('');
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Commande créée avec succès !
          </h3>
          <p className="text-green-600">
            Total: {totalAmount.toFixed(2)} DH
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Nouvelle Commande d'Achat</h1>
        <Button onClick={resetForm} variant="outline">
          Réinitialiser
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supplier Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="w-5 h-5" />
              Fournisseur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedSupplier ? (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{selectedSupplier.name}</p>
                    <p className="text-sm text-gray-600">{selectedSupplier.contact_person}</p>
                    <p className="text-sm text-gray-600">{selectedSupplier.contact_email}</p>
                    <p className="text-sm text-gray-600">
                      Solde: {selectedSupplier.current_balance?.toFixed(2) || '0.00'} DH
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSupplier(null)}
                  >
                    Changer
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher un fournisseur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {searchTerm && (
                  <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredSuppliers.map(supplier => (
                      <div
                        key={supplier.id}
                        onClick={() => selectSupplier(supplier)}
                        className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <p className="font-medium">{supplier.name}</p>
                        <p className="text-sm text-gray-600">{supplier.contact_person}</p>
                        <p className="text-sm text-gray-600">{supplier.contact_email}</p>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Purchase Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Détails de la commande
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Mode de paiement</label>
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="cash"
                    checked={paymentMethod === 'cash'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  <span>Paiement immédiat</span>
                </label>
                <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    value="credit"
                    checked={paymentMethod === 'credit'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  <span>À crédit</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date de livraison prévue</label>
              <div className="relative">
                <Truck className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <input
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes sur la commande..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medicine Search & Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Ajouter des articles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un médicament..."
              value={medicineSearchTerm}
              onChange={(e) => setMedicineSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          {medicineSearchTerm && (
            <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg mb-4">
              {filteredMedicines.slice(0, 10).map(medicine => (
                <div
                  key={medicine.id}
                  onClick={() => addMedicineToPurchase(medicine)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{medicine.nom}</p>
                      <p className="text-sm text-gray-600">Code: {medicine.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{parseFloat(medicine.cost_price || medicine.price || 0).toFixed(2)} DH</p>
                      <p className="text-sm text-gray-600">Stock actuel: {medicine.quantity || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchase Items */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Articles de la commande</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.medicine.nom}</p>
                    <p className="text-sm text-gray-600">Code: {item.medicine.code}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Qté:</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 0)}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm">Coût unitaire:</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_cost}
                      onChange={(e) => updateItemCost(item.id, e.target.value)}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                    />
                    <span className="text-sm">DH</span>
                  </div>
                  <div className="text-right min-w-24">
                    <p className="font-medium">{item.subtotal.toFixed(2)} DH</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(item.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center text-lg font-bold">
                <span>Total:</span>
                <span>{totalAmount.toFixed(2)} DH</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button onClick={resetForm} variant="outline">
          Annuler
        </Button>
        <Button 
          onClick={submitPurchase} 
          disabled={loading || items.length === 0 || !selectedSupplier}
          className="bg-green-600 hover:bg-green-700"
        >
          {loading ? 'Création...' : `Créer la commande (${totalAmount.toFixed(2)} DH)`}
        </Button>
      </div>
    </div>
  );
};

export default CompletePurchaseForm;
