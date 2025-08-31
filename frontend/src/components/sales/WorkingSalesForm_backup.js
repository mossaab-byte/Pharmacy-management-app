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
      
      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading existing sale:', error);
      setMessage('❌ Erreur lors du chargement de la vente');
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
        </div>
        
        {message && (
          <div className={`p-3 rounded-md mb-4 ${
            (typeof message === 'string' && message.includes('✅')) ? 'bg-green-50 text-green-800 border border-green-200' :
            (typeof message === 'string' && message.includes('❌')) ? 'bg-red-50 text-red-800 border border-red-200' :
            'bg-yellow-50 text-yellow-800 border border-yellow-200'
          }`}>
            {typeof message === 'string' ? message : message.text || 'Message système'}
          </div>
        )}
      </div>

      <div className="text-center p-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Working Sales Form</h2>
        <p className="text-gray-600">This is a simplified version. The full component is being restored.</p>
        {isEditMode && (
          <p className="text-blue-600 mt-2">Edit Mode: Sale ID {saleId}</p>
        )}
      </div>
    </div>
  );
};

export default WorkingSalesForm;
