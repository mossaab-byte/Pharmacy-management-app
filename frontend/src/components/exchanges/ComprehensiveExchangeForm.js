import React, { useState, useEffect } from 'react';
import { Button, Input, Select, Textarea } from '../UI';
import MedicineSearchWithBarcode from '../common/MedicineSearchWithBarcode';
import exchangeService from '../../services/exchangeService';
import medicineService from '../../services/medicineService';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';

const ComprehensiveExchangeForm = () => {
  const [exchangeType, setExchangeType] = useState('request'); // 'request' or 'offer'
  const [partnerPharmacyId, setPartnerPharmacyId] = useState('');
  const [partnerPharmacies, setPartnerPharmacies] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [quantityRequested, setQuantityRequested] = useState(1);
  const [quantityOffered, setQuantityOffered] = useState(0);
  const [notes, setNotes] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [pharmaciesData, medicinesData] = await Promise.all([
        exchangeService.getPartnerPharmacies(),
        medicineService.getAll()
      ]);
      
      // Ensure we have arrays
      const pharmaciesList = Array.isArray(pharmaciesData) 
        ? pharmaciesData 
        : [];
        
      const medicinesList = Array.isArray(medicinesData?.data?.results) 
        ? medicinesData.data.results 
        : Array.isArray(medicinesData) 
        ? medicinesData 
        : [];

      setPartnerPharmacies(pharmaciesList);
      setMedicines(medicinesList);
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError('Failed to load data. Please try again.');
      
      // Use mock data on error
      const mockPharmacies = [
        { id: 1, name: 'Pharmacie Central', address: '123 Rue Mohammed V, Casablanca', phone: '0522-123456', owner: 'Dr. Ahmed Benali' },
        { id: 2, name: 'Pharmacie du Quartier', address: '456 Avenue Hassan II, Rabat', phone: '0522-654321', owner: 'Dr. Fatima Zahra' },
        { id: 3, name: 'Pharmacie Al Maghrib', address: '789 Boulevard Zerktouni, Casablanca', phone: '0522-987654', owner: 'Dr. Omar Bennani' },
        { id: 4, name: 'Pharmacie Atlas', address: '321 Rue de la Liberté, Marrakech', phone: '0524-111222', owner: 'Dr. Aicha Alami' }
      ];
      
      const mockMedicines = [
        { id: 1, nom: 'Doliprane 500mg', nom_commercial: 'Doliprane 500mg', dci1: 'Paracetamol', forme: 'Comprimé', presentation: 'Boîte de 16 comprimés', code: '6118000041252', ppv: 15.50, prix_public: 15.50, unit_price: 15.50, stock: 25 },
        { id: 2, nom: 'Doliprane 1000mg', nom_commercial: 'Doliprane 1000mg', dci1: 'Paracetamol', forme: 'Comprimé', presentation: 'Boîte de 8 comprimés', code: '6118000040279', ppv: 22.00, prix_public: 22.00, unit_price: 22.00, stock: 18 },
        { id: 3, nom: 'Aspirin 325mg', nom_commercial: 'Aspirin 325mg', dci1: 'Acide acétylsalicylique', forme: 'Comprimé', presentation: 'Boîte de 20 comprimés', code: '6118000040293', ppv: 18.75, prix_public: 18.75, unit_price: 18.75, stock: 30 }
      ];
      
      setPartnerPharmacies(mockPharmacies);
      setMedicines(mockMedicines);
    } finally {
      setLoading(false);
    }
  };

  const handleMedicineSelect = (medicine) => {
    setSelectedMedicine(medicine);
    showNotification(`Selected ${medicine.nom}`, 'success');
  };

  const validateForm = () => {
    if (!partnerPharmacyId) {
      showNotification('Please select a partner pharmacy', 'error');
      return false;
    }
    
    if (!selectedMedicine) {
      showNotification('Please select a medicine for exchange', 'error');
      return false;
    }
    
    if (!quantityRequested || quantityRequested <= 0) {
      showNotification('Please enter a valid quantity requested', 'error');
      return false;
    }
    
    if (exchangeType === 'offer' && (!quantityOffered || quantityOffered <= 0)) {
      showNotification('Please enter a valid quantity offered', 'error');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      
      const exchangeData = {
        partner_pharmacy_id: partnerPharmacyId,
        medicine_id: selectedMedicine.id,
        quantity_requested: quantityRequested,
        quantity_offered: exchangeType === 'offer' ? quantityOffered : 0,
        exchange_type: exchangeType,
        urgency: urgency,
        notes: notes,
        status: 'pending'
      };
      
      await exchangeService.createExchange(exchangeData);
      showNotification('Exchange request created successfully!', 'success');
      navigate('/exchanges');
      
    } catch (error) {
      console.error('Error creating exchange:', error);
      showNotification('Error creating exchange request. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPharmacy = partnerPharmacies.find(p => p.id === parseInt(partnerPharmacyId));

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Create Medicine Exchange</h2>
        <Button 
          variant="outline" 
          onClick={() => navigate('/exchanges')}
          className="px-4 py-2"
        >
          ← Back to Exchanges
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Exchange Details */}
        <div className="space-y-6">
          {/* Exchange Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Exchange Type *
            </label>
            <Select
              value={exchangeType}
              onChange={(e) => setExchangeType(e.target.value)}
              className="w-full"
            >
              <option value="request">Request Medicine</option>
              <option value="offer">Offer Exchange</option>
            </Select>
            <p className="text-xs text-gray-500 mt-1">
              {exchangeType === 'request' 
                ? 'Request medicine from another pharmacy' 
                : 'Offer to exchange medicines with another pharmacy'}
            </p>
          </div>

          {/* Partner Pharmacy */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Partner Pharmacy *
            </label>
            <Select
              value={partnerPharmacyId}
              onChange={(e) => setPartnerPharmacyId(e.target.value)}
              className="w-full"
            >
              <option value="">Select a pharmacy...</option>
              {partnerPharmacies.map(pharmacy => (
                <option key={pharmacy.id} value={pharmacy.id}>
                  {pharmacy.name}
                </option>
              ))}
            </Select>
          </div>

          {/* Selected Pharmacy Details */}
          {selectedPharmacy && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Pharmacy Details</h4>
              <p className="text-sm text-blue-700">Address: {selectedPharmacy.address}</p>
              <p className="text-sm text-blue-700">Phone: {selectedPharmacy.phone}</p>
              {selectedPharmacy.owner && (
                <p className="text-sm text-blue-700">Owner: {selectedPharmacy.owner}</p>
              )}
            </div>
          )}

          {/* Medicine Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Medicine *
            </label>
            <MedicineSearchWithBarcode 
              onMedicineSelect={handleMedicineSelect}
              placeholder="Search medicine by name, DCI, or scan barcode..."
              className="w-full"
            />
          </div>

          {/* Selected Medicine Details */}
          {selectedMedicine && (
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-medium text-green-800 mb-2">Selected Medicine</h4>
              <p className="text-sm text-green-700 font-medium">{selectedMedicine.nom}</p>
              <p className="text-sm text-green-700">DCI: {selectedMedicine.dci1}</p>
              <p className="text-sm text-green-700">Form: {selectedMedicine.forme}</p>
              <p className="text-sm text-green-700">Presentation: {selectedMedicine.presentation}</p>
              <p className="text-sm text-green-700">Code: {selectedMedicine.code}</p>
              <p className="text-sm text-green-700">Current Stock: {selectedMedicine.stock || 0} units</p>
            </div>
          )}
        </div>

        {/* Right Column - Quantities and Details */}
        <div className="space-y-6">
          {/* Quantity Requested */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity Requested *
            </label>
            <Input
              type="number"
              min="1"
              value={quantityRequested}
              onChange={(e) => setQuantityRequested(parseInt(e.target.value) || 1)}
              className="w-full"
              placeholder="Enter quantity needed"
            />
          </div>

          {/* Quantity Offered (for exchange type 'offer') */}
          {exchangeType === 'offer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity Offered *
              </label>
              <Input
                type="number"
                min="1"
                value={quantityOffered}
                onChange={(e) => setQuantityOffered(parseInt(e.target.value) || 1)}
                className="w-full"
                placeholder="Enter quantity to offer"
              />
              <p className="text-xs text-gray-500 mt-1">
                What you're offering in return
              </p>
            </div>
          )}

          {/* Urgency */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Urgency Level
            </label>
            <Select
              value={urgency}
              onChange={(e) => setUrgency(e.target.value)}
              className="w-full"
            >
              <option value="low">Low - Can wait</option>
              <option value="normal">Normal - Standard priority</option>
              <option value="high">High - Needed soon</option>
              <option value="urgent">Urgent - Needed immediately</option>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full"
              rows="4"
              placeholder="Any additional information about this exchange request..."
            />
          </div>

          {/* Exchange Summary */}
          {selectedMedicine && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-3">Exchange Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium capitalize">{exchangeType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Medicine:</span>
                  <span className="font-medium">{selectedMedicine.nom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Quantity Requested:</span>
                  <span className="font-medium">{quantityRequested} units</span>
                </div>
                {exchangeType === 'offer' && quantityOffered > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Quantity Offered:</span>
                    <span className="font-medium">{quantityOffered} units</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Urgency:</span>
                  <span className={`font-medium capitalize ${
                    urgency === 'urgent' ? 'text-red-600' :
                    urgency === 'high' ? 'text-orange-600' :
                    urgency === 'normal' ? 'text-blue-600' : 'text-green-600'
                  }`}>
                    {urgency}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
        <Button 
          variant="outline" 
          onClick={() => navigate('/exchanges')}
          className="px-6 py-2"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={submitting || !selectedMedicine}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700"
        >
          {submitting ? 'Creating Exchange...' : 'Create Exchange Request'}
        </Button>
      </div>
    </div>
  );
};

export default ComprehensiveExchangeForm;
