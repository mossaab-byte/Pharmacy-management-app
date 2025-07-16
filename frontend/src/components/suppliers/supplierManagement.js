import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/UI';
import { Button } from '../../components/UI';
import { Search, Plus, Edit, Trash2, Building, CreditCard, Truck, DollarSign, Eye } from 'lucide-react';
import supplierService from '../../services/supplierService';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    credit_limit: 0,
    current_balance: 0
  });
  const [showCreditForm, setShowCreditForm] = useState(false);
  const [creditAmount, setCreditAmount] = useState('');
  const [creditNote, setCreditNote] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  useEffect(() => {
    filterSuppliers();
  }, [suppliers, searchTerm]);

  const loadSuppliers = async () => {
    setLoading(true);
    try {
      const response = await supplierService.getAll();
      const suppliersList = Array.isArray(response) ? response : response.results || [];
      setSuppliers(suppliersList);
    } catch (error) {
      console.error('Error loading suppliers:', error);
      alert('Erreur lors du chargement des fournisseurs');
    } finally {
      setLoading(false);
    }
  };

  const filterSuppliers = () => {
    if (!searchTerm) {
      setFilteredSuppliers(suppliers);
    } else {
      const filtered = suppliers.filter(supplier =>
        supplier.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contact_person?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contact_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contact_phone?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSuppliers(filtered);
    }
  };

  const openForm = (supplier = null) => {
    if (supplier) {
      setEditingSupplier(supplier);
      setFormData({
        name: supplier.name || '',
        contact_person: supplier.contact_person || '',
        contact_email: supplier.contact_email || '',
        contact_phone: supplier.contact_phone || '',
        address: supplier.address || '',
        credit_limit: supplier.credit_limit || 0,
        current_balance: supplier.current_balance || 0
      });
    } else {
      setEditingSupplier(null);
      setFormData({
        name: '',
        contact_person: '',
        contact_email: '',
        contact_phone: '',
        address: '',
        credit_limit: 0,
        current_balance: 0
      });
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSupplier(null);
    setFormData({
      name: '',
      contact_person: '',
      contact_email: '',
      contact_phone: '',
      address: '',
      credit_limit: 0,
      current_balance: 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingSupplier) {
        await supplierService.update(editingSupplier.id, formData);
      } else {
        await supplierService.create(formData);
      }
      await loadSuppliers();
      closeForm();
    } catch (error) {
      console.error('Error saving supplier:', error);
      alert('Erreur lors de la sauvegarde du fournisseur');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (supplier) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer le fournisseur "${supplier.name}" ?`)) {
      return;
    }

    setLoading(true);
    try {
      await supplierService.delete(supplier.id);
      await loadSuppliers();
    } catch (error) {
      console.error('Error deleting supplier:', error);
      alert('Erreur lors de la suppression du fournisseur');
    } finally {
      setLoading(false);
    }
  };

  const openCreditAdjustment = (supplier) => {
    setSelectedSupplier(supplier);
    setCreditAmount('');
    setCreditNote('');
    setShowCreditForm(true);
  };

  const closeCreditForm = () => {
    setShowCreditForm(false);
    setSelectedSupplier(null);
    setCreditAmount('');
    setCreditNote('');
  };

  const handleCreditAdjustment = async (type) => {
    if (!creditAmount || parseFloat(creditAmount) <= 0) {
      alert('Veuillez entrer un montant valide');
      return;
    }

    setLoading(true);
    try {
      const amount = parseFloat(creditAmount);
      const adjustmentAmount = type === 'decrease' ? -amount : amount;
      
      await supplierService.adjustBalance(selectedSupplier.id, {
        amount: adjustmentAmount,
        note: creditNote || `${type === 'decrease' ? 'Diminution' : 'Augmentation'} de solde`
      });
      
      await loadSuppliers();
      closeCreditForm();
    } catch (error) {
      console.error('Error adjusting supplier balance:', error);
      alert('Erreur lors de l\'ajustement du solde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Fournisseurs</h1>
        <Button onClick={() => openForm()} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Fournisseur
        </Button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher un fournisseur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Suppliers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {filteredSuppliers.map(supplier => (
          <Card key={supplier.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="w-5 h-5 text-blue-600" />
                  <span className="truncate">{supplier.name}</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openForm(supplier)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(supplier)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Eye className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Contact:</span>
                  <span>{supplier.contact_person || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">Email:</span>
                  <span className="truncate">{supplier.contact_email || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">Téléphone:</span>
                  <span>{supplier.contact_phone || 'N/A'}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Solde actuel:</span>
                  <span className={`font-medium ${
                    (supplier.current_balance || 0) > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {(supplier.current_balance || 0).toFixed(2)} DH
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Limite crédit:</span>
                  <span className="font-medium text-blue-600">
                    {(supplier.credit_limit || 0).toFixed(2)} DH
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openCreditAdjustment(supplier)}
                  className="w-full"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Ajuster Solde
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      )}

      {!loading && filteredSuppliers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {searchTerm ? 'Aucun fournisseur trouvé' : 'Aucun fournisseur enregistré'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Supplier Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">
                {editingSupplier ? 'Modifier le Fournisseur' : 'Nouveau Fournisseur'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nom de l'entreprise *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Personne de contact</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Adresse</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Limite de crédit (DH)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.credit_limit}
                    onChange={(e) => setFormData({ ...formData, credit_limit: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={closeForm} className="flex-1">
                    Annuler
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1">
                    {loading ? 'Sauvegarde...' : 'Sauvegarder'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Credit Adjustment Modal */}
      {showCreditForm && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Ajuster le Solde</h2>
              <p className="text-gray-600 mb-4">
                Fournisseur: <strong>{selectedSupplier.name}</strong>
              </p>
              <p className="text-gray-600 mb-4">
                Solde actuel: <strong className={
                  (selectedSupplier.current_balance || 0) > 0 ? 'text-red-600' : 'text-green-600'
                }>
                  {(selectedSupplier.current_balance || 0).toFixed(2)} DH
                </strong>
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Montant (DH)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={creditAmount}
                    onChange={(e) => setCreditAmount(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Note</label>
                  <input
                    type="text"
                    value={creditNote}
                    onChange={(e) => setCreditNote(e.target.value)}
                    placeholder="Raison de l'ajustement..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleCreditAdjustment('increase')}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Augmenter
                  </Button>
                  <Button
                    onClick={() => handleCreditAdjustment('decrease')}
                    disabled={loading}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Diminuer
                  </Button>
                </div>

                <Button variant="outline" onClick={closeCreditForm} className="w-full">
                  Annuler
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierManagement;
