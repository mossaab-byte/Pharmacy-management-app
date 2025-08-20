import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../../components/ErrorBoundary';
import { Card, Input, Button, LoadingSpinner, ErrorMessage, Modal } from '../../components/UI';
import { useNotification } from '../../context/NotificationContext';
import supplierService from '../../services/supplierService';
import { Plus, Edit, Trash2, DollarSign, CreditCard, Phone, Mail, MapPin, Building, Search, ArrowLeft } from 'lucide-react';

const SupplierManagementPage = () => {
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  // State
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    tax_id: '',
    license_number: '',
    credit_limit: '0',
    payment_terms: '',
    minimum_order: '0',
    discount_rate: '0',
    notes: ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await supplierService.getAll();
      setSuppliers(response.results || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      setError('Failed to load suppliers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSupplier = () => {
    navigate('/suppliers/new');
  };

  const handleEditSupplier = (supplier) => {
    navigate(`/suppliers/${supplier.id}/edit`);
  };

  const handleDeleteSupplier = async (id) => {
    if (!window.confirm('Are you sure you want to delete this supplier? This action cannot be undone.')) {
      return;
    }

    try {
      await supplierService.remove(id);
      setSuppliers(prev => prev.filter(s => s.id !== id));
      addNotification({
        type: 'success',
        message: 'Supplier deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting supplier:', error);
      addNotification({
        type: 'error',
        message: 'Failed to delete supplier'
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      addNotification({
        type: 'error',
        message: 'Supplier name is required'
      });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        credit_limit: parseFloat(formData.credit_limit) || 0,
        minimum_order: parseFloat(formData.minimum_order) || 0,
        discount_rate: parseFloat(formData.discount_rate) || 0
      };

      if (editingSupplier) {
        const updated = await supplierService.update(editingSupplier.id, payload);
        setSuppliers(prev => prev.map(s => s.id === editingSupplier.id ? updated : s));
        addNotification({
          type: 'success',
          message: 'Supplier updated successfully'
        });
      } else {
        const created = await supplierService.create(payload);
        setSuppliers(prev => [created, ...prev]);
        addNotification({
          type: 'success',
          message: 'Supplier created successfully'
        });
      }

      setShowModal(false);
    } catch (error) {
      console.error('Error saving supplier:', error);
      addNotification({
        type: 'error',
        message: `Failed to ${editingSupplier ? 'update' : 'create'} supplier`
      });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return '0.00 DH';
    return `${amount.toFixed(2)} DH`;
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
      <div className="p-6 max-w-7xl mx-auto">
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
              <h1 className="text-2xl font-bold text-gray-900">Supplier Management</h1>
              <p className="text-gray-600">Manage your suppliers and their credit terms</p>
            </div>
          </div>
          <Button
            onClick={handleAddSupplier}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Supplier
          </Button>
        </div>

        {error && (
          <ErrorMessage message={error} onClose={() => setError(null)} />
        )}

        {/* Search */}
        <Card className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search suppliers by name, contact person, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Suppliers Grid */}
        {filteredSuppliers.length === 0 ? (
          <Card className="p-12 text-center">
            <Building className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'No suppliers match your search criteria.' : 'Get started by adding your first supplier.'}
            </p>
            {!searchTerm && (
              <Button onClick={handleAddSupplier}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Supplier
              </Button>
            )}
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map(supplier => (
              <Card key={supplier.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {supplier.name}
                    </h3>
                    {supplier.contact_person && (
                      <p className="text-sm text-gray-600 mb-2">
                        Contact: {supplier.contact_person}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditSupplier(supplier)}
                    >
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSupplier(supplier.id)}
                      className="text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  {supplier.contact_email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-3 h-3" />
                      <span>{supplier.contact_email}</span>
                    </div>
                  )}
                  {supplier.contact_phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-3 h-3" />
                      <span>{supplier.contact_phone}</span>
                    </div>
                  )}
                  {supplier.address && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{supplier.address}</span>
                    </div>
                  )}
                </div>

                {/* Financial Info */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="flex items-center gap-1 text-gray-500 mb-1">
                        <CreditCard className="w-3 h-3" />
                        Credit Limit
                      </div>
                      <div className="font-medium text-blue-600">
                        {formatCurrency(supplier.credit_limit || 0)}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-gray-500 mb-1">
                        <DollarSign className="w-3 h-3" />
                        Balance
                      </div>
                      <div className={`font-medium ${
                        (supplier.current_balance || 0) > 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {formatCurrency(supplier.current_balance || 0)}
                      </div>
                    </div>
                  </div>
                  {supplier.payment_terms && (
                    <div className="mt-2 text-xs text-gray-500">
                      Payment Terms: {supplier.payment_terms}
                    </div>
                  )}
                  
                  {/* Payment Management Button */}
                  {(supplier.current_balance || 0) > 0 && (
                    <div className="mt-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/suppliers/${supplier.id}/payments`)}
                        className="w-full text-xs"
                      >
                        <DollarSign className="w-3 h-3 mr-1" />
                        Manage Payments
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Supplier Form Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}
          maxWidth="4xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Supplier Name *"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter supplier name"
                  required
                />
                <Input
                  label="Contact Person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                  placeholder="Enter contact person name"
                />
                <Input
                  label="Email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                  placeholder="Enter email address"
                />
                <Input
                  label="Phone"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Address Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Address"
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter street address"
                  />
                </div>
                <Input
                  label="City"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="Enter city"
                />
                <Input
                  label="State/Province"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  placeholder="Enter state or province"
                />
                <Input
                  label="Postal Code"
                  value={formData.postal_code}
                  onChange={(e) => setFormData(prev => ({ ...prev, postal_code: e.target.value }))}
                  placeholder="Enter postal code"
                />
                <Input
                  label="Country"
                  value={formData.country}
                  onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
                  placeholder="Enter country"
                />
              </div>
            </div>

            {/* Business Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Tax ID"
                  value={formData.tax_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, tax_id: e.target.value }))}
                  placeholder="Enter tax identification number"
                />
                <Input
                  label="License Number"
                  value={formData.license_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, license_number: e.target.value }))}
                  placeholder="Enter business license number"
                />
              </div>
            </div>

            {/* Financial Terms */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Financial Terms</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Credit Limit (DH)"
                  type="number"
                  step="0.01"
                  value={formData.credit_limit}
                  onChange={(e) => setFormData(prev => ({ ...prev, credit_limit: e.target.value }))}
                  placeholder="0.00"
                  min="0"
                />
                <Input
                  label="Minimum Order (DH)"
                  type="number"
                  step="0.01"
                  value={formData.minimum_order}
                  onChange={(e) => setFormData(prev => ({ ...prev, minimum_order: e.target.value }))}
                  placeholder="0.00"
                  min="0"
                />
                <Input
                  label="Discount Rate (%)"
                  type="number"
                  step="0.01"
                  value={formData.discount_rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_rate: e.target.value }))}
                  placeholder="0.00"
                  min="0"
                  max="100"
                />
              </div>
              <div className="mt-4">
                <Input
                  label="Payment Terms"
                  value={formData.payment_terms}
                  onChange={(e) => setFormData(prev => ({ ...prev, payment_terms: e.target.value }))}
                  placeholder="e.g., Net 30, COD, 2/10 Net 30"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes about this supplier..."
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowModal(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || !formData.name.trim()}
              >
                {submitting ? (
                  <>
                    <LoadingSpinner size="sm" />
                    {editingSupplier ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  editingSupplier ? 'Update Supplier' : 'Create Supplier'
                )}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </ErrorBoundary>
  );
};

export default SupplierManagementPage;
