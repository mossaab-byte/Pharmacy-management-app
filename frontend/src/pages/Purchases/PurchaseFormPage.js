import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorBoundary from '../../components/ErrorBoundary';
import { Card, Input, Button, LoadingSpinner, ErrorMessage, Modal } from '../../components/UI';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContextNew';
import MedicineSearchWithBarcode from '../../components/common/MedicineSearchWithBarcode';
import supplierService from '../../services/supplierService';
import purchaseService from '../../services/purchaseService';
import medicineService from '../../services/medicineService';
import { Plus, Minus, Search, Package, DollarSign, Calendar, Hash, Trash2, ArrowLeft, Save } from 'lucide-react';

const PurchaseFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addNotification } = useNotification();
  const { user } = useAuth();
  const isEdit = Boolean(id);

  // Form state
  const [formData, setFormData] = useState({
    supplier: '',
    items: [],
    notes: ''
  });

  // UI state
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);

  // Add item modal state
  const [newItem, setNewItem] = useState({
    medicine: null,
    quantity: '',
    unit_cost: ''
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load purchase data if editing
  useEffect(() => {
    if (isEdit && id) {
      loadPurchaseData(id);
    }
  }, [isEdit, id]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const suppliersResponse = await supplierService.getAll();
      const suppliersList = suppliersResponse.results || [];
      setSuppliers(suppliersList);

    } catch (error) {
      console.error('Error loading initial data:', error);
      setError('Failed to load data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadPurchaseData = async (purchaseId) => {
    try {
      console.log('🔍 Loading purchase data for edit:', purchaseId);
      const purchase = await purchaseService.getById(purchaseId);
      console.log('🔍 Purchase data loaded for edit:', purchase);
      
      setFormData({
        supplier: purchase.supplier?.id || '',
        items: purchase.items || [],
        notes: purchase.notes || ''
      });
      
      console.log('🔍 Form data set for edit:', {
        supplier: purchase.supplier?.id || '',
        items: purchase.items || [],
        notes: purchase.notes || ''
      });
    } catch (error) {
      console.error('Error loading purchase:', error);
      addNotification({
        type: 'error',
        message: 'Failed to load purchase data'
      });
      // If loading fails, redirect back to purchases list
      navigate('/purchases');
    }
  };

  const handleSupplierChange = (supplierId) => {
    setFormData(prev => ({ ...prev, supplier: supplierId }));
  };

  const handleAddItem = () => {
    if (!newItem.medicine || !newItem.quantity || !newItem.unit_cost) {
      addNotification({
        type: 'error',
        message: 'Please fill in all required fields'
      });
      return;
    }

    const item = {
      id: Date.now(), // Temporary ID for frontend
      medicine: newItem.medicine,
      quantity: parseInt(newItem.quantity),
      unit_cost: parseFloat(newItem.unit_cost),
      subtotal: parseInt(newItem.quantity) * parseFloat(newItem.unit_cost)
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, item]
    }));

    // Reset modal
    setNewItem({
      medicine: null,
      quantity: '',
      unit_cost: ''
    });
    setShowAddItemModal(false);

    addNotification({
      type: 'success',
      message: 'Item added to purchase'
    });
  };

  const handleRemoveItem = (itemId) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }));
  };

  const handleMedicineSelect = (medicine) => {
    setNewItem(prev => ({ 
      ...prev, 
      medicine,
      unit_cost: medicine.ph || medicine.unit_cost || '' // Auto-fill with cost price (ph)
    }));
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => total + (item.subtotal || 0), 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.supplier) {
      addNotification({
        type: 'error',
        message: 'Please select a supplier'
      });
      return;
    }

    if (formData.items.length === 0) {
      addNotification({
        type: 'error',
        message: 'Please add at least one item'
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        supplier_id: formData.supplier,
        items: formData.items.map(item => ({
          medicine_id: item.medicine.id,
          quantity: parseInt(item.quantity),
          unit_cost: parseFloat(item.unit_cost)
        }))
      };

      console.log('🔍 Purchase payload:', payload);
      console.log('🔍 User data:', user);
      console.log('🔍 User pharmacy:', user?.pharmacy);
      console.log('🔍 User owned_pharmacy:', user?.owned_pharmacy);
      console.log('🔍 FormData supplier:', formData.supplier);
      console.log('🔍 FormData items:', formData.items);

      if (isEdit) {
        await purchaseService.update(id, payload);
        addNotification({
          type: 'success',
          message: 'Purchase updated successfully'
        });
      } else {
        await purchaseService.create(payload);
        
        // Refresh supplier data to show updated balance
        try {
          const suppliersResponse = await supplierService.getAll();
          const suppliersList = suppliersResponse.results || [];
          setSuppliers(suppliersList);
          console.log('🔍 Supplier data refreshed after purchase creation');
        } catch (refreshError) {
          console.error('Error refreshing supplier data:', refreshError);
        }
        
        addNotification({
          type: 'success',
          message: 'Purchase created successfully'
        });
      }

      navigate('/purchases');
    } catch (error) {
      console.error('Error saving purchase:', error);
      addNotification({
        type: 'error',
        message: `Failed to ${isEdit ? 'update' : 'create'} purchase: ${error.message}`
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ErrorBoundary>
        <div className="p-6">
          <LoadingSpinner />
        </div>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate('/purchases')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Purchases
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Edit Purchase' : 'New Purchase'}
              </h1>
              <p className="text-gray-600">
                {isEdit ? 'Update purchase details' : 'Create a new purchase order'}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <ErrorMessage message={error} onClose={() => setError(null)} />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Supplier Selection */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-semibold">Supplier Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier *
                </label>
                {suppliers.length === 0 ? (
                  <div className="space-y-3">
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-yellow-800 text-sm mb-2">
                        No suppliers found. You need to create a supplier first before making a purchase.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/suppliers/new')}
                        className="text-blue-600 border-blue-600 hover:bg-blue-50"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Supplier
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <select
                      value={formData.supplier}
                      onChange={(e) => handleSupplierChange(e.target.value)}
                      className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Select Supplier</option>
                      {suppliers.map(supplier => (
                        <option key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/suppliers/new')}
                      className="text-blue-600 border-blue-600 hover:bg-blue-50"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
              
              {formData.supplier && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Supplier Details
                  </label>
                  <div className="p-2 bg-gray-50 rounded-md">
                    {(() => {
                      const supplier = suppliers.find(s => s.id === formData.supplier);
                      console.log('🔍 Selected supplier for balance display:', supplier);
                      return supplier ? (
                        <div className="text-sm text-gray-600">
                          <p><strong>Contact:</strong> {supplier.contact_email}</p>
                          <p><strong>Credit Limit:</strong> {supplier.credit_limit || 0} DH</p>
                          <p><strong>Current Balance:</strong> <span style={{color: supplier.current_balance > 0 ? 'red' : 'green', fontWeight: 'bold'}}>{supplier.current_balance || 0} DH</span></p>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Purchase Items */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-500" />
                <h2 className="text-lg font-semibold">Purchase Items</h2>
              </div>
              <Button
                type="button"
                onClick={() => setShowAddItemModal(true)}
                className="flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Item
              </Button>
            </div>

            {formData.items.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No items added yet</p>
                <p className="text-sm">Click "Add Item" to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Items Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border p-2 text-left">Medicine</th>
                        <th className="border p-2 text-center">Quantity</th>
                        <th className="border p-2 text-center">Unit Cost</th>
                        <th className="border p-2 text-center">Subtotal</th>
                        <th className="border p-2 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.items.map((item, index) => (
                        <tr key={item.id || index}>
                          <td className="border p-2">
                            <div>
                              <p className="font-medium">
                                {item.medicine?.nom_commercial || item.medicine?.nom || 'Unknown Medicine'}
                              </p>
                              <p className="text-sm text-gray-500">
                                {item.medicine?.forme || 'N/A'}
                              </p>
                            </div>
                          </td>
                          <td className="border p-2 text-center">{item.quantity}</td>
                          <td className="border p-2 text-center">{item.unit_cost.toFixed(2)} DH</td>
                          <td className="border p-2 text-center font-medium">
                            {item.subtotal.toFixed(2)} DH
                          </td>
                          <td className="border p-2 text-center">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Total */}
                <div className="flex justify-end">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-lg font-semibold text-blue-900">
                      Total: {calculateTotal().toFixed(2)} DH
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Notes */}
          <Card className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Add any additional notes about this purchase..."
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/purchases')}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || formData.items.length === 0}
              className="flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  {isEdit ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {isEdit ? 'Update Purchase' : 'Create Purchase'}
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Add Item Modal */}
        <Modal
          isOpen={showAddItemModal}
          onClose={() => setShowAddItemModal(false)}
          title="Add Purchase Item"
        >
          <div className="space-y-4">
            {/* Medicine Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medicine *
              </label>
              <MedicineSearchWithBarcode
                onMedicineSelect={handleMedicineSelect}
                placeholder="Search medicine by name or scan barcode..."
              />
              {newItem.medicine && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
                  <p className="text-sm font-medium text-green-800">
                    Selected: {newItem.medicine.nom_commercial || newItem.medicine.nom}
                  </p>
                </div>
              )}
            </div>

            {/* Quantity and Cost */}
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Quantity *"
                type="number"
                value={newItem.quantity}
                onChange={(e) => setNewItem(prev => ({ ...prev, quantity: e.target.value }))}
                placeholder="Enter quantity"
                min="1"
                required
              />
              <Input
                label="Unit Cost (DH) *"
                type="number"
                step="0.01"
                value={newItem.unit_cost}
                onChange={(e) => setNewItem(prev => ({ ...prev, unit_cost: e.target.value }))}
                placeholder="0.00"
                min="0"
                required
              />
            </div>

            {/* Subtotal Preview */}
            {newItem.quantity && newItem.unit_cost && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-700">
                  <strong>Subtotal: {(parseFloat(newItem.quantity || 0) * parseFloat(newItem.unit_cost || 0)).toFixed(2)} DH</strong>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleAddItem}
                disabled={!newItem.medicine || !newItem.quantity || !newItem.unit_cost}
              >
                Add Item
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowAddItemModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </ErrorBoundary>
  );
};

export default PurchaseFormPage;
