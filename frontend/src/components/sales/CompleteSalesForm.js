import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/UI';
import { Button } from '../../components/UI';
import { Search, Plus, Trash2, User, CreditCard, DollarSign, Check, AlertTriangle } from 'lucide-react';
import salesService from '../../services/salesServices';
import customerService from '../../services/customerService';
import medicineService from '../../services/medicineService';
import creditService from '../../services/creditService';
import pharmacyMedicineService from '../../services/pharmacyMedicineService';
import stockManagementService from '../../services/stockManagementService';

const CompleteSalesForm = () => {
  // States
  const [customers, setCustomers] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isWalkInCustomer, setIsWalkInCustomer] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash', 'card', 'credit'
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [medicineSearchTerm, setMedicineSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [stockWarnings, setStockWarnings] = useState([]);
  const [creditCheck, setCreditCheck] = useState(null);
  const [userPermissions, setUserPermissions] = useState(null);

  // Load initial data
  useEffect(() => {
    loadCustomers();
    loadMedicines();
    loadUserPermissions();
  }, []);

  const loadUserPermissions = async () => {
    try {
      const permissions = await stockManagementService.getUserPermissions();
      setUserPermissions(permissions);
      console.log('User permissions:', permissions);
    } catch (error) {
      console.error('Error loading user permissions:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await customerService.getAll();
      setCustomers(Array.isArray(response) ? response : response.results || []);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadMedicines = async () => {
    try {
      // Charger les PharmacyMedicine au lieu des Medicine
      const response = await fetch('http://localhost:8000/api/pharmacy/pharmacy-medicines/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      setMedicines(Array.isArray(data) ? data : data.results || []);
      console.log('Loaded pharmacy medicines:', data.results?.length || data.length);
    } catch (error) {
      console.error('Error loading pharmacy medicines:', error);
    }
  };

  // Customer selection
  const filteredCustomers = customers.filter(customer =>
    customer.user?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.user?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone?.includes(searchTerm)
  );

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setIsWalkInCustomer(false);
    setSearchTerm('');
    
    // Vérifier le crédit si mode crédit
    if (paymentMethod === 'credit') {
      checkCustomerCredit(customer.id);
    }
  };

  // Vérification du crédit client
  const checkCustomerCredit = async (customerId) => {
    try {
      const creditInfo = await creditService.canBuyOnCredit(customerId, totalAmount);
      setCreditCheck(creditInfo);
      console.log('Credit check:', creditInfo);
    } catch (error) {
      console.error('Error checking customer credit:', error);
      setCreditCheck({ canBuy: false, error: 'Erreur lors de la vérification du crédit' });
    }
  };

  // Medicine selection
  const filteredMedicines = medicines.filter(medicine =>
    medicine.medicine_name?.toLowerCase().includes(medicineSearchTerm.toLowerCase()) ||
    medicine.medicine_code?.toLowerCase().includes(medicineSearchTerm.toLowerCase())
  );

  const addMedicineToSale = async (medicine) => {
    const existingItem = items.find(item => item.medicine.id === medicine.id);
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + 1;
      await updateItemQuantity(existingItem.id, newQuantity);
    } else {
      // Vérifier le stock avant d'ajouter
      try {
        const stockCheck = await pharmacyMedicineService.checkStock(medicine.id, 1);
        
        if (!stockCheck.sufficient) {
          alert(`Stock insuffisant pour ${medicine.medicine_name}. Stock disponible: ${stockCheck.available}`);
          return;
        }

        const newItem = {
          id: Date.now(),
          medicine: medicine,
          quantity: 1,
          unit_price: parseFloat(medicine.price || 0),
          subtotal: parseFloat(medicine.price || 0)
        };
        setItems([...items, newItem]);
        setMedicineSearchTerm('');
      } catch (error) {
        console.error('Error checking stock:', error);
        alert('Erreur lors de la vérification du stock');
      }
    }
  };

  const updateItemQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(itemId);
      return;
    }

    // Vérifier le stock avant de mettre à jour
    const item = items.find(i => i.id === itemId);
    if (item) {
      try {
        const stockCheck = await pharmacyMedicineService.checkStock(item.medicine.id, newQuantity);
        
        if (!stockCheck.sufficient) {
          alert(`Stock insuffisant pour ${item.medicine.medicine_name}. Stock disponible: ${stockCheck.available}, demandé: ${newQuantity}`);
          return;
        }

        setItems(items.map(item => {
          if (item.id === itemId) {
            const newSubtotal = newQuantity * item.unit_price;
            return { ...item, quantity: newQuantity, subtotal: newSubtotal };
          }
          return item;
        }));
      } catch (error) {
        console.error('Error checking stock for update:', error);
        alert('Erreur lors de la vérification du stock');
      }
    }
  };

  const updateItemPrice = (itemId, newPrice) => {
    setItems(items.map(item => {
      if (item.id === itemId) {
        const parsedPrice = parseFloat(newPrice) || 0;
        const newSubtotal = item.quantity * parsedPrice;
        return { ...item, unit_price: parsedPrice, subtotal: newSubtotal };
      }
      return item;
    }));
  };

  const removeItem = (itemId) => {
    setItems(items.filter(item => item.id !== itemId));
  };

  // Calculations
  const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  // Submit sale
  const submitSale = async () => {
    console.log('=== SUBMIT SALE FUNCTION CALLED ===');
    console.log('Items length:', items.length);
    console.log('Payment method:', paymentMethod);
    console.log('Selected customer:', selectedCustomer);
    
    if (items.length === 0) {
      console.log('ERROR: No items in sale');
      alert('Veuillez ajouter au moins un article à la vente');
      return;
    }

    if (paymentMethod === 'credit' && !selectedCustomer) {
      console.log('ERROR: No customer selected for credit sale');
      alert('Un client doit être sélectionné pour un paiement à crédit');
      return;
    }

    // Vérification finale du stock pour tous les articles
    console.log('🔍 Vérification finale du stock...');
    try {
      const stockValidation = await pharmacyMedicineService.validateAvailability(
        items.map(item => ({
          pharmacy_medicine_id: item.medicine.id,
          quantity: item.quantity,
          medicine_name: item.medicine.medicine_name
        }))
      );

      if (!stockValidation.valid) {
        const stockIssues = stockValidation.issues.map(issue => 
          `${issue.medicine_name}: demandé ${issue.quantity}, disponible ${issue.stockCheck.available}`
        ).join('\n');
        
        alert(`Stock insuffisant pour:\n${stockIssues}`);
        return;
      }
      console.log('✅ Stock validation passed');
    } catch (error) {
      console.error('Error validating stock:', error);
      alert('Erreur lors de la validation du stock');
      return;
    }

    // Vérification du crédit si nécessaire
    if (paymentMethod === 'credit' && selectedCustomer) {
      console.log('🔍 Vérification du crédit client...');
      try {
        const creditInfo = await creditService.canBuyOnCredit(selectedCustomer.id, totalAmount);
        
        if (!creditInfo.canBuy) {
          alert(`Crédit insuffisant:\nSolde actuel: ${creditInfo.currentBalance} DH\nLimite de crédit: ${creditInfo.creditLimit} DH\nMontant demandé: ${creditInfo.requestedAmount} DH\nCrédit disponible: ${creditInfo.availableCredit} DH`);
          return;
        }
        console.log('✅ Credit check passed');
      } catch (error) {
        console.error('Error checking credit:', error);
        alert('Erreur lors de la vérification du crédit');
        return;
      }
    }

    // SOLUTION TEMPORAIRE : Définir un token d'authentification pour les tests
    const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzUyNzg1MzAzLCJpYXQiOjE3NTI2OTg5MDMsImp0aSI6IjRmYmU3YmEzNjA3MjQwYmVhMWIzMzQxMWJhZmM3MDVkIiwidXNlcl9pZCI6ImFjNjA4OWExLWQ4OWEtNDg1MC04YjI2LTU2ZDU2NTNjYWYzOCJ9.g2NE3Fo1i2Z7jxHJDBnekaH3hkCh7u26TWPKgy9-wUE";
    localStorage.setItem('access_token', testToken);
    console.log('Token set in localStorage:', testToken);

    setLoading(true);
    try {
      console.log('Starting sale submission...');
      console.log('Selected customer:', selectedCustomer);
      console.log('Items:', items);
      console.log('Payment method:', paymentMethod);
      console.log('Total amount:', totalAmount);

      // Prepare sale data
      const saleData = {
        customer: selectedCustomer?.id || null,
        payment_method: paymentMethod,
        total_amount: totalAmount,
        items: items.map(item => ({
          pharmacy_medicine: item.medicine.id,  // Changé de 'medicine' à 'pharmacy_medicine'
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal
        }))
      };

      console.log('Submitting sale data:', JSON.stringify(saleData, null, 2));

      // Create sale
      const sale = await salesService.createSale(saleData);
      console.log('Sale created successfully:', sale);

      // Handle payment and credit updates
      if (paymentMethod === 'credit' && selectedCustomer) {
        console.log('Updating customer credit balance...');
        // For credit sales, update customer's credit balance
        try {
          await customerService.adjustCredit(selectedCustomer.id, totalAmount, 'credit');
          console.log('Customer credit updated successfully');
        } catch (creditError) {
          console.error('Error updating customer credit:', creditError);
          // Don't fail the entire sale for credit update issues
        }
      } else if (paymentMethod !== 'credit') {
        console.log('Creating immediate payment...');
        // Create immediate payment for cash/card
        try {
          const paymentData = {
            sale: sale.id,
            amount: totalAmount,
            method: paymentMethod,
            payment_date: new Date().toISOString()
          };
          await salesService.createPayment(paymentData);
          console.log('Payment created successfully');
        } catch (paymentError) {
          console.error('Error creating payment:', paymentError);
          // Don't fail the entire sale for payment issues
        }
      }

      // Success
      console.log('Sale process completed successfully!');
      setSuccess(true);
      setTimeout(() => {
        resetForm();
        setSuccess(false);
      }, 3000);

    } catch (error) {
      console.error('Error creating sale:', error);
      let errorMessage = 'Erreur lors de la création de la vente';
      
      if (error.response?.data) {
        if (typeof error.response.data === 'string') {
          errorMessage += ': ' + error.response.data;
        } else if (error.response.data.detail) {
          errorMessage += ': ' + error.response.data.detail;
        } else if (error.response.data.error) {
          errorMessage += ': ' + error.response.data.error;
        } else {
          errorMessage += ': ' + JSON.stringify(error.response.data);
        }
      } else if (error.message) {
        errorMessage += ': ' + error.message;
      }
      
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedCustomer(null);
    setIsWalkInCustomer(true);
    setPaymentMethod('cash');
    setItems([]);
    setSearchTerm('');
    setMedicineSearchTerm('');
    setStockWarnings([]);
    setCreditCheck(null);
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            Vente créée avec succès !
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
        <h1 className="text-2xl font-bold">Nouvelle Vente</h1>
        <Button onClick={resetForm} variant="outline">
          Réinitialiser
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Client
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={isWalkInCustomer}
                  onChange={() => {
                    setIsWalkInCustomer(true);
                    setSelectedCustomer(null);
                  }}
                  className="mr-2"
                />
                Client de passage
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!isWalkInCustomer}
                  onChange={() => setIsWalkInCustomer(false)}
                  className="mr-2"
                />
                Client enregistré
              </label>
            </div>

            {!isWalkInCustomer && (
              <div className="space-y-3">
                {selectedCustomer ? (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {selectedCustomer.user?.first_name} {selectedCustomer.user?.last_name}
                        </p>
                        <p className="text-sm text-gray-600">{selectedCustomer.user?.email}</p>
                        <p className="text-sm text-gray-600">
                          Solde: {selectedCustomer.balance?.toFixed(2) || '0.00'} DH
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedCustomer(null)}
                      >
                        Changer
                      </Button>
                    </div>
                    
                    {/* Information de crédit si mode crédit */}
                    {paymentMethod === 'credit' && creditCheck && (
                      <div className={`mt-3 p-3 rounded-lg ${creditCheck.canBuy ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                        <div className="flex items-center">
                          {creditCheck.canBuy ? (
                            <Check className="w-4 h-4 text-green-600 mr-2" />
                          ) : (
                            <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                          )}
                          <span className={`text-sm font-medium ${creditCheck.canBuy ? 'text-green-800' : 'text-red-800'}`}>
                            {creditCheck.canBuy ? 'Crédit suffisant' : 'Crédit insuffisant'}
                          </span>
                        </div>
                        <div className="mt-2 text-xs text-gray-600">
                          <p>Limite de crédit: {creditCheck.creditLimit?.toFixed(2) || '0.00'} DH</p>
                          <p>Solde actuel: {creditCheck.currentBalance?.toFixed(2) || '0.00'} DH</p>
                          <p>Crédit disponible: {creditCheck.availableCredit?.toFixed(2) || '0.00'} DH</p>
                          <p>Montant de cette vente: {totalAmount.toFixed(2)} DH</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher un client..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    {searchTerm && (
                      <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg">
                        {filteredCustomers.map(customer => (
                          <div
                            key={customer.id}
                            onClick={() => selectCustomer(customer)}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <p className="font-medium">
                              {customer.user?.first_name} {customer.user?.last_name}
                            </p>
                            <p className="text-sm text-gray-600">{customer.user?.email}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Mode de paiement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              <label className="flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mb-2"
                />
                <DollarSign className="w-6 h-6 mb-1" />
                <span className="text-sm">Espèces</span>
              </label>
              <label className="flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mb-2"
                />
                <CreditCard className="w-6 h-6 mb-1" />
                <span className="text-sm">Carte</span>
              </label>
              <label className="flex flex-col items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  value="credit"
                  checked={paymentMethod === 'credit'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mb-2"
                  disabled={isWalkInCustomer}
                />
                <User className="w-6 h-6 mb-1" />
                <span className="text-sm">Crédit</span>
              </label>
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
                  onClick={() => addMedicineToSale(medicine)}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{medicine.medicine_name}</p>
                      <p className="text-sm text-gray-600">Code: {medicine.medicine_code}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{parseFloat(medicine.price || 0).toFixed(2)} DH</p>
                      <p className="text-sm text-gray-600">Stock: {medicine.quantity || 0}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sales Items */}
      {items.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Articles de la vente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{item.medicine.medicine_name}</p>
                    <p className="text-sm text-gray-600">Code: {item.medicine.medicine_code}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-500">Stock: {item.medicine.quantity || 0}</span>
                      {item.medicine.quantity && item.quantity > item.medicine.quantity && (
                        <span className="ml-2 text-xs text-red-600 font-medium flex items-center">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Stock insuffisant!
                        </span>
                      )}
                      {item.medicine.quantity && item.medicine.quantity <= (item.medicine.minimum_stock_level || 10) && (
                        <span className="ml-2 text-xs text-orange-600 font-medium">
                          ⚠️ Stock faible
                        </span>
                      )}
                    </div>
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
                    <label className="text-sm">Prix:</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => updateItemPrice(item.id, e.target.value)}
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
          onClick={() => {
            console.log('=== BUTTON CLICKED ===');
            console.log('Button clicked, calling submitSale');
            submitSale();
          }} 
          disabled={loading || items.length === 0}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Création...' : 'Enregistrer la vente'}
        </Button>
      </div>
    </div>
  );
};

export default CompleteSalesForm;
