import React, { useState } from 'react';
import { X, User, Phone, Mail, CreditCard, Save } from 'lucide-react';
import { Button } from '../UI';
import customerService from '../../services/customerService';

const SimpleCustomerCreateModal = ({ isOpen, onClose, onCustomerCreated }) => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    credit_limit: '0.00',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [debugInfo, setDebugInfo] = useState([]);

  const addDebug = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev, `${timestamp}: ${message}`]);
    console.log(`🐛 ${timestamp}: ${message}`);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    addDebug(`Field changed: ${name} = ${value}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    addDebug('Form submission started');
    
    // Basic validation
    if (!formData.first_name.trim() || !formData.last_name.trim() || !formData.phone.trim()) {
      addDebug('Validation failed: Missing required fields');
      setErrors({
        general: 'Prénom, nom et téléphone sont requis'
      });
      return;
    }

    setLoading(true);
    addDebug('Loading state set to true');

    try {
      const customerData = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim() || `customer_${Date.now()}@pharmacy.local`,
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        credit_limit: parseFloat(formData.credit_limit) || 0,
        notes: formData.notes.trim(),
        username: formData.email.trim() ? 
          formData.email.trim().split('@')[0] : 
          `customer_${Date.now()}`
      };
      
      addDebug(`Prepared customer data: ${JSON.stringify(customerData)}`);

      const newCustomer = await customerService.create(customerData);
      addDebug(`Customer created successfully: ${JSON.stringify(newCustomer)}`);

      // Reset form
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        address: '',
        credit_limit: '0.00',
        notes: ''
      });
      
      setErrors({});
      
      if (onCustomerCreated) {
        onCustomerCreated(newCustomer);
      }
      
      if (onClose) {
        onClose();
      }
      
      addDebug('Modal closed successfully');

    } catch (error) {
      addDebug(`Error occurred: ${error.message}`);
      
      if (error.response) {
        addDebug(`Server response: ${JSON.stringify(error.response.data)}`);
        setErrors({ 
          general: `Erreur serveur: ${JSON.stringify(error.response.data)}` 
        });
      } else if (error.request) {
        addDebug('No response from server');
        setErrors({ 
          general: 'Pas de réponse du serveur. Vérifiez votre connexion.' 
        });
      } else {
        addDebug(`Request error: ${error.message}`);
        setErrors({ 
          general: `Erreur: ${error.message}` 
        });
      }
    } finally {
      setLoading(false);
      addDebug('Loading state set to false');
    }
  };

  const handleDirectTest = async () => {
    addDebug('Direct test button clicked');
    
    try {
      // Test with hardcoded data
      const testData = {
        first_name: 'Test',
        last_name: 'Customer',
        email: `test${Date.now()}@pharmacy.local`,
        phone: '0123456789',
        address: 'Test Address',
        credit_limit: 100,
        notes: 'Test customer',
        username: `test_${Date.now()}`
      };
      
      addDebug(`Testing with data: ${JSON.stringify(testData)}`);
      
      const result = await customerService.create(testData);
      addDebug(`Test successful: ${JSON.stringify(result)}`);
      
    } catch (error) {
      addDebug(`Test failed: ${error.message}`);
      if (error.response) {
        addDebug(`Test error response: ${JSON.stringify(error.response.data)}`);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold flex items-center">
            <User className="h-5 w-5 mr-2" />
            Nouveau Client (Debug Version)
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Error display */}
          {errors.general && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded">
              {errors.general}
            </div>
          )}

          {/* Debug info */}
          <div className="p-3 bg-gray-100 rounded max-h-32 overflow-y-auto">
            <h4 className="text-sm font-semibold mb-2">Debug Log:</h4>
            <div className="text-xs">
              {debugInfo.map((info, index) => (
                <div key={index}>{info}</div>
              ))}
            </div>
          </div>

          {/* Form fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom *
              </label>
              <input
                type="text"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom *
              </label>
              <input
                type="text"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Phone className="h-4 w-4 inline mr-1" />
              Téléphone *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Mail className="h-4 w-4 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <CreditCard className="h-4 w-4 inline mr-1" />
              Limite de crédit (MAD)
            </label>
            <input
              type="number"
              name="credit_limit"
              value={formData.credit_limit}
              onChange={handleChange}
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes internes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              onClick={handleDirectTest}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Test API
            </Button>
            
            <div className="flex space-x-2">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
              >
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Création...' : 'Créer Client'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleCustomerCreateModal;
